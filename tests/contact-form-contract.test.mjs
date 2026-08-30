import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTACT_FORM_BODY_LIMIT,
  CONTACT_FORM_FIELDS,
  CONTACT_HONEYPOT_FIELD,
  isContactSubmissionId,
  validateContactSubmission,
} from '../src/contact/form-contract.js';

const valid = Object.freeze({
  name: '  AAA  ',
  email: 'visitor@example.com',
  company: ' Example Co. ',
  message: 'First line\r\nSecond line',
  website: '',
});

test('contact contract has the approved closed field set and limits', () => {
  assert.deepEqual(CONTACT_FORM_FIELDS, {
    name: { required: true, maxLength: 100 },
    email: { required: true, maxLength: 254 },
    company: { required: false, maxLength: 150 },
    message: { required: true, maxLength: 5000 },
  });
  assert.equal(CONTACT_HONEYPOT_FIELD, 'website');
  assert.equal(CONTACT_FORM_BODY_LIMIT, 16 * 1024);
});

test('contact validation normalizes values and accepts the approved shape', () => {
  const result = validateContactSubmission(valid);
  assert.equal(result.valid, true);
  assert.equal(result.values.name, 'AAA');
  assert.equal(result.values.company, 'Example Co.');
  assert.equal(result.values.message, 'First line\nSecond line');
});

test('Unicode and line endings normalize before field limits are enforced', () => {
  const decomposed = 'e\u0301'.repeat(100);
  const accepted = validateContactSubmission({
    ...valid,
    name: decomposed,
    message: 'First\r\nSecond\rThird',
  });
  assert.equal(accepted.valid, true);
  assert.equal(accepted.values.name, 'é'.repeat(100));
  assert.equal(accepted.values.message, 'First\nSecond\nThird');

  const rejected = validateContactSubmission({
    ...valid,
    name: `${decomposed}e\u0301`,
  });
  assert.deepEqual(rejected.errors, [
    { field: 'name', code: 'maxLength', maximum: 100 },
  ]);
});

test('null bytes, prohibited controls, and visitor-email CR/LF are rejected', () => {
  assert.deepEqual(
    validateContactSubmission({ ...valid, message: 'Hello\0world' }).errors,
    [{ field: 'message', code: 'invalid' }],
  );
  assert.deepEqual(
    validateContactSubmission({ ...valid, name: 'Hello\u0007world' }).errors,
    [{ field: 'name', code: 'invalid' }],
  );
  assert.deepEqual(
    validateContactSubmission({
      ...valid,
      email: 'visitor@example.com\r\nBcc:x@example.com',
    }).errors,
    [{ field: 'email', code: 'invalid' }],
  );
});

test('contact validation rejects required, maximum, email, control, and unknown-field violations', () => {
  assert.deepEqual(validateContactSubmission({ ...valid, name: '' }).errors, [
    { field: 'name', code: 'required' },
  ]);
  assert.deepEqual(
    validateContactSubmission({ ...valid, company: 'x'.repeat(151) }).errors,
    [{ field: 'company', code: 'maxLength', maximum: 150 }],
  );
  assert.deepEqual(
    validateContactSubmission({ ...valid, email: 'not-an-email' }).errors,
    [{ field: 'email', code: 'invalid' }],
  );
  assert.deepEqual(
    validateContactSubmission({ ...valid, name: 'AAA\nInjected' }).errors,
    [{ field: 'name', code: 'invalid' }],
  );
  assert.deepEqual(
    validateContactSubmission({ ...valid, projectType: 'Website' })
      .unknownFields,
    ['projectType'],
  );
});

test('honeypot is detected without changing the otherwise-valid result', () => {
  const result = validateContactSubmission({ ...valid, website: 'bot' });
  assert.equal(result.valid, true);
  assert.equal(result.isHoneypot, true);
});

test('only UUID v4 values satisfy the client idempotency contract', () => {
  assert.equal(
    isContactSubmissionId('123e4567-e89b-42d3-a456-426614174000'),
    true,
  );
  assert.equal(isContactSubmissionId('not-a-uuid'), false);
  assert.equal(
    isContactSubmissionId('123e4567-e89b-12d3-a456-426614174000'),
    false,
  );
});
