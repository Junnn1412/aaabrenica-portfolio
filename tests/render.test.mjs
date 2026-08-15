import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderRoute } from '../src/pages/render.js';
import { routes } from '../src/config/routes.js';
import { site } from '../src/config/site.js';

function routeByKey(key) {
  const route = routes.find((r) => r.key === key);
  assert.ok(route, `route "${key}" must exist in routes.js`);
  return route;
}

test('renderRoute("home") produces a single title combining content and site name', () => {
  const { head } = renderRoute(routeByKey('home'));
  const matches = [...head.matchAll(/<title>([^<]*)<\/title>/g)];
  assert.equal(matches.length, 1);
  assert.ok(matches[0][1].endsWith(site.siteName));
});

test('renderRoute("privacy") falls back to site.defaultDescription end-to-end', () => {
  const { head } = renderRoute(routeByKey('privacy'));
  assert.match(
    head,
    new RegExp(`content="${site.defaultDescription.replace(/'/g, '&#39;')}"`),
  );
});

test('renderRoute for a case-study route includes the backLink to /work/', () => {
  const { main } = renderRoute(routeByKey('work-fes-challenger'));
  assert.match(main, /<a href="\/work\/">Back to Work<\/a>/);
});

test('renderRoute("not-found") renders its optional link', () => {
  const { main } = renderRoute(routeByKey('not-found'));
  assert.match(main, /<a href="\/">Return home<\/a>/);
});
