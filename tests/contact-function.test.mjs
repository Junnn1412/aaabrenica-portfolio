import { test } from 'node:test';
import assert from 'node:assert/strict';
import { __test, handleContactRequest } from '../functions/api/contact.js';

const enabledEnv = Object.freeze({
  CONTACT_FORM_ENABLED: 'true',
  RESEND_API_KEY: 'secret-api-key',
  CONTACT_FROM_EMAIL: 'portfolio@example.com',
  CONTACT_TO_EMAIL: 'owner@example.com',
});
const valid = Object.freeze({
  name: 'AAA',
  email: 'visitor@example.net',
  company: 'Example <Co>',
  message: 'Build <script>alert(1)</script>\nSecond line',
  website: '',
});

function request({
  method = 'POST',
  body = JSON.stringify(valid),
  contentType = 'application/json',
  accept = 'application/json',
  headers = {},
} = {}) {
  return new Request('https://portfolio.example/api/contact', {
    method,
    headers: {
      Accept: accept,
      'Content-Type': contentType,
      ...headers,
    },
    body: method === 'GET' ? undefined : body,
  });
}

function quietLogger() {
  return { info() {}, warn() {} };
}

test('Function independently accepts POST only and returns fixed safety headers', async () => {
  const response = await handleContactRequest(
    request({ method: 'GET' }),
    enabledEnv,
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'POST');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('Origin is enforced when present, while absent and same-origin requests remain eligible', async () => {
  let providerCalls = 0;
  const deliver = async () => {
    providerCalls += 1;
    return { ok: true, status: 200 };
  };
  const crossOrigin = await handleContactRequest(
    request({ headers: { Origin: 'https://attacker.example' } }),
    enabledEnv,
    { deliver, logger: quietLogger() },
  );
  assert.equal(crossOrigin.status, 403);
  assert.deepEqual(await crossOrigin.json(), {
    ok: false,
    code: 'submission_failed',
  });
  assert.equal(providerCalls, 0);

  const sameOrigin = await handleContactRequest(
    request({ headers: { Origin: 'https://portfolio.example' } }),
    enabledEnv,
    { deliver, logger: quietLogger() },
  );
  const absentOrigin = await handleContactRequest(request(), enabledEnv, {
    deliver,
    logger: quietLogger(),
  });
  assert.equal(sameOrigin.status, 200);
  assert.equal(absentOrigin.status, 200);
  assert.equal(providerCalls, 2);
});

test('missing or disabled runtime configuration returns generic 503 and makes no provider request', async () => {
  let calls = 0;
  const response = await handleContactRequest(
    request(),
    {},
    {
      deliver: async () => {
        calls += 1;
        return { ok: true, status: 200 };
      },
      logger: quietLogger(),
    },
  );
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    code: 'submission_failed',
  });
  assert.equal(calls, 0);
});

test('Function enforces content type and declared and actual body size', async () => {
  const wrongType = await handleContactRequest(
    request({ contentType: 'text/plain' }),
    enabledEnv,
  );
  assert.equal(wrongType.status, 415);

  const declaredLarge = await handleContactRequest(
    request({ headers: { 'Content-Length': '20000' } }),
    enabledEnv,
  );
  assert.equal(declaredLarge.status, 413);

  const actualLarge = await handleContactRequest(
    request({ body: 'x'.repeat(17000) }),
    enabledEnv,
  );
  assert.equal(actualLarge.status, 413);
});

test('Function rejects unknown and duplicate URL-encoded fields', async () => {
  const unknown = await handleContactRequest(
    request({ body: JSON.stringify({ ...valid, projectType: 'Website' }) }),
    enabledEnv,
  );
  assert.equal(unknown.status, 400);

  const duplicate = await handleContactRequest(
    request({
      contentType: 'application/x-www-form-urlencoded',
      body: 'name=AAA&name=Other&email=a%40example.com&message=Hello&website=',
    }),
    enabledEnv,
  );
  assert.equal(duplicate.status, 400);
});

test('honeypot returns the same public success without provider delivery', async () => {
  let calls = 0;
  const response = await handleContactRequest(
    request({ body: JSON.stringify({ ...valid, website: 'filled' }) }),
    enabledEnv,
    {
      deliver: async () => {
        calls += 1;
      },
      logger: quietLogger(),
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls, 0);
});

test('Function passes normalized safe content, validated Reply-To, and idempotency to the adapter', async () => {
  let delivery;
  const response = await handleContactRequest(
    request({
      headers: {
        'Idempotency-Key': '123e4567-e89b-42d3-a456-426614174000',
      },
    }),
    enabledEnv,
    {
      deliver: async (input) => {
        delivery = input;
        return { ok: true, status: 200 };
      },
      logger: quietLogger(),
    },
  );
  assert.equal(response.status, 200);
  assert.equal(delivery.replyTo, valid.email);
  assert.equal(delivery.subject, 'New portfolio contact inquiry');
  assert.equal(delivery.idempotencyKey, '123e4567-e89b-42d3-a456-426614174000');
  assert.match(delivery.text, /Company or organization: Example <Co>/);
  assert.doesNotMatch(delivery.html, /<script>/);
  assert.match(
    delivery.html,
    /&lt;script&gt;alert\(1\)&lt;\/script&gt;<br>Second line/,
  );
});

test('Function generates an idempotency value when a no-JavaScript request has no header', async () => {
  let idempotencyKey;
  await handleContactRequest(request(), enabledEnv, {
    createSubmissionId: () => 'generated-id',
    deliver: async (input) => {
      idempotencyKey = input.idempotencyKey;
      return { ok: true, status: 200 };
    },
    logger: quietLogger(),
  });
  assert.equal(idempotencyKey, 'generated-id');
});

test('no-JavaScript form POST receives an accessible HTML result', async () => {
  const body = new URLSearchParams(valid).toString();
  const response = await handleContactRequest(
    request({
      body,
      contentType: 'application/x-www-form-urlencoded',
      accept: 'text/html',
    }),
    enabledEnv,
    {
      deliver: async () => ({ ok: true, status: 200 }),
      logger: quietLogger(),
    },
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /^text\/html/);
  assert.match(html, /<main><h1 tabindex="-1">Message submitted<\/h1>/);
  assert.match(html, /href="\/contact\/">Return to Contact<\/a>/);
});

test('safe logging excludes submitted values, raw addresses, and secrets', async () => {
  const calls = [];
  const logger = {
    info: (...args) => calls.push(args),
    warn: (...args) => calls.push(args),
  };
  await handleContactRequest(
    request({ headers: { 'CF-Connecting-IP': '203.0.113.10' } }),
    enabledEnv,
    {
      deliver: async () => ({ ok: false, status: 500 }),
      logger,
    },
  );
  const logged = JSON.stringify(calls);
  for (const forbidden of [
    valid.name,
    valid.email,
    valid.company,
    valid.message,
    enabledEnv.RESEND_API_KEY,
    enabledEnv.CONTACT_FROM_EMAIL,
    enabledEnv.CONTACT_TO_EMAIL,
    JSON.stringify(valid),
    '203.0.113.10',
  ]) {
    assert.equal(logged.includes(forbidden), false);
  }
  assert.match(logged, /providerStatusCategory/);
  assert.match(logged, /5xx/);
  assert.doesNotMatch(logged, /"status":500/);
});

test('provider timeout or ambiguous network failure returns one generic recoverable response without a second send', async () => {
  let providerCalls = 0;
  const response = await handleContactRequest(request(), enabledEnv, {
    deliver: async () => {
      providerCalls += 1;
      throw new DOMException(
        'secret-api-key owner@example.com upstream stack',
        'TimeoutError',
      );
    },
    logger: quietLogger(),
  });
  assert.equal(providerCalls, 1);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    code: 'submission_failed',
  });
});

test('email generator exposes only the approved submission fields', () => {
  assert.deepEqual(__test.CONTACT_INPUT_NAMES, [
    'name',
    'email',
    'company',
    'message',
    'website',
  ]);
});
