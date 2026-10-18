# Rental Desk AI landing page (Landing 3.0.1)

The public front page of rentaldeskai.com for visitors who are not signed in.
It is separate from the Rental Desk AI app: its own repository, its own version line ("Landing x.y.z").
Updating it never rebuilds or restarts the app.

## What it is (3.0.0, 18/10/2026)
Rental Desk AI in its ivory identity, endorsed "by Service Desk AI" (the Lattice brand rule for products).
Sections: hero ("Prepared by AI. Decided by you."), the problem (a scattered rental desk falling into one path),
what it does (five pinned steps: reads, checks, drafts, tracks, you decide), the team with the Chief of Staff,
a note from the founder, trust, Now · Next · Later, the Service Desk AI band, and a demonstration request.
English and Arabic (language button; Arabic is right to left).

3.0.1 (18/10/2026, Farouk: the same page on phones as on the web): the animations now run on every device, also when the phone asks for reduced motion (iPhones with Reduce Motion switched on were getting the still version). On phones and tablets the roadmap is three slides moved across as you scroll, and the big step number shows. If the motion library cannot start, the complete still page is shown instead of a broken one.

- The demonstration request opens the visitor's own email app, addressed to farouk@erlaw.ae
  (until Farouk@servicedeskai.com works). Nothing is collected or stored by the site.
- "Now" lists only what is live in the app. Reports stay under "Next" until they go live.

## Files
- Flat layout: `index.html` is served at `/`, every other file at `/landing/<name>`.
- `landing.css`, `landing.js`: the page's own style and script (no inline scripts).
- `gsap.min.js`, `ScrollTrigger.min.js` (GSAP 3.12.5), `lenis.min.js` (Lenis 1.1.13): self-hosted, see `THIRD-PARTY-LICENSES.md`.
- Fonts (woff2, self-hosted, SIL OFL 1.1): Playfair Display, Geist, Geist Mono, IBM Plex Sans Arabic.
- `my-desk-hero.webp`: the real My Desk screen, client names changed. `farouk-face.webp`: the founder's photo. `rd-icon.svg`: the RD monogram.
- `deploy/docker-compose.yml` and `deploy/nginx.conf`: what runs on the server (Hostinger Docker project `landing`).
- `SHA256SUMS`: a checksum for every file; the server refuses to start if one does not match.
- `VERSION`: the landing version.

## How it is served
1. The Hostinger Docker project `landing` (nginx:alpine) downloads the commit named in `LANDING_REF` from GitHub,
   checks every file against `SHA256SUMS` (log line `landing files OK <commit>`), and serves it with `deploy/nginx.conf`.
2. Traefik sends `rentaldeskai.com/` without the app's `rd_session` cookie to this page, and `/landing/*` to its files.
   Signed-in users keep My Desk at `/`. Every other app route is unchanged.
3. Headers: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`,
   `Cache-Control: no-cache` on `/`, one week on `/landing/*` (files are versioned with `?v=`), `nosniff`, a referrer policy.
   The page makes no request to any other host.

## Update
1. Commit the new files with `SHA256SUMS` and `VERSION` updated.
2. Deploy the project `landing` with `deploy/docker-compose.yml`, `LANDING_REF` set to the new commit (Farouk's yes first).
3. Check `/`, `/landing/landing.css` and the container log line.

## Rollback
Deploy the same compose file with `LANDING_REF` set to the previous release:
- Landing 1.0.0: `a6d99df6e783bea8fbc4447a1f6e65e9a19b9caa` (served until 18/10/2026).
- Landing 2.0.0 (`75074a0`) must not be deployed: its stylesheet locks the page to the first screen.

## Checked before release (3.0.0 and 3.0.1, 18/10/2026)
Served locally with `deploy/nginx.conf` and the CSP above, in Chromium at 1440, 820 and 390 px, English and Arabic,
and with reduced motion: no console errors or warnings, no failed requests, no requests to other hosts,
no sideways scrolling, every font loaded, the demonstration request opens a mail draft.
