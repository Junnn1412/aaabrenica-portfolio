import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSiteProfileProblems } from '../scripts/site-profile-validation.mjs';

function validProfile() {
  return {
    identity: {
      displayName: 'Antonio Abrenica',
      formalName: 'Antonio A. Abrenica III',
    },
    role: 'Full-Stack Software Developer',
    portrait: {
      src: '/images/profile/aaa-portrait.jpg',
      alt: 'Portrait of Antonio A. Abrenica III',
      width: 1665,
      height: 1464,
    },
  };
}

test('shared site profile accepts the complete production shape', () => {
  assert.deepEqual(findSiteProfileProblems(validProfile()), []);
});

test('shared site profile rejects a missing display name', () => {
  const profile = validProfile();
  delete profile.identity.displayName;
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.identity.displayName must be a non-empty string',
    ),
  );
});

test('shared site profile rejects an empty display name', () => {
  const profile = validProfile();
  profile.identity.displayName = '';
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.identity.displayName must be a non-empty string',
    ),
  );
});

test('shared site profile rejects missing and empty formal names', () => {
  for (const formalName of [undefined, '', '   ']) {
    const profile = validProfile();
    if (formalName === undefined) delete profile.identity.formalName;
    else profile.identity.formalName = formalName;
    assert.ok(
      findSiteProfileProblems(profile).includes(
        'site.profile.identity.formalName must be a non-empty string',
      ),
    );
  }
});

test('shared identity rejects unknown fields', () => {
  const profile = validProfile();
  profile.identity.nickname = 'Tony';
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.identity contains unknown field "nickname"',
    ),
  );
});

test('shared site profile rejects a missing role', () => {
  const profile = validProfile();
  delete profile.role;
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.role must be a non-empty string',
    ),
  );
});

test('shared site profile rejects an empty role', () => {
  const profile = validProfile();
  profile.role = '';
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.role must be a non-empty string',
    ),
  );
});

test('shared site profile rejects a missing portrait object', () => {
  const profile = validProfile();
  delete profile.portrait;
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.portrait must be an object',
    ),
  );
});

test('shared site profile rejects an unsafe portrait source', () => {
  const profile = validProfile();
  profile.portrait.src = '//evil.example.com/portrait.jpg';
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.portrait.src must be a safe internal path',
    ),
  );
});

test('shared site profile rejects a missing or empty portrait alt', () => {
  for (const alt of [undefined, '']) {
    const profile = validProfile();
    if (alt === undefined) delete profile.portrait.alt;
    else profile.portrait.alt = alt;
    assert.ok(
      findSiteProfileProblems(profile).includes(
        'site.profile.portrait.alt must be a non-empty string',
      ),
    );
  }
});

test('shared site profile rejects an invalid portrait width', () => {
  const profile = validProfile();
  profile.portrait.width = 0;
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.portrait.width must be a positive integer',
    ),
  );
});

test('shared site profile rejects an invalid portrait height', () => {
  const profile = validProfile();
  profile.portrait.height = -1;
  assert.ok(
    findSiteProfileProblems(profile).includes(
      'site.profile.portrait.height must be a positive integer',
    ),
  );
});
