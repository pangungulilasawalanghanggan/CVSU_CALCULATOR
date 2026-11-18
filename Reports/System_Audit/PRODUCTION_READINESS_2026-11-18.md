# Production readiness and Vercel review — 2026-11-18

## Assessment

The main application passes the upgraded Windows production build, type checking, 26 automated tests, and the C++ function-packaging smoke check. It is prepared for a Vercel deployment trial, but is not certified as working on Vercel: no remote deployment was performed, no production domain was supplied, and no Linux execution environment is available here. Docker is installed without a running daemon; WSL is not installed. Production OAuth and Linux compatibility remain release prerequisites.

## Changes implemented

- With explicit owner approval, upgraded Next.js from 14.2.5 to 15.5.29, the latest 15.5 release returned by npm at review time. Updated server cookies and login search parameters to asynchronous APIs, and moved file tracing to the stable top-level option.
- Patched PostCSS to 8.5.33 with a matching override so Next's nested older PostCSS is also replaced. Package and lockfile are synchronized.
- Added scripts/verify-cpp-package.cjs to the Vercel build command. It executes grade and GWA examples and confirms both calculator function traces contain the current executable. Build failure prevents publication when these checks fail.
- Fixed the two team-leader photo paths to /team/... URLs. The earlier edited values used filesystem-style paths and one incorrect teams directory. Preserved the pre-fix source in pre-production-review/TeamProfiles.tsx.txt.
- Excluded all .env files from Vercel uploads. Environment variables must be set privately on the host.
- Updated the integrity snapshot only for reviewed changes. Prior source/configuration files are retained under pre-production-review; existing original audit assets remain preserved.

## Actual verification

- npm run typecheck: passed after request-API migration.
- npm test: 26 passed, zero failed; includes authenticated C++ route integration, all guide thresholds, invalid inputs, session tampering, OAuth PKCE/state/nonce, Google identity verification and failure cases.
- CVSU_AUDIT_BUILD=1 npm run build:vercel: passed using .next-audit-build, with the current portable compiler and Next.js 15.5.29. Both native execution smoke tests and both deployment traces passed.
- The first restricted build failed because fonts.googleapis.com was unreachable and the sandbox denied an output directory. The approved network-enabled build passed. The existing Google font requires build-time network access.
- npm audit --omit=dev: zero known vulnerabilities reported.
- Full npm audit: ten high-severity development dependency findings associated with picomatch and dependent glob/watch tools. Saved npm-audit-production-review.json and npm-audit-runtime.json contain the actual responses. These are not ten independent application vulnerabilities. No forced Tailwind major migration was applied. Keep build inputs trusted and review upstream fixes before release.

Audit results are point-in-time reports, not a guarantee of vulnerability-free code.

## Will C++ still be used on Vercel?

The intended request path is browser -> Next.js Node API -> child_process.execFile -> build/grading (Linux) -> JSON response. Native C++ performs final percentage transmutation, grade remarks, GWA and the honors estimate. Raw-score percentage weighting remains in the frontend. There is no TypeScript fallback for final conversion or GWA.

Vercel's documented build image includes GCC/C++ tools. Next file tracing supports bundling extra function files. Based on these capabilities, this architecture is a plausible deployment fit; that is an inference, not a verified deployment. C++ runs as a native executable inside Node functions, not as a separate C++ hosting runtime. Edge functions and static export cannot run this design.

The current compile command uses -static. Verify that the selected Linux image provides every required static library, and that its output matches the function CPU architecture and runtime. Windows grading.exe cannot be used on Vercel. A missing compiler, missing static libraries, execution permissions problem or missing packaged engine must block deployment rather than substitute JavaScript calculations.

## Deploy the main application

1. Upload the main app sources to a private or public repository as appropriate, excluding ignored secrets, caches and compiler tools. Do not upload the localhost-only demo as this production app.
2. Import the repository into Vercel. If the repository contains this parent workspace, choose cvsu-grade-calculator as Root Directory; if it contains only the main app, choose the repository root. Select Next.js. Keep the default .next output; do not set CVSU_AUDIT_BUILD on Vercel.
3. The included vercel.json selects npm run build:vercel. Confirm logs show successful Linux compilation, Next build, and the C++ execution/trace checks. If the Linux toolchain cannot satisfy static linking, resolve it with an explicitly selected compatible toolchain/CI artifact before publishing.
4. Privately configure APP_URL=https://YOUR-DOMAIN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, a new strong AUTH_SECRET, and CVSU_ALLOWED_DOMAINS=cvsu.edu.ph. Do not reuse the local signing secret. The current private local configuration is not a production configuration.
5. Add the exact HTTPS callback https://YOUR-DOMAIN/api/auth/callback to the Google Web OAuth client. If configuring a JavaScript origin, use https://YOUR-DOMAIN. Confirm Google audience/publication and university Workspace policies allow intended users; do not assume the locally verified account proves every account can enter.
6. Redeploy after changing environment variables. Verify anonymous tool/API requests are denied, a real CvSU account enters, a personal Google account is rejected, profile/logout work, and both calculator APIs return source C++ with expected values (87.5 -> 1.75, weighted example -> 1.62). Check cold starts and server errors. Preview domains need their own matching callback configuration.
7. Confirm the instructor's actual grading policy, rounding rules, INC requirements and full honors criteria before claiming official academic eligibility. The current honors result is an estimate and INC remains unimplemented.

## Separate localhost demo

Sibling folder cvsu-grade-calculator-local-demo keeps the main design and C++ engine, replacing Google OAuth with an explicitly labeled one-click sample identity. No main .env, Google credentials or portable compiler was copied. Its cookie and GWA storage key are separate. Demo session creation is blocked in production, on Vercel, and for non-loopback origins.

The demo passed 14 tests, type checking, and an actual HTTP flow covering protected tools, one-click entry, both C++ calculations and logout. Its Windows binary matches the main engine at copy time. It retains Next.js 14.2.5 for this localhost study copy and must not be exposed as a real authentication or production system.

A classmate can clone/download the demo, install Node.js, run npm ci, then npm run dev and open http://127.0.0.1:3001. Windows uses the included binary; Linux/macOS require g++ and npm run build:cpp first. Keep node_modules, .next, build caches and .env files out of GitHub. GitHub stores this source; it does not run this Node/C++ server as a GitHub Pages site.

## Primary references checked

- https://vercel.com/changelog/next-js-may-2026-security-release
- https://vercel.com/docs/builds/build-image
- https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- npm registry metadata and saved npm audit responses from this review.
