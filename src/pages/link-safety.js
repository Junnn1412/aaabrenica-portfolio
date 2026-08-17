export function isSafeInternalPath(path) {
  return (
    typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
  );
}

// Deliberately narrow: this validates one owner-controlled portfolio
// contact address, not general RFC 5322 email addresses. "%" is
// excluded from the local part on purpose — combined with raw
// (unencoded) embedding into a mailto: href, a "%"-bearing value like
// "local%0d%0abcc%3aevil@evil.com" would pass a looser whitelist (every
// individual character is otherwise allowed) yet a mail client
// percent-decoding the URI could read %0d%0a/%3a as literal CRLF/":",
// enabling mailto header injection (e.g. an injected Bcc:). Removing "%"
// closes that, and closes "query/header injection" generally, since none
// of ?, &, :, <, >, " are in either allowed character class either.
const EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isSafeEmail(email) {
  if (typeof email !== 'string' || email.length === 0) return false;
  // Explicit, unanchored whitespace/CR/LF scan: JS regex `$` (no `m` flag)
  // matches immediately before a *trailing* "\n", so an anchored-only
  // pattern could wrongly accept "good@example.com\n". This check closes
  // that gap regardless of anchor semantics.
  if (/[\s\r\n]/.test(email)) return false;
  return EMAIL_RE.test(email);
}

// hostGroup restricts each field to hosts matching its own stated
// purpose (not "any HTTPS URL") — e.g. a GitHub field only ever accepts
// github.com, so a mistaken or malicious non-GitHub URL can't silently
// render as if it were the real profile link.
const ALLOWED_EXTERNAL_HOSTS = {
  github: ['github.com', 'www.github.com'],
  linkedin: ['linkedin.com', 'www.linkedin.com'],
};

export function isSafeExternalUrl(url, hostGroup) {
  if (typeof url !== 'string') return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  return (ALLOWED_EXTERNAL_HOSTS[hostGroup] ?? []).includes(
    parsed.hostname.toLowerCase(),
  );
}

// PF-060 — each case-study route may link to at most one approved external
// production site. Keyed by route.content (never a content-supplied
// value), so a content edit alone can never grant itself a new allowed
// host — only a code change here can. Empty until a case study has an
// approved public URL; PF-061/062 add their own entry only when one exists.
const CASE_STUDY_EXTERNAL_HOSTS = {
  'work-fes-challenger': ['feschallenger.com', 'www.feschallenger.com'],
};

export function isSafeCaseStudyExternalUrl(url, contentKey) {
  if (typeof url !== 'string') return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  return (CASE_STUDY_EXTERNAL_HOSTS[contentKey] ?? []).includes(
    parsed.hostname.toLowerCase(),
  );
}
