import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { site } from '../src/config/site.js';
import contactContent from '../src/content/pages/contact.js';
import { primaryNav } from '../src/config/navigation.js';
import { renderContactPage } from '../src/pages/templates/contact.js';
import { handleContactRequest } from '../functions/api/contact.js';

const submission = {
  name: 'AAA',
  email: 'visitor@example.net',
  company: '',
  message: 'Project needs',
  website: '',
};
const completeRuntime = {
  CONTACT_FORM_ENABLED: 'true',
  RESEND_API_KEY: 'test-api-key',
  CONTACT_FROM_EMAIL: 'portfolio@example.com',
  CONTACT_TO_EMAIL: 'owner@example.com',
};

function renderWithSourceGate(enabled) {
  return renderContactPage({
    content: contactContent,
    navItems: primaryNav,
    activeKey: 'contact',
    site: { ...site, contactForm: { ...site.contactForm, enabled } },
  }).main;
}

function request() {
  return new Request('https://portfolio.example/api/contact', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://portfolio.example',
    },
    body: JSON.stringify(submission),
  });
}

test('source gate false omits form markup and leaves explicit client initialization guarded', async () => {
  assert.equal(site.contactForm.enabled, false);
  assert.doesNotMatch(renderWithSourceGate(false), /data-contact-form/);
  const initializer = await readFile(
    new URL('../src/scripts/contact-form.js', import.meta.url),
    'utf8',
  );
  assert.match(initializer, /if \(form\) \{[\s\S]*enhanceContactForm/);
});

test('source gate true renders form markup but does not alter runtime configuration', () => {
  assert.match(renderWithSourceGate(true), /data-contact-form/);
  assert.equal(site.contactForm.enabled, false);
});

test('runtime gate missing cannot call the adapter even if source markup could be enabled', async () => {
  let providerCalls = 0;
  assert.match(renderWithSourceGate(true), /data-contact-form/);
  const response = await handleContactRequest(
    request(),
    {},
    {
      deliver: async () => {
        providerCalls += 1;
        return { ok: true, status: 200 };
      },
      logger: { warn() {}, info() {} },
    },
  );
  assert.equal(response.status, 503);
  assert.equal(providerCalls, 0);
});

test('both gates intentionally enabled with complete configuration may reach the adapter', async () => {
  let providerCalls = 0;
  assert.match(renderWithSourceGate(true), /data-contact-form/);
  const response = await handleContactRequest(request(), completeRuntime, {
    deliver: async () => {
      providerCalls += 1;
      return { ok: true, status: 200 };
    },
    logger: { warn() {}, info() {} },
  });
  assert.equal(response.status, 200);
  assert.equal(providerCalls, 1);
  assert.equal(site.contactForm.enabled, false);
});

test('operations stay incomplete until public Privacy access and approved copy are coordinated with both gates', async () => {
  const operations = await readFile(
    new URL('../docs/CONTACT_FORM_OPERATIONS.md', import.meta.url),
    'utf8',
  );
  assert.match(
    operations,
    /Implemented and disabled; not yet operationally enabled/,
  );
  assert.match(
    operations,
    /Neither `site\.contactForm\.enabled` nor `CONTACT_FORM_ENABLED` may\s+be enabled until a clearly discoverable Privacy link is restored to the public\s+interface and the approved Contact Privacy copy is published\./,
  );
  assert.match(
    operations,
    /Runtime\s+configuration cannot waive or override this prerequisite\. PF-072 owns the final\s+coordinated Privacy\/Contact deployment gate\./,
  );
  assert.match(
    operations,
    /Publish the approved Privacy replacement, restore a clearly discoverable\s+public Privacy link, and set `site\.contactForm\.enabled` to `true` in the same\s+approved release\./,
  );
});
