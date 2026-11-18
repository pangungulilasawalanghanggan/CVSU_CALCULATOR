# System audit and improvement report

Date: 2026-11-06, Asia/Manila. Project: `C:\Users\Huawei\Downloads\cvsu-grade-calculator(test)\cvsu-grade-calculator`.

## 1. Executive summary

Audited and improved the actual CvSU Grade & GWA Calculator, as confirmed by the user after inspection found that the pasted storytelling-system description did not match the supplied folder. Preserved all original source files and assets before changes. Added strict API validation, shared bounded C++ process handling, safer browser persistence, automated tests, and a read-only health command. Implemented the subsequently requested Google-only CvSU login, public Features/About Us homepage, five placeholder team profiles, circular alternate pictures on hover/focus, 1/2/2 team rows, section-aware navigation highlighting, and responsive feature cards.

The existing C++ algorithms, binary, academic thresholds, and images remain preserved. No dependency installation, AI generation, paid service, Google Cloud provisioning, external publishing, media overwrite, or original-asset deletion took place.

**Final assessment: local improvements verified, release prerequisites remain.** Known grading-policy discrepancies and the old framework prevent a clean health result. Google login is implemented but cannot be used until the owner's OAuth credentials are configured. Linux/Vercel execution remains unverified.

## 2. Initial condition and architecture

The outer supplied directory contains one inner application folder. Inspection covered all 26 original maintained files: source routes/components, both grading implementations, CSS and configuration, dependency manifest/lockfile, README, two shell build scripts, Windows binary, and public PNGs. `node_modules` and `.next` are installed/generated output, not maintained source. No Git repository or AGENTS.md was found in the project.

Next.js 14.2.5 App Router + React 18 + TypeScript + Tailwind render the site. Browser state computes raw-score component percentages and weights. POST routes invoke a C++ CLI for percentage-to-grade and GWA/honors. GWA subjects persist in localStorage. There was no automated test runner or health-check command, and `build:cpp` only printed a command.

The storytelling Production Bible, character/animation catalogs, episode reports, FFmpeg workflows, and production assets are absent and inapplicable. No substitute materials were invented.

The attached assignment screenshot specifies percentage conversion, Passed/Failed/INC, GWA with units, a grading-system page, C++ functions/if-else/loop concepts, optional browser saving, and Latin honors. Most features exist; INC is a missing academic-policy workflow.

## 3. Inspection findings and risk classification

The pre-implementation evidence and prioritized six-part plan are preserved in [INITIAL_FINDINGS_AND_PLAN.md](INITIAL_FINDINGS_AND_PLAN.md). Each row records evidence, impact, affected component, proposed action, and verification. This report incorporates subsequent user requests.

### Critical issues

No demonstrated critical data-loss or exploitable critical issue was established during this audit. This is not a security certification or proof that no critical vulnerabilities exist. The vendor framework advisory is a release blocker classified HIGH here; exploitability of every individual advisory was not tested.

### High-priority issues

| Issue | Evidence | Result |
| --- | --- | --- |
| Conflicting transmutation policies | C++ uses 97/94/91/.../75/70; TypeScript and guide use 97.6/93.4/90.1/.../70/50. At 70%, C++ returns 4.00 while TypeScript/guide say 3.00. | Preserved all rules; health check fails visibly until an authoritative table is approved. |
| Unvalidated API values | Grade handler coerced null/blank/booleans; GWA only checked array nonempty; malformed JSON returned 500. | Strict numeric/finite/range/shape validation; 1–100 GWA subjects; malformed inputs return 400. |
| Unsafe persisted-data restoration | Any array was accepted; rendering calls `grade.toFixed` on unchecked data; silent catch could then replace bad stored content with empty subjects. | Validate saved records and suspend writes after failed load/save; old storage is preserved and users see recovery guidance. |
| Missing access control, new requested feature | Original pages and calculation APIs were public. | Server-side signed-session checks on all three pages and both APIs; anonymous APIs return 401; Google-only login, no registration/database. |
| Old framework/security exposure | Next.js dependency and installed package are 14.2.5. [Vendor May 2026 advisory](https://vercel.com/changelog/next-js-may-2026-security-release) lists all 14.x affected. | Health failure and deployment prerequisite documented; no unauthorized upgrade or dependency install. |
| Linux deployment incompatibility | Only `bin/grading.exe` supplied; original resolver preferred `.exe` on every OS; no explicit binary tracing. | Platform-specific resolution; safe new build helper and function tracing. Local g++ missing; Linux compile/deployment still unverified. |

### Medium- and low-priority issues

| Severity | Issue/evidence | Result |
| --- | --- | --- |
| MEDIUM | Duplicate route process code, uncapped stdout/stderr and permissive parseFloat parsing. | Shared execFile wrapper, five-second timeout, 16 KiB output limit, hidden Windows process, strict output protocol and safe public errors. |
| MEDIUM | Process startup can throw synchronously on Windows for non-executable files. | Test caught EFTYPE; wrapper now normalizes synchronous and asynchronous startup failures. |
| MEDIUM | Direct CLI uses atof and does not validate subject pairs/units. `grade invalid` succeeded as `5.00 Failed`; negative-unit example succeeded as `0.00 None`. | Web boundary blocks malformed input. CLI intentionally unchanged without compiler; direct CLI validation remains outstanding. |
| MEDIUM | Old grades/honors visible after inputs changed or API failed. | Pending/error states hide obsolete grades and honors; obsolete fetches abort on cleanup. |
| MEDIUM | Multi-item score/out-of updates used stale array state, so two batched updates could undo one another. | Functional React state update preserves both edits; setter prop type corrected and type/build checks rerun. |
| MEDIUM | No repeatable tests/checks. | Added Node built-in tests and read-only health validation using installed TypeScript. |
| MEDIUM | INC lacks entry/exclusion rules; grade guide has gaps; README example GWA is 1.62 but guide 1.63; honors are GWA-only estimates. | Explicit unresolved decisions documented. No arbitrary academic policy change. |
| MEDIUM | Saved subjects are browser-wide, not account-specific; logout leaves grades on the device. | Preserved data and existing key; visible privacy notice. Account migration requires a separate design decision. |
| MEDIUM | Production build requires existing next/font Google Inter fetch. | Sandbox DNS failure recorded; retry used approved font access. Offline font strategy remains a future improvement. |
| LOW | No ignore rules; unsafe original build scripts overwrite bin output. | Added .gitignore; preserved old scripts and documented safer new helper. |
| LOW | Homepage anchors all kept Home highlighted; feature card orphan left blank space. | Section-aware active links, aria-current; responsive grid uses full-width third card at intermediate widths. |
| LOW | Placeholder team presentation needed five roles and profile hover. | Five labeled placeholder students, circular picture swaps, keyboard focus/reduced-motion support, leader centered above two rows of pairs. |

## 4. Improvements implemented

1. Separated input validation and C++ process/protocol handling into shared modules without moving calculation algorithms into JavaScript.
2. Added server-enforced authentication to calculators and guide. Google authorization-code flow uses state/nonce, PKCE, verified RS256 ID tokens, exact verified Workspace domain, purpose-bound HMAC cookies, expiry, HttpOnly/SameSite/Secure settings, and same-origin POST logout. Missing configuration fails closed; no fake production login bypass exists.
3. Kept the homepage public, with Features and About Us/team, and limited signed-out navigation to public sections/sign-in. No registration form or endpoint was introduced.
4. Preserved invalid localStorage data and stopped silent save failures; validated browser subject restoration and bounded subject count.
5. Hid stale calculation output, aborted superseded requests, handled non-finite number text, and repaired batched score-item state updates.
6. Added safe C++ rebuild command that writes to `build/`, retains prior successful generated builds, and preserves original `bin/` files. Vercel tracing includes the engine, but deployment success is not claimed.
7. Added tests, source/asset integrity manifests, dependency/config/import checks, health reporting, setup/run instructions and preserved originals.

## 5. Files created and modified

Created:

- `.env.example`, `.gitignore`, `docs/LOGIN_AND_DEPLOYMENT.md`.
- `src/lib/auth.ts`, `validation.ts`, `cpp-engine.ts`.
- Four auth routes under `src/app/api/auth/`: google, callback, session, logout; login page under `src/app/login/`.
- `src/components/RequireLogin.tsx`, `AuthStatus.tsx`, `TeamProfiles.tsx`; layouts for grade, gwa and grading-system.
- `public/team/profile.svg`, `public/team/profile-hover.svg` (new placeholders, no original media replaced).
- `scripts/build-cpp.cjs`, `scripts/health-check.cjs`.
- `tests/register.cjs`, `tests/core.test.cjs`, `tests/api.test.cjs`, `tests/auth.test.cjs`.
- This audit directory's plan/report, 26 preserved originals, baseline and final source integrity manifests, and test/health output logs.

Modified:

- `src/app/api/grade/route.ts`, `src/app/api/gwa/route.ts`.
- `src/app/page.tsx`, `src/app/grade/page.tsx`, `src/app/gwa/page.tsx`.
- `src/components/Navbar.tsx`, `src/components/Footer.tsx`.
- `package.json`, `next.config.mjs`, `README.md`.
- `tsconfig.json`: Next.js automatically added `.next-audit-build/types/**/*.ts` and reformatted JSON for isolated build verification. `strict: true` remains enabled.

`package-lock.json`, `src/lib/grading.cpp`, `src/lib/grading.ts`, `bin/grading.exe`, original PNGs and legacy build scripts remain unchanged. Generated `.next`/`.next-audit-build` files were produced by preview/build commands and are excluded from maintained-source integrity. No Git diff is available; SHA-256 manifests provide preservation evidence.

## 6. Testing methodology and actual observations

Automated tests use Node's built-in runner; already-installed TypeScript transpiles test imports in memory. No new test package was installed. API tests call the actual Next route handlers with NextRequest; C++ integration tests spawn the actual supplied Windows executable. Authentication tests generate temporary RSA signing keys and synthetic claims, stub Google's fetch responses, and never contact live OAuth endpoints or consume credits. Temporary test fixtures are created and removed only in uniquely named OS temp directories.

Executed and observed:

| Check | Actual result |
| --- | --- |
| Initial TypeScript check | PASS before edits. |
| Original Windows executable samples | `grade 87.5` → `2.00 Passed`; sample GWA → `1.62 Cum Laude`. |
| Baseline direct-CLI negative/malformed inputs | Returned successful-looking results; recorded as defects, not passing validation tests. |
| First six-test run | 5 passed, 1 failed: synchronous Windows EFTYPE escaped normalization. Fixed wrapper. |
| Expanded automated suite | 20 tests passed, 0 failed. Final rerun log: `test-results.txt`. |
| Type checks after auth/storage changes | PASS. Final type check after score-setter correction also PASS. |
| Initial production build | FAIL: sandbox DNS could not fetch Google Inter font. |
| First approved network-enabled build | Webpack compiled, then FAIL: functional setter callback incompatible with original prop type. Corrected to React Dispatch/SetStateAction and reran. |
| Final production build | PASS, exit 0: optimized compilation, type validation, static generation and build tracing completed. Protected routes reported as dynamic. This is the Windows Next.js build, not a Linux C++ build or deployment. |
| `node scripts/build-cpp.cjs --check` | Expected FAIL: g++ is absent from PATH; clear message; no original binary changed. |
| Direct browser navigation to grade/gwa/grading-system signed out | All three redirected to `/login` (observed in the app preview). |
| Features/About Us navbar clicks | Selected link `aria-current=location`, Home no longer active (observed). |
| Team card geometry | Leader alone; Developer and UI/UX same second-row y; Documenter and Tester same third-row y. Profile measured 124 × 124 px with circular clipping; keyboard-focus alternate state shares the same circle. |
| Responsive feature geometry | 390px: three equal 342px full-width rows; 900px: 405px + 405px first row and 836px third card; 1440px: three equal 407px cards on same row. Temporary viewport overrides reset. |

The 20 tests cover finite numeric bounds, saved-data shapes, subject limits, platform-specific paths (including the real workspace path with spaces/parentheses), missing/non-executable engines, timeout/nonzero exit/output limits, strict result parsing, 15 grade boundary samples, weighted GWA, anonymous/forged-session API rejection, malformed request JSON, unavailable engine 503, weak/missing config, insecure origins, session tampering/expiry/purpose/domain, random PKCE/state/nonce parameters, token signature and claim rejection, Google signing-key outage, OAuth cookie flags, mismatched state without Google contact, a complete simulated callback, session endpoint, and same-origin logout.

Real Windows NTFS access-control denial was not induced; the process failure cases simulate unavailable/non-executable resources without changing user file permissions. Browser storage quota/denied-access UI, real Google consent/account switching, and the complete signed-in browser workflow require manual verification. They are not claimed as passed.

## 7. Automated health check

Run from the inner app folder:

```powershell
npm test
npm run typecheck
npm run health
```

The health command validates required files/folders, preserved-backup hashes, original asset/algorithm integrity, final source hashes, installed dependency/lockfile versions, framework security prerequisite, local imports and profile references, grading-policy agreement, Google environment setup, compiler availability, types and all tests. It prints each PASS/FAIL/WARN with details, overall status and counts, and exits 1 if failures remain. It does not alter/delete assets; test fixtures use isolated temp directories. It does not perform live OAuth or Linux deployment checks.

Expected current failures are the unresolved grading table, Next.js security prerequisite, and missing private OAuth configuration. Missing g++ and incomplete academic/manual checks are warnings. A green test suite does not imply a clean health assessment.

The original manifest is immutable audit evidence. The final source snapshot detects subsequent unexpected file edits; review intentional changes before updating those hashes. Protected-asset hashes must not be bypassed. Raw final health output is saved to `health-check-results.txt`.

## 8. Remaining known issues and required decisions

1. **Before public release:** approve a supported Next.js security upgrade, check current official advisories, and retest auth/C++ packaging. No version upgrade was performed because the user prohibited dependency installation without approval.
2. Configure Google OAuth privately, confirm actual campus Workspace domains, and manually test a real CvSU login and rejected Gmail login. Default allowlist `cvsu.edu.ph` remains an explicit assumption.
3. Obtain instructor/Registrar-approved grading thresholds, rounding, INC treatment and complete honors rules. Reconcile C++/TypeScript/guide only after that decision. Academic outcomes were not changed silently.
4. Verify a compiler/toolchain and Linux executable on the target host. Vercel setup instructions and tracing are preparation, not proof of deployed compatibility.
5. Direct C++ CLI validation still accepts malformed inputs; the validated web API is the intended interface until a compiler is available for safe source/binary parity work.
6. Browser persistence remains shared on a device across Google accounts. A consented migration/account-scoped storage design and export/recovery UI would improve privacy and portability.
7. No centralized logout-all/session revocation, application rate limiter, process concurrency budget or operational monitoring has been added. Consider these before wider traffic; eight-hour signed cookies and bounded individual child processes do not provide those facilities.
8. The original layout still fetches Inter at build time. Local bundled fonts could remove that network dependency, subject to approved font assets/licensing and visual verification.
9. Legacy `.bat` and `.sh` build scripts remain unchanged and write to `bin/`; use the new non-overwriting helper. No asset moves/reorganization occurred.

## 9. Manual verification checklist

- Configure local OAuth and matching exact origin/callback; verify permitted university login, personal Gmail rejection, cancelled consent, interrupted callback, expired state/session, logout, browser back, and direct page/API access after logout. Never publish credentials.
- Add/remove/clear subjects, reload and verify persistence; back up localStorage before testing malformed data. Confirm invalid saved data is retained and saving pauses, then restore the backup. Verify blocked storage/quota errors are visible.
- Exercise lecture/laboratory/both modes, score maximum changes and reset; confirm no obsolete grade is shown while pending or after API errors. Verify official thresholds only after policy approval.
- Replace placeholder team names and both photo paths with approved team information; check mouse hover, keyboard focus, reduced motion and mobile sizing.
- Build on Linux and deploy only after dependency/security approval; verify executable architecture/permissions/function inclusion and exact OAuth callback for the stable HTTPS deployment origin.

## 10. Final verification entry

Final optimized production build completed successfully with exit 0 after the score-setter type correction. Final independent test rerun: 20 passed, 0 failed, 0 skipped. Recorded 51 maintained-source/asset SHA-256 hashes after implementation. See `test-results.txt`, `health-check-results.txt` and `source-integrity.json` for executed checks and preserved-source evidence. Original asset and algorithm hashes are checked separately from the final source snapshot.

Final health command executed with exit 1 as intended: **36 checks, 30 passed, 3 failed, 3 warnings**. Failures are the known framework security prerequisite, unresolved academic grading-table conflict, and missing private Google OAuth setup. Warnings are missing g++, pending academic decisions, and pending real-provider/Linux/deployment/manual workflows. The health command reran all 20 automated tests successfully and verified all 26 preserved originals, four protected original asset/algorithm files, and 51 final source/asset hashes. No hidden failed test is marked as passed.

Production file-trace inspection confirmed `bin/grading.exe` appears in the Windows grade function's `.nft.json`. This confirms local bundling of the existing binary; it does not validate Linux architecture or a Vercel deployment. Public preview remains running at `http://127.0.0.1:3000` beside the chat. The user specifically requested the app preview rather than their desktop Chrome; subsequent verification used the app browser.

## 11. Login and spacing follow-up (2026-11-06)

At the user's request, reduced stacked spacing below the student tip: changed its bottom padding from `pb-20` to `pb-8` and removed the footer's `mt-24`. App-browser geometry measured the resulting tip-to-footer gap as 33 px.

Continued Google login implementation: added a visible Google button with unavailable/connecting states; preserved the intended calculator/guide through an exact allowlist and signed OAuth state; provided distinct cancelled-consent and non-CvSU-account messages; added finite token timestamps and identity size checks; guarded unknown login error codes. All three protected layouts now explicitly wrap the shared login guard. Homepage GWA/guide sign-in links preserve the selected tool. No external redirect or callback parameter can replace the signed destination.

Created a private `.env.local` with the existing preview's exact 127.0.0.1 origin, generated a random session secret without displaying it, and left Google's client ID/secret blank. The private file is ignored and excluded from integrity snapshots. The user confirmed they have no OAuth client and requested instructions to create one. Provided Google Cloud project/Branding/Audience/Web client instructions and exact callback `http://127.0.0.1:3000/api/auth/callback`; no external credentials, account, project or permissions were created by the agent. Real Google sign-in remains pending owner setup.

Added five meaningful auth regression tests covering destination allowlisting, signing the selected tool, returning to GWA despite callback redirect injection, cancellation without token exchange, and rejecting personal Google accounts with useful guidance. All **25 tests passed**. A subsequent generated-layout type check caught that re-exporting a guard with an extra optional `destination` prop violates Next.js layout props; replaced that export with a layout wrapper and reran TypeScript successfully. The optimized production build then passed (exit 0), including compilation, type validation, static generation and build traces.

App-browser checks verified `/gwa` redirects to `/login?next=%2Fgwa`, missing OAuth configuration leaves the Google button disabled, account rejection guidance renders, and unexpected `error=__proto__` safely displays the generic retry message rather than crashing. Login preview remains open beside the chat. Source-integrity snapshot updated only for the explicitly reviewed files, with one new Google button component (52 files total); unknown changes would abort the snapshot update. Latest repeated health/test output is in `health-check-login-followup.txt`. The initial test/health logs remain preserved as the earlier audit record.

Follow-up health command completed with 36 checks: 30 passed, the same three known configuration/security/policy failures, and three warnings. It independently reran all 25 tests with zero failures/skips and verified the original backups, protected assets, and all 52 source hashes. No paid service or billing was enabled.

## 12. Owner-approved live Google connection and workspace refinements

The owner subsequently authorized computer access, approved Google's API Services User Data Policy/configuration, and separately approved creation and connection of the Web OAuth client. Used the existing `cvsu-grading` Google Cloud project. Configured the exact local origin/callback, downloaded the client JSON, validated its client identity and callback, and imported credentials into ignored `.env.local` without displaying secret values. Preserved the prior private environment file and session secret. No billing changes, dependency installs, new Cloud project, external website deployment, or paid service activation occurred. No credentials are included in this report or source hashes.

Google authorization opened successfully. The owner completed Google sign-in themselves, after which the protected grade calculator and GWA calculator loaded with the verified CvSU session. Live C++ checks returned **100% → 1.00 Passed** and a temporary three-unit subject at grade 1.75 returned **GWA 1.75, Cum Laude**. Restored the original empty subject list and grade inputs after verification. Later UI regression confirmed reducing an output's maximum from 100 to 50 clamps its score from 80 to 50 and retains both updates. An early browser test timed out during a development refresh after input values did not persist; repeating after the page settled produced the expected 100%/1.00/Passed result. No success was inferred from that timed-out attempt.

Implemented the requested authenticated workspace in new `src/components/AppShell.tsx`, with server-read session rendering in `src/app/layout.tsx` and authenticated-home redirection in `src/app/page.tsx`. Signed-in users see only the three calculator/reference tools; public navigation and footer are absent. At widths below 1280px, the top bar is removed and four bottom tabs provide Calculator, GWA, Grading, and Settings. Settings opens a small account sheet with name/email/logout. Desktop keeps a sidebar. Settings sheet content, Escape dismissal and focus restoration were observed in the browser. Real-user logout was not invoked, preserving the owner's active session; route-level logout/origin checks remain covered by tests.

Preserved existing calculator controls and workflows, expanded usable content width, added responsive container-query grids, restored comfortable spacing, added accessible score/weight labels, associated GWA labels with inputs, added visible empty-form feedback and retry/re-login actions, and confirmed clear-all before removing saved subjects. Grade Subject Type and Result cards match within a grid row; the Result card has an explicit aligned header/reset control and numeric/status row. Guide cards match heights within a row, and sample lecture/laboratory percentages retain their original values in one aligned table with row separators and totals. Tightened the gap below the guide heading. Calculator assets and academic policy remain unchanged.

Responsive browser checks covered all three tools at 320, 768, 1024 and 1440px widths during refinement; those observations showed no horizontal overflow, out-of-viewport controls or footer. The final navigation breakpoint is 1280px. Vertical scrolling remains available for small screens, enlarged text, errors and long lists; no universal no-scroll claim is made. Restored the browser viewport override to its native panel size after testing, with zoom 1, no main/body blur filter and no main transform. The large desktop test view had been scaled down in the shared preview; native sizing avoids that source of soft-looking text.

Additional modified files: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/grading-system/page.tsx`, plus the previously modified grade/GWA/home pages, health script and setup documentation. New maintained-source count is 53 after adding AppShell. Google configuration is now complete locally; remaining release blockers are the pre-existing grading-policy conflict and Next.js security prerequisite. The Linux compiler/deployment and additional account/provider-failure checks remain outstanding. Latest repeated health output is recorded in `health-check-connected-workspace.txt` after final source review.

Final connected-workspace verification completed: optimized production build passed (exit 0); health check recorded **37 checks, 32 passed, 2 failed, 3 warnings**. All 25 automated tests passed again, along with type checking, dependency/lockfile agreement, local imports, Google configuration, all 26 original backups, four protected asset/algorithm hashes, and 53 final source/asset hashes. Only the pre-existing framework security prerequisite and academic grading-table conflict remain failed checks. No private credential content was included in the output logs.

## 13. GWA list controls and Google profile avatar follow-up

Replaced subject removal text with a pencil action menu and an edit dialog. The menu is portaled outside the internally scrolling list to avoid clipping; cancelling edits preserves the add form. Added a compact GWA view with an Add Subject dialog for narrow or short screens. Subject rows use a bounded area with hidden scrollbars; reduced the desktop top-card height to remove excess blank space. Isolated UI fixtures use port 3001 rather than the owner's saved subjects. An earlier overlapping typing incident was corrected only after the owner approved restoring the affected subject name. Final compact-layout and full edit/recalculation browser coverage remain pending; do not infer them from automated API tests.

Renamed the bottom Settings tab to Profile. The button, account sheet and desktop account area now use the profile picture supplied by the verified Google identity. Only bounded HTTPS Google image URLs are retained in signed sessions. Existing sessions without pictures remain valid and offer a Google profile refresh link; missing or failed images use circular initials. The account popup retains name, email and logout. Browser inspection confirmed the Google avatar in both the popup and bottom tab. No saved subjects were modified during this profile check.

Type checking and all 26 automated tests passed, including the new profile-image validation and session compatibility test. Production compilation has not been repeated for this follow-up. Prior build/health logs describe the earlier revision; the two previously documented release blockers are unchanged.

### Compact GWA spacing correction

Removed flex growth from the compact subject card and its list. The card now fits its rows up to the existing three-row cap instead of expanding into unused viewport height; the GWA summary follows with a 12 px gap. Short screens can shrink and scroll the list while retaining the summary. Read-only browser geometry verified no document overflow at 600×820 and 320×568. Reset the temporary viewport afterward. Also kept compact table headings on one line to avoid a wrapped Action label on narrow phones. User subject records were not changed.

## 14. Owner-approved C++ guide alignment, cleanup and deployment check

The owner explicitly requested that C++ follow the displayed guide, superseding the original unchanged-algorithm constraint for this source. Updated the C++ thresholds to 97.6/93.4/90.1/86.7/83.6/80.1/76.7/73.4/70.0/50.0. The original source remains in the 26-file audit backup and the original binary remains untouched in bin/. Removed the unused src/lib/grading.ts after checking references, replacing the health check's duplicate TypeScript calculation with comparisons between the actual C++ executable and the guide's JSON display data. The JSON data is not used to calculate grades in the application.

Guide ranges use non-overlapping one-decimal display endpoints, including 93.4–97.5 and 80.1–83.5. The guide's weighted-average example now displays the exact 1.625 before rounding rather than contradicting the engine's 1.62. GWA computation and honors thresholds themselves were not changed. Core boundary tests cover all grade minima and values 0.01 below them, plus 0 and 100. API tests execute the actual compiled engine and check the C++ source marker. All 26 tests passed after rebuilding.

No working compiler, WSL distribution or running Docker daemon was available initially. After the owner approved a portable compiler, found an existing WinLibs ZIP in Downloads whose origin was the official vendor. Validated archive paths before extracting into the project's ignored tools/mingw32 directory; reused that archive rather than downloading another copy. Build helper detects the portable executable or CXX override without changing global PATH. Compiled new build/grading.exe and directly verified 70% → 3.00 Passed, 87.5% → 1.75 Passed, and the three-subject example → 1.62 Cum Laude. Both calculation APIs prefer this new engine. Original backups and original binary remain preserved.

Removed comments from maintained source, scripts and configuration with TypeScript AST printing, CSS parsing and string-aware C++ scanning. Generated next-env compiler directives, dependencies, compiled files and original audit backups remain preserved. Removed obsolete .next-audit-build output and the old pre-Google private environment backup; the production check subsequently recreated its ignored build output. Retained purposeful tests, documentation, backups, assets and active preview output. The portable toolchain is required for local rebuilding and excluded from deployment.

Restored the compact GWA explanation and Multiple Subjects label, added an inline Add Subject card when width ≥480 and height ≥760, retained dialogs for smaller views, and bounded the list independently of card height. Verified the 657×830 view showed all three existing rows with list clientHeight=scrollHeight=184 and no document overflow. The 320×568 view also had no document overflow; shorter lists can scroll internally. Checked Add Subject dialog opening/closing without modifying user data. Profile is now a centered modal containing the Google avatar, name, email and logout; observed its contents and dismissal without signing out the user.

Unified workspace page-title, category and description styles and clarified estimated honors wording. Browser computed styles matched on Grade, GWA and Grading System at the tested native width: title 29.7px, description 13.4062px, category 10.725px. At 900px public-page width, all three feature cards measured 278.609375px high; the final card still spans the available second-row width. Restored viewport overrides after checks and closed the separate read-only review tab.

Added vercel.json to select npm run build:vercel, compiling C++ before Next.js, and .vercelignore to exclude private local settings, the Windows-only compiler, cached builds, original binaries, audit records and other unnecessary upload content. Verified both API build traces contain build/grading.exe in the local Windows production build. The first sandboxed build failed only because Google Fonts DNS was unavailable; rerunning with approved network access passed compilation, type checks, generation and build traces. A final production build after source comment cleanup also passed.

Deployment is not yet certified: Next.js 14.2.5 is affected according to the vendor's May 2026 release advisory (https://vercel.com/changelog/next-js-may-2026-security-release); dependency upgrading requires separate owner approval under the original request. The actual Linux compiler, static libraries, function executable compatibility, Google production origin/callback and deployed end-to-end checks remain unverified. No hosting, production OAuth edit or paid service was created. README and docs/LOGIN_AND_DEPLOYMENT.md describe the exact C++/TypeScript split and Vercel steps without claiming a completed deployment.

Final cleanup also removed the unused legacy build-cpp.bat/build-cpp.sh scripts, whose direct writes to bin/ were superseded by the platform-aware npm helper. Their original copies remain in the audit backup. Final maintained snapshot contains 55 files. The final health run before that script-only removal recorded 37 checks: 34 passed, 1 failed (framework security prerequisite), 2 warnings. Its TypeScript check and all 26 tests passed; the obsolete scripts were not used by those checks. No application dependency versions were changed. Full output: health-check-deployment-review.txt.

## 15. Editable main-app team profiles (2026-11-07)

At the owner's request, removed generated Student N names and visible Placeholder profile labels from src/components/TeamProfiles.tsx. Each of the five TEAM entries now has name, image, and hoverImage fields alongside role/detail. Empty names display the actual team role; absent photos use a neutral circular avatar rather than invented student information. Hover/focus swapping activates when both photos are supplied. The leader remains on its own row, followed by two members per row. The separate vanilla copy and study guides were not changed by this main-app edit.

Type checking passed. An in-memory React server render verified five cards, no placeholder labels/generated names, and the leader's full-row layout. Updated only the reviewed TeamProfiles hash in the maintained source snapshot; original assets/backups remain preserved.

## 2026-11-18 production review and localhost demo

See [the current production readiness report](PRODUCTION_READINESS_2026-11-18.md) for the approved Next.js/PostCSS security upgrade, actual build/test/audit results, remaining development advisories, Vercel prerequisites and separate one-click localhost demo. Main production build, C++ packaging check and 26 tests passed. The actual Vercel Linux build and production Google callback remain unverified.

### Final presentation correction and handoff

Removed only descriptions under page/section headings in both apps; restored all homepage subtitles/descriptions on latest user instruction. Other helper text was restored. Source comments removed while retaining TypeScript directives. See workspace HANDOFF_FOR_NEXT_ACCOUNT.md for complete current state and remaining deployment prerequisites.
