# /jobs data

Two owners, two stores, merged only at render time.

| Data | Owner | Where | Written by |
|---|---|---|---|
| Automated snapshot | Mon/Wed/Fri routine → `~/Documents/JobSearch/*.md` | Redis `jobs:snapshot` (prod), `.jobs-data/snapshot.json` (local) | `npm run jobs:sync` → `/api/jobs-sync`, replaced wholesale each publish |
| Manual entries | Dashboard | Redis hash `jobs:manual:roles` | `POST /jobs` (`add`, `edit-manual`, `link`, `not-same`) |
| Manual edits to automated roles (overlays) | Dashboard | Redis hash `jobs:manual:overlays`, keyed by snapshot role id | `POST /jobs` (`edit`, `revert`) |
| Previous versions | — | Redis list `jobs:manual:history` (last 200) | every manual write |

Locally (and on previews) the manual hashes live in `.jobs-data/manual.json` (git-ignored).

## Rules

- The sync never reads or writes `jobs:manual:*`, and the dashboard never writes `jobs:snapshot`. A publish can't erase manual data; a bad edit can't corrupt the routine's data.
- **Layers**, lowest first: snapshot role → merged manual entry → overlay (`merge.ts`).
- **Overlays are sparse.** Only fields that differ from what the card showed are stored. Each stored field keeps `base` (the automated value at edit time). If the routine later changes that field, the card is tagged "automation changed" and the detail view shows both, with "Use automated" to drop the edit.
- **Role Fit**: an automated score is never replaced. A manual score only fills a missing one, and is labelled "entered by hand".
- **Status**: internal values are unchanged (`pipeline.md` vocabulary). `Recruiter response` displays as "Recruiter conversation". A status set on the dashboard decides the section: Rejected / Declined / Closed / Withdrawn → Closed, anything else → Active.
- **Duplicates** (`matchManual`), deterministic, ordered by date added then id:
  1. Confirmed link (`linkedTo`) → merge.
  2. Exactly one certain match (same posting URL, or same company + title after normalising case, punctuation and Inc/LLC suffixes) → merge into the automated card. Manual values win, except Role Fit.
  3. Several certain matches, or near matches (related company name and ≥50% title-word overlap) → no merge. The manual card shows "possible duplicate" with **Same role: merge** / **Not the same**.
- **Ids change**: if `pipeline.md` moves a role (e.g. under Closed, new id), its overlay re-attaches by company + title. If the role disappears entirely, the overlay becomes its own card tagged "not in latest automated run". Nothing is dropped.
- **Concurrency**: every record has a `rev`. Writes are compare-and-set (Lua on Redis, a queued write on the file store). A stale form gets "Not saved: this role was changed somewhere else".
- **Auth**: every write needs the `mf-jobs` cookie, a same-origin request and a CSRF token derived from `JOBS_PASSWORD`. There's no other endpoint that reads manual data.

## Future: letting the routine see manual activity (not built)

Goal: the routine shouldn't recommend applying, researching or drafting outreach for something you're already applying to, interviewing for or talking to a recruiter about.

1. **Endpoint**: add `GET /api/jobs-sync` (same Bearer `JOBS_PASSWORD` auth as the POST). It returns `mergeRoles(snapshot.roles, manual)` reduced to `{ id, company, role, url, source, status, nextAction, nextActionDate, updated }` for every role with a manual entry or overlay. No notes or recruiter contact details unless the routine needs them.
2. **Pull**: in `scripts/jobs-sync.mjs`, before publishing, fetch that and write `~/Documents/JobSearch/manual-activity.md`, one `### Company — Role` block per entry, in the same `Key: value · Key: value` style as `pipeline.md`. The file is generated: the routine reads it and never edits it. Exclude it from the watcher's fingerprint so writing it doesn't trigger a publish loop.
3. **Routine prompt**: add one rule. Before scoring or recommending, read `manual-activity.md`. Any role or company there with status Recruiter response / Applied / Interviewing / Offer is "in progress": keep scoring it, but don't propose apply, research or outreach actions; report "already in progress (manual)" instead. Match with the same rules as `matchManual` (URL, or company + title).
4. Optionally, the routine can then copy a manual entry into `pipeline.md` itself. The next snapshot will contain it, and step 2 of the duplicate rules merges the two automatically.

Nothing above needs a schema change: manual records already carry company, role, URL, source, status and dates in a stable shape.
