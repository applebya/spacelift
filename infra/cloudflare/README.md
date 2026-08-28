# Cloudflare configuration for spacelift.online

**Nothing here is live.** These files describe the edge configuration decided in
[`docs/hosting-architecture-decision.md`](../../docs/hosting-architecture-decision.md)
and are staged for a cutover that requires the owner's explicit approval —
because the zone also carries the business's Microsoft 365 email. Read
[`dns-inventory.md`](./dns-inventory.md) before touching anything.

| File                 | What it is                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `dns-inventory.md`   | The zone exactly as GoDaddy serves it today, captured from the authoritative nameservers. The thing to diff against after import. |
| `transform-rules.md` | Response headers to add, with the reasoning for each.                                                                             |
| `cache-rules.md`     | Cache policy per path, and why HTML is treated differently from `/assets`.                                                        |
| `cutover-runbook.md` | Ordered steps, verification commands, and the rollback for each stage.                                                            |

## What Cloudflare is for here

The site is built by Vite and served by GitHub Pages, and that does not change.
Cloudflare is being introduced to supply four things GitHub Pages cannot:

1. **Response headers.** GitHub Pages has no mechanism for them at all, so the
   site currently ships without CSP, `X-Frame-Options`, `X-Content-Type-Options`,
   `Referrer-Policy` or `Permissions-Policy`.
2. **Correct cache lifetimes.** GitHub Pages returns `max-age=600` for
   everything, including content-hashed files that could safely be cached for a
   year.
3. **Brotli.** GitHub Pages negotiates gzip only — verified, not assumed:
   requesting `Accept-Encoding: br` returns the file uncompressed.
4. **HTTP/3.** No `alt-svc` is advertised today.

## What it is _not_ for

Not a build system, not a host, not a place to put logic. If something can be
solved in the repository, it should be.

## Ownership boundaries

- The domain stays **registered at GoDaddy**, paid by the owner. Only the
  nameservers move.
- No transfer of domain ownership to Appleby Web Services.
- Cloudflare _account_ administration — billing, members, corporate naming — is
  outside this project's scope. Only the `spacelift.online` zone and its rules
  belong to it.
