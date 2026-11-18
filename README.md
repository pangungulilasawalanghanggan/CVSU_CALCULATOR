# CvSU Grade & GWA Calculator

A Google-only student workspace with a Grade Calculator, GWA Calculator, and grading guide. Access requires a verified CvSU Google Workspace account; there is no registration.

## Calculation engine

C++ in `src/lib/grading.cpp` performs percentage-to-grade conversion, Passed/Conditional/Failed status, GWA, and the Latin honors estimate. Both server APIs execute the compiled engine and return `source: "C++"`. Missing or failed engine execution returns an error; there is no TypeScript replacement for these calculations.

The browser uses TypeScript for score entry, component weighting into a final percentage, validation, and presentation. It sends that percentage to C++ for the final grade. GWA grades and units are sent directly to C++.

The C++ thresholds now follow the displayed guide. For example, 70% gives 3.00 Passed, and 87.5% gives 1.75 Passed. The reference data in `src/lib/transmutation.json` is display/test data, not a calculation fallback. The unused `grading.ts` module was removed.

## Run locally

From this inner project directory:

```powershell
npm ci
npm run build:cpp
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Configure private login credentials using `.env.example` and [the login/deployment instructions](docs/LOGIN_AND_DEPLOYMENT.md). Use the exact origin configured as `APP_URL`; the existing local setup uses `http://127.0.0.1:3000`.

The owner-approved portable WinLibs compiler under `tools/mingw32/` is detected automatically on Windows. On other machines, provide g++ on PATH or set `CXX` to a compatible compiler executable. The tools folder is local only and excluded from deployment.

New engines go to `build/grading.exe` on Windows or `build/grading` on Linux. The original `bin/grading.exe` is preserved as an audit asset. The app prefers the new build.

```powershell
.\build\grading.exe grade 70
.\build\grading.exe grade 87.5
.\build\grading.exe gwa 1.50 3 2.00 3 1.25 2
```

Expected output, respectively:

```text
3.00 Passed
1.75 Passed
1.62 Cum Laude
```

## Verify

```powershell
npm run typecheck
npm test
npm run health
```

The tests call the actual C++ engine, check every displayed grade threshold and values immediately below it, and cover authentication and failure paths. The health check also verifies original backups and reviewed source hashes. See [the audit report](Reports/System_Audit/SYSTEM_AUDIT_AND_IMPROVEMENT_REPORT.md) for results and known limitations.

## Deployment

Vercel configuration is included. Its build command is `npm run build:vercel`, which compiles C++ before building Next.js. Deploy the inner `cvsu-grade-calculator` folder as a Next.js project with Node.js functions, not as a static export or Edge application. The production host must build and execute a compatible Linux C++ binary. No deployment has been performed or verified on Vercel yet.

The Next.js security upgrade is applied. Before public deployment, configure the production environment variables and Google callback, and verify both C++ APIs on the host. The local Windows build alone does not certify Linux deployment. Detailed steps are in [LOGIN_AND_DEPLOYMENT.md](docs/LOGIN_AND_DEPLOYMENT.md).

The guide follows the owner's selected thresholds; official institutional policy, INC handling, GWA rounding policy, and complete Latin honors eligibility still require instructor/Registrar confirmation. Honors output is an estimate.

## Production review (2026-11-18)

The approved security upgrade is applied: Next.js 15.5.29 and PostCSS 8.5.33. Current results and exact Vercel steps are in [the production readiness report](Reports/System_Audit/PRODUCTION_READINESS_2026-11-18.md). Runtime dependency audit: zero known vulnerabilities. Development-tooling advisories remain. A successful local build is not a verified Vercel deployment.

The separate sibling folder cvsu-grade-calculator-local-demo is for localhost study only. It uses a one-click sample account, no real Google credentials, and retains C++ calculations. This main app keeps real Google-only CvSU login.
