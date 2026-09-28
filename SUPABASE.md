# Supabase members setup

This app uses Vite/React and Express, with `@supabase/supabase-js` on the backend.
Next.js helpers, `NEXT_PUBLIC_*`, and `@supabase/ssr` are not needed. The browser
talks to `/api/members`; the backend authenticates users and authorizes requests.

## Finish connecting the empty project

1. In the Supabase SQL Editor, run each migration in filename order:
   `supabase/migrations/202609270001_members.sql` **once**, then
   `supabase/migrations/202609280001_profile_provisioning.sql`.
   The first creates the tables and triggers with no sample records. The second
   handles Supabase Auth's metadata update after user insertion and repairs
   missing profiles on existing admin-provisioned accounts. Existing profiles
   are preserved. If the first migration is already applied, run only the second.
   If migration tooling is used, apply both files through that tooling instead.
2. In Supabase Authentication settings, disable **Allow new users to sign up**.
   Keep email/password authentication enabled. Set the minimum password length
   to 12 or higher. Accounts will be created by the administrator.
3. In **Settings → API Keys**, obtain a **secret** key (`sb_secret_...`) and put it
   into `SUPABASE_SECRET_KEY` in `backend/.env.local`. The supplied project URL
   and publishable key are already configured. Do not put the secret in chat,
   frontend variables, or source control. `.env.local` is ignored by Git.
4. In the same local file, choose `BOOTSTRAP_ADMIN_USERNAME`,
   `BOOTSTRAP_ADMIN_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` (12–128 characters).
   Run `npm run members:create-admin`. It refuses to run if an admin exists.
   Remove the bootstrap password from the file after success.
5. Run `npm run dev`, visit `/login`, and sign in using those admin credentials.
   Open **Users** to create accounts, reset passwords, and disable/enable access.

Missing Supabase configuration fails closed; it never falls back to the shared
prototype login. The old prototype password is not a Supabase administrator.
Normal startup never creates accounts or applies database migrations.

## Accounts and sessions

- Usernames are case-insensitive, 3–32 characters, starting with a letter or
  number and containing letters, numbers, dots, underscores or hyphens.
- Admins choose usernames, display names, and passwords. All accounts created
  through the Users page are ordinary members, even if a request supplies a role.
- Supabase Auth supports email/password, so the server maps a username to the
  reserved internal alias `username@members.caesar.invalid`. No email is sent;
  aliases are confirmed by the server. Password recovery is performed by admins.
- Passwords are managed by Supabase Auth and cannot be retrieved from this app.
  Share chosen credentials privately with the member.
- Only admin-controlled Supabase `app_metadata` can provision a profile through
  the migration's trigger. A direct signup or user-controlled metadata cannot
  grant workspace membership. The backend reads roles from `caesar_profiles`.
  Provisioning handles both user insertion and subsequent app-metadata updates;
  account creation verifies the profile exists before reporting success.
- Members can read and edit the shared workspace. Only admins can manage accounts.
  Admin management endpoints recheck role and account status on every request.
- The app uses its own fixed 12-hour sessions stored in `caesar_sessions`.
  Cookies are random, HttpOnly, SameSite=Strict, and Secure in production. Only
  SHA-256 hashes of cookie tokens are stored in the database. Sessions survive
  backend restarts; users sign in again after expiry. Supabase auth tokens are
  discarded after password verification, so refresh-token middleware is unnecessary.
- Password resets and access changes invalidate existing sessions through the
  profile's session epoch. Disabling a profile blocks future login and API access.
  Manage access through the app; changing a password directly in Supabase Auth
  alone does not revoke this app's separate sessions. For an emergency admin
  password reset in Supabase, also update that profile's `session_epoch` to
  `gen_random_uuid()` using the SQL Editor.
- The first admin is protected from changes through the member-management UI.
  Further administrator provisioning is a server/database operator action.

## Data and deployment

The workspace is stored as a versioned JSONB document in `caesar_workspace`.
This preserves the current data model, and saves atomically include activity.
Revision checks retry concurrent writes to avoid losing unrelated changes.
Simultaneous edits to the same record remain last-save-wins. A future larger
workspace can split entities into tables behind the existing repository interface.
The local JSON prototype data is not automatically copied to Supabase.

Projects can store an optional `parentProjectId` inside the workspace JSONB
document. Missing, null (accepted in API input), or empty parents mean a top-level
project. Team documents can store `responsibilities`, `workingStyle`, `workflow`,
and `projectTypes`; the existing description explains what the team does. These
are optional text fields. Team text sections support up to 25,000 characters each.

Formatted team documentation is stored in an optional `information` object:
`{ version: 1, sections: { description, responsibilities, workingStyle, workflow,
projectTypes } }`. Each section contains an allowlisted Tiptap JSON document.
The backend validates node structure, depth, size, marks and HTTP(S)/mailto links,
and rebuilds the document without arbitrary HTML or attributes. The reading page
renders React elements rather than injecting HTML. Plain text fields are kept in
sync for summaries and older clients. Unchanged legacy updates retain formatting;
an old client changing a section replaces only that section with plain text.
Existing text-only records render as paragraphs with their line breaks preserved,
and gain structured documents only when saved in the new editor. No bulk data
rewrite or SQL migration is required. Members API requests allow up to 1 MB for
these documents; document and per-section limits still apply on the backend.

No additional SQL migration or backfill is needed for these optional JSON fields.
Existing documents remain valid. New fields are written through the existing
atomic revision-checked API. Older clients that omit these fields on update
preserve their stored values; sending an empty string clears a field. The API
rejects missing parents, self-parenting, and cycles on every save attempt.
Direct browser database access remains denied. As before, active members and
admins can edit shared projects and team profiles; team member names are display
data, not account-to-team authorization assignments.

All three tables enable RLS and deny direct access by `anon` and `authenticated`
roles. The backend secret key has service access; every public application route
must continue to enforce the appropriate membership/admin check.

Use Node 22+ and HTTPS. Configure the server environment with the same Supabase
variables (bootstrap credentials are unnecessary after setup). Keep the existing
`/api/members/*` reverse proxy to Node and `/new/*` frontend deployment. Static
hosting alone cannot serve this portal. See `frontend/DEPLOYMENT.md`.

Login attempt throttling currently runs per backend process. Behind a proxy,
untrusted forwarding headers are ignored; configure a trusted proxy and an edge
rate limit as appropriate before scaling to multiple backend instances. Sessions
and workspace data themselves are shared across instances.

Expired sessions cannot authenticate. Periodically remove them with
`delete from public.caesar_sessions where expires_at < now();` using the SQL
Editor or a scheduled database job. Configure Supabase backups for real data.

## Checks

Run `npm run check:supabase:live` for a read-only check of the configured hosted
project. It checks the required table columns, workspace document, public access
restrictions, administrator/Auth linkage, and signup settings without printing
keys or passwords. It does not apply migrations or create accounts, and does not
prove every SQL trigger/index exists. The browser/API flows verify their behavior.

Run `npm run build` and `npm run check:members` for the existing local-mode flows.
The local checks explicitly select the local provider and isolated data files.
They never contact the configured Supabase project.

`npm run check:supabase` verifies the real migrations and grants in embedded
PostgreSQL, then runs API and browser flows against a local Auth/PostgREST test
transport. It covers admin/member restrictions, resets and revocation, shared
storage, concurrent saves, restart persistence, and responsive user management.
It does not verify the hosted Supabase Auth service or deployment; test those
after completing the setup above.

The provisioning regression mirrors Supabase Auth's insert-then-update sequence
for custom `app_metadata`; see the [Auth implementation](https://github.com/supabase/auth/blob/master/internal/api/admin.go).

References: [Supabase admin user creation](https://supabase.com/docs/reference/javascript/auth-admin-createuser),
[password login](https://supabase.com/docs/reference/javascript/auth-signinwithpassword),
[row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
