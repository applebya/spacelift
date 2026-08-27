# spacelift.online — DNS inventory before any change

Captured **2026-08-27** by querying the authoritative nameservers
(`ns25.domaincontrol.com`) directly, so this is the zone as GoDaddy actually
serves it rather than a reading of a control panel.

This file exists so the zone can be recreated exactly, and so it can be verified
after a cutover that nothing was lost.

---

## ⚠️ This zone carries live email

`spacelift.online` is configured for **Microsoft 365 email**. The website is a
small part of this zone; mail is the part that breaks loudest if a record is
missed. A nameserver migration must recreate every record below, and mail
delivery must be verified after cutover before the change is considered done.

There is **no DKIM and no DMARC record**. That is a pre-existing gap in the mail
configuration, not something this engagement introduced, and it is the owner's
to decide on — noted here only because anyone reading this list will notice the
absence.

---

## Records

### Website

| Name               | Type  | Value                    | TTL  |
| ------------------ | ----- | ------------------------ | ---- |
| `spacelift.online` | A     | `185.199.108.153`        | 3600 |
| `spacelift.online` | A     | `185.199.109.153`        | 3600 |
| `spacelift.online` | A     | `185.199.110.153`        | 3600 |
| `spacelift.online` | A     | `185.199.111.153`        | 3600 |
| `www`              | CNAME | `applebya-wm.github.io.` | 3600 |

The four A records are GitHub Pages' anycast addresses. `www` 301-redirects to
the apex, so the apex is the canonical host — which is what
`<link rel="canonical">` in `index.html` and `public/sitemap.xml` both declare.

### Mail — Microsoft 365

| Name                     | Type  | Value                                             | TTL  |
| ------------------------ | ----- | ------------------------------------------------- | ---- |
| `spacelift.online`       | MX    | `0 spacelift-online.mail.protection.outlook.com.` | 3600 |
| `spacelift.online`       | TXT   | `"v=spf1 include:secureserver.net -all"`          | 3600 |
| `spacelift.online`       | TXT   | `"NETORGFT16517904.onmicrosoft.com"`              | 3600 |
| `autodiscover`           | CNAME | `autodiscover.outlook.com.`                       | 3600 |
| `sip`                    | CNAME | `sipdir.online.lync.com.`                         | 3600 |
| `lyncdiscover`           | CNAME | `webdir.online.lync.com.`                         | 3600 |
| `msoid`                  | CNAME | `clientconfig.microsoftonline-p.net.`             | 3600 |
| `_sip._tls`              | SRV   | `100 1 443 sipdir.online.lync.com.`               | 3600 |
| `_sipfederationtls._tcp` | SRV   | `100 1 5061 sipfed.online.lync.com.`              | 3600 |

Note the SPF record includes `secureserver.net` (GoDaddy) rather than
`spf.protection.outlook.com`, which is what Microsoft 365 normally requires. It
presumably reflects how the mailbox was provisioned through GoDaddy. **Copy it
verbatim** — do not "correct" it during a migration. If mail is being sent
through Microsoft directly, that is a separate conversation with the owner.

### Other

| Name               | Type  | Value                                                                    | TTL  |
| ------------------ | ----- | ------------------------------------------------------------------------ | ---- |
| `spacelift.online` | TXT   | `"google-site-verification=-HYLTZ4SZ4BwuZj40uqEkpcYDZf8iCtvC5GcoJ6yDfA"` | 3600 |
| `email`            | CNAME | `email.secureserver.net.`                                                | 3600 |
| `_domainconnect`   | CNAME | `_domainconnect.gd.domaincontrol.com.`                                   | 3600 |

`_domainconnect` is GoDaddy's own automation hook. It has no meaning once
Cloudflare is authoritative and does not need to be recreated.

### Zone

```
NS   ns25.domaincontrol.com.
NS   ns26.domaincontrol.com.
SOA  ns25.domaincontrol.com. dns.jomax.net. 2025021500 28800 7200 604800 600
CAA  (none)
```

---

## Implications for the Cloudflare decision

The website work does not require any of this to move. Introducing Cloudflare as
authoritative DNS does, and that raises the blast radius of the change from "the
website" to "the website and the owner's email".

Cloudflare's zone import scans and pre-populates records automatically, and in a
zone this ordinary it will find all of them — but "will probably" is not the
standard to apply to somebody's inbox. Before any nameserver change:

1. Import the zone into Cloudflare and diff the imported records against this
   file, record by record.
2. Set the four A records and `www` to **proxied**; leave every mail, SRV and
   verification record **DNS-only**. Proxying a mail hostname breaks it.
3. Lower TTLs at GoDaddy to 300 s and wait out the old TTL before switching
   nameservers, so a rollback takes minutes rather than an hour.
4. After the switch, verify in this order: MX resolution, a real inbound test
   message, a real outbound test message, then the website.
5. Keep the GoDaddy zone intact — do not delete records there — until mail and
   web have both been verified for at least 24 hours.

If the owner would rather not put email in the path of a website change, that is
an entirely reasonable position, and the alternative is recorded in
`docs/hosting-architecture-decision.md`: the site keeps its current headers and
cache behaviour, which is the status quo, and nothing else about the
modernization depends on it.
