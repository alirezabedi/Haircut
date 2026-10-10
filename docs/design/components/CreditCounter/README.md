# CreditCounter

The pill in the top-right corner of every screen showing credits left out of the current pack of 100.

- Consumer provides: `remaining`, `total` (100), `onOpen` (opens the sheet with past results and "Buy 100 more — £10").
- 44px `card` pill, `shadow-sm`, meter in `primary` on a `muted` track, number in `numeric`.
- At 10 or fewer the meter fill turns `destructive`; the sheet then opens with the buy option first.
- Don't hide it behind a menu; the barber must see it at a glance.
