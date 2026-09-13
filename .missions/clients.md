# Mission: Clients

## Purpose
Parked pane for client work outside Merge Conflict and the corp site. Spacelift
(spacelift.online) is complete and deployed as of 2026-09-10; what remains is
the corp-side invoice. The craft market website is the next client and will get
its own repo and its own mission when it starts.

## Done looks like
- [ ] Spacelift invoice issued from the corp per the Corp Build ruling (NA-corp-build-1) and recorded in `~/dev-personal/corp/TODO.md` "New client work".
- [ ] Craft market site: scope, contact, and first payment agreed; repo created under the Appleby-Web-Services GitHub org; mission file written; registered in `~/dev/worklife/sessions.json` with its own pane.
- [ ] Spacelift repository work is complete; the two owner-side items in `docs/session-handoff.md` (Google Business Profile, the held Cloudflare DNS cutover) are each decided.

## Where state lives
- `docs/session-handoff.md` (read first), `docs/modernization-results.md`.
- Corp-side client ledger: `~/dev-personal/corp/TODO.md` "New client work".

## Rules
- Spacelift is done: no new site changes unless Rose asks. Lighthouse medians of several runs, never one sample.
- Client PII and payment details stay out of this repo.

## Needs Andrew
Line format: `- [ ] NA-<key>-<n>: question | options: A) .. B) .. | writes: .. | due: YYYY-MM-DD | kind: decision|file|desk` (due and kind optional; kind defaults to decision). IDs are never reused; ticked lines stay in place with their ruling. Move old ones under `## Rulings archive` when this section gets long.
- [x] NA-clients-1: Craft market site: is it a go? | options: A) yes B) not before October C) drop it | writes: this file's Done list | kind: decision
  -> Andrew 2026-09-12: (B) not before October. Don't start it yet.
- [ ] NA-clients-2: Craft market site: first deliverable? | options: A) signup + payment page B) landing page only C) I'll describe it at the desk | writes: a new `~/dev/<repo>/.missions/<key>.md` | kind: decision
- [ ] NA-clients-3: Craft market site: contact name and start date? | writes: the new mission file's Where state lives | kind: desk
- [x] NA-clients-4: Spacelift: set up the Google Business Profile Rose was offered? | options: A) yes, I will do it with her B) hand her the instructions C) skip | writes: `docs/session-handoff.md` owner items | kind: decision
  -> Andrew 2026-09-12: (C) skip — not pursuing the Google Business Profile setup.
- [ ] NA-clients-5: Spacelift: resume the held Cloudflare DNS cutover, or leave GitHub Pages as-is? | options: A) resume B) leave as-is C) revisit in 2027 | writes: `docs/session-handoff.md` owner items | kind: decision

## Resume ritual
1. Read `docs/session-handoff.md`.
2. Apply ticked Needs Andrew rulings.
3. If nothing is ticked, say so in one line and stop; this pane is parked by design.
