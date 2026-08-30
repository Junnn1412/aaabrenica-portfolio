import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderAboutPage } from '../src/pages/templates/about.js';
import { primaryNav } from '../src/config/navigation.js';
import { site } from '../src/config/site.js';
import aboutContent from '../src/content/pages/about.js';

const APPROVED_EXPERIENCE = {
  eyebrow: 'PROFESSIONAL JOURNEY',
  heading: 'Experience',
  lede: 'A record of the roles, systems, and technologies that have shaped my professional work since 2020.',
  entries: [
    {
      role: 'Computer Programmer II',
      employer: 'Department of Public Works and Highways',
      dates: {
        start: { label: 'Apr 2024', datetime: '2024-04' },
        end: { label: 'Present' },
      },
      summary:
        'Develop and maintain internal workflow systems by translating operational requirements into technical specifications and application features.',
      responsibilities: [
        'Analyze requirements and implement workflow functionality.',
        'Develop and maintain frontend features and database-supported processes.',
        'Resolve application defects and support testing and deployment.',
      ],
      technologies: ['Angular', 'Microsoft SQL Server'],
    },
    {
      role: 'Analyst Programmer',
      employer: 'Bank of Commerce',
      dates: {
        start: { label: 'Aug 2022', datetime: '2022-08' },
        end: { label: 'Apr 2024', datetime: '2024-04' },
      },
      summary:
        'Enhanced and supported internal enterprise applications used in daily business operations.',
      responsibilities: [
        'Implemented new modules and application improvements.',
        'Provided technical support for internal systems.',
        'Deployed enhancements focused on usability and reliability.',
      ],
      technologies: ['ASP.NET MVC', 'C#', 'Microsoft SQL Server'],
    },
    {
      role: 'Computer Programmer',
      employer: 'SolidService Electronics Corporation',
      dates: {
        start: { label: 'Dec 2020', datetime: '2020-12' },
        end: { label: 'Jul 2022', datetime: '2022-07' },
      },
      summary:
        'Developed and maintained business applications supporting employee timekeeping, attendance, leave management, and payroll preparation.',
      responsibilities: [
        'Maintained core business applications and resolved reported issues.',
        'Developed a multi-branch fingerprint-based timekeeping and leave-management system.',
        'Built attendance-monitoring functionality that generated payroll-ready data.',
      ],
      technologies: ['VB.NET', 'Visual Basic 6', 'PostgreSQL'],
    },
    {
      role: 'IT Support Specialist',
      employer: 'Nephila Web Technology Inc.',
      dates: {
        start: { label: 'Jul 2020', datetime: '2020-07' },
        end: { label: 'Sep 2020', datetime: '2020-09' },
      },
      summary:
        'Supported application development by translating business requirements into technical specifications and assisting with implementation.',
      responsibilities: [
        'Assisted with application development based on business requirements.',
        'Helped prepare technical specifications.',
      ],
      technologies: ['Laravel', 'MySQL'],
    },
  ],
};

function render(content = aboutContent) {
  return renderAboutPage({
    content,
    navItems: primaryNav,
    activeKey: 'about',
    site,
  }).main;
}

function experienceRegion(main = render()) {
  const match = main.match(
    /<section class="about-experience"[\s\S]*?<\/section>/,
  );
  assert.ok(match, 'expected the complete Experience section');
  return match[0];
}

test('Experience production content matches all four approved entries in reverse chronological order', () => {
  assert.deepEqual(aboutContent.experience, APPROVED_EXPERIENCE);
  assert.deepEqual(
    aboutContent.experience.entries.map((entry) => entry.role),
    [
      'Computer Programmer II',
      'Analyst Programmer',
      'Computer Programmer',
      'IT Support Specialist',
    ],
  );
});

test('Experience renders an established eyebrow/H2/lede header and semantic timeline articles', () => {
  const experience = experienceRegion();
  assert.match(
    experience,
    /^<section class="about-experience"[^>]*><div class="about-experience__inner"><div data-content-reveal="fade-up"><div class="section-header">/,
  );
  assert.match(
    experience,
    /<span class="section-header__eyebrow">PROFESSIONAL JOURNEY<\/span>/,
  );
  assert.match(
    experience,
    /<h2 class="section-header__heading" id="experience-heading">Experience<\/h2>/,
  );
  assert.match(
    experience,
    /<p class="section-header__lede">A record of the roles, systems, and technologies that have shaped my professional work since 2020\.<\/p>/,
  );
  assert.match(experience, /<ol class="experience-timeline">/);
  assert.equal(
    [...experience.matchAll(/<li class="experience-timeline__item"[^>]*>/g)]
      .length,
    4,
  );
  assert.equal(
    [...experience.matchAll(/<article class="experience-card"/g)].length,
    4,
  );
  for (let index = 1; index <= 4; index++) {
    assert.match(
      experience,
      new RegExp(
        `<article class="experience-card" aria-labelledby="experience-role-${index}">[\\s\\S]*?<h3 class="experience-card__role" id="experience-role-${index}">`,
      ),
    );
  }
});

test('each wide-card hook preserves approved semantic content order', () => {
  const experience = experienceRegion();
  const cards = [
    ...experience.matchAll(
      /<article class="experience-card"[\s\S]*?<\/article>/g,
    ),
  ].map((match) => match[0]);
  assert.equal(cards.length, 4);

  for (const card of cards) {
    const role = card.indexOf('experience-card__role');
    const employer = card.indexOf('experience-card__employer');
    const dates = card.indexOf('experience-card__dates');
    const main = card.indexOf('experience-card__main');
    const summary = card.indexOf('experience-card__summary');
    const responsibilities = card.indexOf('experience-card__responsibilities');
    const technologies = card.indexOf('experience-card__technologies');
    assert.ok(role < employer);
    assert.ok(employer < dates);
    assert.ok(dates < main);
    assert.ok(main < summary);
    assert.ok(summary < responsibilities);
    assert.ok(responsibilities < technologies);
  }
});

test('Experience renders exact employers, date ranges, responsibilities, and noninteractive tags', () => {
  const experience = experienceRegion();
  for (const entry of APPROVED_EXPERIENCE.entries) {
    assert.match(
      experience,
      new RegExp(
        `<p class="experience-card__employer">${entry.employer.replaceAll('.', '\\.')}<\\/p>`,
      ),
    );
    assert.match(experience, new RegExp(entry.summary.replaceAll('.', '\\.')));
    for (const responsibility of entry.responsibilities) {
      assert.match(
        experience,
        new RegExp(`<li>${responsibility.replaceAll('.', '\\.')}<\\/li>`),
      );
    }
    for (const technology of entry.technologies) {
      const escaped = technology.replaceAll('.', '\\.').replaceAll('#', '\\#');
      assert.match(
        experience,
        new RegExp(`<span class="tag">${escaped}<\\/span>`),
      );
    }
  }

  assert.equal(
    [...experience.matchAll(/class="experience-card__dates"/g)].length,
    4,
  );
  assert.equal([...experience.matchAll(/<time datetime=/g)].length, 7);
  assert.equal(
    [...experience.matchAll(/class="experience-card__tag-item"/g)].length,
    10,
  );
  assert.doesNotMatch(
    experience,
    /<(?:a|button|input|img|svg)\b|href=|src=|logo|icon/i,
  );
});

test('Experience preserves the approved confidentiality boundaries', () => {
  const experience = `${JSON.stringify(aboutContent.experience)} ${experienceRegion()}`;
  assert.doesNotMatch(
    experience,
    /materials? engineer|accreditation|workflow stages?|user roles?|internal urls?|source code|infrastructure/i,
  );
  assert.doesNotMatch(experience, /Legal Management System|\bLMS\b|BankComTK/i);
  assert.doesNotMatch(experience, /endorsement|sponsor|metric|\b\d+%/i);
});

test('timeline line and nodes are CSS-only and absent from the accessibility tree', () => {
  const experience = experienceRegion();
  assert.doesNotMatch(
    experience,
    /experience-(?:timeline__line|timeline__node)|timeline-(?:line|node)/,
  );
  assert.doesNotMatch(experience, /role="presentation"|role="img"/);
});

test('Experience escapes every hostile visitor-facing field', () => {
  const hostile = structuredClone(aboutContent);
  hostile.experience = {
    eyebrow: '<script>eyebrow</script>',
    heading: '<img src=x onerror=alert(1)>',
    lede: 'Lede & <script>bad</script>',
    entries: [
      {
        role: '<script>role</script>',
        employer: 'Employer & <b>brand</b>',
        dates: {
          start: { label: '<b>start</b>', datetime: '2024-04" onload="x' },
          end: { label: '<script>end</script>' },
        },
        summary: 'Summary <script>bad</script>',
        responsibilities: ['Responsibility & <script>bad</script>'],
        technologies: ['Technology <img src=x>'],
      },
    ],
  };

  const experience = experienceRegion(render(hostile));
  assert.doesNotMatch(experience, /<script>|<img|<b>/);
  for (const escapedFragment of [
    '&lt;script&gt;eyebrow&lt;/script&gt;',
    '&lt;img src=x onerror=alert(1)&gt;',
    'Employer &amp; &lt;b&gt;brand&lt;/b&gt;',
    '2024-04&quot; onload=&quot;x',
    'Technology &lt;img src=x&gt;',
  ]) {
    assert.ok(experience.includes(escapedFragment));
  }
});
