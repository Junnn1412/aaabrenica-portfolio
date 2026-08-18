import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderFooter } from '../src/components/partials/footer.js';
import { primaryNav } from '../src/config/navigation.js';
import { site as realSite } from '../src/config/site.js';

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

const fullSite = {
  siteName: 'AAA Portfolio',
  resumePath: '/resume.pdf',
  social: {
    github: 'https://github.com/aaa',
    linkedin: 'https://www.linkedin.com/in/aaa',
  },
  contactEmail: 'hello@aaabrenica.site',
};

// --- Brand group ---

test('exactly one brand group: mark absent when site.brandMark is null, visible "AAA Portfolio" text present, no invented copy', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.equal([...html.matchAll(/site-footer__brand"/g)].length, 1);
  assert.doesNotMatch(html, /site-footer__brand-mark/);
  assert.match(
    html,
    /<span class="site-footer__brand-name">AAA Portfolio<\/span>/,
  );
});

test('brand mark renders decoratively (alt="") when site.brandMark is configured, using the real inspected dimensions — no accessible name on the image itself', () => {
  const site = {
    ...nullSite,
    brandMark: { src: '/x.png', width: 10, height: 20 },
  };
  const html = renderFooter(navItems, site, { year: 2026 });
  assert.match(
    html,
    /<img class="site-footer__brand-mark" src="\/x\.png" alt="" width="10" height="20">/,
  );
});

test('the real production site.brandMark renders in the footer brand group', () => {
  const html = renderFooter(navItems, realSite, { year: 2026 });
  assert.match(
    html,
    /<img class="site-footer__brand-mark" src="\/images\/brand\/aaa-placeholder-logo\.png" alt="" width="231" height="140">/,
  );
});

// --- Quick Links group ---

test('exactly one Quick Links group with a real <h2> heading and the injected navItems', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.match(
    html,
    /<nav class="site-footer__nav" aria-label="Footer"><h2 class="site-footer__heading">Quick Links<\/h2>/,
  );
  assert.equal(
    [...html.matchAll(/site-footer__heading">Quick Links/g)].length,
    1,
  );
  assert.match(html, /<a href="\/">Home<\/a>/);
  assert.match(html, /<a href="\/solutions\/">Solutions<\/a>/);
});

test('footer nav never emits aria-current — the footer is not route-aware', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.doesNotMatch(html, /aria-current/);
});

test('Quick Links contains exactly the real 6 primaryNav destinations, in order, and nothing else', () => {
  const html = renderFooter(primaryNav, realSite, { year: 2026 });
  const navMatch = html.match(/<nav class="site-footer__nav"[\s\S]*?<\/nav>/);
  assert.ok(navMatch, 'expected a .site-footer__nav region');
  const items = [
    ...navMatch[0].matchAll(/<li><a href="([^"]*)">([^<]*)<\/a><\/li>/g),
  ];
  assert.deepEqual(
    items.map((m) => m[2]),
    ['Home', 'Solutions', 'Process', 'Work', 'About', 'Contact'],
  );
  assert.deepEqual(
    items.map((m) => m[1]),
    primaryNav.map((n) => n.path),
  );
});

test('Privacy never appears inside Quick Links', () => {
  const html = renderFooter(primaryNav, realSite, { year: 2026 });
  const navMatch = html.match(/<nav class="site-footer__nav"[\s\S]*?<\/nav>/);
  assert.doesNotMatch(navMatch[0], /Privacy/);
});

// --- Connect group: icon-only Email/GitHub/LinkedIn ---

test('null contact/social/résumé fields render no Connect group at all — no empty wrapper, no placeholder', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /github\.com/);
  assert.doesNotMatch(html, /linkedin\.com/);
  assert.doesNotMatch(html, /Résumé/);
  assert.doesNotMatch(html, /site-footer__connect/);
  assert.doesNotMatch(html, /<li><\/li>/);
});

test('valid fixture contact data renders icon-only Email/GitHub/LinkedIn links with the correct hrefs and aria-labels, escaped', () => {
  const html = renderFooter(navItems, fullSite, { year: 2026 });
  assert.match(
    html,
    /<a class="site-footer__connect-link" href="mailto:hello@aaabrenica\.site" aria-label="Email">/,
  );
  assert.match(
    html,
    /<a class="site-footer__connect-link" href="https:\/\/github\.com\/aaa" aria-label="GitHub">/,
  );
  assert.match(
    html,
    /<a class="site-footer__connect-link" href="https:\/\/www\.linkedin\.com\/in\/aaa" aria-label="LinkedIn">/,
  );
});

test('invalid fixture contact data renders nothing for that field (safe-link filtering preserved)', () => {
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

test('the real configured site renders icon-only Email, GitHub, and LinkedIn links', () => {
  const html = renderFooter(navItems, realSite, { year: 2026 });
  assert.match(
    html,
    new RegExp(
      `<a class="site-footer__connect-link" href="mailto:${realSite.contactEmail}" aria-label="Email">`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    ),
  );
  assert.match(
    html,
    new RegExp(
      `<a class="site-footer__connect-link" href="${realSite.social.github}" aria-label="GitHub">`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    ),
  );
  assert.match(
    html,
    new RegExp(
      `<a class="site-footer__connect-link" href="${realSite.social.linkedin}" aria-label="LinkedIn">`.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    ),
  );
});

test('no visible "Email"/"GitHub"/"LinkedIn" text anywhere — the icon is the only visible content, decorative and aria-hidden', () => {
  const html = renderFooter(navItems, fullSite, { year: 2026 });
  assert.doesNotMatch(html, />Email</);
  assert.doesNotMatch(html, />GitHub</);
  assert.doesNotMatch(html, />LinkedIn</);
  const connectMatch = html.match(
    /<div class="site-footer__connect">[\s\S]*?<\/div>/,
  );
  assert.ok(connectMatch, 'expected a .site-footer__connect region');
  const svgCount = [...connectMatch[0].matchAll(/<svg /g)].length;
  const ariaHiddenCount = [...connectMatch[0].matchAll(/aria-hidden="true"/g)]
    .length;
  assert.equal(
    svgCount,
    ariaHiddenCount,
    'every icon svg in Connect must be aria-hidden',
  );
});

test('each Connect link has exactly one accessible name (aria-label on the anchor) and the icon never duplicates it', () => {
  const html = renderFooter(navItems, fullSite, { year: 2026 });
  const links = [
    ...html.matchAll(
      /<a class="site-footer__connect-link"[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
    ),
  ];
  assert.equal(links.length, 3, 'expected exactly 3 Connect links');
  for (const [, label, inner] of links) {
    assert.ok(label.length > 0, 'expected a non-empty aria-label');
    // The icon inside must be aria-hidden and must not itself carry an
    // aria-label/title that would create a second accessible name.
    assert.doesNotMatch(inner, /aria-label=/);
    assert.doesNotMatch(inner, /<title>/);
  }
});

test('GitHub and LinkedIn use the real Simple Icons brand-mark path data (fill="currentColor"), not Lucide stroke icons', () => {
  const html = renderFooter(navItems, fullSite, { year: 2026 });
  assert.match(html, /aria-label="GitHub">/);
  assert.match(html, /aria-label="LinkedIn">/);
  const githubIcon = html.match(
    /aria-label="GitHub">(<svg[\s\S]*?<\/svg>)<\/a>/,
  )[1];
  const linkedinIcon = html.match(
    /aria-label="LinkedIn">(<svg[\s\S]*?<\/svg>)<\/a>/,
  )[1];
  assert.match(githubIcon, /fill="currentColor"/);
  assert.match(githubIcon, /<path d="M12 \.297/);
  assert.match(linkedinIcon, /fill="currentColor"/);
  assert.match(linkedinIcon, /<path d="M20\.447 20\.452/);
});

test('Email uses the Lucide Mail icon (stroke-based), not a Simple Icons brand mark', () => {
  const html = renderFooter(navItems, fullSite, { year: 2026 });
  const emailIcon = html.match(
    /aria-label="Email">(<svg[\s\S]*?<\/svg>)<\/a>/,
  )[1];
  assert.match(emailIcon, /stroke="currentColor"/);
  assert.match(emailIcon, /fill="none"/);
});

test('résumé stays absent with no empty item/placeholder when resumePath is null (preserved existing behavior)', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.doesNotMatch(html, /Résumé/);
});

// --- Bottom row ---

test('privacy link and copyright are always present, in the bottom row', () => {
  const html = renderFooter(navItems, nullSite, { year: 2026 });
  assert.match(
    html,
    /<div class="site-footer__bottom">[\s\S]*<a href="\/privacy\/">Privacy<\/a>[\s\S]*<\/div>/,
  );
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
