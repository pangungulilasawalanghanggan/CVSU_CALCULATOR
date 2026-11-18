# Google-only CvSU login and C++ deployment

Only existing, verified Google Workspace accounts from the configured CvSU domains can enter. There is no registration endpoint, local password, user database, or TypeScript fallback for final grade conversion or GWA. Home, Features, About Us and login are public. `/grade`, `/gwa`, `/grading-system`, `/api/grade`, and `/api/gwa` require a server-verified session. Do not rely on hiding navigation for authorization.

## Configure local login

1. Copy `.env.example` to `.env.local` and keep it private. Set `APP_URL` to the exact origin you use in the browser: `http://localhost:3000` or `http://127.0.0.1:3000`. Do not mix them.
2. In your own Google Cloud project, configure the OAuth consent screen and a **Web application** OAuth client. Add the exact authorized redirect URI `http://localhost:3000/api/auth/callback` (or the 127.0.0.1 version when using that origin).
3. Put the client ID and client secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Generate `AUTH_SECRET` using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`; put the resulting value in `.env.local`. Do not send secrets in chat or commit them.
4. Set `CVSU_ALLOWED_DOMAINS=cvsu.edu.ph`. This is an assumption pending confirmation of campus domains. Separate exact permitted Workspace domains with commas. Subdomains and suffix matches are not automatically accepted. Restrict the consent audience to the university organization if you administer its Workspace; otherwise the appropriate external consent/test-user setup may be required.
5. Restart `npm run dev`. Sign in with a permitted CvSU account. A personal Gmail account must be denied.

Google setup requires the owner/admin's authorization. During the initial audit no external configuration was changed. In the later owner-approved setup, the Google Auth configuration and a local Web application OAuth client were created in the existing `cvsu-grading` project, and the credentials were connected privately. Billing and hosting were not changed.

### Current local setup and first Google client

A private `.env.local` is configured for the running app preview with `APP_URL=http://127.0.0.1:3000`, a randomly generated session-signing secret, and the owner-approved Google client credentials. Real CvSU sign-in and authenticated C++ calculations were verified. This file is ignored by Git and excluded from audit hash manifests. Do not share it or replace its session secret while people are signed in. The instructions below also apply when creating a separate deployment client.

In Google Cloud Console, create/select the project, open Google Auth Platform, complete Branding/contact details, and choose the audience appropriate to your project. For a project outside CvSU's managed organization, use External; a domain-restricted Internal audience requires the corresponding Workspace organization. Under Clients → Create client select Web application and add the authorized redirect URI exactly:

```text
http://127.0.0.1:3000/api/auth/callback
```

If the console asks for an authorized JavaScript origin, use `http://127.0.0.1:3000` (this app uses a server redirect, not Google's browser SDK). If using the external Testing audience, add the CvSU accounts that will test the app under Test users if Google requires them. Keep the client ID/secret privately and enter them into the two blank fields in `.env.local`. Keep `APP_URL`, `AUTH_SECRET` and the allowlist as configured. Restart/reload the local preview and use that same 127.0.0.1 origin for sign-in. No Drive/Gmail access is requested; the app requests only OpenID identity, email and profile.

The selected tool is stored in the signed ten-minute OAuth flow. Only `/grade`, `/gwa`, and `/grading-system` are accepted as post-login destinations; external URLs and arbitrary paths fall back to `/grade`. Callback query parameters cannot override the signed destination. Cancelled consent and non-CvSU accounts return distinct retry messages without creating a session.

### Signed-in workspace

Signed-in users enter the calculator workspace; the homepage redirects them to `/grade`. The public Home/Features/About Us navbar and footer are absent inside tools. Desktop widths of 1280px and above use a sidebar. Smaller widths use four fixed bottom tabs: Calculator, GWA, Grading, and Profile. Profile opens a centered modal with the Google account picture, name, email, and logout. The modal supports Escape and restores focus to its trigger. Layouts reserve space for mobile tabs and device safe areas.

The original score-entry and subject workflows are preserved. Container queries use available content width for side-by-side cards. Subject Type/Result cards match heights when paired; guide cards match heights within each grid row. Sample weights use aligned table columns and row separators. Short screens and long subject/item lists retain vertical scrolling so all controls remain accessible; no content is clipped to force a viewport fit.

Reference: [Google web-server OAuth client setup](https://developers.google.com/identity/protocols/oauth2/web-server).

The flow uses authorization code exchange, random signed state/nonce, PKCE S256, and a ten-minute HttpOnly flow cookie. The server verifies RS256 signatures against Google's HTTPS signing-key endpoint and verifies issuer, audience, authorized party when present, expiry, nonce, verified email, and exact `hd` Workspace domain. The `hd` request parameter is only an account-selection hint. Only verified claims authorize access. OAuth access/refresh tokens are not saved or sent to the browser. Sessions are purpose-bound HMAC cookies lasting eight hours (HttpOnly, SameSite=Lax; Secure with HTTPS). Sign-out requires a same-origin POST and clears session/flow cookies. Rotating `AUTH_SECRET` revokes all sessions; individual sessions have no central revocation store.

Reference: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).

## C++ engine and Vercel

The Node.js route handlers run a C++ subprocess for grade conversion and GWA. Browser code still performs the existing raw-score/component weighting. No calculation algorithm was rewritten in TypeScript.

`npm run build:cpp` checks for g++, compiles the unchanged `src/lib/grading.cpp` to `build/grading.exe` on Windows or `build/grading` on Linux. The helper never overwrites the supplied `bin/grading.exe`; failed compiles leave the current engine intact. Previous successful build outputs are retained under `build/backups/` when replaced. `node scripts/build-cpp.cjs --check` checks compiler availability without compiling. The obsolete `.bat`/`.sh` scripts were removed; all maintained instructions use the platform-aware npm build helper. Their originals remain in the audit backup.

Vercel preparation:

1. **Approve and complete a supported Next.js security upgrade before public deployment.** The existing Next.js 14.2.5 is not suitable for release; all 14.x versions appear in the [vendor's May 2026 affected-version list](https://vercel.com/changelog/next-js-may-2026-security-release). Consult current advisories when selecting a version; the May patched versions are not a guarantee of current safety. Next.js upgrades can require moving `experimental.outputFileTracingIncludes` to the top level and updating async cookies/page props.
2. Set the Vercel project root to `cvsu-grade-calculator` (the inner app folder), framework to Next.js, and Build Command to `npm run build:vercel`.
3. The included `vercel.json` sets this build command automatically; `.vercelignore` excludes private local credentials, the portable compiler, caches, audit backups, tests and Windows binaries from uploads. The Linux build environment must provide g++ with static-linking support. The build must produce an executable compatible with the deployed function architecture/runtime. If g++ or static libraries are unavailable, use an approved Linux build artifact/CI process; do not install toolchains silently. This prerequisite has not been verified on Vercel.
4. File tracing in `next.config.mjs` explicitly includes the C++ engine in both calculation functions. Use the **Node.js runtime**. Windows `.exe` and Edge/static-only hosting cannot run this engine. The resolver deliberately ignores `.exe` files on Linux.
5. Set production `APP_URL=https://your-project.vercel.app`, OAuth credentials, a fresh `AUTH_SECRET`, and allowed domains as private environment variables. Add `https://your-project.vercel.app/api/auth/callback` to Google's authorized redirect URIs. Each preview/custom origin needs its own matching configuration; request headers never determine a trusted callback origin.
6. Verify real CvSU sign-in, rejection of non-CvSU accounts, direct URL/API protection, both C++ calculations, binary permissions/bundling, sign-out, session expiration, and host restart behavior. Hosting has not been deployed or certified here.

Vercel references: [Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [including files in Next.js functions](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions).

## Local data and team placeholders

GWA subjects remain under the existing browser-local `cvsu-gwa-subjects` key. They are not synchronized to Google, partitioned by Google account, or erased on logout. Use a private browser profile on shared devices. Invalid or inaccessible storage pauses saving rather than replacing the old content. Export/repair the old value using browser developer tools before restoring automatic saving by reloading. Never clear localStorage without keeping a copy of grades.

`src/components/TeamProfiles.tsx` contains five placeholder students: Team Leader on the first row, Developer/UI-UX Designer on row two, Documenter/Tester on row three. Replace placeholder names and, when approved, the per-member image paths. Current default/alternate images are new SVG placeholders under `public/team/`. The circular image swaps on hover and keyboard focus, and transitions respect reduced-motion preferences.

## Checks

Run from the inner app directory:

```powershell
npm test
npm run typecheck
npm run health
```

The health check reads project assets and prints a report; it does not modify or delete them, generate media, or contact Google. Tests use temporary fixtures and synthetic identities. It returns exit code 1 when known issues remain. Original-file backups and SHA-256 manifests are under `Reports/System_Audit/`.

The source-integrity snapshot intentionally detects edited files. Review intentional edits before updating their SHA-256 entries; never bypass a changed protected-asset alert. No automatic baseline reset is provided.

To verify production compilation separately from a running preview on Windows:

```powershell
$env:CVSU_AUDIT_BUILD='1'
npm run build
Remove-Item Env:CVSU_AUDIT_BUILD
```

This uses `.next-audit-build`, leaving the preview's `.next` output separate. Google fonts used by the existing layout may require network access at build time.

The mobile account tab is now Profile and uses the signed-in Google account picture. A session created before picture support can use Profile > Refresh Google profile. Google may provide a default letter avatar when the account has no custom photo. A missing or unavailable image falls back to initials.


## Current verification (2026-11-06)

The C++ table was updated with owner authorization to follow the current guide. A previously downloaded WinLibs archive from the official vendor was extracted into the ignored `tools/mingw32/` directory after compiler approval; no global PATH changes were made. The build helper detects it automatically. The new engine is `build/grading.exe`; original source/binary copies remain preserved in the audit backup. The obsolete `src/lib/grading.ts` calculation module was deleted. Guide rows are shared as display data in `src/lib/transmutation.json`, and boundary tests call C++ directly.

The optimized Next.js build and all 26 tests passed locally. Both API build traces include the newly compiled engine. This verifies the Windows application, not a Linux deployment. The remaining framework security prerequisite must be resolved with an approved dependency upgrade. Production `APP_URL`, OAuth callback and a fresh production signing secret must be configured for the actual HTTPS domain.

Compact GWA screens retain the Multiple Subjects label and description. At least 480px wide and 760px tall, Add Subject appears inline; smaller views use its dialog. Only the bounded subject list scrolls in this compact dashboard. Public feature cards have equal-height grid rows, with the third card spanning a medium-width row. Workspace page titles, category labels and descriptions share typography rules.
