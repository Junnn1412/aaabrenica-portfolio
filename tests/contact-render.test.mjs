// PF-054 — end-to-end structural assertions against the real 'contact'
// route's rendered output, mirroring tests/work-render.test.mjs's style.
// Every "how many contact methods" assertion is scoped to the rendered
// <main> region specifically, not the full composed page — the shared
// footer independently and correctly renders the same three links
// (checked separately by scripts/verify-build-output.mjs and
// tests/footer.test.mjs), so a whole-document count would be wrong here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { renderContactPage } from '../src/pages/templates/contact.js';
import { routes } from '../src/config/routes.js';
import { site } from '../src/config/site.js';
import { primaryNav } from '../src/config/navigation.js';
import contactContent from '../src/content/pages/contact.js';

function contactMain() {
  const route = routes.find((r) => r.key === 'contact');
  return renderRoute(route).main;
}

test('contact: exactly one <h1>', () => {
  const main = contactMain();
  assert.equal([...main.matchAll(/<h1[ >]/g)].length, 1);
});

test('contact: form is disabled by default while all direct methods remain rendered', () => {
  const main = contactMain();
  assert.equal(site.contactForm.enabled, false);
  assert.doesNotMatch(main, /data-contact-form/);
  assert.doesNotMatch(main, /Tell Me About Your Project/);
  assert.match(main, new RegExp(`mailto:${site.contactEmail}`));
  assert.match(main, new RegExp(site.social.github.replaceAll('.', '\\.')));
  assert.match(main, new RegExp(site.social.linkedin.replaceAll('.', '\\.')));
});

test('contact: explicit source enablement renders the progressive form after direct methods', () => {
  const { main } = renderContactPage({
    content: contactContent,
    navItems: primaryNav,
    activeKey: 'contact',
    site: { ...site, contactForm: { ...site.contactForm, enabled: true } },
  });
  assert.match(main, /data-contact-form/);
});

test('contact: exactly one <h2 class="contact-methods__heading"> and exactly 3 .contact-methods__item entries', () => {
  const main = contactMain();
  const h2s = [...main.matchAll(/<h2 class="contact-methods__heading">/g)];
  assert.equal(h2s.length, 1);
  const items = [
    ...main.matchAll(/<li class="contact-methods__item">[\s\S]*?<\/li>/g),
  ];
  assert.equal(items.length, 3);
});

test('contact: the three real hrefs match the real configured site values, imported not hardcoded', () => {
  const main = contactMain();
  assert.match(
    main,
    new RegExp(
      `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    ),
  );
  assert.match(
    main,
    new RegExp(
      `<a href="${site.social.github}">GitHub</a>`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    ),
  );
  assert.match(
    main,
    new RegExp(
      `<a href="${site.social.linkedin}">LinkedIn</a>`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    ),
  );
});

test('contact: every href in main is a safe internal path or an https external link', () => {
  const main = contactMain();
  const hrefs = [...main.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 0);
  for (const href of hrefs) {
    const isSafeInternal = href.startsWith('/') && !href.startsWith('//');
    const isSafeExternal = href.startsWith('https://');
    const isSafeMailto = href.startsWith(`mailto:${site.contactEmail}`);
    assert.ok(
      isSafeInternal || isSafeExternal || isSafeMailto,
      `unsafe href found: "${href}"`,
    );
  }
});

test('renderContactPage omits an unsafe email or external URL entirely, not merely escaped', () => {
  const hostileSite = {
    siteName: 'Antonio Abrenica',
    contactEmail: 'not-an-email',
    social: {
      github: 'https://evil.example.com',
      linkedin: 'http://linkedin.com/in/aaa', // not HTTPS
    },
    resumePath: null,
  };
  const { main } = renderContactPage({
    content: {
      title: 'Contact',
      heading: 'Contact',
      paragraphs: ['Reach out.'],
    },
    navItems: primaryNav,
    activeKey: 'contact',
    site: hostileSite,
  });
  assert.doesNotMatch(main, /mailto:/);
  assert.doesNotMatch(main, /evil\.example\.com/);
  assert.doesNotMatch(main, /linkedin\.com/);
  assert.doesNotMatch(main, /contact-methods__item/);
  assert.doesNotMatch(main, /contact-methods__heading/);
});

test('renderContactPage escapes hostile content fields', () => {
  const hostileContent = {
    title: 'Contact',
    heading: '<b>Bold</b> & Heading',
    paragraphs: ['P & <script>alert(1)</script>'],
  };
  const { main } = renderContactPage({
    content: hostileContent,
    navItems: primaryNav,
    activeKey: 'contact',
    site,
  });
  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /P &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
