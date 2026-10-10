# BeforeAfter

Drag-to-compare view of the customer's front photo and the AI preview on the Result screen.

- Consumer provides: `beforeSrc`, `afterSrc`, optional initial split (default 50%).
- Frame `radius-xl`, `shadow-md`; labels "Before" / "Preview" as `card` chips in `label` style; a 40px `card` knob on a 2px divider (44px touch area).
- Keyboard: arrow keys move the split 5%.
- Below it sit the spec card and the Approve / Try again buttons. (The gradient fills in this preview stand in for real photos.)
