require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
process.env.NODE_ENV = 'test';
const auth = require('../src/lib/auth.ts');
const entry = require('../src/app/api/auth/demo/route.ts');
const logout = require('../src/app/api/auth/logout/route.ts');
const session = require('../src/app/api/auth/session/route.ts');
function request(url, origin, body = 'next=%2Fgwa', cookie) {
    return new NextRequest(url, { method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded', ...(cookie ? { cookie } : {}) }, body });
}
test('one click opens the sample identity and logout clears its cookie', async () => {
    const response = await entry.POST(request('http://127.0.0.1:3001/api/auth/demo', 'http://127.0.0.1:3001'));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'http://127.0.0.1:3001/gwa');
    const raw = response.cookies.get(auth.SESSION_COOKIE).value;
    const cookie = `${auth.SESSION_COOKIE}=${raw}`;
    assert.equal(auth.readSession(raw).name, 'Demo Student');
    assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
    const info = await session.GET(new NextRequest('http://127.0.0.1:3001/api/auth/session', { headers: { cookie } }));
    assert.deepEqual(await info.json(), { user: { name: 'Demo Student', email: 'demo@cvsu.edu.ph', picture: null } });
    const leave = await logout.POST(request('http://127.0.0.1:3001/api/auth/logout', 'http://127.0.0.1:3001', '', cookie));
    assert.equal(leave.cookies.get(auth.SESSION_COOKIE).value, '');
    assert.match(leave.headers.get('set-cookie'), /Max-Age=0/i);
});
test('demo rejects external origins, cross-site submissions, forged and expired sessions', async () => {
    for (const [url, origin] of [['https://example.com/api/auth/demo', 'https://example.com'], ['http://127.0.0.1:3001/api/auth/demo', 'https://example.com']])
        assert.equal((await entry.POST(request(url, origin))).status, 403);
    const response = await entry.POST(request('http://localhost:3001/api/auth/demo', 'http://localhost:3001', 'next=https%3A%2F%2Fevil.example'));
    assert.equal(response.headers.get('location'), 'http://localhost:3001/grade');
    assert.equal(auth.readSession('forged'), null);
    assert.equal(auth.readSession(auth.signValue({ sub: 'local-demo', name: 'Demo Student', email: 'demo@cvsu.edu.ph', domain: 'cvsu.edu.ph', exp: 1 })), null);
});
test('production and Vercel cannot issue or accept demo sessions', async () => {
    const raw = auth.createDemoSession();
    try {
        process.env.NODE_ENV = 'production';
        assert.equal(auth.readSession(raw), null);
        assert.throws(() => auth.createDemoSession(), /disabled/);
        assert.equal((await entry.POST(request('http://127.0.0.1:3001/api/auth/demo', 'http://127.0.0.1:3001'))).status, 403);
        process.env.NODE_ENV = 'test';
        process.env.VERCEL = '1';
        assert.equal(auth.readSession(raw), null);
    } finally {
        process.env.NODE_ENV = 'test';
        delete process.env.VERCEL;
    }
});
