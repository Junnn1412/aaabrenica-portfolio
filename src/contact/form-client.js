import {
  CONTACT_FORM_FIELDS,
  CONTACT_INPUT_NAMES,
  validateContactSubmission,
} from './form-contract.js';

export const CONTACT_RESPONSE_KIND = Object.freeze({
  success: 'success',
  validation: 'validation',
  rateLimited: 'rate-limited',
  failure: 'failure',
});

export async function submitContactRequest({
  fetchImpl,
  action,
  values,
  submissionId,
}) {
  const response = await fetchImpl(action, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Idempotency-Key': submissionId,
    },
    body: JSON.stringify(values),
  });

  if (response.status === 429) {
    return { kind: CONTACT_RESPONSE_KIND.rateLimited };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // A generic failure is safer than exposing an intermediary response.
  }

  if (response.ok && payload?.ok === true) {
    return { kind: CONTACT_RESPONSE_KIND.success };
  }
  if (
    response.status === 400 &&
    payload?.code === 'validation_error' &&
    Array.isArray(payload.errors)
  ) {
    return {
      kind: CONTACT_RESPONSE_KIND.validation,
      errors: payload.errors,
    };
  }
  return { kind: CONTACT_RESPONSE_KIND.failure };
}

function valuesFromForm(form) {
  const data = new FormData(form);
  return Object.fromEntries(
    CONTACT_INPUT_NAMES.map((name) => [name, data.get(name) ?? '']),
  );
}

function clearFeedback(form) {
  const summary = form.querySelector('[data-contact-form-summary]');
  summary.hidden = true;
  summary.querySelector('[data-contact-form-summary-list]').hidden = true;

  for (const field of Object.keys(CONTACT_FORM_FIELDS)) {
    const wrapper = form.querySelector(`[data-contact-field="${field}"]`);
    const control = form.elements.namedItem(field);
    const error = form.querySelector(`[data-contact-error-for="${field}"]`);
    wrapper.classList.remove('field--error');
    control.removeAttribute('aria-invalid');
    error.textContent = '';
    error.hidden = true;
  }
}

function showErrors(form, errors, content, mapErrors) {
  const mapped = mapErrors(errors, content);
  const summary = form.querySelector('[data-contact-form-summary]');
  const list = summary.querySelector('[data-contact-form-summary-list]');
  const items = [];

  for (const [field, message] of Object.entries(mapped)) {
    const wrapper = form.querySelector(`[data-contact-field="${field}"]`);
    const control = form.elements.namedItem(field);
    const error = form.querySelector(`[data-contact-error-for="${field}"]`);
    wrapper.classList.add('field--error');
    control.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    error.hidden = false;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${control.id}`;
    link.textContent = message;
    item.append(link);
    items.push(item);
  }

  summary.querySelector('[data-contact-form-summary-message]').textContent =
    content.validation.instruction;
  list.replaceChildren(...items);
  list.hidden = items.length === 0;
  summary.hidden = false;
  summary.focus();
}

function showFailure(form, message) {
  const summary = form.querySelector('[data-contact-form-summary]');
  summary.querySelector('[data-contact-form-summary-message]').textContent =
    message;
  summary.querySelector('[data-contact-form-summary-list]').hidden = true;
  summary.hidden = false;
  summary.focus();
}

export function enhanceContactForm({
  form,
  content,
  mapErrors,
  fetchImpl = globalThis.fetch,
  createSubmissionId = () => globalThis.crypto.randomUUID(),
}) {
  if (!form) return;

  let submissionId = createSubmissionId();
  const button = form.querySelector('[data-contact-form-submit]');
  const status = form.querySelector('[data-contact-form-status]');
  const success = form.parentElement.querySelector(
    '[data-contact-form-success]',
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFeedback(form);

    const values = valuesFromForm(form);
    const validation = validateContactSubmission(values);
    if (!validation.valid) {
      showErrors(form, validation.errors, content, mapErrors);
      return;
    }

    button.disabled = true;
    status.textContent = content.pendingMessage;

    let result;
    try {
      result = await submitContactRequest({
        fetchImpl,
        action: form.action,
        values: validation.values,
        submissionId,
      });
    } catch {
      result = { kind: CONTACT_RESPONSE_KIND.failure };
    } finally {
      button.disabled = false;
      status.textContent = '';
    }

    if (result.kind === CONTACT_RESPONSE_KIND.success) {
      form.hidden = true;
      success.hidden = false;
      success.focus();
      submissionId = createSubmissionId();
      return;
    }
    if (result.kind === CONTACT_RESPONSE_KIND.validation) {
      showErrors(form, result.errors, content, mapErrors);
      return;
    }

    // 429 and all other recoverable failures use the approved generic copy.
    // Values remain in the controls and no automatic retry is attempted.
    showFailure(form, content.failureMessage);
  });
}
