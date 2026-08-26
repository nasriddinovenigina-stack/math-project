# Math Practice site — project reference

Read this file first, before asking the user anything about "where does this live" or "how is it deployed." It answers those questions.

## What this is

A static bilingual (English/Russian) math practice website for grades 5–9. Each topic page has a short slideshow explanation (hook → rule → worked example → common mistake → why it matters) plus auto-generated practice problems with instant answer checking. No backend, no accounts, no database — everything runs in the browser.

## Where the code lives

- **GitHub repo:** https://github.com/nasriddinovenigina-stack/math-project (branch: `master`)
- **GitHub CLI (`gh`) is already authenticated** on this machine as `nasriddinovenigina-stack` — `git push` / `git clone` over HTTPS should just work without any login prompt. If it doesn't, run `gh auth status` to check.
- There is no permanent local clone — clone fresh into the scratchpad each session:
  `git clone https://github.com/nasriddinovenigina-stack/math-project.git`

## Where it's deployed

- **Live site:** https://mathpracticehub.netlify.app
- **Netlify project name:** `mathpracticehub` (owner team: `nasriddinovenigina-stack`, in the Netlify account logged in via email **nasriddinovenigina@gmail.com** — email+password login, NOT Google/GitHub OAuth on Netlify. The user knows this password; I don't.)
- Netlify **auto-deploys on every push to `master`** via the Netlify GitHub App installed on this repo (visible under github.com/nasriddinovenigina-stack/math-project/settings/installations). A push is usually live within ~10–30 seconds.
- **`netlify.toml`** sets `publish = "public"` and has **no build command** — Netlify just serves whatever is already committed in `public/`. This means:
  ⚠️ **You must run `node build.js` locally and commit the regenerated `public/` files before pushing.** Editing `content.js` or `public/script.js` alone does nothing to the live site until you rebuild.

### Dead domain — do not use

`mathpractise.netlify.app` (note: **-practise-**, with an "s") is an **old, orphaned deployment of this same project**. Its Netlify account is lost — we tried GitHub OAuth, Google OAuth (both `nasriddinovenigina@gmail.com` and `zuhraisokova@gmail.com`), and email/password reset; none of them own it. It still exists and still serves stale content, but nobody can update it anymore. **Never link to it, reference it, or assume it's the live site.** The current live domain is `mathpracticehub.netlify.app`.

## Site architecture

- **`content.js`** — the single source of truth for all topic content. Exports `{ SITE_URL, TOPICS }`. `TOPICS` is an array; each entry has `slug`, `grade` (5–9), and `en`/`ru` objects with `navLabel`, `pageTitle`, `metaDescription`, `h1`, `hookHtml`, `ruleHtml`, `oneLinerHtml`, `steps[]` (`{type: "plain"|"note"|"result", text}`), `trapHtml`, `whyItMattersHtml`, `hintHtml`, and an optional `secondary: {...}` block for a second explanation section (e.g. "Subtracting Fractions" alongside "Adding Fractions"). Style: real-world word-problem hooks, often using Uzbek `so'm` currency and local context (bazaar, samsa, etc.) — keep new topics consistent with that tone.
- **`build.js`** — reads `content.js` and generates the entire static site into `public/`: one HTML page per topic per language (`public/<slug>.html` and `public/ru/<slug>.html`), both `index.html` files, `sitemap.xml`, and `robots.txt`. Also has a `TOPIC_ICONS` map (slug → emoji) that **must have an entry for every slug** or the nav icon is blank. Run with `node build.js` (no npm install needed for this step).
- **`public/script.js`** — client-side logic for the interactive practice problems. Has a `GENERATORS` map (slug → function) at the bottom; each generator function returns 5 problem objects `{ question, checkAnswer(rawInput) -> boolean, correctAnswerText }`. **Every slug in `content.js` needs a matching entry in `GENERATORS` or the practice section on that page silently does nothing.** Reuse the helpers already defined near the top of the file: `randInt`, `nonZeroRandInt`, `gcd`, `getLang()`, `fractionCheckAnswer(num, den)`, `fractionAnswerText(num, den)`.
- **`server.js`** — trivial local dev server (Express) for previewing with `node server.js` → http://localhost:3000. Not used in production (Netlify serves `public/` directly).

## Adding or editing a topic — checklist

1. Add/edit the entry in `content.js` (both `en` and `ru`).
2. Add an icon in `build.js`'s `TOPIC_ICONS`.
3. Add a generator function + `GENERATORS` map entry in `public/script.js`.
4. Run `node build.js` to regenerate `public/`.
5. Sanity-check: `node --check public/script.js`, and ideally stress-test new generators headlessly (load `script.js` in a Node `eval` with a stubbed `document`, call the generator N times, assert `checkAnswer(correctAnswerText)` is true for every problem — this caught a real bug once, see git history "Add 10 new topics" commit).
6. `git add -A && git commit -m "..." && git push origin master` — Netlify deploys automatically.
7. Verify live: `curl -s https://mathpracticehub.netlify.app/<slug> | grep '<title>'`.

## SEO / Google Search Console

- Search Console property `https://mathpracticehub.netlify.app` is added and verified (under the `nasriddinovenigina@gmail.com` Google account), with `sitemap.xml` submitted.
- Manual "Request Indexing" has a **very small daily quota on this account** that gets exhausted almost immediately — don't rely on it or spam it. The sitemap submission alone is enough; Google crawls it on its own schedule (days, not minutes).
- `public/google9a9e1bb721361d09.html` and `public/yandex_6d5beeb915a5c6bf.html` are search-engine ownership-verification files **for the old dead domain** — harmless to keep, not meaningful for the new domain.

## History / context worth knowing

- The site was originally built and deployed by the user, then the Netlify login for it was lost (see "Dead domain" above). On 2026-08-25/26 we recovered by pushing the existing GitHub repo to a **brand-new** Netlify site (`mathpracticehub`, formerly briefly named `mathpractise-uz`) under the `nasriddinovenigina@gmail.com` Netlify account, which the user *can* log into.
- Topics 1–30 (arithmetic through absolute-value) are the original set. Topics 31–40 (rounding, prime-factorization, multiplying-fractions, unit-rate, simple-interest, surface-area, angles, foil, distance-formula, trigonometry) were added afterward, grades 5–9 spread, no overlap with existing topics.
