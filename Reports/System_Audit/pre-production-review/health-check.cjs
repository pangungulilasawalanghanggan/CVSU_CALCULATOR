const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const checks = [];
function check(name, fn) {
    try {
        const detail = fn();
        checks.push({ name, status: 'PASS', detail: detail || '' });
    }
    catch (error) {
        checks.push({ name, status: 'FAIL', detail: error.message });
    }
}
function warn(name, detail) { checks.push({ name, status: 'WARN', detail }); }
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
function run(args, timeout = 120000) {
    const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout, maxBuffer: 1024 * 1024, windowsHide: true });
    if (result.error || result.status !== 0)
        throw new Error(result.error?.message || `${result.stdout}\n${result.stderr}`.trim());
    return result.stdout.trim();
}
function walk(folder) { return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : [path.join(folder, entry.name)]); }
for (const file of ['src/app/page.tsx', 'src/app/login/page.tsx', 'src/components/AppShell.tsx', 'src/lib/grading.cpp', 'src/lib/auth.ts', 'src/lib/cpp-engine.ts', 'src/app/grade/layout.tsx', 'src/app/gwa/layout.tsx', 'src/app/grading-system/layout.tsx', 'public/team/profile.svg', 'public/team/profile-hover.svg', 'package.json', 'package-lock.json', 'README.md', '.env.example', 'Reports/System_Audit/INITIAL_FINDINGS_AND_PLAN.md', 'Reports/System_Audit/SYSTEM_AUDIT_AND_IMPROVEMENT_REPORT.md'])
    check(`Required file: ${file}`, () => { if (!fs.statSync(file).isFile())
        throw Error('Missing required file'); });
for (const dir of ['src/app', 'src/components', 'src/lib', 'public', 'bin', 'scripts', 'tests'])
    check(`Required folder: ${dir}`, () => { if (!fs.statSync(dir).isDirectory())
        throw Error('Missing required folder'); });
check('Original backup integrity', () => {
    const manifest = json('Reports/System_Audit/baseline-manifest.json');
    for (const entry of manifest)
        if (hash(path.join('Reports/System_Audit/originals', entry.path)) !== entry.sha256)
            throw Error(`Backup altered: ${entry.path}`);
    return `${manifest.length} original files verified`;
});
check('Protected original images and binary unchanged', () => {
    const entries = json('Reports/System_Audit/baseline-manifest.json').filter(e => e.path.startsWith('public/') || e.path.startsWith('bin/'));
    for (const entry of entries)
        if (hash(entry.path) !== entry.sha256)
            throw Error(`Protected file changed: ${entry.path}`);
    return `${entries.length} protected files verified`;
});
check('Source integrity snapshot', () => {
    const entries = json('Reports/System_Audit/source-integrity.json');
    for (const entry of entries)
        if (hash(entry.path) !== entry.sha256)
            throw Error(`Changed or missing file: ${entry.path}. Review the change before updating the integrity snapshot.`);
    return `${entries.length} file hashes verified`;
});
check('Installed dependencies match lockfile', () => {
    const pkg = json('package.json'), lock = json('package-lock.json');
    for (const section of ['dependencies', 'devDependencies'])
        for (const [name, range] of Object.entries(pkg[section] || {})) {
            if (lock.packages[''][section]?.[name] !== range)
                throw Error(`Lockfile out of sync: ${name}`);
            const installed = json(`node_modules/${name}/package.json`);
            if (installed.version !== lock.packages[`node_modules/${name}`]?.version)
                throw Error(`Installed version differs from lockfile: ${name}`);
        }
});
check('Framework security prerequisite', () => {
    const version = json('node_modules/next/package.json').version;
    if (Number(version.split('.')[0]) <= 14)
        throw Error(`Next.js ${version}: vendor lists all 14.x affected in May 2026. Approve a supported security upgrade and check current advisories before deployment. https://vercel.com/changelog/next-js-may-2026-security-release`);
    return 'Review current vendor advisories before deployment; this is not a vulnerability database scan.';
});
check('Local source imports and public profile assets', () => {
    const ts = require('typescript');
    for (const file of walk('src').filter(f => /\.(ts|tsx)$/.test(f))) {
        const imports = ts.preProcessFile(fs.readFileSync(file, 'utf8')).importedFiles;
        for (const { fileName } of imports) {
            if (!fileName.startsWith('.') && !fileName.startsWith('@/'))
                continue;
            const target = fileName.startsWith('@/') ? path.join(root, 'src', fileName.slice(2)) : path.resolve(path.dirname(file), fileName);
            if (!['', '.ts', '.tsx', '.css', '.json', '.mjs', '/index.ts', '/index.tsx'].some(ext => fs.existsSync(target + ext)))
                throw Error(`Broken import in ${file}: ${fileName}`);
        }
    }
    const profiles = fs.readFileSync('src/components/TeamProfiles.tsx', 'utf8');
    for (const [, asset] of profiles.matchAll(/src="(\/team\/[^\"]+)"/g))
        if (!fs.existsSync(path.join('public', asset)))
            throw Error(`Missing profile asset: ${asset}`);
});
try {
    require('./../tests/register.cjs');
    check('Grading-policy consistency', () => {
        const { findBinary, parseResult } = require('../src/lib/cpp-engine.ts');
        const table = json('src/lib/transmutation.json');
        for (const row of table) {
            const result = spawnSync(findBinary(), ['grade', String(row.minimum)], { encoding: 'utf8', timeout: 5000, windowsHide: true });
            if (result.error || result.status !== 0)
                throw Error('C++ smoke execution failed');
            const cpp = parseResult(result.stdout, 'grade').value;
            if (cpp !== Number(row.grade))
                throw Error(`C++ gives ${cpp.toFixed(2)} at ${row.minimum}%; guide gives ${row.grade}. Rebuild the C++ engine.`);
        }
        return `${table.length} C++ thresholds match the displayed guide`;
    });
    check('Google login configuration', () => {
        require('@next/env').loadEnvConfig(root);
        const config = require('../src/lib/auth.ts').authConfig();
        return `Configured domains: ${config.domains.join(', ')}. Live OAuth still requires manual verification.`;
    });
}
catch (error) {
    checks.push({ name: 'Validation runtime', status: 'FAIL', detail: error.message });
}
const compiler = spawnSync(process.execPath, ['scripts/build-cpp.cjs', '--check'], { encoding: 'utf8', windowsHide: true, timeout: 5000 });
if (compiler.error || compiler.status !== 0)
    warn('C++ compiler missing', 'Existing Windows engine can run, but this machine cannot rebuild or verify a Linux binary. Install only with approval.');
else
    checks.push({ name: 'C++ compiler', status: 'PASS', detail: compiler.stdout.split('\n')[0] });
check('TypeScript compilation', () => run(['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false']));
check('Automated unit, integration, error and regression suite', () => run(['--test', ...fs.readdirSync('tests').filter(f => f.endsWith('.test.cjs')).map(f => `tests/${f}`)]));
warn('Academic decisions pending', 'INC handling, official transmutation policy, GWA rounding, and full Latin honors eligibility require instructor/Registrar confirmation.');
warn('Provider and deployment verification', 'Live Google checks are recorded separately in the audit report; this command does not contact Google. Account switching/outages, additional campus domains, Linux compilation and Vercel deployment still need separate verification.');
const counts = status => checks.filter(c => c.status === status).length;
console.log(`SYSTEM HEALTH: ${counts('FAIL') ? 'NEEDS ATTENTION' : counts('WARN') ? 'WARNINGS' : 'PASS'}`);
for (const item of checks)
    console.log(`[${item.status}] ${item.name}${item.detail ? `\n  ${item.detail}` : ''}`);
console.log(`\nChecks: ${checks.length}; passed: ${counts('PASS')}; failed: ${counts('FAIL')}; warnings: ${counts('WARN')}`);
process.exitCode = counts('FAIL') ? 1 : 0;
