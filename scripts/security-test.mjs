import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_AUTH_SECRET =
  process.env.TEST_API_AUTH_SECRET || process.env.API_AUTH_SECRET || '';
const EXPECT_PROD_CSP = process.env.EXPECT_PROD_CSP === 'true';

function httpRequest(urlStr, { method = 'GET', headers = {}, body = '' } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function getSetCookieHeaders(headers) {
  const raw = headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function parseJson(res, label) {
  try {
    return JSON.parse(res.body);
  } catch (err) {
    assert.fail(`${label}: expected JSON response, got status ${res.status} (${err.message})`);
  }
}

async function runSecurityTests() {
  console.log(`Running security regression tests against ${BASE}...`);

  // 1. Unauthenticated / No-Origin mutations must be rejected (401/403/503)
  const syncNoOrigin = await httpRequest(`${BASE}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pull: true }),
  });
  assert.ok(
    [401, 403, 503].includes(syncNoOrigin.status),
    `Expected 401/403/503 for /api/sync without Origin, got ${syncNoOrigin.status}`
  );

  // 2. Cross-origin mutations must be rejected
  const syncCrossOrigin = await httpRequest(`${BASE}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
    body: JSON.stringify({ habits: [] }),
  });
  assert.ok(
    [401, 403, 503].includes(syncCrossOrigin.status),
    `Expected 401/403/503 for cross-origin /api/sync, got ${syncCrossOrigin.status}`
  );

  // 3. Same-origin oversized array in /api/sync must return 400 (or 401/503 if auth required/unconfigured)
  const syncOversized = await httpRequest(`${BASE}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ habits: new Array(2001).fill({ id: 'x' }) }),
  });
  assert.ok(
    [400, 401, 503].includes(syncOversized.status),
    `Expected 400/401/503 for oversized /api/sync payload, got ${syncOversized.status}`
  );

  // 4. /api/ai prompt length cap (>8000 chars) must be rejected
  const aiOversized = await httpRequest(`${BASE}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ action: 'chat', prompt: 'a'.repeat(8001) }),
  });
  assert.ok(
    [400, 401, 503].includes(aiOversized.status),
    `Expected 400/401/503 for oversized /api/ai prompt, got ${aiOversized.status}`
  );

  // 5. /api/blob disallowed MIME type (text/html) must be rejected
  const blobHtml = await httpRequest(`${BASE}/api/blob?filename=../../evil.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/html', Origin: BASE },
    body: '<script>alert(1)</script>',
  });
  assert.ok(
    [401, 415, 503].includes(blobHtml.status),
    `Expected 401/415/503 for /api/blob text/html, got ${blobHtml.status}`
  );

  // 6. Filename and URL path traversal handling
  const blobEncodedTraversal = await httpRequest(
    `${BASE}/api/blob?filename=..%2F..%2F..%2Fetc%2Fpasswd`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/html', Origin: BASE },
      body: 'traversal-test',
    }
  );
  assert.ok(
    [401, 415, 503].includes(blobEncodedTraversal.status),
    `Expected 401/415/503 for encoded traversal on /api/blob, got ${blobEncodedTraversal.status}`
  );

  const blobBackslashTraversal = await httpRequest(
    `${BASE}/api/blob?filename=..%5C..%5Cwindows%5Cwin.ini`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/html', Origin: BASE },
      body: 'traversal-test',
    }
  );
  assert.ok(
    [401, 415, 503].includes(blobBackslashTraversal.status),
    `Expected 401/415/503 for backslash traversal on /api/blob, got ${blobBackslashTraversal.status}`
  );

  const routeTraversal = await httpRequest(`${BASE}/..%2F..%2Fpackage.json`);
  assert.ok(
    routeTraversal.status !== 200,
    `Path traversal request must not return 200, got ${routeTraversal.status}`
  );

  // 7. /api/auth endpoints: GET status, wrong/missing secret rejection, optional login, DELETE logout
  const authGet = await httpRequest(`${BASE}/api/auth`);
  assert.equal(authGet.status, 200, `Expected 200 from GET /api/auth, got ${authGet.status}`);
  const authGetBody = parseJson(authGet, 'GET /api/auth');
  assert.equal(
    typeof authGetBody.authenticated,
    'boolean',
    'GET /api/auth must return { authenticated: boolean }'
  );

  const authWrongSecret = await httpRequest(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ secret: 'incorrect-secret-regression-check' }),
  });
  assert.ok(
    [401, 503].includes(authWrongSecret.status),
    `Expected 401/503 for POST /api/auth with wrong secret, got ${authWrongSecret.status}`
  );
  assert.equal(
    getSetCookieHeaders(authWrongSecret.headers).some((c) => c.includes('nexdev_session=')),
    false,
    'Failed POST /api/auth must not set nexdev_session cookie'
  );

  const authMissingSecret = await httpRequest(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({}),
  });
  assert.ok(
    [401, 503].includes(authMissingSecret.status),
    `Expected 401/503 for POST /api/auth with missing secret, got ${authMissingSecret.status}`
  );

  if (TEST_AUTH_SECRET) {
    const authLogin = await httpRequest(`${BASE}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE },
      body: JSON.stringify({ secret: TEST_AUTH_SECRET }),
    });
    assert.equal(authLogin.status, 200, `Expected 200 from valid POST /api/auth, got ${authLogin.status}`);
    const loginBody = parseJson(authLogin, 'POST /api/auth (valid)');
    assert.equal(loginBody.authenticated, true);

    const setCookies = getSetCookieHeaders(authLogin.headers);
    const sessionCookieHeader = setCookies.find((c) => c.startsWith('nexdev_session='));
    assert.ok(sessionCookieHeader, 'Valid POST /api/auth must set nexdev_session cookie');
    assert.match(sessionCookieHeader, /httponly/i, 'nexdev_session cookie must set HttpOnly');

    const cookiePair = sessionCookieHeader.split(';')[0];
    const authVerified = await httpRequest(`${BASE}/api/auth`, {
      headers: { Cookie: cookiePair },
    });
    assert.equal(authVerified.status, 200);
    assert.equal(parseJson(authVerified, 'GET /api/auth (with cookie)').authenticated, true);

    // Authenticated validation check on /api/ai (>8000 chars must return 400 after passing auth)
    const authedAiOversized = await httpRequest(`${BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE, Cookie: cookiePair },
      body: JSON.stringify({ action: 'chat', prompt: 'a'.repeat(8001) }),
    });
    assert.equal(
      authedAiOversized.status,
      400,
      `Authenticated /api/ai >8000 char prompt must return 400, got ${authedAiOversized.status}`
    );
  }

  const authDelete = await httpRequest(`${BASE}/api/auth`, {
    method: 'DELETE',
    headers: { Origin: BASE },
  });
  assert.equal(authDelete.status, 200, `Expected 200 from DELETE /api/auth, got ${authDelete.status}`);
  const authDeleteBody = parseJson(authDelete, 'DELETE /api/auth');
  assert.equal(authDeleteBody.authenticated, false);
  const deleteCookies = getSetCookieHeaders(authDelete.headers);
  const clearedCookie = deleteCookies.find((c) => c.startsWith('nexdev_session='));
  assert.ok(clearedCookie, 'DELETE /api/auth must emit Set-Cookie clearing nexdev_session');
  assert.ok(
    clearedCookie.includes('nexdev_session=;') ||
      /max-age=0/i.test(clearedCookie) ||
      /1970/i.test(clearedCookie),
    `DELETE /api/auth must expire nexdev_session cookie, got: ${clearedCookie}`
  );

  // 8. Security headers & CSP directives check on homepage
  const home = await httpRequest(BASE);
  assert.equal(home.status, 200);
  assert.equal(home.headers['x-frame-options'], 'DENY');
  assert.equal(home.headers['x-content-type-options'], 'nosniff');
  assert.equal(home.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(home.headers['x-powered-by'], undefined, 'X-Powered-By header must be disabled');

  const csp = home.headers['content-security-policy'];
  assert.ok(csp, 'Missing CSP header');
  assert.ok(csp.includes("default-src 'self'"), 'CSP missing default-src self');
  assert.ok(csp.includes("object-src 'none'"), "CSP missing object-src 'none'");
  assert.ok(csp.includes("base-uri 'self'"), "CSP missing base-uri 'self'");
  assert.ok(csp.includes("form-action 'self'"), "CSP missing form-action 'self'");
  assert.ok(csp.includes("frame-ancestors 'none'"), "CSP missing frame-ancestors 'none'");
  if (EXPECT_PROD_CSP) {
    assert.equal(
      csp.includes("'unsafe-eval'"),
      false,
      `Production CSP must not include 'unsafe-eval': ${csp}`
    );
  }

  console.log('ALL SECURITY REGRESSION TESTS PASSED.');
}

runSecurityTests().catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
