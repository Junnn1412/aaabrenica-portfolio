import { renderStandardPage } from './standard.js';
import { renderListingPage } from './listing.js';
import { renderCaseStudyPage } from './case-study.js';

// Single static registry, shared by src/pages/render.js and scripts/validate-routes.mjs.
export const templates = {
  standard: renderStandardPage,
  listing: renderListingPage,
  'case-study': renderCaseStudyPage,
};
