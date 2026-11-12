# Edge Devices Status — reference

## Hybrid routing

| Router | Routes | Layout / entry |
|--------|--------|----------------|
| Pages | `/`, `/api/devices`, `/api/import` | `pages/_app.tsx`, `styles/globals.css` |
| App | `/authentication/sign-in`, `/api/auth/*`, `/api/callback` | `app/layout.tsx` (Flowbite theme, gray/dark body) |

Both coexist in Next 16; `proxy.ts` applies to matched paths for both routers.

## OAuth route handlers

| Method | Path | File |
|--------|------|------|
| GET | `/api/auth/login` | `app/api/auth/login/route.ts` |
| GET | `/api/callback` | `app/api/callback/route.ts` |
| GET | `/api/auth/logout` | `app/api/auth/logout/route.ts` |

Callback failure redirects to `/?auth_error=...` (dashboard shows banner from `getServerSideProps`).

## `lib/slb` module map

| Module | Responsibility |
|--------|----------------|
| `env.ts` | `getSlbTokenEnv`, `getSlbUserOAuthEnv` |
| `token-client.ts` | Code exchange, refresh (Basic auth default) |
| `session-cookies.ts` | Set/clear httpOnly session (App Router `cookies()`) |
| `pkce.ts` | State + PKCE when `SLB_USE_PKCE=true` |
| `has-user-session.ts` | Cookie-based session check; `SIGN_IN_PATH` |
| `access-token-expiry.ts`, `jwt-profile.ts` | JWT `exp` skew |
| `app-origin.ts` | `APP_BASE_URL` + forwarded headers for redirects |
| `auth-guard.ts` | `isPublicPath`, `handleAuthGuard` |

## Tailwind / Flowbite

`tailwind.config.js` includes `app/`, `components/`, `flowbite/plugin`, `darkMode: "class"`, and `flowbite-react/dist/**/*.js` in `content`.

Sign-in page mirrors ddh-manager: horizontal `Card`, `login.jpg`, `SignInActions` with Flowbite `Button` + `Link`.

## Device shape (dashboard normalization)

Excel import uses `normalizeExcelDevice` in `pages/index.tsx` — maps columns like `Serial`, `Country`, `OS Version`, `Conn Mode`, `Rig` into nested `rig`, `location`, `cloud_status`, `hypervisor` objects used by filters and `DeviceList`.

## Related repos

- **ddh-manager** — canonical SLB OAuth, sign-in UX, and `proxy.ts` pattern.
- Skill folder there: `.cursor/skills/ddh-manager/SKILL.md` for full auth/deployment context.
