// PF-051 — end-to-end structural assertions against the real 'process'
// route's rendered output, mirroring tests/solutions-render.test.mjs's
// style: real renderer output checked against the shared structural-
// contract helpers plus this page's own canonical-order/next-omission/
// heading-hierarchy contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { renderProcessPage } from '../src/pages/templates/process.js';
import { routes } from '../src/config/routes.js';
import { PROCESS_STAGE_NAMES } from '../src/pages/content-schema.js';
import processContent from '../src/content/pages/process.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import { expectCtaPanels } from './helpers/component-markup.mjs';

function processMain() {
  const route = routes.find((r) => r.key === 'process');
  return renderRoute(route).main;
}

function stageBlocks(main) {
  return [
    ...main.matchAll(
      /<li class="process-detail__stage"(?: [^>]*)?>[\s\S]*?<\/li>/g,
    ),
  ].map((m) => m[0]);
}

function pageSectionBlocks(main) {
  return [
    ...main.matchAll(
      /<section class="page-section(?: [^"]*)?"(?: [^>]*)?>[\s\S]*?<\/section>/g,
    ),
  ].map((m) => m[0]);
}

test('process: stage headings render in the exact canonical order', () => {
  const main = processMain();
  const headings = [
    ...main.matchAll(/<h3 class="process-detail__heading">([^<]*)<\/h3>/g),
  ].map((m) => m[1]);
  assert.deepEqual(headings, PROCESS_STAGE_NAMES);
});

test('process: exactly one <h1>', () => {
  const main = processMain();
  const h1s = [...main.matchAll(/<h1[ >]/g)].length;
  assert.equal(h1s, 1, 'expected exactly one <h1>');
});

test('process: exactly 3 <h2>s total (Stages + Working Together section headers, plus the closing CTA heading)', () => {
  const main = processMain();
  const sectionH2s = [...main.matchAll(/<h2 class="section-header__heading">/g)]
    .length;
  const ctaH2s = [...main.matchAll(/<h2 class="cta__heading">/g)].length;
  assert.equal(sectionH2s, 2, 'expected 2 section-header <h2>s');
  assert.equal(ctaH2s, 1, 'expected 1 <h2 class="cta__heading">');
  assert.equal(sectionH2s + ctaH2s, 3, 'expected 3 <h2>s total');
});

test('process: exactly 7 <h3>s total, all stage headings — the closing CTA no longer renders an <h3>', () => {
  const main = processMain();
  const stageH3s = [...main.matchAll(/<h3 class="process-detail__heading">/g)]
    .length;
  assert.equal(stageH3s, 7, 'expected 7 stage <h3>s');
  const ctaH3s = [...main.matchAll(/<h3 class="cta__heading">/g)].length;
  assert.equal(
    ctaH3s,
    0,
    'expected zero <h3 class="cta__heading"> — the Process closing CTA must render as <h2>, not <h3>',
  );
});

test('process: exactly 7 stage <li>s, each with a decorative, correctly-numbered badge', () => {
  const main = processMain();
  const blocks = stageBlocks(main);
  assert.equal(blocks.length, 7, 'expected exactly 7 stage <li>s');
  blocks.forEach((block, i) => {
    const match = block.match(
      /<span class="process-detail__number" aria-hidden="true">(\d+)<\/span>/,
    );
    assert.ok(match, `stage #${i + 1}: expected a numbered badge`);
    assert.equal(
      Number(match[1]),
      i + 1,
      `stage #${i + 1}: expected badge to read "${i + 1}"`,
    );
  });
});

test('process: "What Happens Next" appears in stages 1–6 and is absent from Support (stage 7)', () => {
  const main = processMain();
  const blocks = stageBlocks(main);
  assert.equal(blocks.length, 7);

  for (let i = 0; i < 6; i++) {
    assert.match(
      blocks[i],
      /<dt class="process-facts__term">What Happens Next<\/dt>/,
      `stage #${i + 1} (${PROCESS_STAGE_NAMES[i]}) should include "What Happens Next"`,
    );
  }
  assert.doesNotMatch(
    blocks[6],
    /What Happens Next/,
    'Support (stage 7) must not render a "What Happens Next" pair at all',
  );

  const totalNextOccurrences = [
    ...main.matchAll(
      /<dt class="process-facts__term">What Happens Next<\/dt>/g,
    ),
  ].length;
  assert.equal(totalNextOccurrences, 6);
});

test('process: exactly 34 fact pairs across the 7 stages (5 each for the first 6, 4 for Support)', () => {
  const main = processMain();
  const blocks = stageBlocks(main);
  const joined = blocks.join('');
  const dts = [...joined.matchAll(/<dt class="process-facts__term">/g)].length;
  const dds = [...joined.matchAll(/<dd class="process-facts__detail">/g)]
    .length;
  assert.equal(dts, 34, 'expected 34 <dt> across all 7 stages');
  assert.equal(dds, 34, 'expected 34 matching <dd> across all 7 stages');
});

test('process: every stage preserves title then five canonical detail fields in semantic order', () => {
  const blocks = stageBlocks(processMain());
  blocks.forEach((block, index) => {
    assert.ok(
      block.indexOf('process-detail__heading-row') <
        block.indexOf('process-facts'),
    );
    const terms = [
      ...block.matchAll(/<dt class="process-facts__term">([^<]+)<\/dt>/g),
    ].map((match) => match[1].replace('&amp;', '&'));
    const expected = [
      'What Happens',
      'What We Need From You',
      'What I Deliver',
      'Review & Approval',
      ...(index < 6 ? ['What Happens Next'] : []),
    ];
    assert.deepEqual(terms, expected);
    assert.equal(
      [...block.matchAll(/<div class="process-facts__item">/g)].length,
      expected.length,
    );
  });
});

test('process: Working Together section carries exactly 2 fact pairs, separate from the stages', () => {
  const main = processMain();
  const sections = pageSectionBlocks(main);
  assert.equal(sections.length, 3, 'expected 3 top-level .page-sections');
  const workingTogether = sections[1];
  assert.match(workingTogether, /How We Communicate and Manage Change/);
  const dts = [...workingTogether.matchAll(/<dt class="process-facts__term">/g)]
    .length;
  const dds = [
    ...workingTogether.matchAll(/<dd class="process-facts__detail">/g),
  ].length;
  assert.equal(dts, 2);
  assert.equal(dds, 2);
});

test('process: exactly one closing CTA panel with one interactive element', () => {
  const main = processMain();
  expectCtaPanels(main, { count: 1, actionClass: 'btn btn--primary' });
});

test('process: every href is a safe internal path', () => {
  const main = processMain();
  const hrefs = [...main.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(
    hrefs.length > 0,
    'expected at least one href in the rendered output',
  );
  for (const href of hrefs) {
    assert.ok(href.startsWith('/'), `unsafe href found: "${href}"`);
    assert.ok(
      !href.startsWith('//'),
      `protocol-relative href found: "${href}"`,
    );
  }
});

test('production process content matches the schema-required shape used above (sanity check)', () => {
  assert.equal(processContent.stages.items.length, 7);
  assert.ok(!Object.hasOwn(processContent.stages.items[6], 'next'));
});

test('renderProcessPage escapes every string field, including every stage fact', () => {
  const hostileStage = (heading, withNext) => ({
    heading,
    whatHappens: `What happens & <script>alert('${heading}')</script>`,
    clientInput: `Client input "quoted" & <i>markup</i>`,
    delivers: `Delivers & <b>markup</b>`,
    approval: `Approval & <b>markup</b>`,
    ...(withNext ? { next: `Next & <b>markup</b>` } : {}),
  });

  const hostileContent = {
    title: 'Process',
    description: 'D',
    heading: '<b>Bold</b> & Heading',
    paragraphs: ['P & <script>alert(1)</script>'],
    stages: {
      eyebrow: 'Eyebrow & <b>markup</b>',
      heading: 'Stages & <b>markup</b>',
      items: PROCESS_STAGE_NAMES.map((name, i) =>
        hostileStage(name, i < PROCESS_STAGE_NAMES.length - 1),
      ),
    },
    workingTogether: {
      heading: 'Working Together & <b>markup</b>',
      items: [
        {
          heading: 'One & <b>markup</b>',
          body: 'Body one & <script>alert(1)</script>',
        },
        { heading: 'Two & <b>markup</b>', body: 'Body two & <i>markup</i>' },
      ],
    },
    cta: {
      heading: 'Closing & <b>markup</b>',
      body: 'Body & <b>markup</b>',
      action: { label: "Let's Discuss & <b>markup</b>", path: '/contact/' },
    },
  };

  const { main } = renderProcessPage({
    content: hostileContent,
    navItems: primaryNav,
    activeKey: 'process',
    site,
  });

  assert.doesNotMatch(main, /<script>/, 'no raw <script> tag should survive');
  assert.match(main, /&lt;b&gt;Bold&lt;\/b&gt; &amp; Heading/);
  assert.match(main, /P &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(
    main,
    /What happens &amp; &lt;script&gt;alert\(&#39;Discover&#39;\)&lt;\/script&gt;/,
  );
  assert.match(
    main,
    /Client input &quot;quoted&quot; &amp; &lt;i&gt;markup&lt;\/i&gt;/,
  );
  assert.match(main, /Delivers &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Approval &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Next &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Working Together &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Body one &amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(main, /Closing &amp; &lt;b&gt;markup&lt;\/b&gt;/);
  assert.match(main, /Let&#39;s Discuss &amp; &lt;b&gt;markup&lt;\/b&gt;/);
});
