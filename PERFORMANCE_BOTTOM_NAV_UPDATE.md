# TA’LIMOT — Bottom Navigation + Performance Update

Baseline: `talimotv10.3_mening_testlarim_attempt_history.zip`

## Bottom navigation

The third mobile tab was changed from **Yo‘l xaritasi** to **Testlarim**.

- Label: `Testlarim`
- Route: `/mening-testlarim`
- New icon: test sheet + check mark
- `/mening-testlarim` is now highlighted by its own tab.
- `Natijalar` only highlights `/natijalar`.
- Pages that are not one of the five bottom tabs no longer incorrectly highlight `Bosh sahifa`.

## Performance work

### 1. Heavy home images converted to WebP

Nine large homepage images were converted from PNG to WebP and the app now prefers the WebP versions.

Combined source size:
- Before: ~15.9 MB
- After: ~1.03 MB
- Reduction: ~93.5%

Legacy PNG files remain in the project for compatibility with old DB paths, but the home UI maps known legacy paths to the optimized WebP files.

### 2. Telegram SDK no longer blocks first paint

The external Telegram Web App SDK changed from `beforeInteractive` to `afterInteractive`.
`TelegramWebAppSetup` now retries briefly until the SDK is available, then calls `ready()`, `expand()` and `disableVerticalSwipes()`.

### 3. Home page client boundary reduced

The home page itself is now a Server Component.
Interactive state was isolated into:
- `HomeHeaderShell`
- `HomeHeroCarousel`

The 6-second banner rotation now re-renders only the hero carousel instead of the whole homepage.

### 4. Drawer JS is lazy-loaded

`HomeDrawer` is loaded only after the user opens the menu for the first time.

### 5. Below-the-fold sections are code-split/deferred

Large lower homepage sections use dynamic imports and CSS `content-visibility` / intrinsic sizing where supported.

### 6. Navigation prefetch

The five bottom-navigation destinations are prefetched when the browser is idle and again on pointer/focus intent.
Drawer destinations are prefetched when the drawer opens.

### 7. Public catalog cache

`/api/catalog/home` now has a 60-second CDN/server cache with stale-while-revalidate support.
The client catalog refresh is deferred until browser idle because fallback catalog content is already available immediately.

### 8. Public DB reads cached briefly

Published course/book catalog reads and test-category count reads are cached for 60 seconds. This reduces repeated Postgres work during navigation while still allowing Admin changes to appear quickly.

### 9. Active user status short cache

The active-user DB status lookup is cached for 30 seconds to reduce repeated identical Postgres lookups during rapid navigation. Authentication cookies are still verified per request.

### 10. Image optimizer cache

Next Image optimized outputs now have a 7-day minimum cache TTL.

### 11. Lighter glass blur

The sticky header and bottom navigation keep the glass look with a slightly cheaper blur/saturation configuration for mobile GPU rendering.

## Database

No SQL migration is required for this update.

## Validation completed

- 374 TS/TSX files parsed: 0 syntax failures
- 9 generated WebP files verified successfully
- All referenced optimized assets exist

The final Vercel production build remains the authoritative Next.js type/build verification.

## Recommended production test

1. Deploy the ZIP.
2. Open TA’LIMOT in Telegram Mini App.
3. Confirm bottom nav shows: `Bosh sahifa | Testlar | Testlarim | Natijalar | Profil`.
4. Tap `Testlarim`; it should route to `/mening-testlarim` and highlight that tab.
5. Move repeatedly between the five bottom tabs; second/subsequent navigations should feel faster because of prefetching.
6. Close and reopen the homepage and verify banners/course/book imagery renders correctly.
7. Open the drawer and verify `Yo‘l xaritasi` remains available there.
8. Confirm Telegram Mini App still expands normally.
