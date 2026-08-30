import {
  CONTACT_FORM_BODY_LIMIT,
  CONTACT_INPUT_NAMES,
  isContactSubmissionId,
  validateContactSubmission,
} from '../../src/contact/form-contract.js';
import {
  deliverContactEmail,
  getEmailDeliveryConfig,
} from '../_shared/email-delivery.js';

const SUBJECT = 'New portfolio contact inquiry';
const RESPONSE_HEADERS = Object.freeze({
  'Cache-Control': 'no-store',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
});

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function emailContent(values) {
  const companyText = values.company || 'Not provided';
  const text = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Company or organization: ${companyText}`,
    '',
    'Message / project needs:',
    values.message,
  ].join('\n');
  const htmlMessage = escapeHtml(values.message).replaceAll('\n', '<br>');
  const html =
    `<p><strong>Name:</strong> ${escapeHtml(values.name)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(values.email)}</p>` +
    `<p><strong>Company or organization:</strong> ${escapeHtml(companyText)}</p>` +
    `<p><strong>Message / project needs:</strong><br>${htmlMessage}</p>`;
  return { text, html };
}

function wantsHtml(request) {
  return !request.headers.get('Accept')?.includes('application/json');
}

function hasAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (origin == null) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function providerStatusCategory(status) {
  if (Number.isInteger(status) && status >= 400 && status <= 499) return '4xx';
  if (Number.isInteger(status) && status >= 500 && status <= 599) return '5xx';
  return 'other';
}

function htmlDocument({ title, heading, message, status = 200 }) {
  const body = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:system-ui,sans-serif;line-height:1.5;max-width:42rem;margin:3rem auto;padding:0 1rem;color:#171923;background:#fff}a{color:#0645ad}a:focus{outline:2px solid currentColor;outline-offset:2px}</style><main><h1 tabindex="-1">${escapeHtml(heading)}</h1><p>${escapeHtml(message)}</p><p><a href="/contact/">Return to Contact</a></p></main></html>`;
  return new Response(body, {
    status,
    headers: {
      ...RESPONSE_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...RESPONSE_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function publicError(request, status) {
  const message =
    'Your message could not be submitted right now. Please try again, or email website@aaabrenica.site.';
  if (wantsHtml(request)) {
    return htmlDocument({
      title: 'Message not submitted',
      heading: 'Message not submitted',
      message,
      status,
    });
  }
  return jsonResponse({ ok: false, code: 'submission_failed' }, status);
}

function successResponse(request) {
  if (wantsHtml(request)) {
    return htmlDocument({
      title: 'Message submitted',
      heading: 'Message submitted',
      message:
        'Thanks for reaching out. Your message was accepted for processing. If you need another way to reach me, email website@aaabrenica.site.',
    });
  }
  return jsonResponse({ ok: true });
}

function validationResponse(request, errors) {
  if (wantsHtml(request)) {
    return htmlDocument({
      title: 'Please check your message',
      heading: 'Please check the highlighted fields',
      message: 'Correct the errors below and submit the form again.',
      status: 400,
    });
  }
  return jsonResponse({ ok: false, code: 'validation_error', errors }, 400);
}

async function readBody(request) {
  const declaredLength = Number(request.headers.get('Content-Length'));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > CONTACT_FORM_BODY_LIMIT
  ) {
    return { error: 413 };
  }

  const contentType = request.headers
    .get('Content-Type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (
    contentType !== 'application/json' &&
    contentType !== 'application/x-www-form-urlencoded'
  ) {
    return { error: 415 };
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > CONTACT_FORM_BODY_LIMIT) return { error: 413 };

  let raw;
  try {
    raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { error: 400 };
  }

  try {
    if (contentType === 'application/json') {
      const value = JSON.parse(raw);
      if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        return { error: 400 };
      }
      if (Object.values(value).some((field) => typeof field !== 'string')) {
        return { error: 400 };
      }
      return { value };
    }

    const params = new URLSearchParams(raw);
    const value = {};
    for (const [key, field] of params) {
      if (Object.hasOwn(value, key)) return { error: 400 };
      value[key] = field;
    }
    return { value };
  } catch {
    return { error: 400 };
  }
}

export async function handleContactRequest(
  request,
  env,
  {
    deliver = deliverContactEmail,
    createSubmissionId = () => crypto.randomUUID(),
    logger = console,
  } = {},
) {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, code: 'method_not_allowed' }, 405, {
      Allow: 'POST',
    });
  }

  if (!hasAllowedOrigin(request)) return publicError(request, 403);

  const parsed = await readBody(request);
  if (parsed.error) return publicError(request, parsed.error);

  const validation = validateContactSubmission(parsed.value);
  if (validation.unknownFields.length > 0) return publicError(request, 400);
  if (!validation.valid) return validationResponse(request, validation.errors);

  const config = getEmailDeliveryConfig(env);
  if (!config) {
    logger.warn?.('contact_configuration_unavailable');
    return publicError(request, 503);
  }

  if (validation.isHoneypot) return successResponse(request);

  const suppliedId = request.headers.get('Idempotency-Key');
  const idempotencyKey = isContactSubmissionId(suppliedId)
    ? suppliedId
    : createSubmissionId();
  const content = emailContent(validation.values);

  try {
    const result = await deliver({
      config,
      replyTo: validation.values.email,
      subject: SUBJECT,
      ...content,
      idempotencyKey,
    });
    if (!result.ok) {
      logger.warn?.('contact_delivery_failed', {
        providerStatusCategory: providerStatusCategory(result.status),
      });
      return publicError(request, 503);
    }
  } catch {
    logger.warn?.('contact_delivery_failed');
    return publicError(request, 503);
  }

  logger.info?.('contact_delivery_accepted');
  return successResponse(request);
}

export function onRequest(context) {
  return handleContactRequest(context.request, context.env);
}

export const __test = Object.freeze({
  CONTACT_INPUT_NAMES,
  emailContent,
  hasAllowedOrigin,
  providerStatusCategory,
});
