# CaptureSlot

One of four photo slots (front, left, right, back) in the capture step.

- Consumer provides: `angle` label, `state` (`empty` | `active` | `done`), the captured image for `done`, `onTap` to open the camera.
- `empty`: `muted` fill with a head silhouette in `muted-foreground`. `active`: `card` with `shadow-md` and a 2px `primary` outline, silhouette in `primary-ink`. `done`: the photo, a brass check badge with `on-primary` glyph.
- 3:4 aspect, `radius-lg`, label in `label` style bottom-left.
- The camera view itself uses the same silhouette as an overlay guide.
