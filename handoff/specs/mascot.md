# Mascot: the AStra pixel robot

Arya's recording `Pixel-Trail-Robot-Sep-27-14-16-08.mp4` (also in `../assets/`) is the source. It shows a voxel-style blue robot with coral accents that waves and types "ASTRA" letter by letter on its visor, on a dark navy stage with a floor arc.

## Files (`media/mascot/`)

| File | Use |
|---|---|
| `astra-mascot-original-1920x1080.mp4` | The original recording, untouched: 1920x1080, 60 fps, 3.0 s, H.264 with an AAC audio track. Master file only; don't ship it. |
| `astra-mascot-wave-1x1.mp4` | **Web loop.** Centre crop 1080x1080 (removes the "ASTRA / PIXEL RUNNER" label in the top-left), scaled to 720x720, 30 fps, H.264, audio removed, fast-start. About 85 KB. |
| `astra-mascot-wave-1x1.webm` | Same loop as VP9 WebM. About 53 KB. List it first in `<source>`. |
| `astra-mascot-poster-1x1.jpg` | Still of the last frame (visor reads "ASTRA"), 720x720. Poster and reduced-motion fallback. |
| `astra-mascot-wave-16x9.mp4` / `astra-mascot-poster-16x9.jpg` | Full-frame 1280x720 versions for wide placements (a hero or a 404 page). |

Re-encode from the original with ffmpeg if you need other sizes:
```
ffmpeg -i astra-mascot-original-1920x1080.mp4 -an -vf "crop=1080:1080:420:0,scale=720:720,fps=30" -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart astra-mascot-wave-1x1.mp4
ffmpeg -i astra-mascot-original-1920x1080.mp4 -an -vf "crop=1080:1080:420:0,scale=720:720,fps=30" -c:v libvpx-vp9 -crf 34 -b:v 0 astra-mascot-wave-1x1.webm
ffmpeg -sseof -0.1 -i astra-mascot-original-1920x1080.mp4 -vf "crop=1080:1080:420:0,scale=720:720" -frames:v 1 -q:v 3 astra-mascot-poster-1x1.jpg
```

## Where it appears (built in the mockups)

| Page | Placement | Size |
|---|---|---|
| Landing, desktop (`prototype/pages/Main.dc.html`) | Footer call to action, left of "Bring your work. Meet your people." and the "Join AStra" button | 200x200 tile, 28px radius |
| Landing, mobile (`LandingMobile.dc.html`) | Footer, left of the same headline, above "Join AStra" | 120x120 tile, 20px radius |
| Onboarding, desktop (`Onboarding.dc.html`) | Left of "Pick a few creators to start your feed" | 160x160 tile, 28px radius |
| Onboarding, mobile (`OnboardingMobile.dc.html`) | Left of the same headline | 96x96 tile, 20px radius |

Screenshots: `screens/desktop/Main.png` (bottom), `screens/mobile/LandingMobile.png` (bottom), `screens/desktop/Onboarding.png`, `screens/mobile/OnboardingMobile.png` (top).

Good future spots (not designed yet): empty states, the 404 page, loading or "all caught up" states. Use it at most once per view.

## How to build it

- Tile markup in the mockups: `<div class="as-mascot">` (position relative, fixed square size, `overflow: hidden`, `border: 1px solid var(--glass-edge)`, inner highlight `inset 0 1px 0 var(--glass-highlight)`, shadow `0 24px 48px -24px rgba(0,0,0,.6)`) containing the design system's `MotionLoop` filling the tile (`position: absolute; inset: 0`).
- MotionLoop props: `src` = the 1x1 MP4, `webm` = the 1x1 WebM, `poster` = the 1x1 JPG, `focus` = `50% 45%`, `preload` = `auto`, `label` = "Animation: the AStra pixel robot mascot waves and types ASTRA on its visor."
- Behaviour (same as every AStra loop): muted, `playsInline`, loops, plays only while on screen, pauses when the tab is hidden, and has a visible pause/play control. In the mascot tile the control is smaller and sits 8px from the bottom-right corner (28px button with a 44px hit area):
  `.as-mascot .as-motion__ctl { right: 8px; bottom: 8px; width: 28px; height: 28px } .as-mascot .as-motion__ctl::after { inset: -8px }`
- Under `prefers-reduced-motion` or Save-Data, show only the poster (no video, no control).
- Never play sound; the web files have no audio track.
- It's decorative: the video element is `aria-hidden`, the label goes in a visually hidden span. Don't put information in the animation.
- Keep it off checkout, forms, admin and private conversations (the design system's no-motion areas).
- The robot is the working mascot for a working brand name; final branding still needs approval.
