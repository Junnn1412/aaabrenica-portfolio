import home from './home.js';
import solutions from './solutions.js';
import processContent from './process.js';
import about from './about.js';
import contact from './contact.js';
import privacy from './privacy.js';
import notFound from './not-found.js';
import work from './work/index.js';
import workFesChallenger from './work/fes-challenger.js';
import workBusinessWorkflowSystem from './work/business-workflow-system.js';
import workEbarangay from './work/ebarangay.js';

// Single static registry, shared by src/pages/render.js and scripts/validate-routes.mjs.
export const contentByKey = {
  home,
  solutions,
  process: processContent,
  about,
  contact,
  privacy,
  'not-found': notFound,
  work,
  'work-fes-challenger': workFesChallenger,
  'work-business-workflow-system': workBusinessWorkflowSystem,
  'work-ebarangay': workEbarangay,
};
