# MediaFrame

A fixed-ratio frame for creators' work, with credit, optional label and a designed missing-image state.

**Consumer provides:** `ratio` (`4:5` | `16:9` | `1:1` | `9:16` | `3:2` | `3:4`), `src` + `alt` (or `art` placeholder), optional `credit`, `label`, `discipline` (icon for the missing state), `missingText`, `phone`.

- Crops with `object-fit: cover` centered; creators can set a focal point later. Radius `radius-lg` (`radius-md` in cart rows, `radius-xl` for the phone frame).
- Credits sit bottom-right on a 72% black chip — "Artwork: Mira Rao". Always credit work that isn't the viewer's.
- Alt text describes the work, not "image of". Decorative repeats get empty alt.
- Placeholder `art` fills (painting, event, print, chrome, prism, reel, dance) stand in until generated imagery is approved; they're labelled "Placeholder art".
- Text never sits directly on media except the credit/label chips; titles go below the frame.
