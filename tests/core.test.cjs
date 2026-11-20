require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { isPercentage, isSubject, isSavedSubjects } = require('../src/lib/validation.ts');
const { findBinary, runCpp, parseResult } = require('../src/lib/cpp-engine.ts');
test('percentages reject coercion, non-finite values and out-of-range numbers', () => {
    for (const value of [null, undefined, '', '87', true, NaN, Infinity, -1, 101])
        assert.equal(isPercentage(value), false);
    for (const value of [0, 75, 87.5, 100])
        assert.equal(isPercentage(value), true);
});
test('subject and persisted-record validation prevents render crashes', () => {
    for (const value of [null, [], {}, { grade: 2, units: 0 }, { grade: 2, units: -3 }, { grade: '2', units: 3 }, { grade: 9, units: 3 }, { grade: 2, units: Infinity }])
        assert.equal(isSubject(value), false);
    assert.equal(isSavedSubjects([{ name: 'Math', grade: 2, units: 3 }]), true);
    assert.equal(isSavedSubjects([]), true);
    assert.equal(isSavedSubjects([null]), false);
    assert.equal(isSavedSubjects([{ name: '', grade: 2, units: 3 }]), false);
    assert.equal(isSavedSubjects(Array(101).fill({ name: 'Math', grade: 2, units: 3 })), false);
});
test('platform-specific lookup and missing binary give useful failures', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cvsu-test-'));
    try {
        assert.throws(() => findBinary(root), /engine unavailable/);
        fs.mkdirSync(path.join(root, 'bin'));
        fs.writeFileSync(path.join(root, 'bin/grading.exe'), 'fixture');
        assert.match(findBinary(root, 'win32'), /grading\.exe$/);
        assert.throws(() => findBinary(root, 'linux'), /engine unavailable/);
    }
    finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
test('engine rejects missing executables, non-executable files, nonzero exits, timeouts and excess output', async () => {
    await assert.rejects(runCpp(path.join(os.tmpdir(), 'no-cvsu-binary'), []), /execution failed/);
    await assert.rejects(runCpp(__filename, []), /execution failed/);
    await assert.rejects(runCpp(process.execPath, ['-e', 'process.exit(1)']), /execution failed/);
    await assert.rejects(runCpp(process.execPath, ['-e', 'setTimeout(()=>{},10000)'], 50), /execution failed/);
    await assert.rejects(runCpp(process.execPath, ['-e', 'console.log("x".repeat(20000))']), /execution failed/);
});
test('strict protocol rejects partial, invalid and cross-mode output', () => {
    assert.deepEqual(parseResult('2.00 Passed\r\n', 'grade'), { value: 2, label: 'Passed' });
    for (const output of ['NaN Passed', '2.00garbage Passed', '0.00 None', '2.00 Passed\nextra', '2.00 Cum Laude', '6.00 Failed'])
        assert.throws(() => parseResult(output, 'grade'));
});
test('C++ grade boundaries match the displayed guide and GWA remains unchanged', async () => {
    const binary = findBinary();
    const table = require('../src/lib/transmutation.json');
    const cases = [[100, 1], [0, 5], ...table.flatMap((row, index) => [[row.minimum, Number(row.grade)], ...(row.minimum > 0 ? [[Number((row.minimum - .01).toFixed(2)), Number(table[index + 1].grade)]] : [])])];
    for (const [percentage, expected] of cases)
        assert.equal(parseResult(await runCpp(binary, ['grade', String(percentage)]), 'grade').value, expected);
    assert.deepEqual(parseResult(await runCpp(binary, ['gwa', '1.5', '3', '2', '3', '1.25', '2']), 'gwa'), { value: 1.62, label: 'Cum Laude' });
});
