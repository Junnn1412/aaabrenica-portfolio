# Proposed Contact-form Privacy copy (unpublished draft)

## Publication status

Do not copy this text into `src/content/pages/privacy.js` yet. The existing
no-form Privacy statements remain accurate while `site.contactForm.enabled` is
`false`.

Publish a reviewed replacement only after all six gates pass:

1. Resend is configured.
2. The sending domain and sender are verified.
3. Real message delivery and Reply-To behavior pass.
4. The exact-hostname Cloudflare WAF rate-limiting rule is confirmed active and
   its blocking behavior is tested.
5. Provider/account retention and deletion facts are verified.
6. AAA approves the form and Privacy copy for production enablement.

## Proposed replacement paragraphs

> The current site code does not include analytics or advertising trackers.
>
> The current site code does not set nonessential cookies.
>
> If you submit the contact form, the site collects the name, email address,
> optional company or organization, and message that you provide so the inquiry
> can be reviewed and answered.
>
> Contact-form submissions are processed through Cloudflare and Resend for
> message delivery. This portfolio does not store form submissions in an
> application database.
>
> Do not include passwords, access credentials, or other sensitive information
> in your message.
>
> Fonts are served from this site rather than requested from Google Fonts.

Before publication, replace or expand the provider-processing paragraph only
with retention/deletion facts verified in AAA's actual Cloudflare and Resend
accounts and current provider terms. Do not claim fixed retention, guaranteed
deletion, guaranteed delivery, regulatory compliance, or security
certification.
