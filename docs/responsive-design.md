# Responsive presentation

The public mobile layout applies at `max-width: 900px`. Desktop styles, original image sources, and the desktop GSAP timeline remain in place. `frontend/src/mobile.css` loads after the existing public styles. The members area has its own scoped `members/mobile.css` overrides, with vertical data records and the existing menu breakpoint at 700px.

On mobile, the homepage uses native document flow, concise team introductions, and optional interactive diagrams mounted when opened. All diagram controls and links to the full team pages remain available. The decorative Earth transition is omitted, the starfield is static, and content does not wait for scroll reveals. Changing between desktop and mobile rebuilds the scene after React mounts the corresponding content.

The hamburger menu supports Escape, keyboard focus containment, background inertness, and scroll locking. Swish keeps the original QR image, number, and exact payment URL; the mobile payment button precedes the QR visually. Contact, sponsor, partner, membership, and social links retain their destinations.

Mobile WebP variants retain the original assets for desktop:

| Asset | Original | Mobile |
| --- | ---: | ---: |
| Homepage rocket | 937,906 bytes | 14,526 bytes |
| Header/footer logo | 362,845 bytes | 7,636 bytes |
| Homepage team photograph | 288,346 bytes | 38,110 bytes |

## Verification

- All 11 public pages: 320, 375, 390, 430, 768, 900, 1024, and 1440px.
- Touch interactions with normal motion: 320×568, 375×667, 390×844, 430×932, 768×1024, 900×700, and 844×390.
- Expanded diagram controls, recovery stages, calculation disclosure, menu/anchors, QR loading, and exact Swish handoff. Swish requests are intercepted; no payment is initiated.
- Sign-in and nine portal views, including project and password dialogs, at 320, 375, 390, 430, 768, 1024, and 1440px. Portal checks use isolated sample responses, including administrative views, without accessing accounts or modifying real data.
- Public desktop element geometry and typography match the captured pre-change baseline at 1024 and 1440px. Desktop screenshots were compared as well; small rasterization differences remain on a few images, without geometry changes.
- Existing desktop animation checks cover camera interpolation, reverse scrolling, synchronized About transitions, and live reduced-motion changes. Live resizing restores the desktop Earth animation and releases mobile menu state.
- Frontend TypeScript check and production build pass. Mobile flows were also tested under the production `/new/` path.

Tests use headless Chrome with touch/viewport emulation, not physical iOS/Android devices. They verify link destinations and intercepted Swish navigation; opening the installed Swish app needs a real phone. Contact uses email links; no public contact form is present.

## Run the checks

Start a Vite development or production preview and set `CHECK_URL` to its base URL (including `/new/` for a build). Use `BROWSER_PATH` if Chrome/Edge is not at a standard Windows location. The portal fixture import requires the backend build (`npm run build --workspace=backend`).

```text
node scripts/check-responsive.mjs --baseline
node scripts/check-responsive.mjs
node scripts/check-mobile-flows.mjs
node scripts/check-scroll-motion.mjs
npm run build --workspace=frontend
```

Capture `--baseline` before a desktop-sensitive change; the next command compares against it. Screenshots and baseline JSON are local artifacts under `artifacts/responsive/`, excluded from Git. Focused interaction runs support `--resize-only` and `--portal-only`.
