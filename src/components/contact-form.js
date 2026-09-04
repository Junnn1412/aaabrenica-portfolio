import { escapeHtml } from '../pages/escape.js';
import { isSafeEmail, isSafeInternalPath } from '../pages/link-safety.js';
import { CONTACT_FORM_FIELDS } from '../contact/form-contract.js';

const FIELD_IDS = Object.freeze({
  name: 'contact-name',
  email: 'contact-email',
  company: 'contact-company',
  message: 'contact-message',
});

export function getContactFieldError(error, formContent) {
  if (error.code === 'maxLength') {
    return formContent.errors.maxLength.replace(
      '{maximum}',
      String(error.maximum),
    );
  }
  if (error.field === 'name' && error.code === 'required') {
    return formContent.errors.nameRequired;
  }
  if (error.field === 'email' && error.code === 'required') {
    return formContent.errors.emailRequired;
  }
  if (error.field === 'email' && error.code === 'invalid') {
    return formContent.errors.emailInvalid;
  }
  if (error.field === 'message' && error.code === 'required') {
    return formContent.errors.messageRequired;
  }
  return formContent.failureMessage;
}

export function mapContactFieldErrors(validationErrors, formContent) {
  return Object.fromEntries(
    validationErrors.map((error) => [
      error.field,
      getContactFieldError(error, formContent),
    ]),
  );
}

function renderErrorMessage(field, message) {
  const id = `${FIELD_IDS[field]}-error`;
  const visible = typeof message === 'string' && message.length > 0;
  return `<p class="field__error" id="${id}" data-contact-error-for="${field}"${visible ? '' : ' hidden'}>${visible ? escapeHtml(message) : ''}</p>`;
}

function renderInputField({
  field,
  type = 'text',
  autocomplete,
  content,
  values,
  errors,
}) {
  const id = FIELD_IDS[field];
  const definition = CONTACT_FORM_FIELDS[field];
  const error = errors[field];
  return (
    `<div class="field${error ? ' field--error' : ''}" data-contact-field="${field}">` +
    `<label class="field__label" for="${id}">${escapeHtml(content.fields[field].label)}</label>` +
    `<input class="field__control" id="${id}" name="${field}" type="${type}" maxlength="${definition.maxLength}"${definition.required ? ' required' : ''}${autocomplete ? ` autocomplete="${autocomplete}"` : ''} aria-describedby="${id}-error"${error ? ' aria-invalid="true"' : ''} value="${escapeHtml(values[field] ?? '')}">` +
    renderErrorMessage(field, error) +
    `</div>`
  );
}

function renderMessageField(content, values, errors) {
  const field = 'message';
  const id = FIELD_IDS[field];
  const definition = CONTACT_FORM_FIELDS[field];
  const error = errors[field];
  return (
    `<div class="field${error ? ' field--error' : ''}" data-contact-field="${field}">` +
    `<label class="field__label" for="${id}">${escapeHtml(content.fields[field].label)}</label>` +
    `<textarea class="field__control" id="${id}" name="${field}" maxlength="${definition.maxLength}" required aria-describedby="${id}-help ${id}-error"${error ? ' aria-invalid="true"' : ''}>${escapeHtml(values[field] ?? '')}</textarea>` +
    `<p class="field__help" id="${id}-help">${escapeHtml(content.fields[field].help)}</p>` +
    renderErrorMessage(field, error) +
    `</div>`
  );
}

function renderErrorSummary(formContent, errors, formError) {
  const entries = Object.entries(errors);
  const visible = entries.length > 0 || Boolean(formError);
  const items = entries
    .map(
      ([field, message]) =>
        `<li><a href="#${FIELD_IDS[field]}">${escapeHtml(message)}</a></li>`,
    )
    .join('');
  return (
    `<div class="form-feedback form-feedback--error" data-contact-form-summary role="alert" tabindex="-1" aria-labelledby="contact-form-errors-title"${visible ? '' : ' hidden'}>` +
    `<h3 id="contact-form-errors-title">${escapeHtml(formContent.validation.heading)}</h3>` +
    `<p data-contact-form-summary-message>${escapeHtml(formError ?? formContent.validation.instruction)}</p>` +
    `<ul data-contact-form-summary-list${items ? '' : ' hidden'}>${items}</ul>` +
    `</div>`
  );
}

export function renderContactForm({
  content,
  action,
  contactEmail,
  values = {},
  errors = {},
  formError = '',
} = {}) {
  if (!content || !isSafeInternalPath(action) || !isSafeEmail(contactEmail)) {
    throw new TypeError(
      'renderContactForm: valid content, action, and contactEmail are required',
    );
  }

  return (
    `<section class="contact-form-panel" aria-labelledby="contact-form-heading">` +
    `<form class="contact-form" method="post" action="${escapeHtml(action)}" data-contact-form>` +
    `<h2 id="contact-form-heading">${escapeHtml(content.heading)}</h2>` +
    renderErrorSummary(content, errors, formError) +
    renderInputField({
      field: 'name',
      autocomplete: 'name',
      content,
      values,
      errors,
    }) +
    renderInputField({
      field: 'email',
      type: 'email',
      autocomplete: 'email',
      content,
      values,
      errors,
    }) +
    renderInputField({
      field: 'company',
      autocomplete: 'organization',
      content,
      values,
      errors,
    }) +
    renderMessageField(content, values, errors) +
    `<div class="contact-form__honeypot" aria-hidden="true"><label for="contact-website">Leave this field blank</label><input id="contact-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>` +
    `<p class="contact-form__privacy">${escapeHtml(content.privacy.text)} <a href="${escapeHtml(content.privacy.link.path)}">${escapeHtml(content.privacy.link.label)}</a>.</p>` +
    `<button class="btn btn--primary" type="submit" data-contact-form-submit>${escapeHtml(content.submitLabel)}</button>` +
    `<p class="form-status" data-contact-form-status role="status" aria-live="polite" aria-atomic="true"></p>` +
    `<p class="contact-form__alternative" data-contact-form-alternative hidden><a href="mailto:${escapeHtml(contactEmail)}">Email ${escapeHtml(contactEmail)}</a></p>` +
    `</form>` +
    `<div class="form-feedback form-feedback--success" data-contact-form-success role="status" tabindex="-1" hidden><h2>${escapeHtml(content.success.heading)}</h2><p>${escapeHtml(content.success.message)}</p></div>` +
    `</section>`
  );
}
