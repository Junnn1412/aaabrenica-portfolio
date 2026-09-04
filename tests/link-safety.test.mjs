import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSafeInternalPath,
  isSafeEmail,
  isSafeExternalUrl,
  isSafeCaseStudyExternalUrl,
} from '../src/pages/link-safety.js';

test('accepts a plain internal path', () => {
  assert.equal(isSafeInternalPath('/work/fes-challenger/'), true);
  assert.equal(isSafeInternalPath('/'), true);
});

test('rejects javascript: URLs', () => {
  assert.equal(isSafeInternalPath('javascript:alert(1)'), false);
});

test('rejects external http(s) URLs', () => {
  assert.equal(isSafeInternalPath('http://example.com'), false);
  assert.equal(isSafeInternalPath('https://example.com'), false);
});

test('rejects mailto: URLs', () => {
  assert.equal(isSafeInternalPath('mailto:test@example.com'), false);
});

test('rejects protocol-relative URLs', () => {
  assert.equal(isSafeInternalPath('//evil.com'), false);
});

test('rejects non-string and empty-string input', () => {
  assert.equal(isSafeInternalPath(''), false);
  assert.equal(isSafeInternalPath(null), false);
  assert.equal(isSafeInternalPath(undefined), false);
  assert.equal(isSafeInternalPath(42), false);
});

test('isSafeEmail accepts a plain address', () => {
  assert.equal(isSafeEmail('hello@aaabrenica.site'), true);
});

test('isSafeEmail rejects a "%"-bearing local part (mailto CRLF-injection shape)', () => {
  assert.equal(isSafeEmail('local%0d%0abcc%3aevil@evil.com'), false);
});

test('isSafeEmail rejects a trailing newline', () => {
  assert.equal(isSafeEmail('good@example.com\n'), false);
});

test('isSafeEmail rejects embedded CR/LF', () => {
  assert.equal(isSafeEmail('go\r\nod@example.com'), false);
});

test('isSafeEmail rejects query/header-injection characters', () => {
  assert.equal(isSafeEmail('a?b@example.com'), false);
  assert.equal(isSafeEmail('a&b@example.com'), false);
  assert.equal(isSafeEmail('a<b>@example.com'), false);
  assert.equal(isSafeEmail('a"b@example.com'), false);
});

test('isSafeEmail rejects malformed and non-string input', () => {
  assert.equal(isSafeEmail('not-an-email'), false);
  assert.equal(isSafeEmail(''), false);
  assert.equal(isSafeEmail(null), false);
  assert.equal(isSafeEmail(undefined), false);
});

test('isSafeExternalUrl accepts an allowed HTTPS host for its group', () => {
  assert.equal(isSafeExternalUrl('https://github.com/aaa', 'github'), true);
  assert.equal(
    isSafeExternalUrl('https://www.linkedin.com/in/aaa', 'linkedin'),
    true,
  );
  assert.equal(
    isSafeExternalUrl('https://www.facebook.com/Junnabrenica/', 'facebook'),
    true,
  );
});

test('isSafeExternalUrl rejects a non-HTTPS protocol', () => {
  assert.equal(isSafeExternalUrl('http://github.com/aaa', 'github'), false);
  assert.equal(isSafeExternalUrl('javascript:alert(1)', 'github'), false);
});

test('isSafeExternalUrl rejects a wrong or unrelated host', () => {
  assert.equal(isSafeExternalUrl('https://evil.example.com', 'github'), false);
  assert.equal(
    isSafeExternalUrl('https://linkedin.com/in/aaa', 'github'),
    false,
  );
  assert.equal(isSafeExternalUrl('https://example.com/aaa', 'facebook'), false);
});

test('isSafeExternalUrl rejects malformed and non-string input', () => {
  assert.equal(isSafeExternalUrl('not a url', 'github'), false);
  assert.equal(isSafeExternalUrl(null, 'github'), false);
  assert.equal(isSafeExternalUrl('https://github.com', 'unknown-group'), false);
});

// PF-060 — keyed by route.content (a code-side closed map), not a
// content-supplied hostGroup, so a content edit alone can never grant
// itself a new allowed host.
test('isSafeCaseStudyExternalUrl accepts the approved FES Challenger host', () => {
  assert.equal(
    isSafeCaseStudyExternalUrl(
      'https://feschallenger.com/',
      'work-fes-challenger',
    ),
    true,
  );
  assert.equal(
    isSafeCaseStudyExternalUrl(
      'https://www.feschallenger.com/',
      'work-fes-challenger',
    ),
    true,
  );
});

test('isSafeCaseStudyExternalUrl rejects a non-HTTPS protocol', () => {
  assert.equal(
    isSafeCaseStudyExternalUrl(
      'http://feschallenger.com/',
      'work-fes-challenger',
    ),
    false,
  );
});

test('isSafeCaseStudyExternalUrl rejects a wrong or unrelated host', () => {
  assert.equal(
    isSafeCaseStudyExternalUrl(
      'https://evil.example.com/',
      'work-fes-challenger',
    ),
    false,
  );
});

test('isSafeCaseStudyExternalUrl rejects any URL for an unregistered content key', () => {
  assert.equal(
    isSafeCaseStudyExternalUrl(
      'https://feschallenger.com/',
      'work-future-project',
    ),
    false,
  );
});

test('isSafeCaseStudyExternalUrl rejects malformed and non-string input', () => {
  assert.equal(
    isSafeCaseStudyExternalUrl('not a url', 'work-fes-challenger'),
    false,
  );
  assert.equal(isSafeCaseStudyExternalUrl(null, 'work-fes-challenger'), false);
});
