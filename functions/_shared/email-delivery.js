import { isValidVisitorEmail } from '../../src/contact/form-contract.js';

export const RESEND_EMAIL_ENDPOINT = 'https://api.resend.com/emails';
export const RESEND_TIMEOUT_MS = 8_000;

function hasHeaderInjection(value) {
  return typeof value !== 'string' || /[\r\n]/.test(value);
}

export function getEmailDeliveryConfig(env) {
  const config = {
    apiKey: env?.RESEND_API_KEY,
    from: env?.CONTACT_FROM_EMAIL,
    to: env?.CONTACT_TO_EMAIL,
  };

  if (
    env?.CONTACT_FORM_ENABLED !== 'true' ||
    typeof config.apiKey !== 'string' ||
    config.apiKey.length === 0 ||
    hasHeaderInjection(config.from) ||
    hasHeaderInjection(config.to) ||
    !isValidVisitorEmail(config.from) ||
    !isValidVisitorEmail(config.to)
  ) {
    return null;
  }
  return config;
}

export function createResendEmailDelivery({
  fetchImpl = globalThis.fetch,
  createTimeoutSignal = (timeout) => AbortSignal.timeout(timeout),
} = {}) {
  return async function deliverEmail({
    config,
    replyTo,
    subject,
    text,
    html,
    idempotencyKey,
  }) {
    if (
      !config ||
      hasHeaderInjection(replyTo) ||
      !isValidVisitorEmail(replyTo) ||
      hasHeaderInjection(subject) ||
      typeof idempotencyKey !== 'string'
    ) {
      throw new TypeError('Invalid email delivery input');
    }

    const response = await fetchImpl(RESEND_EMAIL_ENDPOINT, {
      method: 'POST',
      signal: createTimeoutSignal(RESEND_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
    });

    return { ok: response.ok, status: response.status };
  };
}

export const deliverContactEmail = createResendEmailDelivery();
