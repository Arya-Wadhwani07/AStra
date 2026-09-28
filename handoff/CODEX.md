# Build brief: AStra website

You are building the AStra web app from a finished design handoff. Match the mockups closely, use the design system as the only source for visual decisions, and keep every product rule below. Also follow `../AGENTS.md` (filesystem boundary, security, labelling of sample data) and `../CLAUDE_DESIGN_CONTEXT.md` (product brief). Where this brief and AGENTS.md differ, AGENTS.md wins, and the latest explicit user decisions win over both.

> **Development gate.** AGENTS.md says implementation starts only when Arya explicitly authorizes it and that no framework has been selected yet. Confirm both before scaffolding. Keep all files, dependencies and build output inside the `AStra/` folder.

## 1. Sources of truth (in this order)

1. `design-system/tokens.json` / `tokens.css`: every colour, font, size, spacing, radius, shadow, layer. Never hard-code a value that has a token.
2. `design-system/components/index.d.ts` + `components/<Name>/README.md`: component APIs and usage rules. `components/bundle.js` + `bundle.css` are the reference implementation (React 18, plain `React.createElement`). Port them into real components with the same names and props.
3. `prototype/pages/*.dc.html`: each page's layout, copy, sample data, states and interactions. The markup is HTML with `{{ holes }}`, `<sc-if>`, `<sc-for>` and `<x-import component-from-global-scope="AStra.X">` (a design-system component). The `<script type="text/x-dc">` at the bottom holds the page's state (`const s = Object.assign({...}, this.state)`), its actions (`const X = {...}`) and computed values (`renderVals()` return).
4. `screens/desktop|mobile/*.png`: what it should look like. `specs/screens.md` lists states, actions and links per page.
5. `design-system/README.md`, `guidelines/handoff.md`, `guidelines/motion.md`, `specs/product-rules.md`: rules. `specs/mascot.md`: the mascot animation.

Run `python3 -m http.server 8080` in `handoff/` and open `http://localhost:8080/prototype/#Feed` (any page name) to click through the reference.

## 2. Visual system in one page

- **Themes.** Apply with `data-theme` on a wrapper. The signed-in app, onboarding, sign in and landing sections use **Glass** (`data-theme="glass"`); the landing hero, collaboration intro and loyalty intro are **Cinema** stages. Studio (`light`) is the default for component docs.
- **Glass surfaces.** A page root gets `data-theme="glass"` plus `as-shell` (app pages) or `as-app--glass` (public/onboarding), and its first child is the ambient layer:
  `<div class="as-ambient [as-ambient--drift|--quiet]"><span class="as-ambient__blob as-ambient__blob--1..4"></span><span class="as-ambient__grain"></span></div>`.
  Use `--drift` on browsing pages, still on forms/checkout/messages, `--quiet` on admin. Cards, nav, fields, chips and secondary buttons become glass automatically through `bundle.css`.
- **Colour roles.** `action` = every primary button and selection (warm white on Glass, navy on Studio). `accent` = coral energy (logo planet, focus, highlights). `points` = loyalty blue, used only for points. `private` = creators-only teal. Status colours always come with an icon and a word.
- **Type.** Unbounded for display headlines (public pages only), Schibsted Grotesk for everything else, IBM Plex Mono only for codes/IDs. Load `design-system/fonts.css`. Tabular figures for money, points and counts.
- **Shape.** Controls 12px radius, cards 20px, dialogs/stages 28px, pills for chips/badges/avatars.
- **Icons.** Phosphor only, via `@phosphor-icons/react`: regular weight, `fill` for selected states. Names used are in `design-system/icons/`. Icons never carry meaning alone.
- **Motion.** Durations/easing in `bundle.css` (`--dur-fast` 120ms, `--dur-base` 200ms, `--dur-slow` 320ms, `--dur-ambient` 24s). Video loops use `MotionLoop`/`MotionStage` behaviour: muted, loop, pause off-screen, visible pause control, poster under `prefers-reduced-motion` or Save-Data. Checkout, forms, admin and conversations never animate.
- **Mascot.** The pixel robot from Arya's recording (`media/mascot/`: web loop `astra-mascot-wave-1x1.mp4|webm`, poster `astra-mascot-poster-1x1.jpg`, original `astra-mascot-original-1920x1080.mp4`) sits in a rounded glass tile in the landing footer call to action and next to the onboarding headline, desktop and mobile. Same MotionLoop behaviour, no sound, poster under reduced motion, label "Animation: the AStra pixel robot mascot waves and types ASTRA on its visor." Full spec, sizes, CSS and re-encode commands: `specs/mascot.md`.
- **Copy.** Sentence case, verb-first buttons, no em or en dashes, at most one middle dot per line, no exclamation marks. Label sample data once per view.

## 3. What to build (26 screens in desktop + mobile, plus a mobile creator menu)

Responsive pages, one route each (suggested routes in `specs/routes.json`). Desktop shell: 248px sidebar + content (max 1200) + optional 320px rail. Below 768px: top bar + content + bottom nav.

| Area | Screens (source files) |
|---|---|
| Public | Landing `Main` / `LandingMobile`, Sign in and join `SignIn`, Onboarding (pick favourite creators) `Onboarding` |
| Audience (fan) | Feed, Discover, Creator profile `Profile`, Event detail `Event`, Cart and checkout with points `Checkout`, Loyalty history `Loyalty`, Orders, Notifications, Settings |
| Creator workspace | Overview `Dashboard`, Creator setup and verification `CreatorSetup`, Edit profile `ProfileEdit`, Publish (post, event, merchandise) `Publish`, Audience insights `Insights`, Creator orders `CreatorOrders`, Loyalty settings `CreatorLoyalty`, Community (creators only) `Community`, Messages, Creator menu (mobile) `CreatorMenuMobile` |
| Collaboration (creators only) | Find opportunities `CollabFind`, Create opportunity `CollabCreate`, Respond `CollabRespond`, My collaborations (responses, shortlist, brief, active) `MyCollabs` |
| Admin | Review queue `Admin` |

Each mobile board is `<Name>Mobile.dc.html`.

**Key flows** (all clickable in the prototype):
- Join → choose Audience → Create account → verify email → Onboarding (pick creators) → Feed.
- Join → choose Creator or Both → Create account → Set up creator profile (essentials, portfolio, verification) → Overview.
- Feed → Event → Add to cart → Checkout with points → Receipt → Loyalty history.
- Creator: Publish (draft, publish, unpublish, delete, sold out, verification gate).
- Collaboration: Create opportunity → responses → shortlist → brief v1/v2 confirmation → active project; responder side via Find → Respond.
- Creator/Audience view switch (dual-role accounts) in the sidebar and the mobile creator menu.

## 4. Suggested build order

1. Tokens and fonts: import `fonts.css` + `tokens.css` globally (or generate Tailwind/CSS-in-JS config from `tokens.json`); support `data-theme`.
2. Port components from `bundle.js`/`bundle.css`, matching `index.d.ts` and each README (start with Icon, Button, fields, Chip, StatusBadge, Banner, Card patterns, SideNav/TopBar/BottomNav/AppShell). Verify each against `design-system/gallery.html` in Studio and Glass.
3. App shell + ambient/glass layer, routing, role switch.
4. Screens by area (include the mascot tiles on landing and onboarding, see `specs/mascot.md`): public → audience → checkout/loyalty → creator workspace → collaboration → admin. Compare with screenshots at 1440 and 390.
5. States: every state in `specs/screens.md` (empty, loading, error, success, gated). Demo switches in the mockups ("Demo:", "Prototype controls") only exist to show states; don't ship them.
6. Accessibility pass: 4.5:1 text contrast in Glass, visible focus rings, labels on icon-only buttons, reduced motion.

## 5. Product rules you must keep (details in `specs/product-rules.md`)

- Loyalty: one shared platform balance; **100 points = $1 off**; each creator sets a maximum % discount; fans choose points up to the lower of balance and cap and pay the rest; pending points can't be spent; points have no cash value; points are debited only after payment succeeds; never auto-spend the whole balance. No 100% discounts or $0 orders without a policy decision.
- Collaboration is creators only: audiences never see opportunities, responses, conversations, shortlists or progress (enforce on the server, not just in the UI). One response per creator per opportunity; response limit 5/10/20 (default 10) pauses automatically; required filters block, preferred filters only highlight. A brief is a shared plan, not a contract.
- Verification: statuses not submitted / pending / verified / action needed; selling tickets, merchandise and accepting points discounts are gated; identity documents never appear in ordinary screens; provider not chosen.
- No live listening/viewing rewards or "verified Spotify" claims; campaigns are drafts until earning is approved.
- Creators never see buyers' payment details. Private conversations are visible only to participants.
- Label sample data; never present sample numbers as real traction.

## 6. Done means

Every screen matches its screenshot at 1440 and 390, all flows above work, every listed state is reachable, contrast and reduced-motion checks pass, and no rule in section 5 is broken. Report what you verified and anything you couldn't.
