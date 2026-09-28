# CAESAR members workspace

Complete [SUPABASE.md](SUPABASE.md), then run `npm run dev` and visit
`http://localhost:5173/login`. Each member signs in with an admin-assigned username
and password. After login, `/dashboard` provides Overview, Teams, Goals, Data,
Projects and Activity. Administrators also get a Users page to create accounts,
reset passwords, and disable/enable access. Direct dashboard routes require a
session, including after refresh and browser back/forward navigation.

## What works

- Create and edit teams, member lists, current projects and statuses.
- Create and edit projects, with dates, lead teams and descriptions.
- Create and edit goals, deadlines, statuses and progress. Planned goals are 0%;
  completed goals are 100%. Team and project pages derive progress from their goals.
- Post and edit dated updates with an author, status, description and optional tags.
- Create and edit numeric technical records, including units, categories and notes.
  Records can belong to a team, a project, or both. Search and combine team,
  project, category and inclusive date-range filters; expand rows for full notes.
- Activity is recorded on the server after each successful save. New records and
  changes appear in the associated team/project pages and overview.

Supabase starts with an empty workspace. In local demo mode only, initial teams,
projects, members, dates and measurements are explicitly illustrative.
The Avionics team represents the public site's Electronics discipline. No real
engineering results or personal membership data are implied by these examples.

## Authentication and storage

`backend/src/members/auth.ts` selects the configured provider. Supabase mode uses
Supabase Auth for passwords, database profiles for membership/admin roles, and
hashed session tokens in PostgreSQL. Sessions last 12 hours and survive restarts.
The Users API requires administrator access on every request; member-created
requests cannot assign roles. Password resets and access changes revoke sessions.
See [SUPABASE.md](SUPABASE.md) for account provisioning and the database migration.

The optional `MEMBERS_PROVIDER=local` prototype
uses a server-only scrypt hash, constant-time comparison, login attempt throttling,
and a random, HttpOnly, SameSite=Strict session cookie. Passwords and session tokens
are not stored in browser localStorage. Sessions last 12 hours and are held in
memory, so restarting the server signs everyone out. Logout revokes the session.
HTTPS is required in production, where the cookie also has the Secure flag.

Set `MEMBER_USERNAME` and `MEMBER_PASSWORD_HASH` in the server environment to
override the prototype account. `MEMBER_PASSWORD_HASH` is `salt:hex`, where `hex`
is the 64-byte result of Node's `crypto.scrypt(password, salt, 64)`. Use a random
salt and keep the password out of source control. `backend/.env.example` documents
the settings. Node 22+ automatically loads `backend/.env.local`, with process
environment variables taking precedence. The prototype password is disabled in
production; local production mode requires an explicit password hash.

The server protects every workspace read and write under `/api/members`. Writes
require a custom header and this API does not enable cross-origin CORS. The public
API keeps its existing behavior. Inputs are validated before saving. Identity in
the activity log comes from the session; an update's author field is a separate
documentation attribution field.

`backend/src/members/supabase-repository.ts` stores the shared workspace as a
versioned JSONB document in PostgreSQL. A revision check retries conflicting
writes so unrelated changes are preserved, and activity saves atomically with
each record. No sample data or local JSON data is uploaded automatically.

`backend/src/members/repository.ts` defines the repository interface and the local
JSON implementation. Its default file is `backend/data/members.json` (gitignored).
It seeds on the first read and persists on the first change. Writes are queued and
use an atomic file replacement; failed saves are reported rather than shown as
successful. Set `MEMBER_DATA_FILE` to a persistent, writable path if needed.

Local mode supports one Node server process and one shared account. Supabase mode
provides individual accounts and shared persistent sessions/data. All members can
edit workspace records; only admins manage accounts. Both modes use last-save-wins
editing of the same record; the app does not provide concurrent
editing conflict resolution. The frontend adapter is `frontend/src/members/api.ts`;
shared TypeScript models live in `backend/src/members/models.ts`.

## Project hierarchy and team profiles

In Projects, use **Parent project** when creating or editing a project, or open
an existing project and choose **Create subproject**. Projects without a parent
stay at the top level. Expand/collapse buttons reveal nested work; project names
open the existing detail pages, with ancestor links and a subprojects section.
The parent selector excludes the current project and its descendants, and the
backend also validates relationships to prevent cycles.

**Edit team** opens a documentation editor with basic metadata at the top and
collapsible About, Responsibilities, How we work, Workflow/process, and Types of
projects sections. One section expands into a roomy writing surface at a time.
The toolbar supports paragraphs, headings, bold/italic, bullets, numbered lists,
links, undo and redo; Shift+Enter adds a line break. Switching sections retains
the draft, and **Save changes** saves all sections together. Failed saves retain
the draft; closing with changes offers Keep writing or Discard changes.

Tiptap and only the required formatting extensions load with the team editor.
The reading page uses ordinary React-rendered typography and Overview/Members/
Projects navigation, with no editor dependency or editable controls. Each section
supports up to 25,000 characters. Existing plain text is converted without
interpreting it as HTML and is preserved until edited. No SQL migration is needed.

Documentation appears above members and the team's hierarchy. Team projects include projects led by
the team, its selected current project, their subprojects, and ancestor projects
needed for context. Existing goals, updates, data and member lists remain available.

The existing permission model applies: active signed-in members can edit shared
workspace records. Team member names do not establish account-level ownership.
Optional JSONB fields keep existing data compatible without a SQL migration;
see `SUPABASE.md`. Both integration suites exercise these flows through
`scripts/check-organization-flows.mjs`, including legacy payload compatibility,
cycle prevention, anonymous write denial, keyboard controls and mobile layouts.

## Deployment

The existing public static deployment remains supported. **The members portal
needs the Node backend; uploading only frontend/dist cannot provide authentication
or private data.** The members service shows an unavailable message when missing.

Build with `npm run build`. Run `backend/dist/index.js` with `NODE_ENV=production`
behind HTTPS. The Node server serves the build under `/new/` to match the existing
Vite base, including refreshed deep links. The production portal URLs are
`/new/login` and `/new/dashboard`. Configure the reverse proxy so `/api/members/*`
goes to this same Node service on the same public origin, and `/new/*` goes to the
frontend. Keep the site's existing WordPress root configuration intact.

Configure the Supabase environment variables on the Node host. Use Supabase
backups for real workspace data. Local demo mode instead requires a persistent
volume for its JSON file and loses sessions on restart. Normal app startup never
applies hosted migrations; follow `SUPABASE.md` before deploying the backend.

## Checks

`npm run build` type-checks and builds both workspaces. After building, run
`npm run check:members` for API authorization, input validation, all editing flows,
filtering, saved-data reload/restart persistence, sign-out, responsive layouts and
browser error checks. It starts isolated test servers and uses a unique data file
under `artifacts/`; it never writes to the normal members data store. It uses
Playwright Chromium, or `BROWSER_PATH` for an installed Chrome/Edge executable.
Screenshots are saved in `artifacts/members/`.

`npm run check:supabase` runs the real SQL migrations against embedded PostgreSQL
and checks database permissions, separate identities, admin authorization,
bootstrap behavior, shared data/concurrent writes, restart persistence, password
resets, session revocation, and responsive user-management flows. It uses a local
Auth/PostgREST test transport and never contacts the hosted project. Screenshots
are saved in `artifacts/supabase/`. Run `npm run check:supabase:live` after applying
the migrations and configuring the backend secret key for read-only hosted
readiness checks. Verify login and editing against the deployed backend too.
