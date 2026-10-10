# Button

The main action button: full width at the bottom of each screen, 52px tall.

- Consumer provides: the label (a verb phrase such as "Approve this cut"), `onClick`, optional `disabled`.
- Variants: `primary` (brass `primary` fill, `on-primary` text; one per screen), `secondary` (`secondary` fill), `ghost` (`primary-ink` text, no fill) for low-stakes actions such as "Retake photos".
- Radius `radius-md`; focus ring 2px `primary-ink`, offset 2px.
- Implement with shadcn `Button`; map `primary` to `default`, keep the height override.
- Don't: put two primary buttons side by side; use white text on brass.
