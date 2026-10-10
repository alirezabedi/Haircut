# Haircut design system

Screens in `screens/` are design references (HTML with inline styles; the `<x-dc>`/`support.js` wrapper belongs to the design tool, ignore it). Rebuild them with Tailwind + shadcn using the tokens. Component guidelines and previews are in `components/`; all tokens with usage notes in `tokens.json`.

Haircut is a mobile-first PWA used inside a London barbershop. A customer records what they want, takes photos from four sides, and approves an AI preview before the barber starts. The barber sees remaining credits and past results. The feel is a good barbershop: warm, precise, unhurried, a little old-school, never techy.

Built on shadcn/ui. Every token below maps 1:1 to a shadcn CSS variable of the same name, so screens designed here can be implemented with stock shadcn components and this theme.

## Content fundamentals

- Speak like a friendly barber, not like software. Short sentences, second person: "Turn your head to the left", not "Please rotate the subject".
- Sentence case everywhere except `label` style, which is uppercase.
- British English: "colour", "favourite", "£10".
- Name the action on buttons: "Take photo", "Record", "Approve this cut", "Try again". Never "Submit" or "OK".
- No emoji, no exclamation marks in system copy.
- Numbers that matter (credits, timer, clipper guard numbers like "#2 on the sides") are set in `numeric`.

## Colour

- Grounds: `background` for screens, `card` for anything raised. Text is `foreground`; secondary text is `muted-foreground`.
- Brass (`primary`) is the only hue. Spend it on one thing per screen: the main action, the active capture slot, or the credit meter fill.
- Text or icons sitting on a `primary` or `accent` fill use `on-primary`, never `primary-foreground` (white on brass is 2.3:1 in light).
- Brass as text, links, outline icons or focus rings uses `primary-ink`, not `primary`.
- Errors use `destructive`; small text on it uses `on-destructive`. Always pair an error with words, not colour alone.
- `border` and `input` lines are decorative (about 1.3:1). A control is identified by its label, fill or `shadow-sm`, never by a hairline alone.
- Light is the default theme (the shop is bright). Dark must work but is secondary.

## Type

- `display` and `title` are set in the serif family (Georgia) and give the barbershop feel. Use at most one `display` per screen.
- Everything else uses the sans family (Inter): `heading` for card titles, `body` for copy, `body-sm` for helper text, `label` for uppercase step counters and chips.
- `numeric` (JetBrains Mono) is for counters, timers and guard numbers only.
- Inputs never go below 16px, so iOS does not zoom.

## Space, shape, depth

- 4px grid: `space-4` side gutter and card padding, `space-6` between cards, `space-8` top and bottom of screens.
- Corners: `radius-md` buttons and inputs, `radius-lg` cards and capture slots, `radius-xl` bottom sheets and the result image, `radius-full` the record button and meter track.
- Depth: `shadow-sm` for cards at rest, `shadow-md` for the active capture slot and the result card, `shadow-lg` for sheets. No other elevation.

## Layout

- Design at 390px wide first; one column; primary action pinned to the bottom within thumb reach, full width, 52px tall.
- Every interactive target is at least 44×44px.
- The credit counter sits in the top-right corner of every screen and opens the history and buy-credits sheet.

## Imagery and iconography

- Icons: Lucide only (the shadcn default), 1.5px stroke, 20px in controls and 24px standalone, coloured `foreground` or `primary-ink`.
- Photography is the customer's own photos and the AI result; no stock imagery, illustrations or mascots.
- Capture slots show a thin outline silhouette of a head from the relevant angle, in `muted-foreground`.

## States

- Focus: 2px solid `primary-ink` ring, 2px offset.
- Pressed: fill darkens about 4%; no scale bounce.
- Disabled: 50% opacity, no pointer.
- Loading while the preview generates: a calm progress line in `primary` with a plain sentence ("Shaping your cut… about 30 seconds"). No spinners with jokes.

## Components

Button, CaptureSlot, RecordButton, BeforeAfter, CreditCounter and HistoryItem are previewed in this system. Everything else (dialogs, sheets, inputs, toasts) uses the stock shadcn/ui component with these tokens.

## Don't

- No gradients, glows, glassmorphism, purple, or neon.
- No coloured left-border cards, no emoji decoration, no filler stats.
- No more than one brass element competing for attention on a screen.
