const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const portableCompiler = path.join(root, 'tools', 'mingw32', 'bin', 'g++.exe');
const compiler = process.env.CXX || (process.platform === 'win32' && fs.existsSync(portableCompiler) ? portableCompiler : 'g++');
const check = spawnSync(compiler, ['--version'], { encoding: 'utf8', windowsHide: true });
if (check.error || check.status !== 0) {
    console.error('C++ compiler unavailable. Install g++ and add it to PATH; see README. Original binary has not been changed.');
    process.exit(1);
}
if (process.argv.includes('--check')) {
    console.log(check.stdout.split('\n')[0]);
    process.exit(0);
}
const folder = path.join(root, 'build');
fs.mkdirSync(folder, { recursive: true });
const name = process.platform === 'win32' ? 'grading.exe' : 'grading';
const output = path.join(folder, name);
const temporary = path.join(folder, `${randomUUID()}-${name}`);
const linking = process.platform === 'win32' ? ['-static'] : [];
const result = spawnSync(compiler, ['-O2', ...linking, '-o', temporary, path.join(root, 'src/lib/grading.cpp')], { stdio: 'inherit', windowsHide: true });
if (result.error || result.status !== 0) {
    console.error('Compilation failed. Existing engine preserved.');
    process.exit(1);
}
let backup;
try {
    if (fs.existsSync(output)) {
        fs.mkdirSync(path.join(folder, 'backups'), { recursive: true });
        backup = path.join(folder, 'backups', `${randomUUID()}-${name}`);
        fs.renameSync(output, backup);
    }
    fs.renameSync(temporary, output);
    console.log(`Built ${output}. Original bin/ assets preserved.`);
}
catch (error) {
    if (backup && !fs.existsSync(output))
        fs.renameSync(backup, output);
    console.error(`Could not publish compiled engine: ${error.message}`);
    process.exit(1);
}
