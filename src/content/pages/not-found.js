// PF-055 — a fixed, curated set of 3 recovery links (Home/Work/Contact),
// not a growing collection; see checkNotFoundContent in
// src/pages/content-schema.js. No search box, no redirect — a deliberate
// design choice for this task (either could mask a real broken link rather
// than surfacing it), not a documented requirement being satisfied.
export default {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  heading: 'Page Not Found',
  paragraphs: [
    "The page you're looking for doesn't exist, or it may have moved. Use one of the links below to find what you need.",
  ],
  links: [
    { label: 'Home', path: '/' },
    { label: 'Work', path: '/work/' },
    { label: 'Contact', path: '/contact/' },
  ],
};
