# RecordButton

The voice-note control: the customer describes the cut in their own words.

- Consumer provides: `recording` (bool), elapsed seconds, `onStart`, `onStop`. Cap recordings at 90 seconds.
- Idle: 80px `card` disc, `shadow-md`, red `destructive` dot, caption "Tap to record" in `body-sm` `muted-foreground`.
- Recording: dot becomes a rounded square, ring turns `destructive`, caption becomes the timer in `numeric`.
- Red is used here because "recording" is a universal convention; it is the only non-error use of `destructive`.
