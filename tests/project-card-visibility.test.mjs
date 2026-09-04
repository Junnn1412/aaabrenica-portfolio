import { test } from 'node:test';
import assert from 'node:assert/strict';
import homeContent from '../src/content/pages/home.js';
import workContent from '../src/content/pages/work/index.js';
import { routes } from '../src/config/routes.js';
import { getVisibleProjectCards } from '../src/content/project-card-visibility.js';
import { findWorkProjectRouteProblems } from '../scripts/work-project-routes.mjs';

test('Home and Work share the canonical FES-visible/BWS-hidden/eBarangay-hidden state', () => {
  for (const content of [homeContent, workContent]) {
    assert.deepEqual(
      content.projects.items.map(({ heading, isVisible }) => ({
        heading,
        isVisible,
      })),
      [
        { heading: 'FES Challenger', isVisible: true },
        { heading: 'Business Workflow System', isVisible: false },
        { heading: 'eBarangay', isVisible: false },
      ],
    );
    assert.deepEqual(
      getVisibleProjectCards(content.projects.items).map(
        (item) => item.heading,
      ),
      ['FES Challenger'],
    );
  }
});

test('visibility filtering does not weaken the full Work route exact-set invariant', () => {
  const rawLinks = workContent.projects.items.map((item) => item.link);
  const registeredRoutes = routes
    .filter((route) => route.template === 'case-study')
    .map((route) => route.path);
  assert.deepEqual(
    findWorkProjectRouteProblems(rawLinks, registeredRoutes),
    [],
  );
  assert.equal(rawLinks.length, 3);
});

test('visibility selection rejects missing/malformed state and an empty publication set', () => {
  assert.throws(
    () => getVisibleProjectCards([{ heading: 'Missing' }]),
    /isVisible must be a boolean/,
  );
  assert.throws(
    () => getVisibleProjectCards([{ heading: 'Malformed', isVisible: 'yes' }]),
    /isVisible must be a boolean/,
  );
  assert.throws(
    () => getVisibleProjectCards([{ heading: 'Hidden', isVisible: false }]),
    /at least one project must be visible/,
  );
});
