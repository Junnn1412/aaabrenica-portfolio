import { renderStandardPage } from './standard.js';
import { renderCaseStudyPage } from './case-study.js';
import { renderHomePage } from './home.js';
import { renderSolutionsPage } from './solutions.js';
import { renderProcessPage } from './process.js';
import { renderWorkPage } from './work.js';
import { renderContactPage } from './contact.js';
import { renderNotFoundPage } from './not-found.js';

// Single static registry, shared by src/pages/render.js and scripts/validate-routes.mjs.
export const templates = {
  standard: renderStandardPage,
  'case-study': renderCaseStudyPage,
  home: renderHomePage,
  solutions: renderSolutionsPage,
  process: renderProcessPage,
  work: renderWorkPage,
  contact: renderContactPage,
  'not-found': renderNotFoundPage,
};
