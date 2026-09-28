# Handoff and review

The portable part of AStra's design system: what exists, how it maps to the brief, what's assumed, and what needs your decision before the connected mockup pass. Section numbers refer to `CLAUDE_DESIGN_CONTEXT.md`; requirement IDs to SRS v0.3.

## What ships

- `tokens.json` (semantic tokens, five themes) and the generated `tokens.css` (CSS custom properties; `[data-theme="light|crimson|chrome|prism|cinema"]`).
- `components/bundle.js` — one classic script exposing `window.AStra` (React 18 components, Phosphor paths embedded), `components/bundle.css` (component styles + motion variables), `components/index.d.ts` (props as documentation).
- A live preview and usage guide per component, the proof set, the motion set (five example layouts and storyboards), `guidelines/motion.md`, and this handoff.
- Motion assets: placeholder MP4/WebM loops, posters and storyboard stills in the **Motion** and **Storyboards** asset groups.
- These are **design specimens, not production code**: the bundle is a reference implementation for review. Production will use `@phosphor-icons/react`, the God UI sources under `components/godui/`, and whatever stack is chosen later. No framework was selected and nothing was installed in the AStra folder.

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
| Content and identity | Avatar | image, initials fallback, verified; 28–80 |
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
| `ink` on `bg` | 16.0 | 18.1 | 20.1 | 15.6 | 18.0 | 4.5:1 |
| `ink` on `surface` | 17.3 | 17.2 | 18.3 | 17.3 | 16.8 | 4.5:1 |
| `ink-muted` on `surface` | 8.1 | 9.6 | 8.3 | 7.9 | 9.6 | 4.5:1 |
| `ink-muted` on `surface-sunken` | 6.9 | 10.4 | 8.8 | 6.5 | 10.4 | 4.5:1 |
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
| `border-strong` on `field` | 4.1 | 3.4 | 3.4 | 3.8 | 3.3 | 3:1 |
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

Connected mockups for the three demo journeys (§7), the remaining screens in §6, and the components listed under "Not yet designed" — reusing these tokens and components, with any additions documented here.
