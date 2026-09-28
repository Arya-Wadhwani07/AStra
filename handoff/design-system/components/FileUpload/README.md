# FileUpload

A drop zone for images on posts, events, merchandise and portfolios, with uploading, done and error states.

**Consumer provides:** `label`, `state` (`idle` | `uploading` | `done` | `error`), `fileName`, `progress` (0–100), optional `helper`, `error`.

- Always state accepted formats and the size limit in the helper; errors say what to do next and keep a Try again action.
- Progress is a labelled `progressbar` in `accent`. Prompt for alt text and credit right after upload.
