---
name: edge-devices-status
description: Guides development in the Edge Devices Status Next.js app — device dashboard (filter/search, JSON/Excel import, CSV export), SLB OAuth sign-in (CSI SAuth), hybrid Pages + App Router, and auth patterns shared with ddh-manager. Use when working in edge-devices-status, edge device dashboard, SLB login/callback, device import, or matching ddh-manager authentication.
---

# Edge Devices Status

## Quick orientation

Next.js 16 hybrid app: **Pages Router** for the dashboard and legacy APIs; **App Router** for auth UI and OAuth API routes.

| Area | Path | Notes |
|------|------|--------|
| Dashboard | `pages/index.tsx` | SSR device list, filters, import/export UI |
| Device list UI | `components/DeviceList.tsx` | Presentation |
| Devices API | `pages/api/devices.ts` | Reads `references/edge-devices-status.json` |
| Import API | `pages/api/import.ts` | POST → writes `data/190826_edge_Devices.json` |
| Sign-in | `app/authentication/sign-in/` | Flowbite card (ddh-manager style) |
| OAuth | `app/api/auth/login`, `app/api/callback`, `app/api/auth/logout` | Authorization code flow |
| Auth guard | `proxy.ts` → `lib/slb/auth-guard.ts` | Next.js 16 `proxy` convention (not `middleware.ts`) |
| SLB helpers | `lib/slb/*` | Ported from `c:\apps\ddh-manager` |

TypeScript path alias: `@/*` → repo root (`tsconfig.json`).

## Auth (match ddh-manager)

**Reference implementation:** `c:\apps\ddh-manager` (`app/api/auth/login`, `app/api/callback`, `lib/slb/*`, `proxy.ts`).

**Flow:** unauthenticated visit → redirect `/authentication/sign-in` → `GET /api/auth/login` → CSI SAuth → `GET /api/callback` → session cookies → `/`.

**Public paths** (`lib/slb/auth-guard.ts` `isPublicPath`): `/_next/*`, `/authentication/*`, `/api/auth/login`, `/api/callback`, `/api/auth/logout`.

**Protected behavior:** pages redirect to sign-in with `callbackUrl`; `/api/*` without session returns **401** JSON.

**Session cookies:** `slb_user_at`, `slb_user_rt`, `slb_user_exp` (see `lib/slb/constants.ts`).

When extending auth (refresh, `/api/auth/me`, admin lists), copy the corresponding ddh-manager module first, then trim project-specific allowlists.

## Environment

Copy from ddh-manager `.env.example` pattern. Required for OAuth (never commit values):

| Variable | Purpose |
|----------|---------|
| `APP_CLIENT_ID`, `APP_CLIENT_SECRET` | SLB client |
| `APP_KEY` | Optional API key for downstream SLB APIs |
| `SLB_AUTHORIZATION_URL`, `SLB_TOKEN_URL` | CSI endpoints (`https://csi.slb.com/v2/...`) |
| `SLB_SCOPES` | Space-separated audience(s); strip outer quotes in `.env` |
| `SLB_REDIRECT_URI` | Must match portal, e.g. `http://localhost:3000/api/callback` |
| `APP_BASE_URL` | Redirect origin behind proxies |
| `SLB_TOKEN_CLIENT_AUTH` | Default `basic` |
| `SLB_USE_PKCE` | Set `true` only if registration requires PKCE |
| `NEXT_PUBLIC_APP_NAME` | Sign-in header label |

Local file: `.env.local` (gitignored).

## Data files

| File | Role |
|------|------|
| `data/190826_edge_Devices.json` | **Dashboard SSR source** (`pages/index.tsx` `getServerSideProps`) |
| `references/edge-devices-status.json` | Reference copy; `/api/devices` |
| `references/doremi-api.txt` | External API notes |
| `data/*.json` | Additional snapshots (not wired to index by default) |

**Import:** UI POSTs to `/api/import` with `{ devices: [...] }` or full JSON body; overwrites `data/190826_edge_Devices.json`. Excel import is client-side (sheet `Devices` or first sheet) then same API.

**Export:** client builds CSV from filtered rows (not XLSX lib server export).

## UI stack

- Dashboard: Tailwind 3, dark theme via `styles/globals.css` + `pages/_app.tsx`.
- Sign-in / App layout: Flowbite React, Inter font, `ThemeProvider` in `app/layout.tsx`.
- Branding: `lib/branding.ts`, `components/app-logo.tsx`, assets under `public/images/`.

`package.json` **`postinstall`:** `flowbite-react patch` — run after install when Flowbite changes.

## Development commands

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # verify App + Pages routes and proxy
```

## Change guidelines

1. **Minimize scope** — dashboard logic stays in `pages/` unless migrating intentionally.
2. **Auth changes** — keep `lib/slb` in sync with ddh-manager semantics; adjust `isPublicPath` when adding public API routes.
3. **Secrets** — only `.env.local`; never document real client secrets in skills or commits.
4. **Hybrid routing** — new OAuth or auth UI → App Router under `app/`; avoid duplicating `/api/callback` in `pages/api`.

## Additional resources

- Env and cookie details: [reference.md](reference.md)
