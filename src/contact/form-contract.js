export const CONTACT_FORM_ACTION = '/api/contact';
export const CONTACT_FORM_BODY_LIMIT = 16 * 1024;

export const CONTACT_FORM_FIELDS = Object.freeze({
  name: Object.freeze({ required: true, maxLength: 100 }),
  email: Object.freeze({ required: true, maxLength: 254 }),
  company: Object.freeze({ required: false, maxLength: 150 }),
  message: Object.freeze({ required: true, maxLength: 5000 }),
});

export const CONTACT_HONEYPOT_FIELD = 'website';
export const CONTACT_INPUT_NAMES = Object.freeze([
  ...Object.keys(CONTACT_FORM_FIELDS),
  CONTACT_HONEYPOT_FIELD,
]);

const VISITOR_EMAIL_RE =
  /^[A-Za-z0-9.!#$&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, '\n');
}

export function normalizeContactValue(value) {
  return normalizeLineEndings(String(value ?? '').normalize('NFC')).trim();
}

export function isValidVisitorEmail(value) {
  return (
    typeof value === 'string' &&
    value.length <= CONTACT_FORM_FIELDS.email.maxLength &&
    !hasUnsupportedControlCharacters(value) &&
    VISITOR_EMAIL_RE.test(value)
  );
}

function hasUnsupportedControlCharacters(value, { multiline = false } = {}) {
  return [...value].some((character) => {
    if (multiline && (character === '\n' || character === '\t')) return false;
    const codePoint = character.codePointAt(0);
    return codePoint <= 31 || codePoint === 127;
  });
}

export function validateContactSubmission(input) {
  const source =
    input != null && typeof input === 'object' && !Array.isArray(input)
      ? input
      : {};
  const unknownFields = Object.keys(source).filter(
    (key) => !CONTACT_INPUT_NAMES.includes(key),
  );
  const values = Object.fromEntries(
    CONTACT_INPUT_NAMES.map((name) => [
      name,
      normalizeContactValue(source[name]),
    ]),
  );
  const errors = [];

  for (const [field, definition] of Object.entries(CONTACT_FORM_FIELDS)) {
    const value = values[field];
    if (definition.required && value.length === 0) {
      errors.push({ field, code: 'required' });
      continue;
    }
    if (value.length > definition.maxLength) {
      errors.push({
        field,
        code: 'maxLength',
        maximum: definition.maxLength,
      });
      continue;
    }
    if (
      value.length > 0 &&
      hasUnsupportedControlCharacters(value, { multiline: field === 'message' })
    ) {
      errors.push({ field, code: 'invalid' });
      continue;
    }
    if (field === 'email' && value.length > 0 && !isValidVisitorEmail(value)) {
      errors.push({ field, code: 'invalid' });
    }
  }

  return {
    values,
    errors,
    unknownFields,
    isHoneypot: values[CONTACT_HONEYPOT_FIELD].length > 0,
    valid: errors.length === 0 && unknownFields.length === 0,
  };
}

export function isContactSubmissionId(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
