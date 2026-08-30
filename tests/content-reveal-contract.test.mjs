import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { routes } from '../src/config/routes.js';
import { renderRoute } from '../src/pages/render.js';
import {
  contentRevealAttributes,
  CONTENT_REVEAL_MAX_STAGGER,
  CONTENT_REVEAL_VARIANTS,
} from '../src/components/content-reveal.js';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);
const scriptSource = fs.readFileSync(
  fileURLToPath(new URL('../src/scripts/content-reveal.js', import.meta.url)),
  'utf8',
);
const mainScriptSource = fs.readFileSync(
  fileURLToPath(new URL('../src/scripts/main.js', import.meta.url)),
  'utf8',
);

test('content reveal has a closed template-authored variant and stagger contract', () => {
  assert.deepEqual(CONTENT_REVEAL_VARIANTS, ['fade-up', 'fade-in']);
  assert.equal(CONTENT_REVEAL_MAX_STAGGER, 3);
  assert.equal(
    contentRevealAttributes('fade-up'),
    ' data-content-reveal="fade-up"',
  );
  assert.equal(
    contentRevealAttributes('fade-in', { stagger: 3 }),
    ' data-content-reveal="fade-in" data-content-reveal-stagger="3"',
  );
  assert.throws(() => contentRevealAttributes('zoom'));
  assert.throws(() => contentRevealAttributes('fade-up', { stagger: 4 }));
  assert.throws(() => contentRevealAttributes('fade-up', { stagger: 1.5 }));
});

test('all 11 visitor routes receive explicit reveal targets without content-module timing facts', () => {
  assert.equal(routes.length, 11);
  for (const route of routes) {
    const rendered = renderRoute(route);
    assert.match(
      rendered.main,
      /data-content-reveal="(?:fade-up|fade-in)"/,
      `expected route ${route.key} to include a reveal target`,
    );
    assert.doesNotMatch(rendered.header, /data-content-reveal/);
    assert.doesNotMatch(rendered.footer, /data-content-reveal/);
  }

  const contentFiles = fs
    .readdirSync(
      fileURLToPath(new URL('../src/content/pages/', import.meta.url)),
    )
    .filter((name) => name.endsWith('.js'));
  for (const file of contentFiles) {
    const source = fs.readFileSync(
      fileURLToPath(new URL(`../src/content/pages/${file}`, import.meta.url)),
      'utf8',
    );
    assert.doesNotMatch(source, /content-reveal|stagger/i);
  }
});

test('persistent and interaction-owned elements are not reveal targets', () => {
  const allMain = routes.map((route) => renderRoute(route).main).join('');
  for (const className of [
    'project-carousel__slide',
    'project-carousel__controls',
    'project-carousel__arrow',
    'project-carousel__indicator',
    'action-link__icon',
    'tag',
    'contact-form__status',
    'contact-form__error-summary',
  ]) {
    assert.doesNotMatch(
      allMain,
      new RegExp(
        `class="[^"]*\\b${className}\\b[^"]*"[^>]*data-content-reveal`,
      ),
      `${className} must not be a reveal target`,
    );
  }
  assert.doesNotMatch(
    allMain,
    /data-hero-(?:connection|reveal|signal|node|point)[^>]*data-content-reveal/,
  );
});

test('server-rendered reveal content is visible without JavaScript', () => {
  const defaultRule = css.match(/\[data-content-reveal\]\s*\{([^}]*)\}/);
  assert.ok(defaultRule);
  assert.doesNotMatch(
    defaultRule[1],
    /opacity\s*:\s*0|visibility\s*:\s*hidden|display\s*:\s*none|transform\s*:/,
  );
  assert.doesNotMatch(
    css,
    /(?:html|body|\.js)[^{]*\[data-content-reveal\][^{]*\{[^}]*(?:opacity\s*:\s*0|visibility\s*:\s*hidden)/,
  );
});

test('motion is restrained, centralized, and reduced motion is immediately static', () => {
  assert.match(css, /--motion-duration-reveal:\s*560ms;/);
  assert.match(css, /--motion-stagger-reveal:\s*80ms;/);
  assert.match(css, /--motion-stagger-reveal-double:\s*160ms;/);
  assert.match(css, /--motion-stagger-reveal-triple:\s*240ms;/);
  assert.match(
    css,
    /--motion-easing-reveal:\s*cubic-bezier\(0\.22, 1, 0\.36, 1\);/,
  );
  assert.match(css, /translateY\(var\(--motion-distance-md\)\)/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.is-content-reveal-animating\[data-content-reveal\][\s\S]*?animation:\s*none;[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none;/,
  );
  assert.doesNotMatch(
    css.match(/@keyframes content-reveal-fade-up[\s\S]*?\n\}/)?.[0] ?? '',
    /scale|rotate|blur|filter|box-shadow|text-shadow/,
  );
});

test('one shared observer drives once-only reveals without loops or an animation dependency', () => {
  assert.equal(
    [...scriptSource.matchAll(/new IntersectionObserverObject/g)].length,
    1,
  );
  assert.match(scriptSource, /observer\?\.unobserve\?\./);
  assert.match(scriptSource, /initializedRoots/);
  assert.doesNotMatch(
    scriptSource,
    /requestAnimationFrame|setInterval|setTimeout|from ['"](?:motion|gsap|animejs|three)/,
  );
});

test('reveal lifecycle covers visibility, runtime motion, focus, and hash navigation', () => {
  assert.match(scriptSource, /visibilitychange/);
  assert.match(scriptSource, /prefers-reduced-motion: reduce/);
  assert.match(scriptSource, /handleMotionChange/);
  assert.match(
    scriptSource,
    /addEventListener\?\.\('focus', handleFocus, true\)/,
  );
  assert.match(scriptSource, /a\[href\^="#"\]/);
  assert.match(scriptSource, /hashchange/);
  assert.match(scriptSource, /pageshow/);
});

test('Home hero and content reveal initialize once through separate lifecycles', () => {
  assert.equal(
    [...mainScriptSource.matchAll(/import ['"]\.\/hero-visual\.js['"]/g)]
      .length,
    1,
  );
  assert.equal(
    [...mainScriptSource.matchAll(/import ['"]\.\/content-reveal\.js['"]/g)]
      .length,
    1,
  );
  assert.doesNotMatch(mainScriptSource, /initHeroVisuals/);
  assert.doesNotMatch(scriptSource, /data-hero-|initHeroVisual/);
});
