import contactContent from '../content/pages/contact.js';
import { mapContactFieldErrors } from '../components/contact-form.js';
import { enhanceContactForm } from '../contact/form-client.js';

const form = document.querySelector('[data-contact-form]');

if (form) {
  enhanceContactForm({
    form,
    content: contactContent.form,
    mapErrors: mapContactFieldErrors,
  });
}
