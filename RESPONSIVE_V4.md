# ExamPixel V4 Responsive Update

This release adds a mobile-first responsive layer over the existing ExamPixel frontend.

## Target layouts

- 320px small phones
- 360px phones
- 375–414px common modern phones
- 768px tablets
- 900–1366px laptops/desktops
- 1920px wide desktops
- Portrait and short landscape mobile layouts

## V4 changes

- Mobile hamburger navigation with keyboard Escape support and scroll locking
- Safe-area support for iPhone-style display cutouts and home indicators
- No intentional horizontal page overflow
- 44px+ touch targets for key controls
- Single-column editor controls on very narrow screens
- Responsive exam cards, specification cards, upload tabs and preview actions
- Cropper switches to a stacked mobile layout
- Background remover and bulk converter actions stack on small screens
- Responsive saved-photo grid inside the modal
- Mobile-friendly CAPTCHA layout
- Bottom-sheet style modal behavior on small screens
- Landscape-phone modal and navigation safeguards
- Hover effects disabled on touch-only devices to reduce accidental transforms
- Reduced-motion support retained

## Validation note

The repository was statically checked after the V4 changes. Full React production build could not be executed in the sandbox because npm dependencies were not available locally and external package download was unavailable. The project remains configured for the existing Create React App build process.
