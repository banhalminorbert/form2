# G.O.A.T — Go-Live Checklist

This repository contains a **static, security-first, multilingual website** for
G.O.A.T (Guardians Of All Territories). It is currently in **staging**: indexing
is suppressed and several values are deliberate placeholders.

Do **not** publish until every item below is completed and a final legal review
has been obtained.

---

## 1. Critical replacements

Search-and-replace across the whole project:

- [ ] `www.example.com` → your verified production domain (appears in canonical
      tags, hreflang, Open Graph, JSON-LD, sitemap, robots, security.txt).
- [ ] `inquiries@example.com` and `inquiries@[verified-domain]` → your verified
      inquiry email. **Do not use a personal Gmail address publicly.**
- [ ] `security@[verified-domain]` (in `security.txt` and
      `.well-known/security.txt`) → your verified security contact.

Quick check after replacing:

```
grep -rn "example.com\|\[verified-domain\]" .
```

This should return **no results** before go-live.

## 2. Legal & business data (legal/ pages — EN, DE, AR)

Verify and complete every `placeholder` span:

- [ ] Managing director name
- [ ] Commercial register court (Amtsgericht) and number (HRB …)
- [ ] VAT identification number (USt-IdNr.)
- [ ] § 34a GewO security trade permit details + issuing authority
- [ ] Competent supervisory authority
- [ ] Professional liability insurer + geographic scope of cover
- [ ] Responsible person for content (§ 18(2) MStV)
- [ ] Telephone number (only if you choose to publish one)

## 3. Privacy policy (privacy/ pages — EN, DE, AR)

- [ ] Confirm controller details and managing director
- [ ] Confirm competent data protection supervisory authority (e.g. BayLDA)
- [ ] Confirm hosting provider and complete a data processing agreement
- [ ] Confirm retention periods reflect actual practice
- [ ] Re-confirm the "no cookies / no analytics / no trackers" statement is true
      after any future changes

## 4. Indexing: staging → production

- [ ] Remove `<meta name="robots" content="noindex,nofollow">` from **every**
      HTML page (root, en, ar, de, hu, all legal/ and privacy/ pages, 404.html).
- [ ] In `robots.txt`, disable the STAGING block and enable the PRODUCTION block
      (including the `Sitemap:` line).

Check for any remaining noindex tags:

```
grep -rn "noindex" .
```

## 5. Hosting (GitHub Pages)

- [ ] Push to a **public-safe** repository (see section 7).
- [ ] Configure the custom domain in repository settings.
- [ ] Confirm the `CNAME` is set (GitHub Pages) for the custom domain.
- [ ] Enforce **HTTPS**.
- [ ] Confirm `.nojekyll` is present (it is, in the repo root).
- [ ] Confirm `/.well-known/security.txt` is reachable in production.

## 6. SEO / discovery

- [ ] Validate all JSON-LD with the Schema Markup Validator and Google Rich
      Results Test.
- [ ] Submit `sitemap.xml` in Google Search Console.
- [ ] Submit the site in Bing Webmaster Tools.
- [ ] Confirm hreflang reciprocity (en/ar/de/hu + x-default) resolves correctly.
- [ ] Update `Expires` in `security.txt` if needed.

## 7. Repository history hygiene (security-critical)

This public repo must contain **public-safe website code only**. Never commit:

- [ ] Certificates or redacted certificates
- [ ] Reference letters
- [ ] Founder portrait or any private photos
- [ ] Client names or any client-identifying material
- [ ] Personal documents / CVs
- [ ] EXIF-rich images
- [ ] Draft confidential notes
- [ ] Private contact databases
- [ ] Anything dangerous if exposed in git history

The private credentials pack is handled **separately** and must never enter this
repository. If any sensitive file was ever committed, treat the history as
compromised and create a fresh repository.

## 8. Language quality

- [ ] Arabic native review (MSA, tone, RTL rendering, numerals)
- [ ] German legal-tone review
- [ ] Confirm Hungarian remains secondary (footer/gateway only, not primary nav)

## 9. Final legal review

- [ ] Have qualified counsel in the relevant jurisdiction(s) review the legal
      notice, privacy policy and all service wording before publishing.

---

## File structure

```
/
  index.html                 x-default language gateway
  /en/index.html             English (canonical content)
  /ar/index.html             Arabic (RTL)
  /de/index.html             German
  /hu/index.html             Hungarian (secondary)
  /legal/index.html          Legal notice (EN)
  /legal/de/index.html       Impressum (DE)
  /legal/ar/index.html       Legal notice (AR)
  /privacy/index.html        Privacy notice (EN)
  /privacy/de/index.html     Datenschutz (DE)
  /privacy/ar/index.html     Privacy notice (AR)
  /assets/style.css          Shared stylesheet (incl. RTL)
  /assets/script.js          Minimal JS (nav toggle, scroll reveal)
  /assets/goat-mark.svg      Abstract monogram
  /assets/hero-bg.svg        Abstract route-arc hero background
  /assets/og-image.svg       Social share card
  sitemap.xml
  robots.txt
  llms.txt
  humans.txt
  security.txt               (also copied to /.well-known/security.txt)
  404.html
  .nojekyll
  README_GO_LIVE.md
```

## Design & privacy notes

- No frameworks, no external fonts, no cookies, no analytics, no trackers, no
  embedded maps, no chat widgets.
- System font stacks only; SVG graphics; minimal JavaScript.
- Discretion is intentional and presented as a trust feature: no client names,
  no team photos, no certificates, no operational detail are published.
