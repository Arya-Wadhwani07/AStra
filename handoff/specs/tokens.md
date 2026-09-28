# AStra design tokens

Generated from `design-system/tokens.json` (version 7). CSS custom properties live in `design-system/tokens.css`; apply a theme with `data-theme="<id>"` on any element. `:root` is Studio (`light`).

**Themes:** `light` (Studio), `crimson` (Crimson), `chrome` (Chrome), `prism` (Prism), `cinema` (Cinema), `glass` (Glass). The signed-in app, onboarding, sign in and landing use **Glass**; Cinema is only for motion stages (hero, collaboration intro, loyalty intro).

> One palette in five grounds: signal red, orange and coral for energy, off-navy for every button and selection, royal navy-blue for loyalty points. Studio (warm light) is the default for transactional, form and admin views; Crimson, Chrome and Prism are for public, editorial and event moments; Cinema is the scoped dark treatment behind motion surfaces (hero loops, section intros). Status, points and creator-only colors stay separate from the brand accent. v5 taste pass: Studio neutrals lose their pink cast so the warm ground, navy ink and hairlines read as one family; no pure black anywhere; shadows are navy-tinted. v7: a Glass theme (scenic liquid glass) for signed-in pages: deep blurred colour scene, nearly clear panels, white ink.

## Colour

| Token | Studio | Crimson | Chrome | Prism | Cinema | Glass | Usage |
|---|---|---|---|---|---|---|---|
| `--bg` | `#faf7f4` | `#140606` | `#08080a` | `#f1f3fb` | `#04060D` | `#0b1430` | Page ground behind shells and feeds. In Cinema it is the deep navy-black behind motion loops. |
| `--surface` | `#ffffff` | `#1f0c0c` | `#0f0f12` | `#ffffff` | `#0A1020` | `rgba(20, 30, 64, 0.45)` | Cards, panels, sidebar, dialogs' body. |
| `--surface-raised` | `#ffffff` | `#2b1111` | `#1b1b20` | `#fbfcff` | `#111A30` | `rgba(28, 40, 82, 0.62)` | Menus, popovers, sticky order summary; pair with `shadow-md`. |
| `--surface-sunken` | `#f2eeea` | `#0d0303` | `#070708` | `#e6eaf7` | `#020308` | `rgba(6, 10, 26, 0.36)` | Wells: table header rows, code/ID chips, skeleton base, hover fills. |
| `--field` | `#ffffff` | `#271010` | `#1d1d22` | `#ffffff` | `#0D1428` | `rgba(255, 255, 255, 0.08)` | Input, select and textarea fill. |
| `--ink` | `#0f1a33` | `#fff2ef` | `#fafafa` | `#0f1a33` | `#F4F1EE` | `#ffffff` | Primary text and icons on `bg`, `surface`, `surface-raised`, `surface-sunken`, `field`. |
| `--ink-muted` | `#4a4f66` | `#d1b3ad` | `#aaaab6` | `#465170` | `#B3B8C8` | `rgba(255, 255, 255, 0.9)` | Secondary text, metadata, helper text on every surface and `field`. |
| `--ink-subtle` | `#62687f` | `#ad918b` | `#9494a0` | `#5f6988` | `#8E95A8` | `rgba(255, 255, 255, 0.74)` | Placeholders and disabled labels only; still 4.5:1 on `field` and `surface`. |
| `--border` | `#e7e1dc` | `#4a1f1b` | `#2c2c33` | `#d5dcf0` | `rgba(179, 190, 220, 0.14)` | `rgba(255, 255, 255, 0.18)` | Decorative hairlines between content. Never the only edge of a control. |
| `--border-strong` | `#7b7e8c` | `#8f5f58` | `#70707c` | `#7483a8` | `rgba(179, 190, 220, 0.5)` | `rgba(255, 255, 255, 0.55)` | Control outlines (inputs, checkboxes, secondary buttons); 3:1 on `surface` and `field`. |
| `--action` | `#1e2b4d` | `#2a3a66` | `#2a3a66` | `#1e2b4d` | `#2A3A66` | `#f4f1ee` | Off-navy fill: primary buttons, selected nav item, checked controls, selected chips and pagination. |
| `--action-hover` | `#2c3d6b` | `#34477a` | `#34477a` | `#2c3d6b` | `#34477A` | `#ffffff` | Hover/pressed fill of `action`. |
| `--action-edge` | `#1e2b4d` | `#7d93d6` | `#7d93d6` | `#1e2b4d` | `#7D93D6` | `rgba(255, 255, 255, 0.9)` | 1px edge on `action` fills so navy reads against dark grounds (3:1 on `bg` and `surface`). |
| `--on-action` | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` | `#FFFFFF` | `#16244a` | Text and icons on `action` fills. |
| `--navy` | `#16244a` | `#8fa6ea` | `#8fa6ea` | `#16244a` | `#8FA6EA` | `#c9d6ff` | Brand navy as text/icon color: logo planet, headings accents, the navy stop in AuroraText on light grounds. |
| `--link` | `#1f4fc4` | `#ff8d80` | `#ff9a52` | `#1f4fc4` | `#FF8A70` | `#ffb3a3` | Inline text links on surfaces; always underlined. |
| `--accent` | `#e8472f` | `#ff3b2f` | `#ff5f00` | `#ff4f6d` | `#FF5A3C` | `#ff6a4d` | Brand accent for marks: tab underline, progress, wordmark, eyebrow squares, glows. Not for text. |
| `--accent-ink` | `#c42d17` | `#ff6f64` | `#ff8f3d` | `#d0223f` | `#FF8A70` | `#ffa08c` | Accent when it must be text (event dates, eyebrow on surface, active step). |
| `--focus` | `#e8472f` | `#ffb0a8` | `#ffa05c` | `#1f4fc4` | `#FFB0A0` | `#ffd2c8` | 2px solid focus ring, 2px offset, on every interactive element. |
| `--success` | `#007a3d` | `#3ff08f` | `#3ff08f` | `#007a3d` | `#3ff08f` | `#5cf2a0` | Success text/icon on surfaces and on `success-bg`; always with a check icon and a word. |
| `--success-bg` | `#d2fbe3` | `#0a2e18` | `#082914` | `#d2fbe3` | `#0a2e18` | `rgba(63, 240, 143, 0.16)` | Success banner/badge fill. |
| `--warning` | `#8a4f00` | `#ffd03a` | `#ffd03a` | `#854c00` | `#ffd03a` | `#ffd66b` | Warning text/icon; always with a warning icon and a word. |
| `--warning-bg` | `#ffedb8` | `#332508` | `#2e2106` | `#ffedb8` | `#332508` | `rgba(255, 208, 58, 0.16)` | Warning banner/badge fill. |
| `--error` | `#c9002f` | `#ff8f85` | `#ff8f85` | `#c9002f` | `#ff8f85` | `#ff9c93` | Error text/icon, field error outline; always with an icon and a message. |
| `--error-bg` | `#ffdce3` | `#43100c` | `#330c09` | `#ffdce3` | `#43100c` | `rgba(255, 143, 133, 0.18)` | Error banner/badge fill. |
| `--info` | `#006b8f` | `#6fd3ff` | `#6fd3ff` | `#006b8f` | `#6fd3ff` | `#8fdcff` | Information text/icon; pending/processing states; post tags. |
| `--info-bg` | `#d4f1fb` | `#0a2633` | `#08202b` | `#d4f1fb` | `#0a2633` | `rgba(111, 211, 255, 0.16)` | Information banner/badge fill. |
| `--points` | `#1f4fc4` | `#9ab4ff` | `#9ab4ff` | `#1f4fc4` | `#9AB4FF` | `#b3c7ff` | Loyalty points figures and the points icon (royal navy-blue). Never used for money. |
| `--points-bg` | `#dfe8ff` | `#16203f` | `#121a33` | `#dfe8ff` | `#131C3A` | `rgba(154, 180, 255, 0.18)` | Points balance tile and ledger chip fill. |
| `--private` | `#00776f` | `#3ff0d8` | `#3ff0d8` | `#006f66` | `#3ff0d8` | `#6ff3df` | Creator-only marker (lock + 'Creators only'): collaboration surfaces, never on audience views. |
| `--private-bg` | `#c9fbf2` | `#082d28` | `#072520` | `#c9f7ee` | `#082d28` | `rgba(63, 240, 216, 0.14)` | Creator-only banner/badge fill. |
| `--scrim` | `rgba(15, 26, 51, 0.56)` | `rgba(10, 0, 0, 0.7)` | `rgba(8, 8, 10, 0.74)` | `rgba(15, 26, 51, 0.5)` | `rgba(2, 3, 8, 0.72)` | `rgba(4, 8, 20, 0.6)` | Overlay behind dialogs/drawers. |
| `--glow-1` | `#e8472f` | `#ff2a1a` | `#ff5f00` | `#ff4f6d` | `#FF5A3C` | `#ff5a3c` | Primary glow light for public moments only: hero backdrops, onboarding `as-backdrop`, the single `shadow-glow` CTA. Not used in app shells, selections or buttons. Never a text or field background. |
| `--glow-2` | `#ff8a3d` | `#ff8a00` | `#ffb000` | `#2f5bd8` | `#3D6BFF` | `#3d6bff` | Secondary glow light, the second source in `as-backdrop` and the shell wash. |
| `--aurora-1` | `#e8472f` | `#ff3b2f` | `#ffffff` | `#e8472f` | `#F4F1EE` | `#ffffff` | AuroraText stop 1. Display sizes only (24px+). |
| `--aurora-2` | `#d0561a` | `#ff8a3d` | `#a0a0ad` | `#d0223f` | `#FF5A3C` | `#ff8a70` | AuroraText stop 2. |
| `--aurora-3` | `#d8284f` | `#ff4f6d` | `#ff5f00` | `#1f4fc4` | `#9AB4FF` | `#b3c7ff` | AuroraText stop 3. |
| `--aurora-4` | `#1f3c8f` | `#8fa6ea` | `#ffb000` | `#16244a` | `#FF8A3D` | `#ffb23e` | AuroraText stop 4 (navy). |
| `--ambient-1` | `#e8472f` | `` | `` | `` | `#FF5A3C` | `#ff5a3c` | Ambient glass: coral light source behind signed-in pages. Background only, blurred, never text or fills. |
| `--ambient-2` | `#ffb23e` | `` | `` | `` | `#FF8A3D` | `#ffb23e` | Ambient glass: amber light source. Background only. |
| `--ambient-3` | `#1f3c8f` | `` | `` | `` | `#2A3A66` | `#3d6bff` | Ambient glass: brand navy light source. Background only (not the loyalty blue). |
| `--ambient-4` | `#ff5a8a` | `` | `` | `` | `#FF8A70` | `#ff5a8a` | Ambient glass: pink light source, lowest opacity. Background only. |
| `--glass-fill` | `rgba(255, 255, 255, 0.72)` | `` | `` | `` | `rgba(10, 16, 32, 0.72)` | `rgba(20, 30, 64, 0.45)` | Liquid-glass card and chrome fill over the ambient layer. Keeps ink 4.5:1 over any blob. |
| `--glass-edge` | `rgba(255, 255, 255, 0.78)` | `` | `` | `` | `rgba(179, 190, 220, 0.18)` | `rgba(255, 255, 255, 0.26)` | Liquid-glass rim (1px border). |
| `--glass-highlight` | `rgba(255, 255, 255, 0.95)` | `` | `` | `` | `rgba(255, 255, 255, 0.10)` | `rgba(255, 255, 255, 0.22)` | Liquid-glass inner top highlight and specular sheen. |
| `--neu-surface` | `#efebe7` | `` | `` | `` | `#0D1428` | `#17234a` | Neumorphic ground: tab tracks, segmented tracks, stat tiles, secondary buttons in the signed-in app. |
| `--neu-light` | `rgba(255, 255, 255, 0.95)` | `` | `` | `` | `rgba(179, 190, 220, 0.08)` | `rgba(255, 255, 255, 0.07)` | Neumorphic highlight shadow (top-left). |
| `--neu-shade` | `rgba(15, 26, 51, 0.13)` | `` | `` | `` | `rgba(0, 0, 0, 0.55)` | `rgba(0, 0, 0, 0.45)` | Neumorphic navy-tinted shade (bottom-right). |
| `--ambient-sky` | `#faf7f4` | `` | `` | `` | `#0A1020` | `#16306a` | Ambient scene: top of the backdrop behind glass pages. |
| `--ambient-ground` | `#faf7f4` | `` | `` | `` | `#04060D` | `#0a1026` | Ambient scene: bottom of the backdrop behind glass pages. |

## Typography

Families:

- `--font-display`: "Unbounded", "Arial Black", system-ui, sans-serif
- `--font-sans`: "Schibsted Grotesk", "Helvetica Neue", Arial, system-ui, sans-serif
- `--font-mono`: "IBM Plex Mono", ui-monospace, Menlo, monospace

Font files: Unbounded 200 900 (`fonts/Unbounded.woff2`), Schibsted Grotesk 400 900 (`fonts/SchibstedGrotesk.woff2`), IBM Plex Mono 400 (`fonts/IBMPlexMono-400.woff2`), IBM Plex Mono 500 (`fonts/IBMPlexMono-500.woff2`). Include `design-system/fonts.css`.

### Editorial (display)

| Style | Size | Line height | Weight | Letter spacing | Usage |
|---|---|---|---|---|---|
| `wordmark` | 160px | 0.9 | 700 | -0.04em | Oversized brand word on public/editorial heroes only; may crop off an edge and sit behind media. Never in app shells. |
| `display` | 64px | 1 | 600 | -0.02em | Public hero headline; one per page. Over motion, always inside the text-safe area. |
| `display-sm` | 40px | 1.05 | 600 | -0.015em | Event and editorial feature titles; section intros over motion; mobile hero. |
| `eyebrow` | 11px | 16px | 600 | 0.18em | Uppercase section markers with a square bullet; always paired with a heading. |

### Interface (sans)

| Style | Size | Line height | Weight | Letter spacing | Usage |
|---|---|---|---|---|---|
| `page-title` | 30px | 36px | 700 | -0.01em | One per screen, top of the content column. |
| `section-title` | 20px | 28px | 600 | -0.005em | Panel and section headings. |
| `title` | 16px | 24px | 600 |  | Card titles, dialog titles, table primary cells. |
| `body` | 16px | 24px | 400 |  | Default reading text, posts, descriptions. |
| `body-sm` | 14px | 20px | 400 |  | Dense UI text, card metadata, table cells, admin density. |
| `label` | 14px | 20px | 600 |  | Form labels, buttons, tabs, nav items. |
| `helper` | 13px | 18px | 400 |  | Helper and error text under fields; never below 13px. |
| `caption` | 12px | 16px | 500 | 0.01em | Media credits, timestamps, badge text. Minimum size in the system. |

### Numeric (sans)

| Style | Size | Line height | Weight | Letter spacing | Usage |
|---|---|---|---|---|---|
| `numeric-total` | 28px | 32px | 700 | -0.01em | Order totals and points balances; tabular figures. |
| `numeric` | 16px | 24px | 600 |  | Line-item amounts, ledger changes, counters; tabular figures. |

### Mono (mono)

| Style | Size | Line height | Weight | Letter spacing | Usage |
|---|---|---|---|---|---|
| `code` | 13px | 20px | 500 |  | Order IDs, case IDs, audit record references. |

## Spacing

> 4px base. Components snap to these steps; section rhythm uses 32 / 48 / 64.

| Token | Value | Usage |
|---|---|---|
| `--space-0-5` | `2px` | Hairline nudges: badge icon gap. |
| `--space-1` | `4px` | Icon-to-text gap in small controls. |
| `--space-2` | `8px` | Icon-to-label gap, chip padding, tight stacks. |
| `--space-3` | `12px` | Field label-to-input gap, list row padding (compact). |
| `--space-4` | `16px` | Default gap; card padding (compact/admin); mobile gutter. |
| `--space-5` | `20px` | Card padding on mobile. |
| `--space-6` | `24px` | Card padding (comfortable); gap between form fields. |
| `--space-8` | `32px` | Gap between cards and panels. |
| `--space-10` | `40px` | Page gutter on desktop. |
| `--space-12` | `48px` | Space between page sections. |
| `--space-16` | `64px` | Hero and editorial section padding. |
| `--space-24` | `96px` | Public page section rhythm. |

## Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | `4px` | Checkbox, focus-ring corners on inline links, code chips. |
| `--radius-sm` | `8px` | Chips, badges, inputs in admin density, tooltips. |
| `--radius-md` | `12px` | Buttons, inputs, select, cart rows. |
| `--radius-lg` | `20px` | Cards, panels, media frames, glass panels over motion. |
| `--radius-xl` | `28px` | Dialogs, drawers, hero media, motion stages, the phone frame. |
| `--radius-pill` | `999px` | Pills, segmented controls, avatars, round icon buttons, progress, the motion pause control. |

## Size

> Control heights and touch targets.

| Token | Value | Usage |
|---|---|---|
| `--control-sm` | `32px` | Compact buttons and inputs in admin tables (desktop pointer only). |
| `--control-md` | `40px` | Default desktop buttons, inputs, selects. |
| `--control-lg` | `48px` | Primary mobile actions, checkout CTA, search on mobile. |
| `--touch-min` | `44px` | Minimum hit area for any mobile control; pad smaller visuals up to it. |
| `--icon-sm` | `16px` | Icons inside badges, chips, helper text. |
| `--icon-md` | `20px` | Default icon in buttons, fields, nav. |
| `--icon-lg` | `24px` | Bottom-nav icons, empty-state leading icons in rows. |
| `--icon-xl` | `40px` | Empty/error state illustration icon. |

## Layout

> Widths and breakpoints (reference widths 1440 / 1280 / 768 / 390; check 360).

| Token | Value | Usage |
|---|---|---|
| `--bp-sm` | `390px` | Phone reference; layouts must also hold at 360px. |
| `--bp-md` | `768px` | Tablet: sidebar collapses; motion switches to the portrait loop below this. |
| `--bp-lg` | `1280px` | Laptop: sidebar + content + optional right rail. |
| `--bp-xl` | `1440px` | Presentation screens: content caps at `width-page`, margins grow. |
| `--width-sidebar` | `248px` | Desktop app-shell sidebar. |
| `--width-rail` | `320px` | Right rail (loyalty summary, order summary). |
| `--width-content` | `680px` | Reading column: feed, forms, briefs. |
| `--width-page` | `1200px` | Maximum content width inside the shell. |
| `--safe-text-desktop` | `44%` | Width of the text-safe column over desktop motion (left side); the subject lives in the right 56%. |
| `--safe-text-mobile` | `42%` | Height of the text-safe band over portrait motion (bottom); the subject lives in the top 58%. |

## Layer

> Stacking order.

| Token | Value | Usage |
|---|---|---|
| `--z-media` | `0` | Motion loops and posters. |
| `--z-scrim` | `1` | Legibility gradient over motion. |
| `--z-sticky` | `10` | Sticky headers, bottom nav, sticky order summary. |
| `--z-drawer` | `30` | Drawers and mobile menus. |
| `--z-dialog` | `40` | Dialogs and their scrim. |
| `--z-toast` | `50` | Toasts. |
| `--z-tooltip` | `60` | Tooltips. |

## Border

| Token | Value | Usage |
|---|---|---|
| `--border-width` | `1px` | All hairlines and control outlines. |
| `--border-width-strong` | `2px` | Selected cards, focus ring width and offset, error outline. |

## Shadows

| Token | Studio | Crimson | Chrome | Prism | Cinema | Glass | Usage |
|---|---|---|---|---|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(15, 26, 51, 0.06)` | `0 1px 2px rgba(0, 0, 0, 0.5)` | `0 1px 2px rgba(0, 0, 0, 0.6)` | `0 1px 2px rgba(23, 19, 42, 0.06)` | `0 1px 0 rgba(179, 190, 220, 0.06) inset, 0 8px 24px rgba(0, 0, 0, 0.45)` | `0 1px 0 rgba(255, 255, 255, 0.14) inset, 0 12px 32px rgba(0, 0, 0, 0.35)` | Cards at rest (with `border`); glass panels over motion. |
| `--shadow-md` | `0 10px 28px rgba(15, 26, 51, 0.12)` | `0 12px 32px rgba(0, 0, 0, 0.55)` | `0 12px 32px rgba(0, 0, 0, 0.7)` | `0 10px 28px rgba(30, 43, 77, 0.16)` | `0 16px 40px rgba(0, 0, 0, 0.6)` | `0 18px 44px rgba(0, 0, 0, 0.45)` | Menus, popovers, sticky summaries, toasts. |
| `--shadow-lg` | `0 24px 64px rgba(15, 26, 51, 0.2)` | `0 24px 64px rgba(0, 0, 0, 0.7)` | `0 24px 64px rgba(0, 0, 0, 0.8)` | `0 24px 64px rgba(30, 43, 77, 0.24)` | `0 30px 80px rgba(0, 0, 0, 0.7)` | `0 30px 80px rgba(0, 0, 0, 0.55)` | Dialogs and drawers. |
| `--shadow-glow` | `0 0 0 1px rgba(232, 71, 47, 0.35), 0 12px 36px rgba(232, 71, 47, 0.4)` | `0 0 0 1px rgba(255, 42, 26, 0.55), 0 14px 44px rgba(255, 42, 26, 0.6)` | `0 0 0 1px rgba(255, 95, 0, 0.55), 0 14px 40px rgba(255, 95, 0, 0.5)` | `0 0 0 1px rgba(255, 79, 109, 0.4), 0 14px 40px rgba(47, 91, 216, 0.4)` | `0 0 0 1px rgba(255, 90, 60, 0.55), 0 14px 44px rgba(255, 90, 60, 0.45)` | `0 0 0 1px rgba(255, 255, 255, 0.4), 0 14px 40px rgba(255, 90, 60, 0.4)` | One CTA per public page (the hero or a Cinema stage). Never on forms, checkout, admin or app shells, and never two on one screen. |

## Motion

Durations and easing (defined at the top of `components/bundle.css`):

- `--dur-instant`: `0ms`
- `--dur-fast`: `120ms`
- `--dur-base`: `200ms`
- `--dur-slow`: `320ms`
- `--dur-ambient`: `24s`
- `--ease-standard`: `cubic-bezier(0.2, 0, 0, 1)`
- `--ease-exit`: `cubic-bezier(0.3, 0, 1, 1)`
- `--ease-emphasis`: `cubic-bezier(0.2, 0.8, 0.2, 1)`

Keyframes in the bundle: `as-aurora`, `as-drift`, `as-fade`, `as-orbit`, `as-orbit-counter`, `as-shimmer`, `as-spin`.

Rules: UI feedback uses `--dur-fast`/`--dur-base` and a 1px press on buttons. Ambient drift (`as-ambient--drift`) uses `--dur-ambient`. Every animation stops under `prefers-reduced-motion`. Checkout, forms, admin and conversations never animate. Video loops (hero, collaboration, loyalty, mascot) are muted, pause off-screen, have a pause control and fall back to their poster under reduced motion or Save-Data. See `design-system/guidelines/motion.md`.
