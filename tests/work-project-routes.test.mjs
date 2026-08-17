// PF-052 — direct unit coverage of findWorkProjectRouteProblems(), the
// pure exact-set-equality checker scripts/validate-routes.mjs's
// checkWorkProjectLinks() wraps with real data. Since the function is
// pure (no file-system/module state), these synthetic-data cases directly
// exercise every failure path — this *is* the deliberate-failure proof,
// per the approved plan, rather than a separate temporary-source-mutation
// ceremony. tests/validate-routes-smoke.test.mjs (unchanged) separately
// proves the real wiring against the real repository.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findWorkProjectRouteProblems } from '../scripts/work-project-routes.mjs';

const REGISTERED = [
  '/work/fes-challenger/',
  '/work/business-workflow-system/',
  '/work/ebarangay/',
];

test('valid exact set: every registered case-study route present exactly once produces no problems', () => {
  const problems = findWorkProjectRouteProblems(
    [
      '/work/business-workflow-system/',
      '/work/fes-challenger/',
      '/work/ebarangay/',
    ],
    REGISTERED,
  );
  assert.deepEqual(problems, []);
});

test('missing case-study link: an omitted registered route is reported', () => {
  const problems = findWorkProjectRouteProblems(
    ['/work/fes-challenger/', '/work/business-workflow-system/'],
    REGISTERED,
  );
  assert.equal(problems.length, 1);
  assert.match(problems[0], /missing a project card linking to/);
  assert.match(problems[0], /\/work\/ebarangay\//);
});

test('duplicate link: a repeated real path is reported, with nothing missing or unregistered', () => {
  const problems = findWorkProjectRouteProblems(
    [
      '/work/fes-challenger/',
      '/work/business-workflow-system/',
      '/work/ebarangay/',
      '/work/fes-challenger/',
    ],
    REGISTERED,
  );
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /links to "\/work\/fes-challenger\/" more than once/,
  );
});

test('unregistered/extra link: a made-up destination is reported, with nothing missing or duplicated', () => {
  const problems = findWorkProjectRouteProblems(
    [
      '/work/fes-challenger/',
      '/work/business-workflow-system/',
      '/work/ebarangay/',
      '/work/some-future-project/',
    ],
    REGISTERED,
  );
  assert.equal(problems.length, 1);
  assert.match(
    problems[0],
    /project card link "\/work\/some-future-project\/" does not match any registered case-study route/,
  );
});

test('growth-safety: a larger registered set with a matching larger project list still produces no problems (no hardcoded count of 3)', () => {
  const registeredFour = [...REGISTERED, '/work/a-fourth-project/'];
  const linksFour = [
    '/work/fes-challenger/',
    '/work/business-workflow-system/',
    '/work/ebarangay/',
    '/work/a-fourth-project/',
  ];
  assert.deepEqual(findWorkProjectRouteProblems(linksFour, registeredFour), []);
});
