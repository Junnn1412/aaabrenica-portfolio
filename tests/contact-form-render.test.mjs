import { test } from 'node:test';
import assert from 'node:assert/strict';
import contact from '../src/content/pages/contact.js';
import { site } from '../src/config/site.js';
import { renderContactForm } from '../src/components/contact-form.js';

function markup() {
  return renderContactForm({
    content: contact.form,
    action: site.contactForm.action,
    contactEmail: site.contactEmail,
  });
}

test('contact form renders the exact approved heading, labels, help, and button copy', () => {
  const html = markup();
  assert.match(html, />Tell Me About Your Project<\/h2>/);
  assert.match(html, />Name \(required\)<\/label>/);
  assert.match(html, />Email \(required\)<\/label>/);
  assert.match(html, />Company or organization \(optional\)<\/label>/);
  assert.match(html, />Message \/ project needs \(required\)<\/label>/);
  assert.match(
    html,
    /Please do not include passwords, access credentials, or other sensitive information\./,
  );
  assert.match(html, />Send Message<\/button>/);
  assert.doesNotMatch(html, /Project type|privacy checkbox|type="checkbox"/i);
});

test('contact form keeps native constraints and stable help/error associations', () => {
  const html = markup();
  assert.match(
    html,
    /id="contact-name"[^>]*maxlength="100"[^>]* required[^>]*aria-describedby="contact-name-error"/,
  );
  assert.match(
    html,
    /id="contact-email"[^>]*type="email"[^>]*maxlength="254"[^>]* required/,
  );
  assert.match(html, /id="contact-company"[^>]*maxlength="150"/);
  assert.match(
    html,
    /id="contact-message"[^>]*maxlength="5000" required aria-describedby="contact-message-help contact-message-error"/,
  );
  assert.match(html, /data-contact-form-summary role="alert" tabindex="-1"/);
  assert.match(html, /data-contact-form-success role="status" tabindex="-1"/);
  assert.match(
    html,
    /data-contact-form-status role="status" aria-live="polite"/,
  );
});

test('contact form has one non-focusable honeypot and a normal no-JavaScript POST action', () => {
  const html = markup();
  assert.match(html, /<form[^>]*method="post" action="\/api\/contact"[^>]*>/);
  assert.match(
    html,
    /name="website" type="text" tabindex="-1" autocomplete="off"/,
  );
});
