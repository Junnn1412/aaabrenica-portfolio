import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTACT_RESPONSE_KIND,
  submitContactRequest,
} from '../src/contact/form-client.js';

const values = {
  name: 'AAA',
  email: 'visitor@example.com',
  company: '',
  message: 'A project',
  website: '',
};

test('HTTP 429 becomes a recoverable rate-limited result with one request and no automatic retry', async () => {
  const calls = [];
  const result = await submitContactRequest({
    fetchImpl: async (...args) => {
      calls.push(args);
      return { status: 429, ok: false };
    },
    action: '/api/contact',
    values,
    submissionId: '123e4567-e89b-42d3-a456-426614174000',
  });

  assert.deepEqual(result, { kind: CONTACT_RESPONSE_KIND.rateLimited });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].method, 'POST');
});

test('client sends JSON and the stable idempotency key without changing button copy data', async () => {
  let options;
  const result = await submitContactRequest({
    fetchImpl: async (_url, requestOptions) => {
      options = requestOptions;
      return { status: 200, ok: true, json: async () => ({ ok: true }) };
    },
    action: '/api/contact',
    values,
    submissionId: '123e4567-e89b-42d3-a456-426614174000',
  });
  assert.equal(result.kind, CONTACT_RESPONSE_KIND.success);
  assert.equal(
    options.headers['Idempotency-Key'],
    '123e4567-e89b-42d3-a456-426614174000',
  );
  assert.deepEqual(JSON.parse(options.body), values);
});

test('server validation details are classified for field-level rendering', async () => {
  const errors = [{ field: 'email', code: 'invalid' }];
  const result = await submitContactRequest({
    fetchImpl: async () => ({
      status: 400,
      ok: false,
      json: async () => ({ code: 'validation_error', errors }),
    }),
    action: '/api/contact',
    values,
    submissionId: '123e4567-e89b-42d3-a456-426614174000',
  });
  assert.deepEqual(result, {
    kind: CONTACT_RESPONSE_KIND.validation,
    errors,
  });
});
