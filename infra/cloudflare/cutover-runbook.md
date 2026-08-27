# Cutover runbook — spacelift.online → Cloudflare

**Not yet executed.** Requires the owner's explicit approval, because moving the
nameservers moves the **business's email** along with the website. Read
[`dns-inventory.md`](./dns-inventory.md) first — it is not a website-only zone.

Each stage below is reversible and states how. Do not start a stage until the
previous one is verified.

---

## Before anything

- [ ] Owner has approved the nameserver change, understanding it affects email.
- [ ] Someone can send and receive a test message at an `@spacelift.online`
      address during the window, to prove mail before and after.
- [ ] Schedule outside business hours.
- [ ] `dns-inventory.md` is current — re-run the capture if more than a few days
      have passed.

---

## Stage 1 — Lower TTLs at GoDaddy (reversible, no user impact)

Set every record in the zone to **300 s**. Wait **at least the previous TTL**
(3600 s) before continuing, so that resolvers everywhere are holding the short
value and a rollback takes five minutes rather than an hour.

**Rollback:** raise them again. Nothing has moved.

---

## Stage 2 — Create the zone in Cloudflare (reversible, no user impact)

1. Add `spacelift.online` to the Cloudflare account. Do **not** change
   nameservers yet.
2. Let Cloudflare scan the existing zone, then **diff every record against
   `dns-inventory.md` line by line**. Cloudflare's scan is good; it is not a
   substitute for checking, and a missed MX record is somebody's inbox.
3. Set proxy status deliberately:

   | Record | Proxy |
   |---|---|
   | `spacelift.online` A ×4 | **Proxied** (orange) |
   | `www` CNAME | **Proxied** (orange) |
   | MX, SPF/TXT, `autodiscover`, `sip`, `lyncdiscover`, `msoid`, both SRV, `email`, google-site-verification | **DNS only** (grey) |

   Proxying a mail hostname breaks mail. There is no exception to this.
4. Drop `_domainconnect` — it is GoDaddy's own automation hook and is meaningless
   once Cloudflare is authoritative.
5. SSL/TLS mode: **Full (strict)**. GitHub Pages presents a valid certificate, so
   there is no reason to accept anything weaker. *Flexible would create a
   redirect loop and must not be used.*
6. Enable: Always Use HTTPS, Automatic HTTPS Rewrites, Brotli, HTTP/3.
   Disable: Rocket Loader, all Auto Minify, Email Obfuscation.
7. Add the rules from [`transform-rules.md`](./transform-rules.md) and
   [`cache-rules.md`](./cache-rules.md) — CSP as **Report-Only** for now.

**Rollback:** delete the zone. Nothing points at it yet.

---

## Stage 3 — Switch nameservers at GoDaddy (the live step)

Replace `ns25.domaincontrol.com` / `ns26.domaincontrol.com` with the two
Cloudflare nameservers shown in the dashboard.

**Leave the GoDaddy zone records in place.** Do not delete them. They cost
nothing and they are the rollback.

### Verify, in this order — mail first

```sh
# 1. MX still resolves, and to the same host
dig +short spacelift.online MX
#    expect: 0 spacelift-online.mail.protection.outlook.com.

# 2. SPF and the Microsoft verification TXT survived
dig +short spacelift.online TXT

# 3. Autodiscover and the Lync/Teams records
dig +short autodiscover.spacelift.online CNAME
dig +short _sipfederationtls._tcp.spacelift.online SRV
```

- [ ] **Send a real message to an `@spacelift.online` address and confirm it
      arrives.** DNS resolving correctly is necessary, not sufficient.
- [ ] **Send a real message from that address and confirm it is delivered.**

Only once mail is proven, move on to the website:

```sh
# apex and www both serve, www still 301s to apex
curl -sI https://spacelift.online/            | head -1
curl -sI https://www.spacelift.online/        | head -2
curl -sI http://spacelift.online/             | head -2   # → 301 to https

# proxy is actually in the path
curl -sI https://spacelift.online/ | grep -i 'server\|cf-ray'

# TLS is valid for both names
echo | openssl s_client -connect spacelift.online:443 -servername spacelift.online 2>/dev/null \
  | openssl x509 -noout -subject -dates

# headers arrived
curl -sI https://spacelift.online/ | grep -iE 'content-security|strict-transport|x-content-type|referrer-policy|permissions-policy'

# cache policy is right on both sides
ASSET=$(curl -s https://spacelift.online/ | grep -o '/assets/index-[^"]*\.js' | head -1)
curl -sI "https://spacelift.online$ASSET" | grep -i 'cache-control\|cf-cache-status'
curl -sI  https://spacelift.online/        | grep -i 'cache-control'

# brotli, which GitHub Pages alone does not negotiate
curl -sI -H 'Accept-Encoding: br' "https://spacelift.online$ASSET" | grep -i content-encoding

# nothing 404s
curl -s -o /dev/null -w '%{http_code} og-image\n'  https://spacelift.online/og-image.jpg
curl -s -o /dev/null -w '%{http_code} sitemap\n'   https://spacelift.online/sitemap.xml
curl -s -o /dev/null -w '%{http_code} robots\n'    https://spacelift.online/robots.txt
curl -s -o /dev/null -w '%{http_code} 404 page\n'  https://spacelift.online/definitely-not-a-page
```

- [ ] Load the site in a browser with devtools open — console clean, no CSP
      report-only violations that would break under enforcement.
- [ ] Check it on a real phone, not just an emulator.
- [ ] Submit the contact form once and confirm the message arrives.

**Rollback (any failure):** set the nameservers back to
`ns25.domaincontrol.com` / `ns26.domaincontrol.com` at GoDaddy. The zone there is
untouched, so this restores the exact prior state. With TTLs at 300 s from
Stage 1, propagation is minutes.

**Faster partial rollback (website only):** grey-cloud the apex and `www` records
in Cloudflare. Traffic goes straight to GitHub Pages, headers and cache rules
stop applying, everything else stays. Effective in under a minute.

---

## Stage 4 — Settle

- [ ] 24 hours after cutover, with mail and web both healthy, switch CSP from
      Report-Only to enforcing.
- [ ] Confirm a deployment still works end to end: push to `main`, watch the
      Actions run, confirm the change is live and that `index.html` revalidates
      rather than serving stale.
- [ ] Raise TTLs back to 3600 s (or leave Cloudflare's Auto).
- [ ] Only now, if desired, tidy the GoDaddy zone. There is no hurry.

---

## Deliberately out of scope

- Adding DKIM or DMARC records. The zone has neither. That is a real gap in the
  mail configuration and worth raising with the owner, but it is an email
  decision, not a website one, and it should not be bundled into a change whose
  rollback plan depends on the zone being reproduced exactly as it was.
- HSTS preload submission — irreversible for the domain, owner's decision.
- Moving the registrar. Registration stays at GoDaddy, on the owner's card.
