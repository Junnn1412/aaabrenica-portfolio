import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateContent,
  PROCESS_STAGE_NAMES,
} from '../src/pages/content-schema.js';

test('valid standard content produces no problems', () => {
  const route = { key: 'about', template: 'standard' };
  const content = {
    title: 'About',
    heading: 'About',
    paragraphs: ['Body copy.'],
  };
  assert.deepEqual(validateContent(route, content), []);
});

test('missing required fields are reported', () => {
  const route = { key: 'about', template: 'standard' };
  const problems = validateContent(route, {});
  assert.ok(problems.some((p) => p.includes('"title"')));
  assert.ok(problems.some((p) => p.includes('"heading"')));
  assert.ok(problems.some((p) => p.includes('"paragraphs"')));
});

test('wrong field types are reported', () => {
  const route = { key: 'about', template: 'standard' };
  const content = { title: 42, heading: 'About', paragraphs: ['ok'] };
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('"title"')));
});

test('optional description is validated only when present', () => {
  const route = { key: 'privacy', template: 'standard' };
  const withoutDescription = {
    title: 'Privacy',
    heading: 'Privacy',
    paragraphs: ['ok'],
  };
  assert.deepEqual(validateContent(route, withoutDescription), []);

  const withBadDescription = { ...withoutDescription, description: '' };
  assert.ok(validateContent(route, withBadDescription).length > 0);
});

test('listing template requires a non-empty links array of valid links', () => {
  const route = { key: 'work', template: 'listing' };
  const base = { title: 'Work', heading: 'Work', paragraphs: ['ok'] };

  assert.ok(validateContent(route, base).some((p) => p.includes('"links"')));

  const badLink = { ...base, links: [{ label: '', path: 'not-safe' }] };
  const problems = validateContent(route, badLink);
  assert.ok(problems.some((p) => p.includes('links[0].label')));
  assert.ok(problems.some((p) => p.includes('links[0].path')));

  const goodLink = {
    ...base,
    links: [{ label: 'FES Challenger', path: '/work/fes-challenger/' }],
  };
  assert.deepEqual(validateContent(route, goodLink), []);
});

// PF-041 — a minimal but complete valid 'home' content fixture, matching
// the shape src/content/pages/home.js uses for real.
function validHomeContent() {
  return {
    title: 'Home',
    description: 'Home description.',
    heading: 'Hero heading.',
    paragraphs: ['Hero supporting copy.'],
    hero: {
      primaryCta: { label: 'Discuss Your Project', path: '/contact/' },
      secondaryCta: { label: 'Explore My Work', path: '/work/' },
    },
    trust: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      items: [
        { icon: 'package-check', heading: 'One' },
        { icon: 'handshake', heading: 'Two' },
        { icon: 'workflow', heading: 'Three' },
      ],
      link: { label: 'Learn About My Approach', path: '/about/' },
    },
    problems: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      items: ['One', 'Two', 'Three', 'Four'],
      reassurance: 'Reassurance.',
      link: { label: 'Explore Solutions', path: '/solutions/' },
    },
    capabilities: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      items: [
        {
          accent: 'lime',
          icon: 'boxes',
          heading: 'One',
          description: 'D',
          link: '/solutions/',
        },
        {
          accent: 'amber',
          icon: 'workflow',
          heading: 'Two',
          description: 'D',
          link: '/solutions/',
        },
        {
          accent: 'cyan',
          icon: 'globe',
          heading: 'Three',
          description: 'D',
          link: '/solutions/',
        },
        {
          accent: 'violet',
          icon: 'code',
          heading: 'Four',
          description: 'D',
          link: '/solutions/',
        },
        {
          accent: 'coral',
          icon: 'refresh-cw',
          heading: 'Five',
          description: 'D',
          link: '/solutions/',
        },
        {
          accent: 'magenta',
          icon: 'life-buoy',
          heading: 'Six',
          description: 'D',
          link: '/solutions/',
        },
      ],
    },
    projects: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      items: [
        { featured: true, heading: 'One', link: '/work/fes-challenger/' },
        {
          category: 'Cat',
          heading: 'Two',
          link: '/work/business-workflow-system/',
        },
        { heading: 'Three', link: '/work/ebarangay/' },
      ],
      link: { label: 'Explore All Work', path: '/work/' },
    },
    process: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      steps: [
        { heading: 'One' },
        { heading: 'Two' },
        { heading: 'Three' },
        { heading: 'Four' },
      ],
      link: { label: 'See the Full Process', path: '/process/' },
    },
    engagement: {
      heading: 'Start with what creates the most value.',
      lede: 'Lede.',
      items: ['One', 'Two', 'Three', 'Four'],
    },
    about: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      paragraphs: ['Paragraph.'],
      link: { label: 'Read My Full Story', path: '/about/' },
    },
    cta: {
      heading: 'Heading',
      body: 'Body.',
      action: { label: "Let's Discuss Your Project", path: '/contact/' },
    },
  };
}

test('valid home content produces no problems', () => {
  const route = { key: 'home', template: 'home' };
  assert.deepEqual(validateContent(route, validHomeContent()), []);
});

test('home template reports every missing top-level section', () => {
  const route = { key: 'home', template: 'home' };
  const content = {
    title: 'Home',
    heading: 'Heading',
    paragraphs: ['P'],
  };
  const problems = validateContent(route, content);
  for (const field of [
    'hero',
    'trust',
    'problems',
    'capabilities',
    'projects',
    'process',
    'engagement',
    'about',
    'cta',
  ]) {
    assert.ok(
      problems.some((p) => p.includes(`"${field}"`)),
      `expected a problem mentioning "${field}"`,
    );
  }
});

test('home template enforces exact array lengths for every section', () => {
  const route = { key: 'home', template: 'home' };
  const content = validHomeContent();
  content.trust.items = content.trust.items.slice(0, 2); // 2 instead of 3
  content.capabilities.items = content.capabilities.items.slice(0, 5); // 5 instead of 6
  const problems = validateContent(route, content);
  assert.ok(
    problems.some((p) =>
      p.includes('"trust.items" must be an array of exactly 3'),
    ),
  );
  assert.ok(
    problems.some((p) =>
      p.includes('"capabilities.items" must be an array of exactly 6'),
    ),
  );
});

test('home template rejects an unknown trust icon key', () => {
  const route = { key: 'home', template: 'home' };
  const content = validHomeContent();
  content.trust.items[0].icon = 'not-a-real-icon';
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('trust.items[0].icon')));
});

test('home template rejects an unknown capability icon key and accent', () => {
  const route = { key: 'home', template: 'home' };
  const content = validHomeContent();
  content.capabilities.items[0].icon = 'not-a-real-icon';
  content.capabilities.items[1].accent = 'not-a-real-accent';
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('capabilities.items[0].icon')));
  assert.ok(problems.some((p) => p.includes('capabilities.items[1].accent')));
});

test('home template rejects an unsafe capability/project card link', () => {
  const route = { key: 'home', template: 'home' };
  const content = validHomeContent();
  content.capabilities.items[0].link = 'javascript:alert(1)';
  content.projects.items[0].link = '//evil.example.com';
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('capabilities.items[0].link')));
  assert.ok(problems.some((p) => p.includes('projects.items[0].link')));
});

test('home template requires exactly one featured project', () => {
  const route = { key: 'home', template: 'home' };

  const none = validHomeContent();
  none.projects.items.forEach((item) => delete item.featured);
  assert.ok(
    validateContent(route, none).some((p) =>
      p.includes(
        '"projects.items" must contain exactly one item with "featured: true"',
      ),
    ),
  );

  const two = validHomeContent();
  two.projects.items[1].featured = true;
  assert.ok(
    validateContent(route, two).some((p) =>
      p.includes(
        '"projects.items" must contain exactly one item with "featured: true"',
      ),
    ),
  );
});

test('case-study template requires backLink pointing exactly at /work/', () => {
  const route = { key: 'work-fes-challenger', template: 'case-study' };
  const base = {
    title: 'FES Challenger',
    heading: 'FES Challenger',
    paragraphs: ['ok'],
  };

  assert.ok(validateContent(route, base).some((p) => p.includes('"backLink"')));

  const wrongPath = { ...base, backLink: { label: 'Back', path: '/work' } };
  assert.ok(
    validateContent(route, wrongPath).some((p) => p.includes('backLink.path')),
  );

  const correct = {
    ...base,
    backLink: { label: 'Back to Work', path: '/work/' },
  };
  assert.deepEqual(validateContent(route, correct), []);
});

// PF-050 — a minimal but complete valid 'solutions' content fixture,
// matching the shape src/content/pages/solutions.js uses for real.
function validSolutionsContent() {
  const ids = [
    'custom-business-systems',
    'workflow-process-solutions',
    'corporate-websites',
    'wordpress-development',
    'existing-system-improvements',
    'support-maintenance',
  ];
  const icons = [
    'boxes',
    'workflow',
    'globe',
    'code',
    'refresh-cw',
    'life-buoy',
  ];
  const accents = ['lime', 'amber', 'cyan', 'violet', 'coral', 'magenta'];
  return {
    title: 'Solutions',
    description: 'Solutions description.',
    heading: 'Solutions heading.',
    paragraphs: ['Intro paragraph.'],
    sections: ids.map((id, i) => ({
      id,
      icon: icons[i],
      accent: accents[i],
      heading: `Heading ${i}`,
      problem: 'Problem.',
      audience: 'Audience.',
      build: 'Build.',
      benefit: 'Benefit.',
      ...(i === 1
        ? {
            evidence: {
              label: 'Business Workflow System',
              path: '/work/business-workflow-system/',
            },
          }
        : {}),
      cta: { label: `Discuss ${id}`, path: '/contact/' },
    })),
    cta: {
      heading: 'Closing heading',
      body: 'Closing body.',
      action: { label: "Let's Discuss Your Project", path: '/contact/' },
    },
  };
}

test('valid solutions content produces no problems', () => {
  const route = { key: 'solutions', template: 'solutions' };
  assert.deepEqual(validateContent(route, validSolutionsContent()), []);
});

test('solutions template requires exactly 6 sections', () => {
  const route = { key: 'solutions', template: 'solutions' };
  const tooFew = validSolutionsContent();
  tooFew.sections = tooFew.sections.slice(0, 5);
  assert.ok(
    validateContent(route, tooFew).some((p) =>
      p.includes('"sections" must be an array of exactly 6'),
    ),
  );
});

test('solutions template rejects a duplicate section id', () => {
  const route = { key: 'solutions', template: 'solutions' };
  const content = validSolutionsContent();
  content.sections[1].id = content.sections[0].id;
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('sections[1].id')));
});

test('solutions template rejects a section id outside the approved 6 slugs', () => {
  const route = { key: 'solutions', template: 'solutions' };
  const content = validSolutionsContent();
  content.sections[0].id = 'not-a-real-section';
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('sections[0].id')));
});

test('solutions template reports every missing required per-section field', () => {
  const route = { key: 'solutions', template: 'solutions' };
  const content = validSolutionsContent();
  delete content.sections[0].problem;
  delete content.sections[0].audience;
  delete content.sections[0].build;
  delete content.sections[0].benefit;
  const problems = validateContent(route, content);
  for (const field of ['problem', 'audience', 'build', 'benefit']) {
    assert.ok(
      problems.some((p) => p.includes(`sections[0].${field}`)),
      `expected a problem mentioning "sections[0].${field}"`,
    );
  }
});

test('solutions template rejects an unknown section icon key and accent', () => {
  const route = { key: 'solutions', template: 'solutions' };
  const content = validSolutionsContent();
  content.sections[0].icon = 'not-a-real-icon';
  content.sections[0].accent = 'not-a-real-accent';
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('sections[0].icon')));
  assert.ok(problems.some((p) => p.includes('sections[0].accent')));
});

test('solutions template: evidence is valid when absent, and validated when present', () => {
  const route = { key: 'solutions', template: 'solutions' };

  const noEvidence = validSolutionsContent();
  delete noEvidence.sections[1].evidence;
  assert.deepEqual(validateContent(route, noEvidence), []);

  const badEvidence = validSolutionsContent();
  badEvidence.sections[1].evidence = { label: '', path: 'not-safe' };
  const problems = validateContent(route, badEvidence);
  assert.ok(problems.some((p) => p.includes('sections[1].evidence.label')));
  assert.ok(problems.some((p) => p.includes('sections[1].evidence.path')));
});

test('solutions template requires a valid per-section cta', () => {
  const route = { key: 'solutions', template: 'solutions' };
  const content = validSolutionsContent();
  delete content.sections[0].cta;
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('sections[0].cta')));
});

test('solutions template requires a valid closing cta', () => {
  const route = { key: 'solutions', template: 'solutions' };

  const missing = validSolutionsContent();
  delete missing.cta;
  assert.ok(validateContent(route, missing).some((p) => p.includes('"cta"')));

  const badAction = validSolutionsContent();
  badAction.cta.action = { label: '', path: 'not-safe' };
  const problems = validateContent(route, badAction);
  assert.ok(problems.some((p) => p.includes('cta.action')));
});

// PF-051 — a minimal but complete valid 'process' content fixture, matching
// the shape src/content/pages/process.js uses for real: 7 stages in the
// exact PROCESS_STAGE_NAMES order, "next" present on all but the last.
function validProcessContent() {
  return {
    title: 'Process',
    description: 'Process description.',
    heading: 'Process heading.',
    paragraphs: ['Intro paragraph.'],
    stages: {
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      items: PROCESS_STAGE_NAMES.map((name, i) => {
        const stage = {
          heading: name,
          whatHappens: 'What happens.',
          clientInput: 'Client input.',
          delivers: 'Delivers.',
          approval: 'Approval.',
        };
        if (i < PROCESS_STAGE_NAMES.length - 1) {
          stage.next = 'Next.';
        }
        return stage;
      }),
    },
    workingTogether: {
      heading: 'Working together heading.',
      items: [
        { heading: 'One', body: 'Body one.' },
        { heading: 'Two', body: 'Body two.' },
      ],
    },
    cta: {
      heading: 'Closing heading',
      body: 'Closing body.',
      action: { label: "Let's Discuss Your Project", path: '/contact/' },
    },
  };
}

test('valid process content produces no problems', () => {
  const route = { key: 'process', template: 'process' };
  assert.deepEqual(validateContent(route, validProcessContent()), []);
});

test('process template requires exactly 7 stages', () => {
  const route = { key: 'process', template: 'process' };
  const tooFew = validProcessContent();
  tooFew.stages.items = tooFew.stages.items.slice(0, 6);
  assert.ok(
    validateContent(route, tooFew).some((p) =>
      p.includes('"stages.items" must be an array of exactly 7'),
    ),
  );
});

test('process template rejects a stage heading out of the canonical order', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  content.stages.items[0].heading = 'Discovery'; // wrong name
  const problems = validateContent(route, content);
  assert.ok(
    problems.some(
      (p) =>
        p.includes('stages.items[0].heading') &&
        p.includes('must be "Discover"') &&
        p.includes('canonical order'),
    ),
  );
});

test('process template rejects two stages swapped out of order', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  // Swap Design (index 2) and Develop (index 3) headings, valid names but
  // wrong positions.
  const tmp = content.stages.items[2].heading;
  content.stages.items[2].heading = content.stages.items[3].heading;
  content.stages.items[3].heading = tmp;
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('stages.items[2].heading')));
  assert.ok(problems.some((p) => p.includes('stages.items[3].heading')));
});

test('process template reports every missing required per-stage field', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  delete content.stages.items[0].whatHappens;
  delete content.stages.items[0].clientInput;
  delete content.stages.items[0].delivers;
  delete content.stages.items[0].approval;
  const problems = validateContent(route, content);
  for (const field of ['whatHappens', 'clientInput', 'delivers', 'approval']) {
    assert.ok(
      problems.some((p) => p.includes(`stages.items[0].${field}`)),
      `expected a problem mentioning "stages.items[0].${field}"`,
    );
  }
});

test('process template requires "next" on a non-terminal stage (Design, index 2)', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  delete content.stages.items[2].next;
  const problems = validateContent(route, content);
  assert.ok(problems.some((p) => p.includes('"stages.items[2].next"')));
});

// PF-051 — the four Support-specific cases AAA required proven separately:
// a non-empty string, null, undefined, and an empty string must all fail,
// exactly like a fully-present valid string would on any other stage. Only
// a "next" key that is entirely absent (the valid fixture's own shape) may
// pass for Support (index 6).

test('process template rejects Support (index 6) declaring next as a non-empty string', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  content.stages.items[6].next = 'Some non-empty string';
  const problems = validateContent(route, content);
  assert.ok(
    problems.some(
      (p) =>
        p.includes('"stages.items[6].next"') && p.includes('must be omitted'),
    ),
  );
});

test('process template rejects Support (index 6) declaring next as null', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  content.stages.items[6].next = null;
  const problems = validateContent(route, content);
  assert.ok(
    problems.some(
      (p) =>
        p.includes('"stages.items[6].next"') && p.includes('must be omitted'),
    ),
  );
});

test('process template rejects Support (index 6) declaring next as undefined (a real own property)', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  content.stages.items[6].next = undefined;
  // Guard the fixture itself: an object literal assigning `next: undefined`
  // must still be a real own property, or this test would silently prove
  // nothing.
  assert.ok(Object.hasOwn(content.stages.items[6], 'next'));
  const problems = validateContent(route, content);
  assert.ok(
    problems.some(
      (p) =>
        p.includes('"stages.items[6].next"') && p.includes('must be omitted'),
    ),
  );
});

test('process template rejects Support (index 6) declaring next as an empty string', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  content.stages.items[6].next = '';
  const problems = validateContent(route, content);
  assert.ok(
    problems.some(
      (p) =>
        p.includes('"stages.items[6].next"') && p.includes('must be omitted'),
    ),
  );
});

test('process template accepts Support (index 6) with no next key at all', () => {
  const route = { key: 'process', template: 'process' };
  const content = validProcessContent();
  assert.ok(!Object.hasOwn(content.stages.items[6], 'next'));
  const problems = validateContent(route, content);
  assert.ok(!problems.some((p) => p.includes('stages.items[6].next')));
});

test('process template requires exactly 2 workingTogether items', () => {
  const route = { key: 'process', template: 'process' };

  const tooFew = validProcessContent();
  tooFew.workingTogether.items = tooFew.workingTogether.items.slice(0, 1);
  assert.ok(
    validateContent(route, tooFew).some((p) =>
      p.includes('"workingTogether.items" must be an array of exactly 2'),
    ),
  );

  const tooMany = validProcessContent();
  tooMany.workingTogether.items.push({ heading: 'Three', body: 'Body three.' });
  assert.ok(
    validateContent(route, tooMany).some((p) =>
      p.includes('"workingTogether.items" must be an array of exactly 2'),
    ),
  );
});

test('process template requires a valid closing cta', () => {
  const route = { key: 'process', template: 'process' };

  const missing = validProcessContent();
  delete missing.cta;
  assert.ok(validateContent(route, missing).some((p) => p.includes('"cta"')));

  const badAction = validProcessContent();
  badAction.cta.action = { label: '', path: 'not-safe' };
  const problems = validateContent(route, badAction);
  assert.ok(problems.some((p) => p.includes('cta.action')));
});
