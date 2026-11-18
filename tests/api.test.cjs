require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { NextRequest } = require('next/server');
Object.assign(process.env, { NODE_ENV: 'test', GOOGLE_CLIENT_ID: 'test', GOOGLE_CLIENT_SECRET: 'test', AUTH_SECRET: 'test-secret-at-least-thirty-two-bytes', APP_URL: 'http://localhost:3000', CVSU_ALLOWED_DOMAINS: 'cvsu.edu.ph' });
const { signValue, SESSION_COOKIE } = require('../src/lib/auth.ts');
const grade = require('../src/app/api/grade/route.ts');
const gwa = require('../src/app/api/gwa/route.ts');
const cookie = `${SESSION_COOKIE}=${signValue({ sub: 'test', email: 'test@cvsu.edu.ph', name: 'Test', domain: 'cvsu.edu.ph', exp: Math.floor(Date.now() / 1000) + 3600 }, 'session')}`;
function req(body, authenticated = true) { return new NextRequest('http://localhost:3000/api/test', { method: 'POST', headers: { 'content-type': 'application/json', ...(authenticated ? { cookie } : {}) }, body: typeof body === 'string' ? body : JSON.stringify(body) }); }
test('both APIs reject unauthenticated and forged-session requests', async () => {
    for (const route of [grade, gwa]) {
        assert.equal((await route.POST(req({}, false))).status, 401);
        assert.equal((await route.POST(new NextRequest('http://localhost:3000/api/test', { method: 'POST', headers: { cookie: 'cvsu_session=forged' }, body: '{}' }))).status, 401);
    }
});
test('grade route reports malformed JSON and invalid numeric inputs as 400', async () => {
    for (const input of ['{', null, [], {}, { percentage: null }, { percentage: '' }, { percentage: true }, { percentage: '90' }, { percentage: -1 }, { percentage: 101 }])
        assert.equal((await grade.POST(req(input))).status, 400);
});
test('GWA route rejects invalid shapes, null records, zero/negative units and too many records', async () => {
    for (const input of ['{', null, [], {}, { subjects: [] }, { subjects: [null] }, { subjects: [{ grade: 2, units: -3 }] }, { subjects: [{ grade: 2, units: 0 }] }, { subjects: [{ grade: '2', units: 3 }] }, { subjects: Array(101).fill({ grade: 2, units: 3 }) }])
        assert.equal((await gwa.POST(req(input))).status, 400);
});
test('authenticated APIs integrate with the original C++ engine', async () => {
    const a = await grade.POST(req({ percentage: 87.5 }));
    assert.equal(a.status, 200);
    assert.deepEqual(await a.json(), { grade: 1.75, remark: 'Passed', source: 'C++' });
    const b = await gwa.POST(req({ subjects: [{ grade: 1.5, units: 3 }, { grade: 2, units: 3 }, { grade: 1.25, units: 2 }] }));
    assert.equal(b.status, 200);
    assert.deepEqual(await b.json(), { gwa: 1.62, honors: 'Cum Laude', source: 'C++' });
});
test('missing engine returns safe 503 without leaking filesystem paths', async () => {
    const original = process.cwd();
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'cvsu-missing-'));
    try {
        process.chdir(temporary);
        const response = await grade.POST(req({ percentage: 87.5 }));
        assert.equal(response.status, 503);
        assert.equal(JSON.stringify(await response.json()).includes(temporary), false);
    }
    finally {
        process.chdir(original);
        fs.rmSync(temporary, { recursive: true, force: true });
    }
});
