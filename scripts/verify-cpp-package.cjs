const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const build = process.env.CVSU_AUDIT_BUILD === '1' ? '.next-audit-build' : '.next';
const binary = path.join(root, 'build', process.platform === 'win32' ? 'grading.exe' : 'grading');
for (const [args, expected] of [[['grade', '87.5'], '1.75 Passed'], [['gwa', '1.5', '3', '2', '3', '1.25', '2'], '1.62 Cum Laude']]) {
    const result = spawnSync(binary, args, { encoding: 'utf8', windowsHide: true, timeout: 5000 });
    if (result.error || result.status !== 0 || result.stdout.trim() !== expected)
        throw new Error('Compiled C++ engine failed its deployment smoke test.');
}
for (const route of ['grade', 'gwa']) {
    const trace = path.join(root, build, 'server', 'app', 'api', route, 'route.js.nft.json');
    const files = JSON.parse(fs.readFileSync(trace, 'utf8')).files;
    if (!files.some(file => path.resolve(path.dirname(trace), file) === binary))
        throw new Error(`C++ engine missing from /api/${route} deployment trace.`);
}
console.log('C++ executable runs correctly and is included in both calculator deployment traces.');
