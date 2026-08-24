// Generates the static multi-page site (English + Russian, one page per topic)
// from content.js. Run with `npm run build` whenever content.js changes.
const fs = require("fs");
const path = require("path");
const { SITE_URL, TOPICS } = require("./content.js");

const PUBLIC_DIR = path.join(__dirname, "public");
const RU_DIR = path.join(PUBLIC_DIR, "ru");

const SITE_TITLES = { en: `Math Practice`, ru: `Практика по математике` };
const SITE_SUBTITLES = {
  en: `Learn the idea, then practice it.`,
  ru: `Изучи идею — затем закрепи её на практике.`,
};
const HOME_INTRO = {
  en: `Pick a topic below to learn the idea, then practice it with instant feedback.`,
  ru: `Выберите тему ниже, чтобы изучить идею, а затем отработать её с мгновенной проверкой ответов.`,
};
const HOME_META_DESCRIPTION = {
  en: `Simple, step-by-step math explanations and practice problems: arithmetic, algebra, quadratic equations, and more.`,
  ru: `Простые, пошаговые объяснения математики и практические задачи: арифметика, алгебра, квадратные уравнения и многое другое.`,
};
const FOOTER_TEXT = {
  en: `Practice runs entirely in your browser — no account, no server storage.`,
  ru: `Практика полностью работает в вашем браузере — без аккаунта и без хранения данных на сервере.`,
};
const NEW_PROBLEMS_LABEL = { en: `New Problems`, ru: `Новые примеры` };

function pagePath(lang, slug) {
  if (lang === "en") return slug ? `/${slug}` : `/`;
  return slug ? `/ru/${slug}` : `/ru/`;
}

function headHtml(lang, slug, title, description) {
  const canonical = `${SITE_URL}${pagePath(lang, slug)}`;
  const enHref = `${SITE_URL}${pagePath("en", slug)}`;
  const ruHref = `${SITE_URL}${pagePath("ru", slug)}`;
  const siteName = SITE_TITLES[lang];
  const ogLocale = lang === "ru" ? "ru_RU" : "en_US";
  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${enHref}" />
  <link rel="alternate" hreflang="ru" href="${ruHref}" />
  <link rel="alternate" hreflang="x-default" href="${enHref}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/styles.css" />
  <meta name="application-name" content="${siteName}" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:locale" content="${ogLocale}" />`;
}

function sidebarHtml(lang, currentSlug) {
  const items = TOPICS.map((t) => {
    const label = t[lang].navLabel;
    const href = pagePath(lang, t.slug);
    const active = t.slug === currentSlug ? " active" : "";
    return `        <a class="tab-btn${active}" href="${href}">${label}</a>`;
  }).join("\n");

  return `    <aside class="sidebar">
      <div class="sidebar-header">
        <h1><a class="site-title" href="${pagePath(lang, "")}">${SITE_TITLES[lang]}</a></h1>
        <p class="subtitle">${SITE_SUBTITLES[lang]}</p>
        <div class="lang-switch">
          <a class="lang-link${lang === "en" ? " active" : ""}" href="${pagePath("en", currentSlug)}">EN</a>
          <a class="lang-link${lang === "ru" ? " active" : ""}" href="${pagePath("ru", currentSlug)}">RU</a>
        </div>
      </div>
      <nav class="topic-nav">
${items}
      </nav>
    </aside>`;
}

function stepsHtml(steps) {
  return steps
    .map((s) => {
      if (s.type === "note") return `            <p class="steps-note">${s.text}</p>`;
      if (s.type === "result") return `            <p class="steps-result">${s.text}</p>`;
      return `            <p>${s.text}</p>`;
    })
    .join("\n");
}

function explanationSectionHtml(entry, sectionTitle) {
  const titleHtml = sectionTitle ? `          <h3 class="section-title">${sectionTitle}</h3>\n` : "";
  return `        <div class="explanation">
${titleHtml}          <p class="hook">${entry.hookHtml}</p>
          <p>${entry.ruleHtml}</p>
          <p class="one-liner">${entry.oneLinerHtml}</p>
          <div class="steps">
${stepsHtml(entry.steps)}
          </div>
          <p class="trap">${entry.trapHtml}</p>
          <p class="why-it-matters">${entry.whyItMattersHtml}</p>
        </div>`;
}

function topicPageHtml(lang, topic) {
  const t = topic[lang];
  const hintBlock = t.hintHtml ? `\n          <p class="hint">${t.hintHtml}</p>` : "";
  const primaryTitle = t.secondary ? t.title : null;
  let explanationHtml = explanationSectionHtml(t, primaryTitle);
  if (t.secondary) {
    explanationHtml += `\n\n` + explanationSectionHtml(t.secondary, t.secondary.title);
  }

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  ${headHtml(lang, topic.slug, t.pageTitle, t.metaDescription)}
</head>
<body data-topic="${topic.slug}">
  <div class="app">
${sidebarHtml(lang, topic.slug)}

    <main class="content">
      <section class="topic active">
        <h2>${t.h1}</h2>
${explanationHtml}

        <div class="practice" data-practice="${topic.slug}">
          <div class="practice-controls">
            <button class="generate-btn" data-topic="${topic.slug}">${NEW_PROBLEMS_LABEL[lang]}</button>
            <span class="score"></span>
          </div>
          <div class="problem-list"></div>${hintBlock}
        </div>
      </section>

      <footer>
        <p>${FOOTER_TEXT[lang]}</p>
      </footer>
    </main>
  </div>

  <script src="/script.js"></script>
</body>
</html>
`;
}

function homePageHtml(lang) {
  const title = `${SITE_TITLES[lang]}${lang === "en" ? " — Learn Math Step by Step" : " — изучай математику шаг за шагом"}`;
  const links = TOPICS.map((t) => {
    const tt = t[lang];
    return `          <li><a href="${pagePath(lang, t.slug)}">${tt.navLabel}</a></li>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  ${headHtml(lang, "", title, HOME_META_DESCRIPTION[lang])}
</head>
<body data-topic="">
  <div class="app">
${sidebarHtml(lang, "")}

    <main class="content">
      <section class="topic active">
        <h2>${SITE_TITLES[lang]}</h2>
        <p class="home-intro">${HOME_INTRO[lang]}</p>
        <ul class="topic-list">
${links}
        </ul>
      </section>

      <footer>
        <p>${FOOTER_TEXT[lang]}</p>
      </footer>
    </main>
  </div>
</body>
</html>
`;
}

function sitemapXml() {
  const slugs = ["", ...TOPICS.map((t) => t.slug)];
  const entries = slugs
    .map((slug) => {
      const enHref = `${SITE_URL}${pagePath("en", slug)}`;
      const ruHref = `${SITE_URL}${pagePath("ru", slug)}`;
      const altLinks = `    <xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${ruHref}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}"/>`;
      return `  <url>
    <loc>${enHref}</loc>
${altLinks}
  </url>
  <url>
    <loc>${ruHref}</loc>
${altLinks}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function build() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(RU_DIR, { recursive: true });

  TOPICS.forEach((topic) => {
    fs.writeFileSync(path.join(PUBLIC_DIR, `${topic.slug}.html`), topicPageHtml("en", topic));
    fs.writeFileSync(path.join(RU_DIR, `${topic.slug}.html`), topicPageHtml("ru", topic));
  });

  fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), homePageHtml("en"));
  fs.writeFileSync(path.join(RU_DIR, "index.html"), homePageHtml("ru"));

  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml());
  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robotsTxt());

  console.log(`Built ${TOPICS.length} topics x 2 languages + 2 home pages + sitemap.xml + robots.txt`);
}

build();
