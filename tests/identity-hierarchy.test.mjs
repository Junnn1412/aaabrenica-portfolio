import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import { site } from '../src/config/site.js';

function renderedRoute(key) {
  const route = routes.find((item) => item.key === key);
  assert.ok(route, `route ${key} must exist`);
  return renderRoute(route);
}

test('production identity contract exposes the exact concise and formal names', () => {
  assert.deepEqual(site.profile.identity, {
    displayName: 'Antonio Abrenica',
    formalName: 'Antonio A. Abrenica III',
  });
  assert.equal(site.siteName, site.profile.identity.displayName);
});

test('navbar, metadata, footer, and Home compact card use the concise public name', () => {
  const home = renderedRoute('home');
  assert.match(
    home.header,
    /<span class="site-brand__text">Antonio Abrenica<\/span>/,
  );
  assert.match(
    home.head,
    /<title>Practical Software Solutions for Growing Businesses — Antonio Abrenica<\/title>/,
  );
  assert.match(
    home.footer,
    /<p class="site-footer__meta">© 2026 Antonio Abrenica\. All rights reserved\.<\/p>/,
  );
  assert.match(
    home.main,
    /profile-card--compact[\s\S]*?<p class="profile-card__name">Antonio Abrenica<\/p>/,
  );
});

test('About full card uses the formal name and exact formal portrait alternative', () => {
  const { main } = renderedRoute('about');
  assert.match(
    main,
    /profile-card--full[\s\S]*?<p class="profile-card__name">Antonio A\. Abrenica III<\/p>/,
  );
  assert.match(
    main,
    /<img src="\/images\/profile\/aaa-portrait\.jpg" alt="Portrait of Antonio A\. Abrenica III"/,
  );
  assert.doesNotMatch(
    main,
    /profile-card--full[\s\S]*?<p class="profile-card__name">Antonio Abrenica<\/p>/,
  );
});

test('old public identity strings are absent from every rendered route', () => {
  for (const route of routes) {
    const rendered = renderRoute(route);
    const html = `${rendered.head}${rendered.header}${rendered.main}${rendered.footer}`;
    assert.doesNotMatch(html, /AAA Portfolio/);
    assert.doesNotMatch(html, />\s*AAA\s*</);
  }
});

test('temporary navbar asset stays decorative and contributes no accessible name', () => {
  const { header } = renderedRoute('home');
  assert.match(
    header,
    /<img class="site-brand__mark" src="\/images\/brand\/aaa-placeholder-logo\.png" alt="" width="231" height="140">/,
  );
  assert.equal([...header.matchAll(/site-header__brand"/g)].length, 1);
  assert.doesNotMatch(header, /site-brand__mark[^>]+aria-label|alt="AAA/);
});

test('identity change does not alter contact, social, route, or domain contracts', () => {
  assert.equal(site.contactEmail, 'website@aaabrenica.site');
  assert.deepEqual(site.social, {
    github: 'https://github.com/Junnn1412',
    linkedin: 'https://www.linkedin.com/in/antonio-iii-abrenica-b17b181a7',
    facebook: 'https://www.facebook.com/Junnabrenica/',
  });
  assert.deepEqual(
    routes.map(({ key, path }) => ({ key, path })),
    [
      { key: 'home', path: '/' },
      { key: 'solutions', path: '/solutions/' },
      { key: 'process', path: '/process/' },
      { key: 'work', path: '/work/' },
      {
        key: 'work-fes-challenger',
        path: '/work/fes-challenger/',
      },
      {
        key: 'work-business-workflow-system',
        path: '/work/business-workflow-system/',
      },
      { key: 'work-ebarangay', path: '/work/ebarangay/' },
      { key: 'about', path: '/about/' },
      { key: 'contact', path: '/contact/' },
      { key: 'privacy', path: '/privacy/' },
      { key: 'not-found', path: '/404.html' },
    ],
  );
});
