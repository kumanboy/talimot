# Paid Test Purchase Modal UX Fix

This update fixes the mobile purchase dialog position and stacking behavior.

## Changes

- The paid-test purchase dialog is centered in the usable mobile viewport instead of being anchored to the bottom.
- Extra bottom safe space is reserved for the fixed mobile navigation and iOS safe-area.
- The modal is rendered through a React portal into `document.body`, preventing parent stacking contexts from placing it behind the mobile navigation.
- The overlay now sits above app navigation.
- Long modal content can scroll safely on short screens.
- Background page scrolling is locked while the dialog is open.
- Escape closes the dialog on keyboard devices when a purchase is not in progress.
- A short opening animation is included and disabled when `prefers-reduced-motion` is enabled.

No database, payment API, Tanga wallet, or test purchase logic was changed.
