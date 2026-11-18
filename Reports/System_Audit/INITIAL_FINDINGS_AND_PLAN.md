# Inspection and implementation plan

Date: 2026-11-06 (Asia/Manila). Scope confirmed by user: CvSU grade calculator. Later requests: Google-only CvSU login, no registration; retain C++ algorithms; prepare Vercel compatibility.

## Initial condition and evidence

Inspected all 26 original source, configuration, documentation, binary, and public asset files; excluded generated `.next` and installed `node_modules` from source inspection. No Git repository or AGENTS.md exists. Preserved those 26 files byte-for-byte under `originals/` with `baseline-manifest.json` before edits. No storytelling production materials exist; those checklist items do not apply.

Architecture: Next.js 14.2.5 App Router, React 18, TypeScript, Tailwind; browser score weighting and localStorage; two Node POST handlers spawn C++ CLI; public reference page; Windows executable included. No automated test suite or health command. TypeScript baseline check executed successfully.

| ID | Severity | Evidence / impact | Plan and verification |
| --- | --- | --- | --- |
| A01 | HIGH | `grading.cpp` uses 97/94/.../75/70; `grading.ts` and reference page use 97.6/93.4/.../70/50. Results disagree. | Preserve policies; health check must expose conflict; user must approve authoritative table. |
| A02 | HIGH | API `Number(body.percentage)` accepts null/blank/booleans; GWA only checks nonempty array; malformed JSON becomes 500. | Strict finite numeric and shape validation, bounded subject count, 400 responses; malformed-input regression tests. |
| A03 | HIGH | GWA storage loads any array then calls `s.grade.toFixed`; catches silently overwrite invalid stored content with empty array. | Validate records and suspend persistence after storage failures; display recovery guidance; test validators and manual browser recovery. |
| A04 | MEDIUM | Both routes duplicate platform-agnostic binary search and unbounded output collection; parseFloat accepts corrupt output. | Shared platform-aware bounded subprocess execution and strict protocol parsing; missing/non-executable/timeout/protocol tests. |
| A05 | HIGH | Windows-only binary cannot execute on Vercel Linux; `build:cpp` merely echoes; no binary bundle tracing. g++ absent on this machine. | Real build command preserving original binary, platform build output and tracing; dry-run checks; Linux compile/deploy remains external verification. |
| A06 | MEDIUM | Old results remain displayed during requests and errors. | Hide obsolete results while pending/failing; verify source and manual browser steps. |
| A07 | MEDIUM | No tests or reusable validation. | Node built-in test runner using already-installed TypeScript; read-only health checks with manifest/config/asset/dependency/type checks. |
| A08 | HIGH | Dependency pinned to Next.js 14.2.5. Vendor lists all 14.x affected in May 2026 advisory. | Report upgrade prerequisite; do not install dependencies without approval. Source: https://vercel.com/changelog/next-js-may-2026-security-release |
| A09 | MEDIUM | Screenshot requests INC; no incomplete-grade model or exclusion policy exists. Reference table has gaps; README GWA 1.62 disagrees with guide 1.63. CLI executes example as 1.62. | Document unresolved academic policies; do not silently change rounding/table/INC. |
| A10 | LOW | No Git/ignore rules; browser data shared across accounts on same origin. | Add ignore rules and explain storage privacy limitation; no data migration/deletion. |
| A11 | MEDIUM | CLI uses `atof`: `grade invalid` succeeds as `5.00 Failed`; negative-unit GWA succeeds as `0.00 None` (observed). | Block invalid API inputs; retain original C++ and binary until compiler available; direct CLI remains known issue. |

## Incremental work

1. Harden shared input/process boundary; add and run API and engine regression tests.
2. Preserve saved data and hide stale results; type-check.
3. Add Google OIDC authorization-code login using Node built-ins (no installed dependencies), verified Workspace domain, PKCE/state/nonce and signed HttpOnly sessions. Protect calculator page layouts and APIs server-side, with public home/guide. Default domain assumption `cvsu.edu.ph`. Test synthetic signed tokens, state, sessions, errors and access controls; live Google consent requires user's credentials.
4. Add non-overwriting C++ build helper, Vercel file tracing, environment example and setup documentation. No external deployment or Google Cloud changes.
5. Add read-only health check; run tests, type check, production build where possible; compare preserved hashes and report all failures and untested workflows.

Approval gates: installing/upgrading dependencies, changing grading thresholds/INC/rounding, external deployment and OAuth provisioning remain pending. Safe code changes and requested login are authorized. No existing media or binary will be overwritten.
