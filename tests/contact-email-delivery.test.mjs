import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RESEND_EMAIL_ENDPOINT,
  RESEND_TIMEOUT_MS,
  createResendEmailDelivery,
  getEmailDeliveryConfig,
} from '../functions/_shared/email-delivery.js';

const env = Object.freeze({
  CONTACT_FORM_ENABLED: 'true',
  RESEND_API_KEY: 'secret-api-key',
  CONTACT_FROM_EMAIL: 'portfolio@example.com',
  CONTACT_TO_EMAIL: 'owner@example.com',
});

test('delivery configuration is all-or-nothing and rejects CR/LF header input', () => {
  assert.deepEqual(getEmailDeliveryConfig(env), {
    apiKey: env.RESEND_API_KEY,
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_TO_EMAIL,
  });
  assert.equal(
    getEmailDeliveryConfig({ ...env, CONTACT_FORM_ENABLED: 'false' }),
    null,
  );
  assert.equal(getEmailDeliveryConfig({ ...env, RESEND_API_KEY: '' }), null);
  assert.equal(
    getEmailDeliveryConfig({
      ...env,
      CONTACT_TO_EMAIL: 'owner@example.com\nBcc:x@example.com',
    }),
    null,
  );
});

test('Resend adapter makes one provider request with fixed transport headers and validated Reply-To', async () => {
  const calls = [];
  const timeoutSignal = AbortSignal.abort('test-only');
  let requestedTimeout;
  const deliver = createResendEmailDelivery({
    fetchImpl: async (...args) => {
      calls.push(args);
      return { ok: true, status: 200 };
    },
    createTimeoutSignal: (timeout) => {
      requestedTimeout = timeout;
      return timeoutSignal;
    },
  });
  const result = await deliver({
    config: getEmailDeliveryConfig(env),
    replyTo: 'visitor@example.net',
    subject: 'New portfolio contact inquiry',
    text: 'Plain text',
    html: '<p>Safe HTML</p>',
    idempotencyKey: '123e4567-e89b-42d3-a456-426614174000',
  });

  assert.deepEqual(result, { ok: true, status: 200 });
  assert.equal(calls.length, 1);
  assert.equal(requestedTimeout, RESEND_TIMEOUT_MS);
  assert.equal(calls[0][1].signal, timeoutSignal);
  assert.equal(calls[0][0], RESEND_EMAIL_ENDPOINT);
  assert.equal(calls[0][1].headers.Authorization, 'Bearer secret-api-key');
  assert.equal(
    calls[0][1].headers['Idempotency-Key'],
    '123e4567-e89b-42d3-a456-426614174000',
  );
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    from: 'portfolio@example.com',
    to: ['owner@example.com'],
    reply_to: 'visitor@example.net',
    subject: 'New portfolio contact inquiry',
    text: 'Plain text',
    html: '<p>Safe HTML</p>',
  });
});

test('provider timeout abort rejects after one fetch attempt and cannot retry', async () => {
  let calls = 0;
  const deliver = createResendEmailDelivery({
    fetchImpl: async (_url, options) => {
      calls += 1;
      assert.equal(options.signal.aborted, true);
      throw new DOMException('Timed out', 'TimeoutError');
    },
    createTimeoutSignal: () =>
      AbortSignal.abort(new DOMException('Timed out', 'TimeoutError')),
  });

  await assert.rejects(
    deliver({
      config: getEmailDeliveryConfig(env),
      replyTo: 'visitor@example.net',
      subject: 'New portfolio contact inquiry',
      text: 'Plain text',
      html: '<p>Safe HTML</p>',
      idempotencyKey: '123e4567-e89b-42d3-a456-426614174000',
    }),
    { name: 'TimeoutError' },
  );
  assert.equal(calls, 1);
});

test('Resend adapter rejects Reply-To and subject injection before fetch', async () => {
  let calls = 0;
  const deliver = createResendEmailDelivery({
    fetchImpl: async () => {
      calls += 1;
    },
  });
  await assert.rejects(
    deliver({
      config: getEmailDeliveryConfig(env),
      replyTo: 'visitor@example.net\r\nBcc:x@example.net',
      subject: 'New inquiry',
      text: 'Text',
      html: '<p>Text</p>',
      idempotencyKey: 'id',
    }),
    /Invalid email delivery input/,
  );
  assert.equal(calls, 0);
});
