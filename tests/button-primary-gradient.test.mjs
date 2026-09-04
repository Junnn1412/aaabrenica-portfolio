import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import { renderContactForm } from '../src/components/contact-form.js';
import contactContent from '../src/content/pages/contact.js';
import { site } from '../src/config/site.js';

const mainPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const tokensPath = fileURLToPath(
  new URL('../src/styles/generic/_custom-properties.scss', import.meta.url),
);
const { css } = sass.compile(mainPath);
const { css: tokenCss } = sass.compile(tokensPath);

function ruleBodies(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g'))].map(
    (match) => match[1],
  );
}

function tokenValue(name) {
  const match = tokenCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  assert.ok(match, `missing token --${name}`);
  return match[1].trim();
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return {
      r: parseInt(hex[1].slice(0, 2), 16),
      g: parseInt(hex[1].slice(2, 4), 16),
      b: parseInt(hex[1].slice(4, 6), 16),
    };
  }
  const rgb = value.match(
    /^rgba?\(\s*([\d.]+)(%?)\s*[,\s]\s*([\d.]+)(%?)\s*[,\s]\s*([\d.]+)(%?)/,
  );
  assert.ok(rgb, `unrecognized color ${value}`);
  return {
    r: Number(rgb[1]) * (rgb[2] ? 2.55 : 1),
    g: Number(rgb[3]) * (rgb[4] ? 2.55 : 1),
    b: Number(rgb[5]) * (rgb[6] ? 2.55 : 1),
  };
}

function luminance(color) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(color.r) +
    0.7152 * channel(color.g) +
    0.0722 * channel(color.b)
  );
}

function contrast(nameA, nameB) {
  const first = luminance(parseColor(tokenValue(nameA)));
  const second = luminance(parseColor(tokenValue(nameB)));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const gradientStops = [
  'color-primary-gradient-start',
  'color-primary-gradient-end',
  'color-primary-gradient-hover-start',
  'color-primary-gradient-hover-end',
  'color-primary-gradient-active-start',
  'color-primary-gradient-active-end',
];

for (const stop of gradientStops) {
  test(`--${stop} keeps primary-button text at or above 4.5:1`, () => {
    assert.ok(contrast(stop, 'color-text-primary') >= 4.5);
  });
}

test('persistent primary-button boundary clears 3:1 on page and elevated surfaces', () => {
  assert.ok(contrast('color-border-interactive', 'color-canvas') >= 3);
  assert.ok(contrast('color-border-interactive', 'color-surface-1') >= 3);
});

test('shared .btn--primary centrally owns the 135deg gradient and its darker states', () => {
  const base = ruleBodies('.btn--primary')[0];
  assert.match(base, /border-color:\s*var\(--color-border-interactive\);/);
  assert.match(
    base,
    /background-image:\s*linear-gradient\(135deg, var\(--color-primary-gradient-start\), var\(--color-primary-gradient-end\)\);/,
  );
  assert.match(base, /color:\s*var\(--color-text-primary\);/);

  const hoverMedia = css.match(
    /@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\.btn--primary:hover\s*\{([^}]*)\}/,
  );
  assert.ok(hoverMedia);
  assert.match(hoverMedia[1], /color-primary-gradient-hover-start/);
  assert.match(hoverMedia[1], /color-primary-gradient-hover-end/);

  const active = ruleBodies('.btn--primary:active')[0];
  assert.match(active, /color-primary-gradient-active-start/);
  assert.match(active, /color-primary-gradient-active-end/);
});

test('primary gradient is not duplicated into secondary, icon, tag, active-nav, timeline, or page rules', () => {
  for (const selector of [
    '.btn--secondary',
    '.btn--icon',
    '.tag',
    ".site-nav a[aria-current='page']",
    '.experience-timeline::before',
    '.experience-timeline__item::before',
  ]) {
    for (const body of ruleBodies(selector)) {
      assert.doesNotMatch(body, /primary-gradient|linear-gradient/);
    }
  }

  const gradientDeclarations = [
    ...css.matchAll(
      /([^{}]+)\{([^{}]*background-image:\s*linear-gradient\([^{}]*primary-gradient[^{}]*)\}/g,
    ),
  ];
  assert.ok(gradientDeclarations.length >= 3);
  for (const [, selector] of gradientDeclarations) {
    assert.match(selector.trim(), /^\.btn--primary(?::(?:hover|active))?$/);
  }
});

test('both anchor and native-button primary variants use the shared class', () => {
  const home = renderRoute(routes.find((route) => route.key === 'home')).main;
  assert.match(home, /<a class="btn btn--primary btn--lg"/);
  assert.match(home, /<a class="btn btn--secondary btn--lg"/);

  const form = renderContactForm({
    content: contactContent.form,
    action: site.contactForm.action,
    contactEmail: site.contactEmail,
  });
  assert.match(form, /<button class="btn btn--primary" type="submit"/);
});

test('carousel icon controls remain non-primary', () => {
  const home = renderRoute(routes.find((route) => route.key === 'home')).main;
  const controls = [
    ...home.matchAll(
      /<button class="([^"]*project-carousel__(?:arrow|indicator)[^"]*)"/g,
    ),
  ];
  assert.ok(controls.length > 0);
  for (const [, classes] of controls)
    assert.doesNotMatch(classes, /btn--primary/);
});

test('disabled and forced-colors states neutralize the gradient while focus and reduced-motion systems remain intact', () => {
  const disabled = ruleBodies('.btn:disabled')[0];
  assert.match(disabled, /background-image:\s*none;/);
  assert.match(disabled, /cursor:\s*not-allowed;/);

  const forced = css.match(
    /@media \(forced-colors: active\) \{[\s\S]*?\.btn--primary\s*\{([^}]*)\}/,
  );
  assert.ok(forced);
  assert.match(forced[1], /background-image:\s*none;/);
  assert.match(forced[1], /border-color:\s*ButtonText;/);
  assert.match(forced[1], /color:\s*ButtonText;/);

  assert.match(
    css,
    /:focus-visible\s*\{[^}]*outline:\s*var\(--focus-ring-width\) solid var\(--color-focus-ring\);/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?transition-duration:\s*0\.01ms\s*!important;/,
  );
});

test('primary-button rules introduce no glow, scale, animated gradient, or large shadow', () => {
  const relevant = ruleBodies('.btn--primary').join('\n');
  assert.doesNotMatch(
    relevant,
    /box-shadow|filter:|drop-shadow|scale\(|animation:|background-position/,
  );
});
