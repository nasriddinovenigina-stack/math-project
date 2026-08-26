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

There are **two** Netlify sites deploying from this same GitHub repo, under two different Netlify accounts. Both are legitimate and both auto-deploy on push — this isn't a mistake, it's the result of a multi-day saga recovering access. Read both entries below before assuming either one is "the" site.

### mathpractise.netlify.app — the original, real site (has SEO history + real traffic)

- **Netlify project name:** `mathpractise`, team `saidaliotabekovich`, account email **saidaliotabekovich@gmail.com** (Google OAuth login). The user knows this password; I don't.
- This is the site that was actually indexed by Google and getting real organic search traffic before we lost track of the login. It has real history/momentum that `mathpracticehub` (below) does not.
- **⚠️ Deploys here were blocked** starting ~Aug 26, 2026: the Netlify free plan (300 credits/month) ran out after ~20 production deploys, so every push from Aug 26 onward shows as "Skipped due to account credit usage exceeded" — nothing is broken, it's just a billing/quota wall. **Credits reset Sep 9, 2026** (billing period Aug 10 – Sep 9). After that date, push again (or check if queued deploys resume on their own) and this domain will catch up to everything at once.
- If asked to prioritize one domain as "the real site" going forward (SEO, links, etc.), this is it, once deploys resume.

### mathpracticehub.netlify.app — the interim replacement site (fully caught up, deploys fine)

- **Netlify project name:** `mathpracticehub`, team `nasriddinovenigina-stack`, account email **nasriddinovenigina@gmail.com** (email+password login). The user knows this password; I don't.
- Created on 2026-08-25/26 as a fresh deployment when we couldn't yet find the `mathpractise` account above. Has zero SEO history of its own, but deploys normally (no credit issues) and is fully up to date with every change made in this repo.
- Has its own Google Search Console property (verified) and submitted sitemap — see SEO section below.

**Both** projects auto-deploy on every push to `master` via the Netlify GitHub App installed on this repo (visible under github.com/nasriddinovenigina-stack/math-project/settings/installations) — so a normal `git push` updates `mathpracticehub` immediately and queues up for `mathpractise` (deploying once its credits allow).

- **`netlify.toml`** sets `publish = "public"` and has **no build command** — Netlify just serves whatever is already committed in `public/`. This means:
  ⚠️ **You must run `node build.js` locally and commit the regenerated `public/` files before pushing.** Editing `content.js` or `public/script.js` alone does nothing to either live site until you rebuild.

## Site architecture

- **`content.js`** — the single source of truth for all topic content. Exports `{ SITE_URL, TOPICS }`. `TOPICS` is an array; each entry has `slug`, `grade` (5–9), and `en`/`ru` objects with `navLabel`, `pageTitle`, `metaDescription`, `h1`, `hookHtml`, `ruleHtml`, `oneLinerHtml`, `steps[]` (`{type: "plain"|"note"|"result", text}`), `trapHtml`, `whyItMattersHtml`, `hintHtml`. For explanation content, a topic normally has ONE section (the fields above, directly on `en`/`ru`), optionally plus a `secondary: {...}` block for a second section (e.g. "Subtracting Fractions" alongside "Adding Fractions"). A topic needing **3+ full sections** (e.g. Fractions covers Adding/Subtracting/Multiplying/Dividing) instead sets `sections: [{title, hookHtml, ruleHtml, ...}, ...]` — build.js renders however many entries are in that array. There's also a `frac(num, den)` helper (top of content.js) that renders a stacked numerator/denominator `<span>` instead of plain "3/5" text — use it for any fraction shown in explanation content. Style: real-world word-problem hooks, often using Uzbek `so'm` currency and local context (bazaar, samsa, etc.) — keep new topics consistent with that tone.
- **`build.js`** — reads `content.js` and generates the entire static site into `public/`: one HTML page per topic per language (`public/<slug>.html` and `public/ru/<slug>.html`), both `index.html` files, `sitemap.xml`, and `robots.txt`. Also has a `TOPIC_ICONS` map (slug → emoji) that **must have an entry for every slug** or the nav icon is blank. Run with `node build.js` (no npm install needed for this step).
- **`public/script.js`** — client-side logic for the interactive practice problems. Has a `GENERATORS` map (slug → function) at the bottom; each generator function returns 5 problem objects `{ question, checkAnswer(rawInput) -> boolean, correctAnswerText }`. **Every slug in `content.js` needs a matching entry in `GENERATORS` or the practice section on that page silently does nothing.** Reuse the helpers already defined near the top of the file: `randInt`, `nonZeroRandInt`, `gcd`, `getLang()`, `fractionCheckAnswer(num, den)`, `fractionAnswerText(num, den)`.
- **`server.js`** — trivial local dev server (Express) for previewing with `node server.js` → http://localhost:3000. Not used in production (Netlify serves `public/` directly).

## Adding or editing a topic — checklist

1. Add/edit the entry in `content.js` (both `en` and `ru`).
2. Add an icon in `build.js`'s `TOPIC_ICONS`.
3. Add a generator function + `GENERATORS` map entry in `public/script.js`.
4. Run `node build.js` to regenerate `public/`.
5. Sanity-check: `node --check public/script.js`, and ideally stress-test new generators headlessly (load `script.js` in a Node `eval` with a stubbed `document`, call the generator N times, assert `checkAnswer(correctAnswerText)` is true for every problem — this caught a real bug once, see git history "Add 10 new topics" commit).
6. `git add -A && git commit -m "..." && git push origin master` — both Netlify sites deploy automatically (`mathpracticehub` immediately; `mathpractise` too, once/if its credits allow — see deployment section above).
7. Verify live: `curl -s https://mathpracticehub.netlify.app/<slug> | grep '<title>'` (this one always reflects the latest push; `mathpractise.netlify.app` may lag if it's credit-blocked).
8. There's also a `public/_redirects` file (Netlify redirects syntax, `from to status` per line) — it's hand-maintained, NOT generated by `build.js`, so it survives rebuilds untouched. Currently redirects the old `/multiplying-fractions` URL (from before Fractions absorbed it) to `/fractions`. Add a line here whenever a topic slug changes or gets merged/removed, so old links/bookmarks don't just 404.

## SEO / Google Search Console

- Search Console property `https://mathpracticehub.netlify.app` is added and verified (under the `nasriddinovenigina@gmail.com` Google account), with `sitemap.xml` submitted.
- Manual "Request Indexing" has a **very small daily quota on this account** that gets exhausted almost immediately — don't rely on it or spam it. The sitemap submission alone is enough; Google crawls it on its own schedule (days, not minutes).
- `public/google9a9e1bb721361d09.html` and `public/yandex_6d5beeb915a5c6bf.html` are search-engine ownership-verification files for `mathpractise.netlify.app` (the original domain, see above) — still relevant now that we have that account back, not meaningless.
- No Search Console property has been set up yet for `mathpractise.netlify.app` itself under the `saidaliotabekovich@gmail.com` account — worth doing once its deploys resume, so both domains are tracked.

## History / context worth knowing

- The site was originally built and deployed by the user under **saidaliotabekovich@gmail.com** (Netlify project `mathpractise`, domain `mathpractise.netlify.app`), which had real Google search traffic. Login access to that account was lost for a while.
- On 2026-08-25/26, unable to find that login, we deployed a **replacement** site (`mathpracticehub`, briefly named `mathpractise-uz` first) under the `nasriddinovenigina@gmail.com` Netlify account as a working stand-in.
- On 2026-08-27, the original `saidaliotabekovich@gmail.com` account was recovered. Turned out `mathpractise.netlify.app` was never actually orphaned — it was still connected to this GitHub repo the whole time, just silently failing to deploy because its free-tier Netlify credits (300/month) ran out after ~20 deploys. Credits reset **Sep 9, 2026**; after that, a push will let it catch up to everything built in the meantime. Until then, `mathpracticehub.netlify.app` remains the fully-up-to-date site to point people at.
- The site now has 44 topics (was 30 originally). Added since: rounding, prime-factorization, unit-rate, simple-interest, surface-area, angles, foil, distance-formula, trigonometry, long-division, divisibility-rules, comparing-fractions-decimals, fraction-decimal-percent, unit-conversion. "Multiplying & Dividing Fractions" was added as its own topic, then later merged into the "Fractions" topic (which now covers all 4 operations via `sections: [...]`) — see `public/_redirects`.
