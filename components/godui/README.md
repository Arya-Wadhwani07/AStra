# God UI: Orbiting Circles

Upstream source added; app integration and dependency installation are pending.
AStra currently has no package.json, React app, or shadcn configuration.
No website was scaffolded and no dependencies were installed.

## Sources

Retrieved 2026-09-26:
- https://godui.design/r/orbiting-circles.json
- https://godui.design/r/godui-theme.json

The TSX file is copied unchanged from the component registry.
The JSON preserves the upstream theme definition for later integration; it does not
automatically apply styles. Only Orbiting Circles is included, not the entire catalog.

## Integration once the website exists

1. Use the app's package manager to install `framer-motion` and `@phosphor-icons/react`. The app must also have
   React, React DOM, Tailwind CSS and, for TypeScript, the normal React type definitions.
2. Configure Tailwind to scan this component.
3. Provide the `border-border` color token. For Tailwind v4, the optional
   `orbiting-circles.css` adapter maps it to the app's `--border` variable with a
   neutral fallback. Import it after Tailwind only if the app lacks this mapping.
   For Tailwind v3, configure `theme.extend.colors.border` instead.
4. Import `OrbitingCircles` from the actual relative path or a configured app alias.
5. Review the saved theme definition before adopting the full God UI theme: it includes
   global fonts, colors, shadows and radii that can affect the final design.

Example JSX after importing the component and the Phosphor icons:

```tsx
import { PaletteIcon, MusicNotesIcon, CameraIcon } from "@phosphor-icons/react";

// Inside a React component's render/return:
<OrbitingCircles radius={100} duration={24} iconSize={40}>
  <PaletteIcon size={24} weight="regular" role="img" aria-label="Painter" />
  <MusicNotesIcon size={24} weight="regular" role="img" aria-label="Musician" />
  <CameraIcon size={24} weight="regular" role="img" aria-label="Photographer" />
</OrbitingCircles>
```

Phosphor is the project's chosen icon family. Official React setup:
https://github.com/phosphor-icons/react. The package is not installed yet because
the app has not been initialized. For decorative icons alongside text, use
`aria-hidden="true"` instead of an icon label. Label icon-only buttons on the button.

Default footprint: 280 × 280 pixels. Adjust radius and slot size for small screens.
The upstream component respects reduced-motion preferences.
Use it as decoration, not the only way to navigate or access content.

## Verification limits

Source equality and theme JSON validity are checked independently of the app.
Rendering, TypeScript checking and responsive testing await the app and dependencies.

For a future initialized shadcn app, use a plain URL, not a Markdown link:

```sh
npx shadcn@latest add "https://godui.design/r/orbiting-circles.json"
```

Do not rerun blindly over customized files. Keep package-manager caches and all
generated files inside AStra, as required by AGENTS.md.
