# Contact form operational runbook

## Current status

**Implemented and disabled; not yet operationally enabled.**

The repository contains the Contact form renderer, browser enhancement,
Cloudflare Pages Function at `/api/contact`, and replaceable Resend adapter.
`site.contactForm.enabled` is `false`, and the Function separately requires
`CONTACT_FORM_ENABLED` to equal `true`. Neither switch enables the other.
Direct Email, GitHub, and LinkedIn methods remain public while the form is off.

The compact V1 footer intentionally has no public Privacy link while the form
is disabled. **Neither `site.contactForm.enabled` nor `CONTACT_FORM_ENABLED` may
be enabled until a clearly discoverable Privacy link is restored to the public
interface and the approved Contact Privacy copy is published.** Runtime
configuration cannot waive or override this prerequisite. PF-072 owns the final
coordinated Privacy/Contact deployment gate.

Do not make either switch public until every setup and verification gate below
has passed. Repository tests do not create, inspect, or prove a Cloudflare WAF
rule and do not send a real message through Resend.

## Two-gate enablement model

The build/source and runtime gates are independent:

| `site.contactForm.enabled` | `CONTACT_FORM_ENABLED` plus valid runtime configuration | Result                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `false`                    | missing/disabled                                        | No form markup or Contact initializer; valid direct POST returns generic `503` before Resend                                                                            |
| `false`                    | enabled/complete                                        | No form markup or Contact initializer; runtime configuration alone cannot make static markup appear, though a separately issued valid direct POST can reach the adapter |
| `true`                     | missing/disabled                                        | Form markup is built, but submission returns generic `503` and makes no Resend request                                                                                  |
| `true`                     | enabled/complete                                        | Form markup is built and an accepted request may make the single provider-adapter request                                                                               |

Public enablement therefore requires both an intentional reviewed source change
and complete deployed runtime configuration. Keep both gates disabled until the
WAF, delivery, Reply-To, retention, Privacy, and browser/network gates pass.

## 1. Choose the Cloudflare-managed hostname

Record one exact hostname as `<CONTACT_HOSTNAME>`. It must be a Pages custom
domain or other proxied hostname managed inside AAA's own Cloudflare zone. Use
that hostname for the Contact page and `/api/contact` endpoint.

Do not assume a generic `*.pages.dev` preview hostname is protected by a WAF
rule created in AAA's zone. That hostname is not AAA's zone hostname. If AAA
needs protected preview testing, first create and proxy a dedicated staging
hostname such as `staging.<AAA_ZONE>` in the same Cloudflare zone, attach it to
the Pages preview/staging deployment, and use that hostname for the test.

## 2. Create the required WAF rate-limiting rule

In the Cloudflare dashboard:

1. Select the zone that owns `<CONTACT_HOSTNAME>` and confirm the chosen
   hostname is active and proxied through Cloudflare.
2. Go to **Security > Security rules**.
3. Select **Create rule > Rate limiting rules**.
4. Set **Rule name** to `Contact endpoint - 5 requests per 10 seconds`.
5. Under **When incoming requests match**, choose **URI Path**, **equals**, and
   `/api/contact`. Confirm the expression editor shows exactly:

   ```text
   http.request.uri.path eq "/api/contact"
   ```

6. Use **IP** as the counting characteristic.
7. Set **When rate exceeds** to **5 requests** per **10 seconds**.
8. Set **Then take action** to **Block** for **10 seconds**. Ensure the blocked
   network response is HTTP `429`; if the dashboard offers a custom response,
   explicitly select status `429` with a generic body.
9. Save/deploy the rule and record the Cloudflare zone, exact hostname, rule
   name, rule ID if shown, settings, and activation time.

Cloudflare's current Free-plan matrix exposes Path—but not Host or Method—as a
rate-limiting rule-expression field, with a 10-second counting period, IP
counting, one rule, and a 10-second mitigation period. Consequently, on Free,
the zone-level rule can count **every HTTP method** sent to `/api/contact`, and
the same exact path on another hostname in that zone may also match. The Pages
Function still independently returns `405` for every non-POST method.

References:

- [Cloudflare rate-limiting availability and plan limits](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Cloudflare dashboard rule procedure](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/)
- [Cloudflare rate-limiting parameters](https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/)

## 3. Test WAF blocking as an operational network check

Keep the public form renderer disabled during this check. Against
`https://<CONTACT_HOSTNAME>/api/contact`:

1. Open browser developer tools' Network panel, preserve the log, and make six
   rapid requests within 10 seconds. GET requests are suitable for a no-email
   WAF probe because the Function itself returns `405`; on the Free plan they
   still count for this path.
2. Confirm the first five requests reach the Function and return `405` with
   `Allow: POST`.
3. Confirm the next request is blocked at Cloudflare with HTTP `429`. Inspect
   Cloudflare response evidence such as the response headers/event log; do not
   infer WAF enforcement from application copy alone.
4. Confirm a different path is not rate-limited by this rule.
5. After the 10-second mitigation duration, confirm `/api/contact` reaches the
   Function and returns `405` again.
6. Repeat the relevant check on the exact production hostname before public
   enablement. If preview protection is required, separately confirm it on the
   Cloudflare-managed staging hostname—not on a generic `*.pages.dev` URL.

Record this as a browser/network and Cloudflare-dashboard check. Never describe
repository unit tests as proof that the external WAF is deployed or active.

## 4. Configure Resend and Cloudflare Pages runtime values

In Resend, add AAA's sending domain, publish the required DNS records, wait for
the sender/domain to show verified, and create a restricted API key for this
site. Use a plain mailbox address on the verified domain for the sender.

In each intended Cloudflare Pages environment, add these dashboard-owned
runtime values; do not add them to source, `.env` files, build output, logs, or
test fixtures containing real secrets:

| Name                   | Required value                                             |
| ---------------------- | ---------------------------------------------------------- |
| `CONTACT_FORM_ENABLED` | Keep `false`/unset until the final enablement deployment   |
| `RESEND_API_KEY`       | Resend API key (secret)                                    |
| `CONTACT_FROM_EMAIL`   | Plain sender mailbox on the verified Resend sending domain |
| `CONTACT_TO_EMAIL`     | AAA's destination mailbox                                  |

For local Function work, copy `.dev.vars.example` to the ignored `.dev.vars`
file and fill values only in that ignored file. Environment-specific
`.dev.vars.*` files are also ignored; `.dev.vars.example` remains trackable and
contains empty assignments only.

Missing, disabled, malformed, or CR/LF-containing runtime configuration returns
a generic `503` before the adapter can make any provider request.

When a request carries an `Origin` header, the Function requires it to match
the request URL's origin. Requests without `Origin` remain eligible for
non-browser/no-JavaScript clients. Origin checking is defense in depth, not the
sole abuse safeguard: POST-only handling, body and field validation, honeypot,
and the external WAF prerequisite remain independent.

The Resend adapter makes exactly one fetch with an 8-second platform-native
abort timeout. A timeout, abort, provider rejection, or ambiguous network
outcome returns the same generic recoverable `503`; none triggers a second send
or exposes provider details. Logs contain only fixed result categories and a
provider status category (`4xx`, `5xx`, or `other`)—never submission values,
raw bodies/IPs, configured addresses, or secrets.

## 5. Real delivery and enablement gate

On the protected Cloudflare-zone hostname, and before setting
`site.contactForm.enabled` to `true` for production:

1. Set up Resend and verify the sending domain and sender.
2. Configure the Pages runtime values while keeping public rendering disabled.
3. Exercise a valid direct POST and confirm one real message arrives with the
   expected plain-text and safe-HTML content.
4. Reply to that email and confirm Reply-To targets the visitor address—not the
   sender or destination mailbox.
5. Confirm malformed, oversized, wrong-content-type, unknown-field,
   honeypot, and non-POST behavior without exposing submitted data.
6. Confirm the WAF rule is active and its `429` blocking/recovery behavior has
   passed on the exact hostname.
7. Verify the actual provider/account retention and deletion facts before
   publishing Privacy copy. Do not invent a fixed retention period.
8. Obtain AAA's production enablement and Privacy approval.
9. Publish the approved Privacy replacement, restore a clearly discoverable
   public Privacy link, and set `site.contactForm.enabled` to `true` in the same
   approved release. Set the runtime `CONTACT_FORM_ENABLED` value to `true` only
   in the environment being enabled. Runtime configuration cannot substitute
   for the restored public link or published copy.
10. Repeat keyboard, screen-reader, JavaScript-disabled, responsive, and
    network checks on the deployed production hostname.

The portfolio does not store submissions in KV, D1, Durable Objects, or an
application database. Resend delivery is attempted once per accepted request;
there is no automatic application retry and delivery is not guaranteed.

Production enablement is prohibited until AAA observes the expected external
WAF `429` response on the exact proxied production hostname. Repository tests
prove only that the client handles an HTTP `429`; they do not prove that a WAF
rule exists, matches, blocks, or has been tested.

PF-064 remains open. PF-072 continues to own broader Cloudflare deployment,
environment, domain, CSP, validation, and rollback work.
