# Caesar_website_v2 — CAESAR Modern Website (Vite + React + Node)

This workspace contains a lightweight scaffold for a modern CAESAR site.

Quick commands

Install dependencies (root uses npm workspaces):

```bash
npm install
```

Run development servers (frontend + backend):

```bash
npm run dev
```

Or run individually:

```bash
npm run dev --workspace=frontend
npm run dev --workspace=backend
```

Build for production:

```bash
npm run build
```

The backend serves a minimal API at `/api/projects` during local development.

The redesigned homepage runs at http://localhost:5173. Vite proxies `/api` to the
existing backend on port 3000. The current frontend production build targets
`https://caesar.se/new/` as a standalone static upload; the backend is retained
unchanged and is not required for this deployment. Its existing root-based static
hosting setup is not configured for the new production base path.

Build the temporary deployment with `npm run build --workspace=frontend` and upload
the **contents** of `frontend/dist/`, including `.htaccess`, to `httpdocs/new/`.
Do not upload anything to the WordPress document root. See
[frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md) for Apache/Plesk routing details,
the production project-data snapshot, and verification commands.

The homepage uses the supplied CAESAR logo and locally stored imagery from the
existing website. Other pages remain on caesar.se and are linked directly.
The existing Deimos redirect remains at `/projects/deimos` in development and
`/new/projects/deimos` in production, forwarding to the original Deimos page.
The API's project descriptions and destinations are preserved unchanged.

Homepage sections live in `frontend/src/components`, with content and external
links in `frontend/src/data/site.ts` and the visual system in `frontend/src/styles.css`.
Asset provenance is documented in `frontend/public/assets/README.md`.
News is a snapshot of the latest Swedish posts retrieved on 2026-09-16.

`npm run build` type-checks the frontend and builds both workspaces.
With the development servers running, `npm run check:homepage` checks responsive
layouts, image loading, navigation, reduced motion, scroll reveals, the project
API failure state, and the legacy Deimos destination. Install a Playwright browser
with `npx playwright install chromium`, or set `BROWSER_PATH` to an existing
Chromium/Chrome/Edge executable. Set `CHECK_URL` to check another server.
Screenshots are written to the ignored `artifacts/` directory.

The opening `RocketScrollExperience` uses GSAP ScrollTrigger and a native CSS
sticky viewport. The existing 2480svh runway and camera landmarks are preserved.
`scrub: .25` gives the artwork a short catch-up ease in either scroll direction;
wheel, touch, keyboard, and scrollbar movement remain native, without snapping.
The camera introduces Electronics,
Propulsion, Structures, and Marketing in that order, using the supplied team copy
and keywords in `frontend/src/data/subteams.ts`. Technical diagrams occupy the
space beside the rocket; mobile shows the complete copy below its selected detail.
Subtle SVG/CSS highlights identify electronics, propulsion, structure, and the
printed CAESAR branding. There are no invented dimensions or performance figures.
Electronics includes a floating Phobos flight-computer schematic in
`frontend/src/components/FlightComputer.tsx`, styled in `frontend/src/flight-computer.css`.
`AvionicsHardware.tsx` supplies an illustrative PCB and distinct sensor, radio,
recovery, valve, microSD, and receiver symbols. Decorative traces do not imply a
real pinout or bus assignment. Occasional directional packets connect the hardware;
telemetry coordinates an outgoing packet, radio arcs, and receiver indication.
Hover, click, or focus a subsystem to inspect it; clicking pins the selection and
Escape closes it. Its entrance and restrained signal pulses run only while the
schematic is visible and respect reduced motion. Phones use a compact schematic;
short phone screens use the existing static reading layout to keep all content reachable.
Run `npm run check:avionics` to check subsystem interactions, keyboard access,
responsive spacing, section visibility, and reduced motion.
Propulsion uses a separate vertical flow drawing in `HybridPropulsion.tsx` and
`hybrid-propulsion.css`: tank, valve, injector, paraffin grain, chamber, and nozzle.
Its four interactive areas explain oxidizer flow, plumbing, hybrid combustion,
and the CAESAR-supplied initial sizing. Design parameters appear only on selection.
The existing Propulsion copy sits to the left so the schematic can occupy the right.
Run `npm run check:propulsion` to verify the flow interactions, supplied values,
mobile annotation spacing, keyboard controls, and reduced motion.
Structures adds a compartment cutaway in `VehicleArchitecture.tsx`, with a separate
`RecoveryMechanism.tsx` demonstration. Selecting Recovery again replays the servo,
cam, pressurization, bolt separation, and parachute sequence. Payload and stability
annotations use the supplied project information; Electronics Bay focuses on
physical integration. The default drawing settles after its entrance, and reduced
motion shows the completed mechanism without animation. `npm run check:structures`
checks layout, recovery timing/replay, payload content, keyboard access, and reduced motion.
After Marketing, annotations disappear and the whole rocket returns to the exact
center of the viewport for the mission statement. All four navigation controls
work with a keyboard, and scrolling backwards reverses the sequence.

The About text and portrait share one 800ms, 20px entrance tween, triggered at the
same About landmark and reversed together. Short screens use one shared viewport
trigger for both elements. GSAP owns this composition; the homepage's single
IntersectionObserver handles only ordinary `data-reveal` sections, with 800ms
opacity/translation easing. Live reduced-motion changes clean up these animations.
`npm run check:scroll-motion` samples rendered frames to verify native scrolling,
interpolation, simultaneous image/text timing, reverse motion, and accessibility.

Reduced-motion preferences and short landscape windows use a static introduction,
all four team descriptions in reading order, and the mission with no pinned scroll
sequence. The rocket image has reserved
intrinsic dimensions, is loaded eagerly, and keeps its original aspect ratio.
Animation styles are isolated in `frontend/src/rocket-experience.css`.

Run `npm run check:rocket` with the development servers running to verify camera
travel, reverse scrolling, stage navigation, resizing, live reduced-motion
changes, image loading, and the absence of autoplay at five viewport sizes.
