import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderFooter } from '../src/components/partials/footer.js';

const navItems = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'solutions', label: 'Solutions', path: '/solutions/' },
];

const nullSite = {
  siteName: 'AAA Portfolio',
  resumePath: null,
  social: { github: null, linkedin: null },
  contactEmail: null,
};

test('renders footer navigation from the injected navItems fixture', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.match(html, /<a href="\/">Home<\/a>/);
  assert.match(html, /<a href="\/solutions\/">Solutions<\/a>/);
});

test('footer nav uses aria-label="Footer"', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.match(html, /<nav aria-label="Footer">/);
});

test('footer nav never emits aria-current', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.doesNotMatch(html, /aria-current/);
});

test('null contact/social/résumé fields render no markup and no blank wrapper', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /github\.com/);
  assert.doesNotMatch(html, /linkedin\.com/);
  assert.doesNotMatch(html, /Résumé/);
  assert.doesNotMatch(html, /<ul class="site-footer__links">/);
  assert.doesNotMatch(html, /<li><\/li>/);
});

test('valid fixture contact data renders each link, escaped', () => {
  const site = {
    siteName: 'AAA Portfolio',
    resumePath: '/resume.pdf',
    social: {
      github: 'https://github.com/aaa',
      linkedin: 'https://www.linkedin.com/in/aaa',
    },
    contactEmail: 'hello@aaabrenica.site',
  };
  const html = renderFooter(navItems, site, { year: 2026 });
  assert.match(html, /<a href="mailto:hello@aaabrenica\.site">Email<\/a>/);
  assert.match(html, /<a href="https:\/\/github\.com\/aaa">GitHub<\/a>/);
  assert.match(
    html,
    /<a href="https:\/\/www\.linkedin\.com\/in\/aaa">LinkedIn<\/a>/,
  );
  assert.match(html, /<a href="\/resume\.pdf">Résumé<\/a>/);
});

test('invalid fixture contact data renders nothing for that field', () => {
  const site = {
    siteName: 'AAA Portfolio',
    resumePath: 'resume.pdf', // missing leading slash — unsafe internal path
    social: {
      github: 'https://evil.example.com', // wrong host
      linkedin: 'http://linkedin.com/in/aaa', // not HTTPS
    },
    contactEmail: 'not-an-email',
  };
  const html = renderFooter(navItems, site, { year: 2026 });
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /evil\.example\.com/);
  assert.doesNotMatch(html, /linkedin\.com/);
  assert.doesNotMatch(html, /resume\.pdf/);
});

test('privacy link and copyright are always present', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.match(html, /<a href="\/privacy\/">Privacy<\/a>/);
  assert.match(html, /© 2026 AAA Portfolio\. All rights reserved\./);
});

test('the injected year is deterministic regardless of the real current date', () => {
  const html = renderFooter(navItems, nullSite, { year: 2031 });
  assert.match(html, /© 2031/);
});

test('with no options object, the real current year is used', () => {
  const html = renderFooter(navItems, nullSite);
  const year = new Date().getFullYear();
  assert.match(html, new RegExp(`© ${year} `));
});
