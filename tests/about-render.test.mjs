import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAboutPage } from '../src/pages/templates/about.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import aboutContent from '../src/content/pages/about.js';
import { escapeHtml } from '../src/pages/escape.js';

const APPROVED_PARAGRAPHS = [
  'Since 2020, I’ve been designing and building software—from the interface someone actually clicks through, down to the backend logic, the database that stores everything, and the deployment that gets it live. I work as an independent developer, which means I’m the one person across the whole project, not one specialist in a rotating cast.',
  'I start with the problem you’re trying to solve, not a specific technology or framework. My focus stays on what actually moves your business forward, and I stay directly involved from planning through launch and any agreed post-launch support, so you’re always working with the person who built it.',
];

const APPROVED_STACK = {
  heading: 'Core Technologies',
  groups: [
    {
      heading: 'Frontend',
      items: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'SCSS/CSS'],
    },
    {
      heading: 'Backend',
      items: ['ASP.NET Core', 'C#', 'REST APIs'],
    },
    { heading: 'Data', items: ['Microsoft SQL Server', 'Dapper'] },
    {
      heading: 'CMS & Delivery',
      items: ['WordPress', 'PHP', 'Git', 'GitHub Actions'],
    },
  ],
};

const APPROVED_STATEMENT =
  'I build practical websites, internal systems, and workflow solutions.';
const APPROVED_HIGHLIGHTS = [
  'Problem-first planning shaped around business needs',
  'Direct involvement from implementation through launch',
  'Post-launch support when included in the agreed project scope',
];

function render(content = aboutContent) {
  return renderAboutPage({
    content,
    navItems: primaryNav,
    activeKey: 'about',
    site,
  });
}

function fullCardRegion(main) {
  const match = main.match(
    /<div class="profile-card profile-card--full"[^>]*>[\s\S]*?<\/div><\/div>/,
  );
  assert.ok(match, 'expected the full profile-card region');
  return match[0];
}

function stackRegion(main) {
  const match = main.match(/<section class="about-stack"[\s\S]*?<\/section>/);
  assert.ok(match, 'expected the Core Technologies section');
  return match[0];
}

test('renders the exact approved biography, stack, card, Experience, and CTA in natural DOM order', () => {
  const { main } = render();
  assert.match(main, /^<div class="container about-page">/);
  assert.deepEqual(aboutContent.paragraphs, APPROVED_PARAGRAPHS);
  for (const paragraph of APPROVED_PARAGRAPHS) {
    assert.ok(main.includes(escapeHtml(paragraph)));
  }

  const biographyEnd = main.indexOf(escapeHtml(APPROVED_PARAGRAPHS[1]));
  const stackStart = main.indexOf('<section class="about-stack"');
  const cardStart = main.indexOf('profile-card profile-card--full');
  const experienceStart = main.indexOf('<section class="about-experience"');
  const ctaStart = main.indexOf('<div class="cta"');
  assert.ok(biographyEnd < stackStart);
  assert.ok(stackStart < cardStart);
  assert.ok(cardStart < experienceStart);
  assert.ok(experienceStart < ctaStart);
  assert.match(
    main,
    /<\/div><\/div><\/div><section class="about-experience"/,
    'Experience must follow the closed biography/profile-card layout',
  );
  assert.match(
    main,
    /<\/ol><\/div><\/section><div class="cta"/,
    'the closing CTA must remain a separate sibling after Experience',
  );
});

test('renders the exact approved stack groups and technologies in order with no extras or duplicates', () => {
  assert.deepEqual(aboutContent.technologyStack, APPROVED_STACK);
  assert.equal(aboutContent.technologyStack.groups.length, 4);

  const technologies = aboutContent.technologyStack.groups.flatMap(
    (group) => group.items,
  );
  assert.equal(technologies.length, 14);
  assert.equal(new Set(technologies).size, technologies.length);

  const stack = stackRegion(render().main);
  const renderedHeadings = [...stack.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(
    (match) => match[1],
  );
  const renderedTechnologies = [
    ...stack.matchAll(
      /<li class="about-stack__tag-item"><span class="tag">(.*?)<\/span><\/li>/g,
    ),
  ].map((match) => match[1]);
  assert.deepEqual(
    renderedHeadings,
    APPROVED_STACK.groups.map((group) => escapeHtml(group.heading)),
  );
  assert.deepEqual(renderedTechnologies, technologies.map(escapeHtml));
});

test('stack and card contain no unapproved technologies or proficiency-style claims', () => {
  const content = `${JSON.stringify(aboutContent.technologyStack)} ${JSON.stringify(aboutContent.profileCard)}`;
  assert.doesNotMatch(
    content,
    /React|Next\.js|Node\.js|Docker|Azure|AWS|certif|rating|proficien|percent|\b\d+\s*years?\b/i,
  );
});

test('full card renders approved identity, statement, and exactly three highlights with no action', () => {
  const card = fullCardRegion(render().main);
  assert.match(
    card,
    /<p class="profile-card__name">Antonio A\. Abrenica III<\/p>/,
  );
  assert.match(
    card,
    /<p class="profile-card__role">Full-Stack Software Developer<\/p>/,
  );
  assert.equal(aboutContent.profileCard.statement, APPROVED_STATEMENT);
  assert.deepEqual(aboutContent.profileCard.highlights, APPROVED_HIGHLIGHTS);
  assert.match(card, new RegExp(escapeHtml(APPROVED_STATEMENT)));
  assert.equal([...card.matchAll(/<li>/g)].length, 3);
  for (const highlight of APPROVED_HIGHLIGHTS) {
    assert.match(card, new RegExp(`<li>${escapeHtml(highlight)}<\\/li>`));
  }
  assert.doesNotMatch(card, /about five years/i);
  assert.doesNotMatch(card, /profile-card__action/);
  assert.doesNotMatch(card, /href=/);
});

test('fixed experience duration is absent while Since 2020 appears exactly once in the biography', () => {
  const { main } = render();
  assert.doesNotMatch(main, /about five years/i);
  assert.doesNotMatch(JSON.stringify(aboutContent), /about five years/i);
  assert.doesNotMatch(fullCardRegion(main), /about five years/i);
  assert.equal([...APPROVED_PARAGRAPHS[0].matchAll(/Since 2020/g)].length, 1);
  assert.doesNotMatch(APPROVED_PARAGRAPHS[1], /Since 2020/);
  assert.equal([...main.matchAll(/Since 2020/g)].length, 1);
});

test('About heading hierarchy includes stack groups, Experience roles, and closing CTA in order', () => {
  const { main } = render();
  const headings = [...main.matchAll(/<(h[1-3])[^>]*>(.*?)<\/\1>/g)].map(
    ([, level, text]) => [level, text],
  );
  assert.deepEqual(headings, [
    ['h1', 'About'],
    ['h2', 'Core Technologies'],
    ['h3', 'Frontend'],
    ['h3', 'Backend'],
    ['h3', 'Data'],
    ['h3', 'CMS &amp; Delivery'],
    ['h2', 'Experience'],
    ['h3', 'Computer Programmer II'],
    ['h3', 'Analyst Programmer'],
    ['h3', 'Computer Programmer'],
    ['h3', 'IT Support Specialist'],
    ['h2', 'Have a project you want to talk through?'],
  ]);
});

test('technology tags are static and introduce no links, controls, social destinations, or résumé copy', () => {
  const stack = stackRegion(render().main);
  assert.equal([...stack.matchAll(/class="tag"/g)].length, 14);
  assert.doesNotMatch(
    stack,
    /<(?:a|button|input|select|textarea)\b|href=|mailto:|github\.com|linkedin\.com|[Rr]ésumé/,
  );
  assert.doesNotMatch(stack, /logo|icon|rating|proficien|percent|year/i);
});

test('About main contains exactly one Contact CTA and it is the unchanged page-level closing CTA', () => {
  const { main } = render();
  assert.equal([...main.matchAll(/href="\/contact\/"/g)].length, 1);
  assert.match(
    main,
    /<div class="cta"[^>]*><h2 class="cta__heading">Have a project you want to talk through\?<\/h2><p class="cta__body">Share what you&#39;re working on, and we can figure out a practical next step together\.<\/p><a class="btn btn--primary" href="\/contact\/">Let&#39;s Discuss Your Project<\/a><\/div>/,
  );
});

test('full portrait preserves the approved path, alt, and intrinsic dimensions without lazy loading', () => {
  const card = fullCardRegion(render().main);
  const image = card.match(/<img[^>]+>/)?.[0];
  assert.ok(image, 'expected a portrait image');
  assert.match(
    card,
    /<span class="media-frame media-frame--portrait"><img[^>]+><\/span>/,
  );
  assert.match(image, /src="\/images\/profile\/aaa-portrait\.jpg"/);
  assert.match(image, /alt="Portrait of Antonio A\. Abrenica III"/);
  assert.match(image, /width="1665"/);
  assert.match(image, /height="1464"/);
  assert.doesNotMatch(image, /loading=/);
});

test('the profile card introduces no heading, social link, or résumé link', () => {
  const card = fullCardRegion(render().main);
  assert.doesNotMatch(card, /<h[1-6][ >]/);
  assert.doesNotMatch(card, /mailto:|github\.com|linkedin\.com|[Rr]ésumé/);
});

test('the dedicated About template escapes hostile biography and technology strings', () => {
  const hostileContent = {
    ...aboutContent,
    heading: '<script>heading</script>',
    paragraphs: ['Biography & <script>paragraph</script>'],
    technologyStack: {
      heading: '<script>stack</script>',
      groups: [
        {
          heading: '<img src=x onerror=alert(1)>',
          items: ['Angular & <script>item</script>'],
        },
      ],
    },
  };
  const { main } = render(hostileContent);
  assert.doesNotMatch(main, /<script>/);
  assert.match(main, /&lt;script&gt;heading&lt;\/script&gt;/);
  assert.match(main, /Biography &amp; &lt;script&gt;paragraph&lt;\/script&gt;/);
  assert.match(main, /&lt;script&gt;stack&lt;\/script&gt;/);
  assert.match(main, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(main, /Angular &amp; &lt;script&gt;item&lt;\/script&gt;/);
});
