import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderFooter } from '../src/components/partials/footer.js';
import { renderHeader } from '../src/components/partials/header.js';
import { primaryNav } from '../src/config/navigation.js';
import { site as realSite } from '../src/config/site.js';

const nullSite = {
  siteName: 'Antonio Abrenica',
  social: { github: null, linkedin: null, facebook: null },
  contactEmail: null,
};

const fullSite = {
  siteName: 'Antonio Abrenica',
  social: {
    github: 'https://github.com/aaa',
    linkedin: 'https://www.linkedin.com/in/aaa',
    facebook: 'https://www.facebook.com/aaa/',
  },
  contactEmail: 'hello@aaabrenica.site',
};

function render(site = realSite) {
  return renderFooter(primaryNav, site, { year: 2026 });
}

test('footer emits copyright first and the social list second inside the shared container', () => {
  const html = render();
  assert.match(
    html,
    /^<footer><div class="container site-footer__inner"><p class="site-footer__meta">© 2026 Antonio Abrenica\. All rights reserved\.<\/p><ul class="site-footer__links">[\s\S]*?<\/ul><\/div><\/footer>$/,
  );
  assert.ok(
    html.indexOf('site-footer__meta') < html.indexOf('site-footer__links'),
  );
  assert.equal([...html.matchAll(/site-footer__meta"/g)].length, 1);
  assert.equal([...html.matchAll(/site-footer__links"/g)].length, 1);
});

test('footer emits no logo image, brand link, brand wrapper, or hidden brand content', () => {
  const html = render();
  assert.doesNotMatch(
    html,
    /<img\b|site-footer__brand|site-footer__brand-mark/,
  );
  assert.doesNotMatch(html, /<a[^>]*href="\/"[^>]*>[^<]*Antonio Abrenica/);
  assert.doesNotMatch(html, /hidden[^>]*>[^<]*Antonio Abrenica/);
});

test('sticky-navbar brand lockup remains present exactly once', () => {
  const header = renderHeader(primaryNav, 'home', realSite);
  assert.equal([...header.matchAll(/class="site-header__brand"/g)].length, 1);
  assert.equal([...header.matchAll(/class="site-brand__mark"/g)].length, 1);
  assert.equal([...header.matchAll(/class="site-brand__text"/g)].length, 1);
  assert.match(
    header,
    /<span class="site-brand__text">Antonio Abrenica<\/span>/,
  );
});

test('footer headings, navigation, Quick Links, Connect, Contact, and Privacy remain absent', () => {
  const html = render();
  assert.doesNotMatch(
    html,
    /<h[1-6]\b|<nav\b|Quick Links|>Connect<|>Contact<|site-footer__nav|aria-label="Footer"|site-footer__heading|site-footer__columns|site-footer__bottom|site-footer__privacy|href="\/privacy\/"/,
  );
  for (const { label, path } of primaryNav) {
    assert.doesNotMatch(html, new RegExp(`href="${path}"[^>]*>${label}<`));
  }
});

test('social links render in exact Email, GitHub, LinkedIn, Facebook order', () => {
  const html = render();
  const links = [
    ...html.matchAll(
      /<a class="site-footer__connect-link" href="([^"]+)" aria-label="([^"]+)"[^>]*>/g,
    ),
  ];
  assert.deepEqual(
    links.map((match) => [match[2], match[1]]),
    [
      ['Email', `mailto:${realSite.contactEmail}`],
      ['GitHub', realSite.social.github],
      ['LinkedIn', realSite.social.linkedin],
      ['Facebook', 'https://www.facebook.com/Junnabrenica/'],
    ],
  );
});

test('all destinations and external security attributes remain unchanged', () => {
  const html = render(fullSite);
  const email = html.match(/<a[^>]*aria-label="Email"[^>]*>/)?.[0];
  assert.ok(email);
  assert.match(email, /href="mailto:hello@aaabrenica\.site"/);
  assert.doesNotMatch(email, /target=|rel=/);

  for (const label of ['GitHub', 'LinkedIn', 'Facebook']) {
    const anchor = html.match(
      new RegExp(`<a[^>]*aria-label="${label}"[^>]*>`),
    )?.[0];
    assert.ok(anchor, `expected ${label} anchor`);
    assert.match(anchor, /href="https:\/\//);
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
  }
});

test('each icon link has one anchor name and one decorative, unfocusable SVG', () => {
  const html = render();
  const links = [
    ...html.matchAll(
      /<a class="site-footer__connect-link"[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
    ),
  ];
  assert.equal(links.length, 4);
  for (const [, label, inner] of links) {
    assert.ok(label.length > 0);
    assert.equal([...inner.matchAll(/<svg /g)].length, 1);
    assert.match(inner, /aria-hidden="true"/);
    assert.match(inner, /focusable="false"/);
    assert.doesNotMatch(
      inner,
      /aria-label=|<title>|>Email<|>GitHub<|>LinkedIn<|>Facebook</,
    );
  }
});

test('official brand-icon renderers remain intact, including pinned Facebook data', () => {
  const html = render();
  const facebook = html.match(
    /aria-label="Facebook"[^>]*>(<svg[\s\S]*?<\/svg>)<\/a>/,
  )?.[1];
  const email = html.match(
    /aria-label="Email"[^>]*>(<svg[\s\S]*?<\/svg>)<\/a>/,
  )?.[1];
  assert.ok(facebook);
  assert.match(facebook, /fill="currentColor"/);
  assert.match(facebook, /<path d="M9\.101 23\.691v-7\.98H6\.627/);
  assert.doesNotMatch(facebook, /stroke=/);
  assert.ok(email);
  assert.match(email, /stroke="currentColor"/);
  assert.match(email, /fill="none"/);
});

test('unsafe or missing contact values omit the social list without disturbing copyright', () => {
  const html = render({
    siteName: 'Antonio Abrenica',
    social: {
      github: 'https://evil.example.com',
      linkedin: 'http://linkedin.com/in/aaa',
      facebook: 'https://example.com/aaa',
    },
    contactEmail: 'not-an-email',
  });
  assert.doesNotMatch(
    html,
    /site-footer__links|site-footer__connect-link|<li>/,
  );
  assert.match(html, /<p class="site-footer__meta">© 2026 Antonio Abrenica/);
});

test('copyright appears exactly once and Privacy remains absent', () => {
  const html = renderFooter(primaryNav, nullSite, { year: 2031 });
  assert.equal([...html.matchAll(/© 2031 Antonio Abrenica/g)].length, 1);
  assert.doesNotMatch(html, /Privacy|href="\/privacy\/"/);
});

test('default copyright year uses the current year', () => {
  const html = renderFooter(primaryNav, nullSite);
  assert.match(html, new RegExp(`© ${new Date().getFullYear()} `));
});
