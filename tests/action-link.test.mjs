import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { renderActionLink } from '../src/components/action-link.js';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';

const mainScssPath = fileURLToPath(
  new URL('../src/styles/main.scss', import.meta.url),
);
const { css } = sass.compile(mainScssPath);

function routePart(key, part = 'main') {
  const route = routes.find((item) => item.key === key);
  return renderRoute(route)[part];
}

function actions(html) {
  return [
    ...html.matchAll(
      /<a class="action-link action-link--(forward|back|external)" href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g,
    ),
  ].map((match) => ({
    variant: match[1],
    href: match[2],
    inner: match[3],
    label: match[3].match(
      /<span class="action-link__label">([\s\S]*?)<\/span>/,
    )?.[1],
  }));
}

test('action-link renderer has a closed explicit variant contract', () => {
  for (const variant of ['forward', 'back', 'external']) {
    assert.equal(
      actions(renderActionLink({ label: 'Action', href: '/', variant })).length,
      1,
    );
  }
  assert.throws(
    () => renderActionLink({ label: 'Action', href: '/', variant: 'guessed' }),
    /variant must be one of/,
  );
  assert.throws(
    () => renderActionLink({ label: '', href: '/', variant: 'forward' }),
    /label must be a non-empty string/,
  );
});

test('forward, back, and external variants preserve semantic icon ordering', () => {
  const forward = renderActionLink({
    label: 'Forward',
    href: '/work/',
    variant: 'forward',
  });
  const back = renderActionLink({
    label: 'Back',
    href: '/work/',
    variant: 'back',
  });
  const external = renderActionLink({
    label: 'External',
    href: 'https://example.com/',
    variant: 'external',
  });
  assert.ok(forward.indexOf('action-link__label') < forward.indexOf('<svg'));
  assert.ok(back.indexOf('<svg') < back.indexOf('action-link__label'));
  assert.ok(external.indexOf('action-link__label') < external.indexOf('<svg'));
  assert.match(external, /target="_blank" rel="noopener noreferrer"/);
});

test('every action icon is registry-rendered, decorative, and unfocusable while the label is the accessible name', () => {
  const html = ['forward', 'back', 'external']
    .map((variant) =>
      renderActionLink({ label: `${variant} label`, href: '/', variant }),
    )
    .join('');
  const rendered = actions(html);
  assert.equal(rendered.length, 3);
  for (const action of rendered) {
    assert.match(
      action.inner,
      /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/,
    );
    assert.equal([...action.inner.matchAll(/<svg/g)].length, 1);
    assert.equal([...action.inner.matchAll(/action-link__label/g)].length, 1);
    assert.doesNotMatch(action.label, /[→←]/);
  }
});

test('the exact approved standalone actions use explicit variants', () => {
  assert.deepEqual(
    actions(routePart('home')).map(({ label, href, variant }) => ({
      label,
      href,
      variant,
    })),
    [
      { label: 'Learn About My Approach', href: '/about/', variant: 'forward' },
      { label: 'Explore Solutions', href: '/solutions/', variant: 'forward' },
      { label: 'Explore All Work', href: '/work/', variant: 'forward' },
      { label: 'See the Full Process', href: '/process/', variant: 'forward' },
    ],
  );

  assert.deepEqual(
    actions(routePart('solutions')).map(({ label, href, variant }) => ({
      label,
      href,
      variant,
    })),
    [
      {
        label: 'Discuss a Custom System',
        href: '/contact/',
        variant: 'forward',
      },
      {
        label: 'Related project: Business Workflow System',
        href: '/work/business-workflow-system/',
        variant: 'forward',
      },
      {
        label: 'Discuss a Workflow Solution',
        href: '/contact/',
        variant: 'forward',
      },
      {
        label: 'Related project: FES Challenger',
        href: '/work/fes-challenger/',
        variant: 'forward',
      },
      {
        label: 'Discuss a Website Project',
        href: '/contact/',
        variant: 'forward',
      },
      {
        label: 'Related project: FES Challenger',
        href: '/work/fes-challenger/',
        variant: 'forward',
      },
      {
        label: 'Discuss a WordPress Project',
        href: '/contact/',
        variant: 'forward',
      },
      {
        label: 'Discuss an Existing System',
        href: '/contact/',
        variant: 'forward',
      },
      { label: 'Discuss Support Needs', href: '/contact/', variant: 'forward' },
    ],
  );

  for (const key of [
    'work-fes-challenger',
    'work-business-workflow-system',
    'work-ebarangay',
  ]) {
    assert.deepEqual(
      actions(routePart(key)).map(({ label, href, variant }) => ({
        label,
        href,
        variant,
      })),
      [{ label: 'Back to Work', href: '/work/', variant: 'back' }],
    );
  }

  assert.deepEqual(
    actions(routePart('not-found')).map(({ label, href, variant }) => ({
      label,
      href,
      variant,
    })),
    [
      { label: 'Home', href: '/', variant: 'forward' },
      { label: 'Work', href: '/work/', variant: 'forward' },
      { label: 'Contact', href: '/contact/', variant: 'forward' },
    ],
  );
});

test('generic links and excluded control families do not receive action-link styling', () => {
  const home = renderRoute(routes.find((route) => route.key === 'home'));
  assert.doesNotMatch(home.header, /action-link/);
  assert.doesNotMatch(home.footer, /action-link/);
  assert.doesNotMatch(routePart('privacy'), /action-link/);
  assert.doesNotMatch(routePart('contact'), /action-link/);
  assert.doesNotMatch(
    home.main.match(/<div class="hero__actions">[\s\S]*?<\/div>/)?.[0] ?? '',
    /action-link/,
  );
  assert.doesNotMatch(
    home.main.match(/<li class="project-card[\s\S]*?<\/li>/)?.[0] ?? '',
    /action-link/,
  );
  assert.doesNotMatch(
    home.main,
    /class="tag[^>]*action-link|class="project-carousel__[^>]*action-link/,
  );
  assert.doesNotMatch(
    routePart('solutions').match(
      /<nav class="solutions-jump-nav"[\s\S]*?<\/nav>/,
    )?.[0] ?? '',
    /action-link/,
  );
});

test('action-link styles are scoped, fine-pointer-gated, reduced-motion-safe, focus-compatible, and forced-colors-visible', () => {
  assert.match(css, /\.action-link\s*\{[^}]*display:\s*inline-flex;/s);
  assert.match(
    css,
    /\.action-link\s*\{[^}]*min-height:\s*var\(--touch-target-min\);/s,
  );
  assert.doesNotMatch(css, /a\s*\{[^}]*display:\s*inline-flex;/s);
  assert.match(
    css,
    /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.action-link--forward:hover \.action-link__icon[\s\S]*?translateX\(0\.1875rem\)/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.action-link:hover \.action-link__icon[\s\S]*?transform:\s*none/,
  );
  assert.match(
    css,
    /@media \(forced-colors: active\)[\s\S]*?\.action-link\s*\{/,
  );
  assert.doesNotMatch(css, /\.action-link[^}]*outline:\s*none/s);
});
