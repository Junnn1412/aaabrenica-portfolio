import { isSafeInternalPath } from '../src/pages/link-safety.js';

export function findSiteProfileProblems(profile) {
  const problems = [];

  if (profile == null || typeof profile !== 'object') {
    problems.push('site.profile must be an object');
    return problems;
  }

  if (profile.identity == null || typeof profile.identity !== 'object') {
    problems.push('site.profile.identity must be an object');
  } else {
    const identityFields = new Set(['displayName', 'formalName']);
    for (const field of Object.keys(profile.identity)) {
      if (!identityFields.has(field)) {
        problems.push(
          `site.profile.identity contains unknown field "${field}"`,
        );
      }
    }
    if (
      typeof profile.identity.displayName !== 'string' ||
      profile.identity.displayName.trim().length === 0
    ) {
      problems.push(
        'site.profile.identity.displayName must be a non-empty string',
      );
    }
    if (
      typeof profile.identity.formalName !== 'string' ||
      profile.identity.formalName.trim().length === 0
    ) {
      problems.push(
        'site.profile.identity.formalName must be a non-empty string',
      );
    }
  }
  if (typeof profile.role !== 'string' || profile.role.length === 0) {
    problems.push('site.profile.role must be a non-empty string');
  }

  if (profile.portrait == null || typeof profile.portrait !== 'object') {
    problems.push('site.profile.portrait must be an object');
    return problems;
  }

  const { portrait } = profile;
  if (!isSafeInternalPath(portrait.src)) {
    problems.push('site.profile.portrait.src must be a safe internal path');
  }
  if (typeof portrait.alt !== 'string' || portrait.alt.length === 0) {
    problems.push('site.profile.portrait.alt must be a non-empty string');
  }
  if (!Number.isInteger(portrait.width) || portrait.width <= 0) {
    problems.push('site.profile.portrait.width must be a positive integer');
  }
  if (!Number.isInteger(portrait.height) || portrait.height <= 0) {
    problems.push('site.profile.portrait.height must be a positive integer');
  }

  return problems;
}
