require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync, sign } = require('node:crypto');
const { NextRequest } = require('next/server');
process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.AUTH_SECRET = 'test-only-secret-at-least-thirty-two-bytes';
process.env.APP_URL = 'http://localhost:3000';
process.env.CVSU_ALLOWED_DOMAINS = 'cvsu.edu.ph';
const auth = require('../src/lib/auth.ts');
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' };
const now = () => Math.floor(Date.now() / 1000);
const claims = () => ({ iss: 'https://accounts.google.com', aud: 'test-client', sub: '123', email: 'student@cvsu.edu.ph', email_verified: true, hd: 'cvsu.edu.ph', name: 'Test Student', nonce: 'nonce', iat: now(), exp: now() + 3600 });
function token(overrides = {}, header = {}) {
    const body = [{ alg: 'RS256', kid: 'test-key', ...header }, { ...claims(), ...overrides }].map(v => Buffer.from(JSON.stringify(v)).toString('base64url')).join('.');
    return `${body}.${sign('RSA-SHA256', Buffer.from(body), privateKey).toString('base64url')}`;
}
const nativeFetch = global.fetch;
test.after(() => { global.fetch = nativeFetch; });
test('auth configuration fails closed with missing credentials, weak secret or insecure origins', () => {
    const oldSecret = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = 'short';
    assert.throws(auth.authConfig, /not configured/);
    process.env.AUTH_SECRET = oldSecret;
    process.env.APP_URL = 'http://example.com';
    assert.throws(auth.authConfig, /HTTPS/);
    process.env.APP_URL = 'http://localhost:3000';
    const oldClient = process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;
    assert.throws(auth.authConfig, /not configured/);
    process.env.GOOGLE_CLIENT_ID = oldClient;
});
test('session cookie signature, expiry, purpose and exact domain are enforced', () => {
    const session = { sub: '123', email: 'student@cvsu.edu.ph', name: 'Student', domain: 'cvsu.edu.ph', exp: now() + 60 };
    const raw = auth.signValue(session, 'session');
    assert.equal(auth.readSession(raw).email, session.email);
    assert.equal(auth.readSession(`${raw.slice(0, -2)}xx`), null);
    assert.equal(auth.readSession(auth.signValue({ ...session, exp: now() - 1 }, 'session')), null);
    assert.equal(auth.readSession(auth.signValue(session, 'flow')), null);
    for (const email of ['student@gmail.com', 'student@cvsu.edu.ph.evil.com', 'student@sub.cvsu.edu.ph'])
        assert.equal(auth.readSession(auth.signValue({ ...session, email }, 'session')), null);
});
test('authorization request contains random state, nonce, PKCE and Workspace hint', () => {
    const a = auth.createFlow(), b = auth.createFlow();
    assert.notEqual(a.state, b.state);
    assert.notEqual(a.nonce, b.nonce);
    const url = new URL(auth.authorizationUrl(a));
    assert.equal(url.origin, 'https://accounts.google.com');
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(url.searchParams.get('hd'), 'cvsu.edu.ph');
    assert.equal(url.searchParams.get('state'), a.state);
    assert.equal(url.searchParams.get('nonce'), a.nonce);
    assert.equal(url.searchParams.get('scope'), 'openid email profile');
});
test('profile pictures allow only bounded Google HTTPS image URLs and preserve old sessions', async () => {
    const picture = 'https://lh3.googleusercontent.com/a/example=s96-c';
    assert.equal(auth.googlePicture(picture), picture);
    for (const value of [undefined, null, '', 'javascript:alert(1)', 'data:image/svg+xml,abc', 'http://lh3.googleusercontent.com/a/x', 'https://evil.example/avatar.png', 'https://lh3.googleusercontent.com.evil.example/a/x', 'https://user:password@lh3.googleusercontent.com/a/x', 'https://lh3.googleusercontent.com/' + 'x'.repeat(1024)])
        assert.equal(auth.googlePicture(value), undefined);
    global.fetch = async () => Response.json({ keys: [jwk] });
    const session = await auth.verifyGoogleToken(token({ picture }), 'nonce');
    assert.equal(auth.readSession(auth.signValue(session, 'session')).picture, picture);
    assert.equal(auth.readSession(auth.signValue({ ...session, picture: undefined }, 'session')).picture, undefined);
});
test('signed Google ID token accepted only with verified CvSU Workspace identity', async () => {
    global.fetch = async () => Response.json({ keys: [jwk] });
    assert.equal((await auth.verifyGoogleToken(token(), 'nonce')).email, 'student@cvsu.edu.ph');
    for (const overrides of [{ email: 'student@gmail.com', hd: 'gmail.com' }, { hd: undefined }, { email_verified: false }, { email: 's@cvsu.edu.ph.evil.com' }, { nonce: 'wrong' }, { aud: 'wrong' }, { azp: 'wrong' }, { iss: 'https://evil.com' }, { exp: now() - 1 }, { iat: now() + 500 }])
        await assert.rejects(auth.verifyGoogleToken(token(overrides), 'nonce'));
    await assert.rejects(auth.verifyGoogleToken(token({}, { alg: 'none' }), 'nonce'));
    await assert.rejects(auth.verifyGoogleToken(token({}, { kid: 'unknown' }), 'nonce'));
    const badSignature = token().split('.');
    badSignature[2] = Buffer.alloc(256).toString('base64url');
    await assert.rejects(auth.verifyGoogleToken(badSignature.join('.'), 'nonce'));
});
test('Google key-fetch outage fails safely', async () => {
    global.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(auth.verifyGoogleToken(token(), 'nonce'), /unavailable/);
});
test('OAuth start sets short-lived HttpOnly state cookie; missing setup returns 503', async () => {
    const route = require('../src/app/api/auth/google/route.ts');
    const response = await route.GET(new NextRequest('http://localhost:3000/api/auth/google'));
    assert.equal(response.status, 307);
    assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
    assert.match(response.headers.get('set-cookie'), /SameSite=lax/i);
    assert.match(response.headers.get('location'), /^https:\/\/accounts.google.com\//);
    const old = process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;
    assert.equal((await route.GET(new NextRequest('http://localhost:3000/api/auth/google'))).status, 503);
    process.env.GOOGLE_CLIENT_ID = old;
});
test('OAuth callback blocks missing/mismatched state before contacting Google', async () => {
    const route = require('../src/app/api/auth/callback/route.ts');
    let requests = 0;
    global.fetch = async () => { requests++; throw Error('unexpected'); };
    const flow = auth.createFlow();
    const response = await route.GET(new NextRequest('http://localhost:3000/api/auth/callback?code=test&state=wrong', { headers: { cookie: `${auth.FLOW_COOKIE}=${auth.signValue(flow, 'flow')}` } }));
    assert.equal(requests, 0);
    assert.equal(new URL(response.headers.get('location')).searchParams.get('error'), 'signin');
    assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
});
test('full simulated OAuth callback issues session and discards flow cookie', async () => {
    const route = require('../src/app/api/auth/callback/route.ts');
    const flow = auth.createFlow();
    global.fetch = async (url, options) => {
        if (url === 'https://oauth2.googleapis.com/token') {
            assert.equal(options.body.get('code_verifier'), flow.verifier);
            return Response.json({ id_token: token({ nonce: flow.nonce }) });
        }
        assert.equal(url, 'https://www.googleapis.com/oauth2/v3/certs');
        return Response.json({ keys: [jwk] });
    };
    const response = await route.GET(new NextRequest(`http://localhost:3000/api/auth/callback?code=test&state=${flow.state}`, { headers: { cookie: `${auth.FLOW_COOKIE}=${auth.signValue(flow, 'flow')}` } }));
    assert.equal(response.headers.get('location'), 'http://localhost:3000/grade');
    assert.equal(auth.readSession(response.cookies.get(auth.SESSION_COOKIE).value).sub, '123');
    assert.equal(response.cookies.get(auth.FLOW_COOKIE).value, '');
});
test('session endpoint omits tokens and logout blocks cross-site requests', async () => {
    const sessionRoute = require('../src/app/api/auth/session/route.ts');
    assert.deepEqual(await (await sessionRoute.GET(new NextRequest('http://localhost:3000/api/auth/session'))).json(), { user: null });
    const route = require('../src/app/api/auth/logout/route.ts');
    assert.equal((await route.POST(new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST', headers: { origin: 'https://evil.com' } }))).status, 403);
    const response = await route.POST(new NextRequest('http://localhost:3000/api/auth/logout', { method: 'POST', headers: { origin: 'http://localhost:3000' } }));
    assert.equal(response.status, 303);
    assert.equal(response.cookies.get(auth.SESSION_COOKIE).value, '');
});
test('login destinations accept only the three protected pages', () => {
    for (const next of ['/grade', '/gwa', '/grading-system'])
        assert.equal(auth.loginDestination(next), next);
    for (const next of [null, undefined, '', 'https://evil.example', '//evil.example', '/api/auth/logout', '/gwa?next=https://evil.example', '/\\evil.example', ['//evil.example']])
        assert.equal(auth.loginDestination(next), '/grade');
});
test('OAuth start signs the requested destination rather than trusting it on callback', async () => {
    const route = require('../src/app/api/auth/google/route.ts');
    const response = await route.GET(new NextRequest('http://localhost:3000/api/auth/google?next=%2Fgwa'));
    assert.equal(auth.readValue(response.cookies.get(auth.FLOW_COOKIE).value, 'flow').destination, '/gwa');
});
test('successful login returns to GWA and ignores callback redirect injection', async () => {
    const route = require('../src/app/api/auth/callback/route.ts');
    const flow = auth.createFlow('/gwa');
    global.fetch = async (url) => url === 'https://oauth2.googleapis.com/token' ? Response.json({ id_token: token({ nonce: flow.nonce }) }) : Response.json({ keys: [jwk] });
    const response = await route.GET(new NextRequest(`http://localhost:3000/api/auth/callback?code=test&state=${flow.state}&next=https://evil.example`, { headers: { cookie: `${auth.FLOW_COOKIE}=${auth.signValue(flow, 'flow')}` } }));
    assert.equal(response.headers.get('location'), 'http://localhost:3000/gwa');
});
test('cancelled Google consent clears flow and preserves selected destination without exchanging tokens', async () => {
    const route = require('../src/app/api/auth/callback/route.ts');
    const flow = auth.createFlow('/grading-system');
    global.fetch = async () => { throw Error('Cancellation must not call Google'); };
    const response = await route.GET(new NextRequest(`http://localhost:3000/api/auth/callback?error=access_denied&state=${flow.state}`, { headers: { cookie: `${auth.FLOW_COOKIE}=${auth.signValue(flow, 'flow')}` } }));
    const url = new URL(response.headers.get('location'));
    assert.equal(url.searchParams.get('error'), 'cancelled');
    assert.equal(url.searchParams.get('next'), '/grading-system');
    assert.equal(response.cookies.get(auth.FLOW_COOKIE).value, '');
    assert.equal(response.cookies.get(auth.SESSION_COOKIE).value, '');
});
test('a personal Google account returns actionable account error without issuing a session', async () => {
    const route = require('../src/app/api/auth/callback/route.ts');
    const flow = auth.createFlow('/gwa');
    global.fetch = async (url) => url === 'https://oauth2.googleapis.com/token' ? Response.json({ id_token: token({ nonce: flow.nonce, email: 'student@gmail.com', hd: undefined }) }) : Response.json({ keys: [jwk] });
    const response = await route.GET(new NextRequest(`http://localhost:3000/api/auth/callback?code=test&state=${flow.state}`, { headers: { cookie: `${auth.FLOW_COOKIE}=${auth.signValue(flow, 'flow')}` } }));
    assert.equal(new URL(response.headers.get('location')).searchParams.get('error'), 'account');
    assert.equal(auth.readSession(response.cookies.get(auth.SESSION_COOKIE).value), null);
});
