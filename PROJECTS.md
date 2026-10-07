# Public project showcase

The homepage project section is at `/#projekt`. Phobos has an internal detail
page at `/projects/phobos/`. Production routes are prefixed with `/new/` through
`sitePath`; the existing deployment fallback also handles direct loads.

`frontend/src/data/rocketProjects.ts` holds the public editorial project data.
The Phobos hybrid classification, 3 km target altitude and current-project status
were confirmed by CAESAR. System descriptions summarise the existing technical
team pages. Team links do not create subproject or database relationships.

To publish a development update, add a verified date (`YYYY-MM-DD`), title and
description to the project's `updates` array. Until then, the page displays an
empty state. The development process does not imply completed milestones.

To add another rocket project, add an entry to `rocketProjects` using the
`RocketProject` type. The app resolves `/projects/{slug}/` and renders the shared
detail page, image, facts, status and team components. Add a showcase/navigation
link when that project is ready to be published. The homepage currently features
Phobos explicitly. There is no separate project archive or archive API feed.

This public content does not read or write private Supabase workspace projects,
members, permissions or parent/child relationships.

Validation:

- `npm run build --workspace=frontend`
- `npm run check:projects` (defaults to a running frontend on port 5174; set
  `CHECK_URL` to use another server). The script also starts and stops a preview
  of the production build under `/new/`.

The browser check covers the showcase, internal detail routes, team navigation,
responsive layouts, keyboard navigation, reduced motion and independence from the backend.
It uses an installed Chrome/Edge or a Playwright browser; set `BROWSER_PATH` if
needed. Production preview checks do not replace checking the live host's
Apache fallback after deployment.
