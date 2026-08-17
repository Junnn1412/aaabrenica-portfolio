import { renderStandardPage } from './standard.js';
import { renderListingPage } from './listing.js';
import { renderCaseStudyPage } from './case-study.js';
import { renderHomePage } from './home.js';
import { renderSolutionsPage } from './solutions.js';
import { renderProcessPage } from './process.js';

// Single static registry, shared by src/pages/render.js and scripts/validate-routes.mjs.
export const templates = {
  standard: renderStandardPage,
  listing: renderListingPage,
  'case-study': renderCaseStudyPage,
  home: renderHomePage,
  solutions: renderSolutionsPage,
  process: renderProcessPage,
};
