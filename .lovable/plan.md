

## Plan: Transform MoneyPlan$ into an Installable PWA

Since you only need installability (Add to Home Screen) without offline/service worker support, we'll use the **simple manifest-only approach** — no `vite-plugin-pwa` needed. This avoids service worker caching issues in the Lovable editor preview.

### What will be done

**1. Create `public/manifest.json`**
- `name`: "MoneyPlan$ - Gestão de Patrimônio"
- `short_name`: "MoneyPlan$"
- `display`: "standalone"
- `background_color`: "#0a0a0a"
- `theme_color`: "#0a0a0a"
- `start_url`: "/"
- `icons` array referencing placeholder sizes (192x192, 512x512) using the existing `logo-renew.png` for now, with a note to replace with properly sized icons later

**2. Create PWA icon placeholders**
- Generate `public/pwa-icon-192.png` and `public/pwa-icon-512.png` by copying/resizing from `logo-renew.png` via a script

**3. Update `index.html`**
- Add `<link rel="manifest" href="/manifest.json">`
- Add `<link rel="apple-touch-icon" href="/pwa-icon-192.png">`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

**4. Delete `public/favicon.ico`** (to avoid conflicts with the PNG favicon already set)

### Technical notes
- No service workers, no `vite-plugin-pwa` — the app will be installable but won't work offline
- PWA install prompt will only work on the **published** site, not in the Lovable editor preview
- To install: on Android use browser menu → "Add to Home Screen"; on iOS use Share → "Add to Home Screen"

