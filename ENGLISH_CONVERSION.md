# English-only frontend

All application-owned frontend copy is in English, including navigation,
metadata, accessibility text and public loading/error/empty states. The former
EN language link has been removed. Existing routes and anchor IDs are unchanged.

## Changed frontend files

- `frontend/index.html`: document language, default title and description.
- `frontend/src/App.tsx`: skip link and legacy Deimos redirect message.
- `frontend/src/components/Header.tsx`: desktop/mobile navigation, dropdowns,
  accessible labels and removal of the language link.
- `frontend/src/components/Footer.tsx`: navigation, contact and invitation copy.
- `frontend/src/components/TeamAbout.tsx`: About copy and image description.
- `frontend/src/components/RocketScrollExperience.tsx`: homepage copy and image
  description. Also fixes the blank-screen crash caused by an animation reference
  to the previously removed About link; link handling now supports an empty list.
- `frontend/src/components/MissionTransition.tsx`: mission copy and calls to action.
- `frontend/src/components/ScrollProgress.tsx`: accessible team navigation labels.
- `frontend/src/components/NewsCard.tsx`: English date formatting and link text.
- `frontend/src/components/Partners.tsx`: partner copy and calls to action.
- `frontend/src/components/ProjectFeature.tsx`: project showcase and archive states.
- `frontend/src/components/RocketProjectParts.tsx`: shared project labels/team links.
- `frontend/src/data/rocketProjects.ts`: Phobos editorial content.
- `frontend/src/data/site.ts`: news titles, summaries and image descriptions.
- `frontend/src/pages/RocketProject.tsx`: project detail sections and empty state.
- `frontend/src/pages/Membership.tsx`: membership information and application links.
- `frontend/src/pages/Support.tsx`: donation instructions, metadata and Open Swish.
- `frontend/src/pages/Sponsor.tsx`: sponsorship copy, metadata and Contact Us links.
- `frontend/public/assets/caesar-website.jpg`: refreshed English homepage capture
  used on the Marketing page.
- `frontend/public/assets/README.md`: screenshot provenance updated.

Existing browser-check assertions now use the English labels. The rocket check
also verifies that the removed About link stays absent.

## Audited pages already in English

Electronics, Propulsion, Structures and Marketing page copy, their diagrams and
interactive controls, and all member/login/admin components were already in
English. This includes forms, editors, confirmation dialogs, notifications,
empty states, API error fallbacks and shared team-documentation labels.

## Intentionally preserved

- Proper names, including CAESAR, Phobos, Deimos, Chalmers Raketgrupp,
  Chalmers tekniska högskola, Astronomisk Ungdom and Göteborg.
- URLs, email addresses, route paths, anchor IDs and technical identifiers.
- The original Swish QR image and exact payment URL, including its encoded
  Swedish `Gåva` message. The visible page explains the purpose as “Donation”.
- Stored Supabase data and user-authored content. The interface is English;
  existing records are not rewritten or automatically translated.
- External destinations and documents retain their existing URLs and may have
  their own language. This conversion covers the local React application.

## Verification

The audit covers JSX text, string literals, attributes, metadata, shared backend
labels/errors used by the frontend, public data and text assets. Remaining
Swedish source matches are the preserved names, URLs and identifiers above.
Browser checks cover every public page at desktop and mobile sizes, including
`/new/`, and member/admin screens and editors with isolated fixtures. They do not
write to the database. The frontend build runs TypeScript checking before Vite.
