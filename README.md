# CvSU Calculator — Local Demo

This separate copy keeps the main React, TypeScript, Tailwind and C++ design. The Google-style button opens a sample account with one click. It does not contact Google or authenticate a real student. The main app retains real Google OAuth.

## Run

1. Install Node.js with npm.
2. Run npm ci in this folder to install the existing locked packages.
3. Run npm run dev and open http://127.0.0.1:3001.
4. Select Sign in, then Continue with Google — Demo.

No .env or OAuth credentials are needed. Profile shows Demo Student and a sample email. Logging out clears the demo cookie. Sessions expire after eight hours or a server restart. GWA subjects have a separate browser localStorage key from the main app.

## C++ algorithm

src/lib/grading.cpp implements transmutation, remarks, GWA and the honors estimate. bin/grading.exe is copied from the main app's current compiled engine. The Node API routes execute it through src/lib/cpp-engine.ts. Raw-score percentage weighting remains in the frontend, as in the main app. There is no JavaScript fallback for final conversion or GWA.

To rebuild, install a C++ compiler or set CXX to its g++ path, then run npm run build:cpp. Linux/macOS users must rebuild first. Compiler tools are not included.

Verify using npm test and npm run typecheck. One-click entry rejects non-loopback origins and cross-origin submissions. Demo sessions are disabled in production and on Vercel. Use the main app, after resolving its production prerequisites, for real hosting. This study copy retains the existing Next.js version and must not be published as a real authentication system.
