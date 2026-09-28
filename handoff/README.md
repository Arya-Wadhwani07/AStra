# AStra design handoff

Everything needed to build the AStra website from the approved Claude Design work: the design system (tokens, fonts, colours, components, icons, motion), all 53 page mockups as clickable source, full-page screenshots, media (motion loops and the mascot animation) and written specs.

Exported Sep 27, 2026 from:
- Design system: AStra (Claude Design System artifact), **v7 Glass theme**
- Prototype: "AStra website prototype" (Claude Design canvas), 53 boards (26 screens in desktop and mobile, plus the mobile creator menu)

All people, prices, points, orders and activity shown are **sample data**. Nothing here is live.

## Start here

1. **Browse the clickable prototype.** From this `handoff` folder run
   ```
   python3 -m http.server 8080
   ```
   then open http://localhost:8080/prototype/ . Pick a page on the left, or click through inside a page like Play mode. `#PageName` in the URL deep-links (for example `#Dashboard`). Opening the HTML file directly won't work: the viewer loads pages over http.
2. **Browse the component library:** http://localhost:8080/design-system/gallery.html (switch theme at the top).
3. **Give Codex `CODEX.md`.** It is the build brief: what to build, in what order, which files are the source of truth, and the product rules that must not change.

## What's in the folder

| Path | What it is |
|---|---|
| `CODEX.md` | Build brief for Codex (or any engineer). Read first. |
| `design-system/tokens.json` | Source of truth for every design token: colours per theme, type scale, spacing, radius, sizes, layout, layers, shadows. |
| `design-system/tokens.css` | The same tokens as CSS custom properties. `:root` = Studio; `[data-theme="glass"]`, `cinema`, `crimson`, `chrome`, `prism` override. |
| `design-system/fonts.css`, `fonts/` | `@font-face` rules and WOFF2 files: Unbounded (display), Schibsted Grotesk (UI), IBM Plex Mono (IDs). OFL licences included. |
| `design-system/components/bundle.css` | Styles for every component, glass/ambient surfaces, motion durations, easing and keyframes. |
| `design-system/components/bundle.js` | Reference React 18 implementation of all components (`window.AStra`), Phosphor icon paths embedded. Port these, don't ship the bundle. |
| `design-system/components/index.d.ts` | Props for every component. Treat as the component API contract. |
| `design-system/components/<Name>/README.md` | Usage rules per component. `preview.html` shows its variants and states. |
| `design-system/gallery.html` | All component previews on one page, any theme. |
| `design-system/icons/regular`, `icons/fill` | The 85 Phosphor icons used, as SVG (currentColor). In code use `@phosphor-icons/react`. |
| `design-system/README.md`, `guidelines/handoff.md`, `guidelines/motion.md` | Design system rules: themes, taste rules, content rules, accessibility, motion specs and safe areas. |
| `prototype/pages/*.dc.html` | The 53 page mockups exactly as they exist on the canvas (markup + sample data + interaction logic). `canvas.json` is the board index. |
| `prototype/index.html`, `runtime.js`, `vendor/` | Local viewer that renders those pages with the design system. |
| `screens/desktop`, `screens/mobile` | Full-length screenshots of every board at 1x (1440 or 390 wide). |
| `media/motion/` | Cinema loops (MP4 + WebM), posters, storyboard stills, the hero intro, and `render.py` that generated them. |
| `media/mascot/` | The AStra pixel robot animation: web-ready square loop (MP4 + WebM), posters, and your original 1920x1080 file. |
| `specs/screens.md` | Screen inventory: every page, its states, actions, components and links. |
| `specs/routes.json` | Suggested URL per screen with source and screenshot paths. |
| `specs/tokens.md` | Human-readable token tables (all themes), type scale, motion. |
| `specs/product-rules.md` | Loyalty, collaboration, verification, privacy and copy rules the UI must follow. |
| `specs/sample-data.md` | The fictional sample world used across screens. |
| `specs/mascot.md` | The mascot animation: source recording, web files, placements, sizes, behaviour and re-encode commands. |

## Where the mascot appears

The animation you prepared (the pixel robot that waves and types "ASTRA" on its visor) is now in the website:
- **Landing page footer**, beside "Bring your work. Meet your people." (desktop 200px, mobile 120px).
- **Onboarding** ("Pick a few creators to start your feed"), beside the headline (desktop 160px, mobile 96px).

It uses the design system's `MotionLoop`: muted, loops, pauses off-screen, has a pause control, and shows the poster under reduced motion or Save-Data. Files: `media/mascot/astra-mascot-wave-1x1.mp4|webm` and `astra-mascot-poster-1x1.jpg`. Good further spots (not built yet): empty states, the 404 page and loading screens. Full details: `specs/mascot.md`.

## Known limitations

- The viewer is a lightweight re-implementation of the canvas runtime. It matches the canvas closely but isn't pixel-identical, and the headless screenshots show video posters instead of moving loops.
- A few prototype-only controls exist to demo states (labelled "Demo:" or "Prototype controls"). Build the states, not the demo switches.
- Several product policies are still open (see `specs/product-rules.md`). The mockups show them as open; don't hard-code a decision.
