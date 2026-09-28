# Handoff and review

The portable part of AStra's design system: what exists, how it maps to the brief, what's assumed, and what needs your decision before the connected mockup pass. Section numbers refer to `CLAUDE_DESIGN_CONTEXT.md`; requirement IDs to SRS v0.3.

## What ships

- `tokens.json` (semantic tokens, five themes) and the generated `tokens.css` (CSS custom properties; `[data-theme="light|crimson|chrome|prism|cinema"]`).
- `components/bundle.js`: one classic script exposing `window.AStra` (React 18 components, Phosphor paths embedded), `components/bundle.css` (component styles + motion variables), `components/index.d.ts` (props as documentation).
- A live preview and usage guide per component, the proof set, the motion set (five example layouts and storyboards), `guidelines/motion.md`, and this handoff.
- Motion assets: placeholder MP4/WebM loops, posters and storyboard stills in the **Motion** and **Storyboards** asset groups.
- These are **design specimens, not production code**: the bundle is a reference implementation for review. Production will use `@phosphor-icons/react`, the God UI sources under `components/godui/`, and whatever stack is chosen later. No framework was selected and nothing was installed in the AStra folder.

## v7 Glass theme (what changed)

Requested with a liquid-glass reference: a blurred photographic scene behind large, nearly clear panels with white type, bright rims and soft sheens. v6's milky white frost over a pale background didn't read as that.

- **New theme `glass`:** full token set (grounds are translucent navy, ink is white, action is warm white with navy text, statuses use the dark-theme hues on translucent grounds), plus `ambient-sky` and `ambient-ground` for the scene.
- **Scene:** sky-to-ground gradient, four blurred light sources at 45%, faint light rays at the top, fine grain. Real creator imagery can replace it later: set it as the `.as-ambient` background image.
- **Panels:** 45% navy tint, 32px blur at 185% saturation, 1px rim at 26% white, inner top highlight, diagonal sheen, deep soft shadow.
- **Controls:** clear glass chips, fields and secondary buttons; warm-white primary; tab and segmented tracks press into the glass; stat tiles become glass tiles (neumorphism doesn't read on a dark scene).
- **Contrast:** checked against the brightest blob position: white ink ≥ 5:1, `ink-muted` ≥ 4.5:1.
- **Where:** every signed-in page, onboarding and sign-in. The landing keeps its Cinema motion stages; its Studio sections move to Glass so the whole public page stays dark.

## v6 ambient glass (what changed)

Requested after v5: the signed-in pages felt flat. v6 replaces v5's "no wash in app shells" rule with a designed surface.

- **Tokens:** `ambient-1…4`, `glass-fill`, `glass-edge`, `glass-highlight`, `neu-surface`, `neu-light`, `neu-shade` (Studio and Cinema values; other themes inherit Studio).
- **Classes:** `as-ambient` (+ `__blob--1…4`, `__grain`, `--drift`, `--quiet`), `as-app--glass`, `as-neu`, `as-neu--inset`, `as-neu-tile`.
- **Automatic inside an ambient shell:** liquid glass on `as-card`, `SideNav`, mobile `TopBar` and `BottomNav`, fields (`TextField`, `Select`, `SearchField`), `Chip`, secondary `Button` and `IconButton`, `QuantityStepper`, `RoleSwitch`, `FileUpload`, `DeliveryStatus`, `Banner` (tinted glass), `Toast`, `Tooltip`, `Dialog`, media credit chips; a glass rim on the navy primary; neumorphic tracks on `Tabs` (underline variant) and `SegmentedControl`.
- **Motion:** drift only on browsing pages and only without reduced motion. Checkout, forms, conversations and admin stay still.
- **Accessibility:** glass fill 72% keeps `ink-subtle` ≥ 4.5:1 over the strongest blob; control borders stay at 3:1; neumorphic shadows are never the only boundary.
- **Performance:** `backdrop-filter` costs GPU time; production should cap glass to cards in view and fall back to `surface` when `backdrop-filter` isn't supported.

## v5 taste pass (what changed)

An anti-template audit (the `design-taste-frontend` and `redesign-existing-projects` skills, run in preserve-the-brand mode). Palette roles, type, component APIs, motion loops and loyalty rules are unchanged.

| Area | Before | After | Why |
| --- | --- | --- | --- |
| Studio neutrals | bg #FBF5F1, sunken #F5EBE5, border #EED9CF, border-strong #8C7A73 (pink-taupe) | #FAF7F4, #F2EEEA, #E7E1DC, #7B7E8C (navy-grey) | Warm ground and cool navy ink were two grey families; now one. |
| Chrome bg | #000000 | #08080A | No pure black. |
| Shadows | `shadow-sm` warm black; coral halo on every primary button, selected nav item and segment | navy-tinted; halos removed | Glow reserved for one public CTA (`as-btn--glow`). |
| App shells | coral/orange radial wash behind every signed-in page | none | Transactional views stay quiet. |
| Cards | border + shadow at rest | border only; shadow for raised panels (`as-card--raised`, order summary) | Cards shouldn't all float. |
| Avatars | coral, blue and teal rings; points/private/info fallback tints | one neutral ring; neutral-family tints | Semantic colours were decorating people. |
| Tabs, meters | glowing underline; coral-to-blue gradient fills | flat coral | No neon, no even gradients. |
| Type | none | `text-wrap: balance` on headings, `pretty` on body, `.as-measure` 65ch, tabular figures on money and points | Readability and alignment. |
| Copy | em dashes in 4 component strings | removed | Taste rule: no em or en dashes in UI. |
| Docs | Button README said pill + coral halo | 12px corners, navy hairline shadow | Docs now match the CSS. |

New page rules (Cinema as blocks, eyebrow rationing, no three-equal-card rows on public pages, one label per intent, dash and middle-dot rules) are in the README under *Taste rules* and in `guidelines/motion.md` under *Placement on a page*.

## Component inventory

| Family | Component | Variants / states covered |
| --- | --- | --- |
| Foundations | Icon | regular, fill, bold, duotone; 16/20/24/40 |
| Foundations | AuroraText | theme stops, custom colors, speed; reduced-motion static |
| Foundations | OrbitingCircles | animated, reverse, static; center slot |
| Foundations | Logo (+ Wordmark, Eyebrow) | planet mark + wordmark, mark only, cropped wordmark |
| Motion | MotionLoop | playing + pause control, reduced motion / Save-Data poster, error → poster, no-media gradient, desktop/mobile sources |
| Motion | MotionStage | left / right text side, compact, portrait (mobile), nav band, footnote |
| Actions and input | Button | primary, secondary, quiet, destructive; sm/md/lg; icon; loading; disabled + reason; public glow |
| Actions and input | IconButton | quiet, secondary, primary; sm/md/lg; toggle selected; disabled |
| Actions and input | TextField (+ PasswordField) | default, helper, required/optional, error, success, disabled, multiline, date/time, icon, counter |
| Actions and input | Select | default, error, disabled |
| Actions and input | Checkbox (+ Radio) | checked, indeterminate, description, disabled, error |
| Actions and input | Switch | on, off, disabled |
| Actions and input | SegmentedControl | icons, note, sizes (response limit 5/10/20, content type) |
| Actions and input | SearchField | empty, with value + clear |
| Actions and input | Chip | filter toggle, removable, required, preferred, met / unmet |
| Actions and input | FileUpload | idle, uploading, done, error |
| Navigation | AppShell | desktop (± rail), admin, mobile |
| Navigation | SideNav | creator, audience, admin; selected; counts; creator-only tag |
| Navigation | BottomNav | audience, creator; cart badge |
| Navigation | RoleSwitch | creator, audience |
| Navigation | Tabs | underline, display (sign in / join); counts |
| Navigation | Breadcrumbs (+ Pagination) | trail; first/middle/last page |
| Content and identity | Avatar | image, initials fallback, verified; 28-80 |
| Content and identity | CreatorSummary | full card, compact; favorite / custom action |
| Content and identity | MediaFrame | 4:5, 16:9, 1:1, 9:16, 3:2, 3:4; credit; label; missing image; phone frame |
| Content and identity | FeedCard | post (media / text-only), event, merchandise; external tickets |
| Content and identity | FavoriteButton | off, on; icon-only, labelled |
| Content and identity | PriceTag (+ AvailabilityLabel) | price, free, changed price; available, low, sold out, external, ended |
| Collaboration | OpportunityCard | list, detail; open, paused, closed, draft; selected |
| Collaboration | ResponseCounter | 8/10, 9/10, 10/10 paused |
| Collaboration | EligibilityPanel | eligible, missing field, not eligible, responded, paused, closed |
| Collaboration | ResponseForm | idle, sending, failed (kept text) |
| Collaboration | ParticipantRow | new, shortlisted, declined, accepted, changes requested, awaiting, confirmed |
| Collaboration | MessageBubble | received, sent, sending, failed + retry, system note |
| Collaboration | BriefStatus | awaiting confirmations (new version), active |
| Commerce and loyalty | CartItem | default, changed price, unavailable, points eligible |
| Commerce and loyalty | QuantityStepper | default, at max, disabled |
| Commerce and loyalty | OrderSummary | ready, processing, blocked; points applied |
| Commerce and loyalty | PointsBalance | available + pending + active benefit |
| Commerce and loyalty | LedgerRow | pending, approved, rejected, reversed, redeemed, restored |
| Commerce and loyalty | DeliveryStatus (+ Receipt) | paid/declined/cancelled/checking/refunded × confirmed/none/refunded × queued/sent/delayed/failed |
| Feedback and trust | StatusBadge | success, warning, error, info, neutral, points, private, accent |
| Feedback and trust | Banner | info, success, warning, error, private, points; action; dismissible |
| Feedback and trust | Toast | success, error, info, points; action |
| Feedback and trust | Tooltip | top, bottom, end |
| Feedback and trust | Skeleton (+ Loading) | text, row, card |
| Feedback and trust | EmptyState | first use, no results, error |
| Feedback and trust | Dialog | default, destructive, drawer |
| Feedback and trust | VerificationStatus | not submitted, pending, verified, action needed |
| Feedback and trust | ConsentCard | unconnected, connected, expired, denied, unavailable, disconnected |
| Administration | AdminTable (+ AdminCaseRow) | pending, held, decided, appeal open; selected row |
| Administration | AuditRow | with reason, with notice |

**Proof set (§1):** ProofFeedDesktop (audience feed + loyalty rail, loading state), ProofOpportunityDesktop (creator-only detail with eligibility, 8/10, response form, paused and not-eligible frames), ProofCartDesktop (recoverable payment decline, §8 arithmetic), ProofMobile (feed and opportunity at 390px), ProofAdmin (queue, empty appeals, case decision with reason and audit), ProofThemes (the same hero in Studio, Crimson, Chrome and Prism).

**Motion set:** MotionHeroDesktop, MotionHeroMobile, MotionCollabIntro, MotionLoyaltyIntro, MotionStoryboards.

**Not yet designed (next pass or small additions):** searchable combobox for skills and languages, account menu popover, publishing form layouts (Post / Event / Merchandise), rights-information disclosure, campaign setup form, loyalty rule editor, notification list item, creator insights charts, conversation composer, full-screen checkout steps.

## Contrast check

WCAG 2 contrast ratios computed from the token values (`bundle.css` pairs follow the same tokens).

| Pair | Studio | Crimson | Chrome | Prism | Cinema | Floor |
| --- | --- | --- | --- | --- | --- | --- |
| `ink` on `bg` | 16.2 | 18.1 | 19.2 | 15.6 | 18.0 | 4.5:1 |
| `ink` on `surface` | 17.3 | 17.2 | 18.3 | 17.3 | 16.8 | 4.5:1 |
| `ink-muted` on `surface` | 8.1 | 9.6 | 8.3 | 7.9 | 9.6 | 4.5:1 |
| `ink-muted` on `surface-sunken` | 7.0 | 10.4 | 8.8 | 6.5 | 10.4 | 4.5:1 |
| `ink-subtle` on `field` | 5.5 | 6.2 | 5.6 | 5.4 | 6.1 | 4.5:1 |
| `on-action` on `action` | 13.9 | 11.1 | 11.1 | 13.9 | 11.1 | 4.5:1 |
| `link` on `surface` | 7.1 | 8.4 | 9.1 | 7.1 | 8.2 | 4.5:1 |
| `accent-ink` on `surface` | 5.6 | 6.9 | 8.4 | 5.3 | 8.2 | 4.5:1 |
| `success` on `success-bg` | 4.8 | 9.9 | 10.5 | 4.8 | 9.9 | 4.5:1 |
| `warning` on `warning-bg` | 5.6 | 10.2 | 10.7 | 6.0 | 10.2 | 4.5:1 |
| `error` on `error-bg` | 4.7 | 7.2 | 8.0 | 4.7 | 7.2 | 4.5:1 |
| `info` on `info-bg` | 5.1 | 9.3 | 9.9 | 5.1 | 9.3 | 4.5:1 |
| `points` on `points-bg` | 5.8 | 7.9 | 8.5 | 5.8 | 8.2 | 4.5:1 |
| `private` on `private-bg` | 4.8 | 10.4 | 11.3 | 5.2 | 10.4 | 4.5:1 |
| `border-strong` on `field` | 4.0 | 3.4 | 3.4 | 3.8 | 3.3 | 3:1 |
| `focus` on `surface` | 3.9 | 10.8 | 9.5 | 7.1 | 10.8 | 3:1 |
| `aurora-3` on `bg` | 4.5 | 6.2 | 6.9 | 6.4 | 10.0 | 3:1 |

On motion stages, copy sits over a scrim (92% → 80% navy-black across the text-safe column) and the loops keep particles dim inside that column.

Status never relies on colour: every badge and banner carries an icon and a word. A color-blind-safe status theme can be added if you want one.

## Assets

- Icons: Phosphor Icons v2.1.1 (MIT). 24 key regular-weight SVGs are uploaded in the Icons group for non-React use; the full set used by the components is embedded in `bundle.js`.
- Fonts: Unbounded, Schibsted Grotesk (variable woff2) and IBM Plex Mono 400/500 in `fonts/`, SIL Open Font License; no paid license.
- Logo: working mark (filled Phosphor planet in coral + "AStra" in Unbounded). No approved logo exists.
- Imagery: CSS placeholder art only, labelled "Placeholder art".
- Motion: **procedurally rendered placeholder loops** (numpy particle renderer → ffmpeg), not final production renders. See `guidelines/motion.md` for names, sizes and specs.
- God UI: `aurora-text` and `orbiting-circles` behaviors are ported into the bundle.

## Prototype assumptions

- Studio (light) is the default for the signed-in app; Crimson, Chrome and Prism are for public/editorial moments; Cinema is only for motion sections.
- Verification labels: Not submitted, Pending review, Verified, Action needed (proposed).
- Loyalty: one shared balance across participating creators; 100 points = $1 off; each creator sets a maximum % discount. Demo: Mira caps Color After Hours ($25) at 20% → up to $5 (500 pts), fan pays $20. Minimum 100, steps of 100. A full refund restores redeemed points (assumption for review).
- An opportunity at its limit stays paused; what declines or reopening do to the count is unresolved.
- Mobile More menu holds the role switch for dual-role users.
- Timestamps show Pacific Time for the Los Angeles demo.

## Decisions needing your approval

1. **Cinematic direction ("One constellation"):** six discipline particle clouds converging into one braided knot on a dark reflective floor, in the brand's coral / loyalty-blue / warm-white. Approve before any full website mockups.
2. **Cinema theme scope:** only behind motion sections (hero, collaboration intro, loyalty intro), with the rest of the site staying in Studio. Or run the whole public site on Cinema?
3. **Final renders:** keep the procedural loops for the hackathon, or re-render them in a 3D tool from the same storyboards.
4. **Palette and type:** navy + coral with Unbounded + Schibsted Grotesk (unchanged from the approved base).
5. **Density and shapes:** 12px buttons and inputs, 20px panels, admin at 48px rows.
6. **Final product name and logo** (AStra is the working name).
7. **swift-secp256k1:** this is Bitcoin/Nostr signing and key cryptography. The brief defines points as non-cash and rules out tokens, wallets and crypto framing, so nothing in this system uses it. If you intend it for something specific (for example signing audit records or verifying creator keys), tell me how and I'll design the surfaces for it; it shouldn't change points into a currency.
8. The unresolved product rules in §11 (outreach acceptance, response counting after declines, invitations, verification provider, brief edits after confirmation, checkout policy, point economics).

## Next pass (after approval)

Connected mockups for the three demo journeys (§7), the remaining screens in §6, and the components listed under "Not yet designed", reusing these tokens and components, with any additions documented here.
