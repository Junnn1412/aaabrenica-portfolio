// About profile-card task — dedicated renderer tests, mirroring
// tests/standard-render.test.mjs's fixture style, plus real-content
// assertions against the actual production about.js module (the pattern
// every other real page's own -render test file already follows).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAboutPage } from '../src/pages/templates/about.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import aboutContent from '../src/content/pages/about.js';

function baseContent(overrides = {}) {
  return {
    title: 'Title',
    heading: 'About',
    paragraphs: ['First paragraph.', 'Second paragraph.'],
    ...overrides,
  };
}

function render(content) {
  return renderAboutPage({
    content,
    navItems: primaryNav,
    activeKey: 'about',
    site,
  });
}

const fixtureCard = {
  name: 'Test Name',
  role: 'Test Role',
  statement: 'Test statement.',
  highlights: ['Highlight one', 'Highlight two', 'Highlight three'],
  cta: { label: 'Talk to me', path: '/contact/' },
  portrait: {
    src: '/images/profile/test.jpg',
    alt: 'Portrait of Test Name',
    width: 800,
    height: 1000,
  },
};

// --- Structural fixture tests ---

test('renders exactly one <h1>, biography paragraphs, inside one page container', () => {
  const { main } = render(baseContent());
  assert.equal([...main.matchAll(/<h1[ >]/g)].length, 1);
  assert.match(main, /<h1>About<\/h1>/);
  assert.match(main, /<p>First paragraph\.<\/p><p>Second paragraph\.<\/p>/);
  assert.match(main, /^<div class="container">/);
});

test('without profileCard, .about-layout has no --with-card modifier and no card markup renders (regression guard matching the prior standard.js behavior)', () => {
  const { main } = render(baseContent());
  assert.match(main, /<div class="about-layout">/);
  assert.doesNotMatch(main, /about-layout--with-card/);
  assert.doesNotMatch(main, /about-card/);
});

test('with profileCard present, .about-layout gets the --with-card modifier and the card renders after the biography content, in DOM order', () => {
  const { main } = render(baseContent({ profileCard: fixtureCard }));
  assert.match(main, /<div class="about-layout about-layout--with-card">/);
  const contentIndex = main.indexOf('about-layout__content');
  const cardIndex = main.indexOf('about-card');
  assert.ok(
    contentIndex < cardIndex,
    'expected the biography content to precede the card in source order',
  );
});

test('the profile card renders name, role, statement, exactly 3 highlights, and one CTA', () => {
  const { main } = render(baseContent({ profileCard: fixtureCard }));
  assert.match(main, /<p class="about-card__name">Test Name<\/p>/);
  assert.match(main, /<p class="about-card__role">Test Role<\/p>/);
  assert.match(main, /<p class="about-card__statement">Test statement\.<\/p>/);
  const highlightItems = main.match(
    /<ul class="about-card__highlights">([\s\S]*?)<\/ul>/,
  )[1];
  assert.equal([...highlightItems.matchAll(/<li>/g)].length, 3);
  assert.match(highlightItems, /<li>Highlight one<\/li>/);
  assert.match(highlightItems, /<li>Highlight two<\/li>/);
  assert.match(highlightItems, /<li>Highlight three<\/li>/);
  assert.match(
    main,
    /<a class="btn btn--primary about-card__cta" href="\/contact\/">Talk to me<\/a>/,
  );
});

test('the portrait renders inside .media-frame.media-frame--portrait with the real configured src/alt/width/height', () => {
  const { main } = render(baseContent({ profileCard: fixtureCard }));
  assert.match(
    main,
    /<span class="media-frame media-frame--portrait"><img src="\/images\/profile\/test\.jpg" alt="Portrait of Test Name" width="800" height="1000"><\/span>/,
  );
});

test('no social icons (mailto/GitHub/LinkedIn) appear inside the card — those already live in the footer and Contact page', () => {
  const { main } = render(baseContent({ profileCard: fixtureCard }));
  const cardMatch = main.match(
    /<div class="about-card">[\s\S]*?<\/div><\/div>/,
  );
  assert.ok(cardMatch, 'expected an .about-card region');
  assert.doesNotMatch(cardMatch[0], /mailto:/);
  assert.doesNotMatch(cardMatch[0], /github\.com/);
  assert.doesNotMatch(cardMatch[0], /linkedin\.com/);
});

test('no résumé link appears anywhere on the page', () => {
  const { main } = render(baseContent({ profileCard: fixtureCard }));
  assert.doesNotMatch(main, /[Rr]ésumé/);
});

test("the card's own name/role text does not introduce a second heading — no <h1>-<h6> tag appears anywhere inside the card region", () => {
  const { main } = render(baseContent({ profileCard: fixtureCard }));
  const cardMatch = main.match(
    /<div class="about-card">[\s\S]*?<\/div><\/div>/,
  );
  assert.ok(cardMatch, 'expected an .about-card region');
  assert.doesNotMatch(cardMatch[0], /<h[1-6][ >]/);
});

test('the existing closing CTA renders exactly as standard.js already proved, unmodified by the card', () => {
  const { main } = render(
    baseContent({
      cta: {
        heading: 'Talk it through?',
        body: 'Share the details.',
        action: { label: 'Contact', path: '/contact/' },
      },
    }),
  );
  assert.match(main, /<h2 class="cta__heading">Talk it through\?<\/h2>/);
  assert.match(main, /<p class="cta__body">Share the details\.<\/p>/);
  assert.match(
    main,
    /<a class="btn btn--primary" href="\/contact\/">Contact<\/a>/,
  );
});

test('escapes every hostile string field, including every profileCard field', () => {
  const hostileContent = {
    title: 'T',
    heading: '<b>Bold</b> Heading',
    paragraphs: ['P & <script>alert(1)</script>'],
    profileCard: {
      name: 'N & <b>ame</b>',
      role: 'R & <b>ole</b>',
      statement: 'S & <b>tatement</b>',
      highlights: ['H1 & <b>one</b>', 'H2', 'H3'],
      cta: { label: 'Go & <b>now</b>', path: '/contact/' },
      portrait: {
        src: '/images/profile/"><script>alert(1)</script>.jpg',
        alt: 'Alt & <b>text</b>',
        width: 10,
        height: 10,
      },
    },
  };
  const { main } = render(hostileContent);
  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; Heading/);
  assert.match(main, /P &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(main, /N &amp; &lt;b&gt;ame&lt;\/b&gt;/);
  assert.match(main, /R &amp; &lt;b&gt;ole&lt;\/b&gt;/);
  assert.match(main, /S &amp; &lt;b&gt;tatement&lt;\/b&gt;/);
  assert.match(main, /H1 &amp; &lt;b&gt;one&lt;\/b&gt;/);
  assert.match(main, /Go &amp; &lt;b&gt;now&lt;\/b&gt;/);
  assert.doesNotMatch(main, /"><script>/);
  assert.match(main, /Alt &amp; &lt;b&gt;text&lt;\/b&gt;/);
});

// --- Real production content ---

test('the real production about.js content renders the exact AAA-approved card copy', () => {
  const { main } = render(aboutContent);
  assert.match(main, /<p class="about-card__name">AAA<\/p>/);
  assert.match(
    main,
    /<p class="about-card__role">Full-Stack Software Developer<\/p>/,
  );
  assert.match(
    main,
    /<p class="about-card__statement">About AAA, an independent full-stack software developer with about five years of professional experience\.<\/p>/,
  );
  assert.match(
    main,
    /<li>About five years of professional software-development experience<\/li>/,
  );
  assert.match(
    main,
    /<li>Frontend, backend, database, and deployment capability<\/li>/,
  );
  assert.match(
    main,
    /<li>Direct involvement from planning through launch and agreed post-launch support<\/li>/,
  );
  assert.doesNotMatch(
    main,
    /Direct, end-to-end involvement on every project/,
    'the rejected "every project" phrasing must never appear',
  );
  assert.match(
    main,
    /<a class="btn btn--primary about-card__cta" href="\/contact\/">Let&#39;s Discuss Your Project<\/a>/,
  );
});

test('the real production portrait renders with the real inspected dimensions and the approved alt text', () => {
  const { main } = render(aboutContent);
  assert.match(
    main,
    /<img src="\/images\/profile\/aaa-portrait\.jpg" alt="Portrait of AAA" width="1665" height="1464">/,
  );
});

test('the real production About page still contains its pre-existing approved biography paragraphs, unmodified', () => {
  const { main } = render(aboutContent);
  for (const paragraph of aboutContent.paragraphs) {
    assert.ok(
      main.includes(
        `<p>${paragraph
          .replace(/&/g, '&amp;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</p>`,
      ),
      `expected the existing approved paragraph to render unmodified: ${paragraph.slice(0, 40)}...`,
    );
  }
});
