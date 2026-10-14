# Service Desk AI landing page (Landing 1.0.0)

The public front page of rentaldeskai.com for people who are not signed in.
It is kept separate from the Rental Desk AI app: its own folder, its own version line ("Landing x.y.z"),
and updating it never rebuilds or restarts the app.

## Files
- Flat layout: `index.html` is served at `/`, every other file at `/landing/<name>`.
- `assets/`: served at `https://rentaldeskai.com/landing/assets/`
  - `landing.css`, `landing.js`, `theme.js`: no inline scripts, no third-party requests
  - `fonts/`: DM Sans, Playfair Display, Tajawal (self-hosted woff2)
  - `img/`: founder avatar, video posters, icon
  - `video/`: six recordings of the live platform (MP4 H.264 plus WebM VP9), with client details masked
- `VERSION`: the landing version.

## How it must be served
1. `GET /` without a valid session returns `index.html` (status 200, `Cache-Control: no-cache`).
   With a valid session, `/` stays My Desk exactly as today. `/login` and every other app route are unchanged.
2. `GET /landing/assets/*` serves the files above (`Cache-Control: public, max-age=604800`; the page asks for
   `landing.css?v=…` and `landing.js?v=…`, so a new version is fetched after each update). Videos need byte-range support (`Accept-Ranges`).
3. Response headers for the landing page only:
   `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`
   (`'unsafe-inline'` for styles is needed by the page's style attributes; it has no forms and no user data.)
   Keep the app's own stricter CSP on every app page.
4. The files live outside the app image, e.g. `/opt/rentaldesk/landing/` on the server, mounted read-only.
   Updating the landing page = replacing that folder's contents (keep the previous copy as `landing.prev/` for rollback).

## Checked before hand-over (14/10/2026)
- Served with the CSP above: no console errors, no blocked resources, no requests to any other host.
- Desktop 1366 px and phone 390 px, light and dark: no sideways scrolling.
- The demo switch works (live recordings / walk-throughs); a video plays; the walk-through starts only when its tab is open.

## Open points
- The page shows `Farouk@servicedeskai.com`. That domain is not registered to Farouk (it is listed for sale), so mail to it bounces until it is.
- The six recordings must be checked frame by frame by Farouk before this goes public.
