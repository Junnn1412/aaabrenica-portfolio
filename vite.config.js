import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const r = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        index: r('index.html'),
        solutions: r('solutions/index.html'),
        process: r('process/index.html'),
        work: r('work/index.html'),
        workFesChallenger: r('work/fes-challenger/index.html'),
        workBusinessWorkflowSystem: r('work/business-workflow-system/index.html'),
        workEbarangay: r('work/ebarangay/index.html'),
        about: r('about/index.html'),
        contact: r('contact/index.html'),
        privacy: r('privacy/index.html'),
        notFound: r('404.html'),
      },
    },
  },
});
