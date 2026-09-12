// Generates the static multi-page site (English + Russian, one page per topic)
// from content.js. Run with `npm run build` whenever content.js changes.
const fs = require("fs");
const path = require("path");
const { SITE_URL, TOPICS } = require("./content.js");

const PUBLIC_DIR = path.join(__dirname, "public");
const RU_DIR = path.join(PUBLIC_DIR, "ru");

const DISPLAY_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
// This codebase is deployed to two live domains at once (see CLAUDE.md), each tracked
// under its own separate GA4 property. Which one a visitor's pageview counts toward is
// decided at runtime by hostname (see the inline script in headHtml below), not at build
// time, since both domains serve the exact same built files.
const GA_MEASUREMENT_ID_MATHPRACTISE = "G-VNDQEKH5SK"; // mathpractise.netlify.app (original site)
const GA_MEASUREMENT_ID_MATHPRACTICEHUB = "G-YEQTQFJQ3P"; // mathpracticehub.netlify.app + any other host (e.g. local dev)
// Set this to your AdSense publisher ID (e.g. "pub-1234567890123456") once your AdSense
// application is approved — see the "AdSense" section in CLAUDE.md for the full setup flow.
// Leaving it blank omits the AdSense script/meta tag and ads.txt from the build entirely,
// so it's safe to leave empty until you actually have an ID.
const ADSENSE_PUBLISHER_ID = "";
const SITE_TITLES = { en: `Math Practice`, ru: `Практика по математике` };
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
const PRIVACY_LINK_LABEL = { en: `Privacy Policy`, ru: `Политика конфиденциальности` };
const CONTACT_LINK_LABEL = { en: `Contact Us`, ru: `Связаться с нами` };
const PRIVACY_CONTACT_EMAIL = "saidaliotabekovich@gmail.com";
const CONTACT_META_DESCRIPTION = {
  en: `Get in touch about Math Practice: questions, corrections, or suggestions.`,
  ru: `Свяжитесь с нами по «Практике по математике»: вопросы, исправления или предложения.`,
};
const CONTACT_SECTIONS = {
  en: [
    {
      title: `Questions or feedback`,
      body: `Found a mistake in a topic, have a suggestion for a new topic, or just want to say hello? Email us at <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a> and we'll get back to you.`,
    },
    {
      title: `Privacy questions`,
      body: `For questions about how the site handles information, see our <a href="/privacy">Privacy Policy</a>, or reach out to the same email above.`,
    },
  ],
  ru: [
    {
      title: `Вопросы или отзывы`,
      body: `Нашли ошибку в теме, хотите предложить новую тему или просто хотите поздороваться? Напишите нам на <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a>, и мы вам ответим.`,
    },
    {
      title: `Вопросы о конфиденциальности`,
      body: `По вопросам обработки информации на сайте смотрите нашу <a href="/ru/privacy">Политику конфиденциальности</a> или пишите на тот же адрес выше.`,
    },
  ],
};
const PRIVACY_UPDATED = { en: `Last updated: September 11, 2026`, ru: `Обновлено: 11 сентября 2026 г.` };
const PRIVACY_META_DESCRIPTION = {
  en: `How Math Practice handles information: no accounts, no personal data collection, analytics only.`,
  ru: `Как «Практика по математике» обрабатывает информацию: без аккаунтов, без сбора личных данных, только аналитика.`,
};
const PRIVACY_SECTIONS = {
  en: [
    {
      title: `No accounts, no personal data collected by us`,
      body: `The site has no sign-up, no login, and no server-side database. All the practice problems and answer-checking run entirely in your browser. We do not ask for or store your name, email address, or any other personal information.`,
    },
    {
      title: `Analytics`,
      body: `We use Google Analytics to understand which topics are popular and how the site is used (for example, which pages are visited and roughly how long people spend on them). Google Analytics may use cookies and collect information such as your approximate location (derived from your IP address), browser type, and device type. This data is aggregated and does not identify you personally. You can learn more at Google's <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy &amp; Terms</a> page, and opt out using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a>.`,
    },
    {
      title: `Cookies`,
      body: `The only cookies set on this site are the ones placed by Google Analytics and, if enabled, Google AdSense, as described in this policy. You can block or delete cookies through your browser settings at any time; the site's practice features will continue to work normally without them.`,
    },
    {
      title: `Advertising`,
      body: `This site may show ads through Google AdSense. Google and its advertising partners may use cookies to serve ads based on your visits to this and other websites. You can opt out of personalized advertising through Google's <a href="https://adssettings.google.com" target="_blank" rel="noopener">Ad Settings</a> or at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">aboutads.info</a>.`,
    },
    {
      title: `Children's privacy`,
      body: `This site is designed for students in grades 5&ndash;9 and may be used by children. We do not knowingly collect personal information from anyone, including children &mdash; there are no forms, accounts, or fields anywhere on the site that ask a visitor to enter personal details. If you are a parent or guardian with questions, please contact us using the details below.`,
    },
    {
      title: `Third-party services`,
      body: `Aside from Google Analytics, the site loads fonts from Google Fonts. Loading these fonts may cause your browser to make a request to Google's servers, which can see that the request came from your IP address, as with any resource loaded from a third-party server.`,
    },
    {
      title: `Data security`,
      body: `Because no personal data is collected or stored &mdash; there's no server-side database and no accounts &mdash; there's no personal data on the site to be exposed. All practice progress lives only in your browser's memory during your visit.`,
    },
    {
      title: `Changes to this policy`,
      body: `If this policy changes, the updated version will be posted on this page with a new "last updated" date.`,
    },
    {
      title: `Contact`,
      body: `Questions about this policy can be sent to <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a>.`,
    },
  ],
  ru: [
    {
      title: `Без аккаунтов и без сбора личных данных с нашей стороны`,
      body: `На сайте нет регистрации, входа в систему и серверной базы данных. Все практические задания и проверка ответов выполняются полностью в вашем браузере. Мы не запрашиваем и не храним ваше имя, адрес электронной почты или любую другую личную информацию.`,
    },
    {
      title: `Аналитика`,
      body: `Мы используем Google Analytics, чтобы понимать, какие темы популярны и как используется сайт (например, какие страницы посещаются и сколько времени на них проводят). Google Analytics может использовать файлы cookie и собирать такие данные, как приблизительное местоположение (на основе IP-адреса), тип браузера и тип устройства. Эти данные агрегированы и не позволяют установить вашу личность. Подробнее — на странице Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">«Конфиденциальность и условия»</a>, а отказаться от отслеживания можно с помощью <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">надстройки Google Analytics Opt-out Browser Add-on</a>.`,
    },
    {
      title: `Файлы cookie`,
      body: `Единственные файлы cookie на этом сайте — те, что устанавливает Google Analytics и, если она включена, Google AdSense, как описано в этой политике. Вы можете в любой момент заблокировать или удалить файлы cookie в настройках браузера; практические функции сайта продолжат работать в обычном режиме.`,
    },
    {
      title: `Реклама`,
      body: `На этом сайте может показываться реклама через Google AdSense. Google и его рекламные партнёры могут использовать файлы cookie для показа рекламы на основе ваших посещений этого и других сайтов. Вы можете отказаться от персонализированной рекламы в <a href="https://adssettings.google.com" target="_blank" rel="noopener">настройках рекламы Google</a> или на сайте <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">aboutads.info</a>.`,
    },
    {
      title: `Конфиденциальность детей`,
      body: `Этот сайт предназначен для учащихся 5&ndash;9 классов и может использоваться детьми. Мы сознательно не собираем личную информацию ни от кого, включая детей, — на сайте нет форм, аккаунтов или полей, где посетителю нужно было бы вводить личные данные. Если вы родитель или опекун и у вас есть вопросы, свяжитесь с нами по контактам ниже.`,
    },
    {
      title: `Сторонние сервисы`,
      body: `Помимо Google Analytics, сайт загружает шрифты с Google Fonts. Загрузка этих шрифтов может привести к тому, что ваш браузер отправит запрос на серверы Google, которые увидят, что запрос пришёл с вашего IP-адреса, — как и при загрузке любого ресурса со стороннего сервера.`,
    },
    {
      title: `Безопасность данных`,
      body: `Поскольку личные данные не собираются и не хранятся — серверной базы данных и аккаунтов нет, — на сайте нет личных данных, которые могли бы быть раскрыты. Весь прогресс в практике существует только в памяти вашего браузера во время посещения.`,
    },
    {
      title: `Изменения в этой политике`,
      body: `Если эта политика изменится, обновлённая версия будет опубликована на этой странице с новой датой обновления.`,
    },
    {
      title: `Контакты`,
      body: `Вопросы по этой политике можно направлять на <a href="mailto:${PRIVACY_CONTACT_EMAIL}">${PRIVACY_CONTACT_EMAIL}</a>.`,
    },
  ],
};
const HERO_CTA = { en: `Start Your Journey Now`, ru: `Начни свой путь прямо сейчас` };
const HERO_STAT_LABELS = {
  en: [`Topics`, `Grades`, `Languages`, `Instant Feedback`],
  ru: [`Тем`, `Классы`, `Языка`, `Мгновенно`],
};
const NEW_PROBLEMS_LABEL = { en: `New Problems`, ru: `Новые примеры` };
const SLIDE_LABELS = {
  en: [`The Question`, `The Idea`, `Watch It Solved`, `Watch Out`, `Why It Matters`],
  ru: [`Вопрос`, `Идея`, `Смотрим решение`, `Осторожно`, `Почему это важно`],
};
const VIEW_TOGGLE_LABELS = {
  en: { slides: `Slides`, text: `Text` },
  ru: { slides: `Слайды`, text: `Текст` },
};
function gradeLabel(lang, grade) {
  return lang === "ru" ? `${grade} класс` : `${grade}th Grade`;
}

function insertGradeIntoTitle(title, label) {
  const idx = title.lastIndexOf(" — ");
  if (idx === -1) return `${title} (${label})`;
  return `${title.slice(0, idx)} (${label})${title.slice(idx)}`;
}

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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <meta name="application-name" content="${siteName}" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:locale" content="${ogLocale}" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID_MATHPRACTICEHUB}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    var gaId = (window.location.hostname === 'mathpractise.netlify.app')
      ? '${GA_MEASUREMENT_ID_MATHPRACTISE}'
      : '${GA_MEASUREMENT_ID_MATHPRACTICEHUB}';
    gtag('config', gaId);
  </script>${adsenseHeadHtml()}`;
}

function adsenseHeadHtml() {
  if (!ADSENSE_PUBLISHER_ID) return "";
  return `
  <meta name="google-adsense-account" content="ca-${ADSENSE_PUBLISHER_ID}" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${ADSENSE_PUBLISHER_ID}" crossorigin="anonymous"></script>`;
}

function topBarHtml(lang, currentSlug) {
  return `    <header class="topbar">
      <a class="site-title" href="${pagePath(lang, "")}">${SITE_TITLES[lang]}</a>
      <div class="lang-switch">
        <a class="lang-link${lang === "en" ? " active" : ""}" href="${pagePath("en", currentSlug)}">EN</a>
        <a class="lang-link${lang === "ru" ? " active" : ""}" href="${pagePath("ru", currentSlug)}">RU</a>
      </div>
    </header>`;
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

function explanationSectionHtml(lang, entry, sectionTitle) {
  const titleHtml = sectionTitle ? `        <h3 class="section-title">${sectionTitle}</h3>\n` : "";
  const labels = SLIDE_LABELS[lang];
  const toggle = VIEW_TOGGLE_LABELS[lang];

  const dots = [0, 1, 2, 3, 4]
    .map((i) => `<button class="dot${i === 0 ? " active" : ""}" data-goto="${i}" aria-label="Slide ${i + 1}"></button>`)
    .join("");

  return `      <div class="explanation-block">
${titleHtml}        <div class="view-toggle">
          <button class="view-toggle-btn active" data-view="slides">${toggle.slides}</button>
          <button class="view-toggle-btn" data-view="text">${toggle.text}</button>
        </div>
        <div class="explanation slideshow" data-slideshow>
          <div class="slide active">
            <p class="slide-label">${labels[0]}</p>
            <p class="hook">${entry.hookHtml}</p>
          </div>
          <div class="slide">
            <p class="slide-label">${labels[1]}</p>
            <p>${entry.ruleHtml}</p>
            <p class="one-liner">${entry.oneLinerHtml}</p>
          </div>
          <div class="slide">
            <p class="slide-label">${labels[2]}</p>
            <div class="steps">
${stepsHtml(entry.steps)}
            </div>
          </div>
          <div class="slide">
            <p class="slide-label">${labels[3]}</p>
            <p class="trap">${entry.trapHtml}</p>
          </div>
          <div class="slide">
            <p class="slide-label">${labels[4]}</p>
            <p class="why-it-matters">${entry.whyItMattersHtml}</p>
          </div>
          <div class="slideshow-controls">
            <button class="slide-prev" aria-label="Previous slide">&lsaquo;</button>
            <div class="slide-dots">${dots}</div>
            <button class="slide-next" aria-label="Next slide">&rsaquo;</button>
          </div>
        </div>
      </div>`;
}

function topicPageHtml(lang, topic) {
  const t = topic[lang];
  const hintBlock = t.hintHtml ? `\n          <p class="hint">${t.hintHtml}</p>` : "";

  // Most topics have one explanation section (optionally plus a "secondary" one).
  // A topic can instead provide `sections: [...]` directly for 3+ full sections
  // (e.g. a topic covering all four arithmetic operations on fractions).
  let explanationHtml;
  if (t.sections) {
    explanationHtml = t.sections.map((s) => explanationSectionHtml(lang, s, s.title)).join("\n\n");
  } else {
    const primaryTitle = t.secondary ? t.title : null;
    explanationHtml = explanationSectionHtml(lang, t, primaryTitle);
    if (t.secondary) {
      explanationHtml += `\n\n` + explanationSectionHtml(lang, t.secondary, t.secondary.title);
    }
  }

  const label = gradeLabel(lang, topic.grade);
  const gradedTitle = insertGradeIntoTitle(t.pageTitle, label);
  const gradedDescription = `${t.navLabel}, ${label}: ${t.metaDescription}`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  ${headHtml(lang, topic.slug, gradedTitle, gradedDescription)}
</head>
<body data-topic="${topic.slug}">
  <div class="app">
${topBarHtml(lang, topic.slug)}

    <main class="content">
      <section class="topic active grade-${topic.grade}">
        <span class="grade-badge">${label}</span>
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
        <p class="footer-links"><a href="${pagePath(lang, "privacy")}">${PRIVACY_LINK_LABEL[lang]}</a> · <a href="${pagePath(lang, "contact")}">${CONTACT_LINK_LABEL[lang]}</a></p>
        <p class="site-domain">${DISPLAY_DOMAIN}</p>
      </footer>
    </main>
  </div>

  <script src="/script.js"></script>
</body>
</html>
`;
}

function heroStatsHtml(lang) {
  const labels = HERO_STAT_LABELS[lang];
  const values = [`${TOPICS.length}`, `5&ndash;9`, `2`, `100%`];
  return values
    .map(
      (v, i) => `            <div class="stat-block">
              <span class="stat-number">${v}</span>
              <span class="stat-label">${labels[i]}</span>
            </div>`
    )
    .join("\n");
}

function gradeSectionHtml(lang, grade) {
  const topicsForGrade = TOPICS.filter((t) => t.grade === grade);
  if (!topicsForGrade.length) return "";
  const cards = topicsForGrade
    .map((t) => {
      const tt = t[lang];
      return `            <li class="topic-card grade-${t.grade}">
              <a href="${pagePath(lang, t.slug)}">
                <span class="topic-card-label">${tt.navLabel}</span>
              </a>
            </li>`;
    })
    .join("\n");

  return `        <div class="grade-section">
          <h3 class="grade-section-title grade-${grade}">${gradeLabel(lang, grade)}</h3>
          <ul class="topic-list">
${cards}
          </ul>
        </div>`;
}

const HERO_VISUAL_SLUGS = ["fractions", "algebra", "pythagorean", "quadratic"];

function heroVisualHtml(lang) {
  const tiles = HERO_VISUAL_SLUGS.map((slug) => {
    const topic = TOPICS.find((t) => t.slug === slug);
    return `          <a class="hero-tile" href="${pagePath(lang, slug)}">
            <span class="hero-tile-label">${topic[lang].navLabel}</span>
          </a>`;
  }).join("\n");

  return `        <div class="space-hero-visual">
${tiles}
        </div>`;
}

function homePageHtml(lang) {
  const title = `${SITE_TITLES[lang]}${lang === "en" ? " — Learn Math Step by Step" : " — изучай математику шаг за шагом"}`;
  const sections = [5, 6, 7, 8, 9].map((g) => gradeSectionHtml(lang, g)).join("\n\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  ${headHtml(lang, "", title, HOME_META_DESCRIPTION[lang])}
</head>
<body data-topic="">
  <div class="app">
${topBarHtml(lang, "")}

    <main class="content content-home">
      <section class="topic active">
        <div class="space-hero">
          <div class="planet"></div>
          <div class="space-hero-content">
            <p class="space-eyebrow">${SITE_TITLES[lang]}</p>
            <h2>${HERO_CTA[lang]}</h2>
            <p class="home-intro">${HOME_INTRO[lang]}</p>
            <div class="hero-stats">
${heroStatsHtml(lang)}
            </div>
            <a class="scroll-down" href="#topics">
              <span class="arrow">&darr;</span>
            </a>
          </div>
${heroVisualHtml(lang)}
        </div>
        <div id="topics">
${sections}
        </div>
      </section>

      <footer>
        <p>${FOOTER_TEXT[lang]}</p>
        <p class="footer-links"><a href="${pagePath(lang, "privacy")}">${PRIVACY_LINK_LABEL[lang]}</a> · <a href="${pagePath(lang, "contact")}">${CONTACT_LINK_LABEL[lang]}</a></p>
        <p class="site-domain">${DISPLAY_DOMAIN}</p>
      </footer>
    </main>
  </div>
</body>
</html>
`;
}

const PRIVACY_INTRO = {
  en: `Math Practice ("the site", "we", "us") is a free educational website for practicing math skills for grades 5&ndash;9. This policy explains what information is collected when you use the site and how it's handled.`,
  ru: `«Практика по математике» (далее — «сайт», «мы») — бесплатный образовательный сайт для отработки математических навыков для 5&ndash;9 классов. Эта политика объясняет, какая информация собирается при использовании сайта и как она обрабатывается.`,
};

function privacyPageHtml(lang) {
  const title = `${PRIVACY_LINK_LABEL[lang]} — ${SITE_TITLES[lang]}`;
  const sections = PRIVACY_SECTIONS[lang]
    .map((s) => `        <h3>${s.title}</h3>\n        <p>${s.body}</p>`)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  ${headHtml(lang, "privacy", title, PRIVACY_META_DESCRIPTION[lang])}
</head>
<body data-topic="">
  <div class="app">
${topBarHtml(lang, "privacy")}

    <main class="content">
      <section class="topic active legal-page">
        <h2>${PRIVACY_LINK_LABEL[lang]}</h2>
        <p class="updated">${PRIVACY_UPDATED[lang]}</p>
        <p>${PRIVACY_INTRO[lang]}</p>

${sections}
      </section>

      <footer>
        <p>${FOOTER_TEXT[lang]}</p>
        <p class="footer-links"><a href="${pagePath(lang, "privacy")}">${PRIVACY_LINK_LABEL[lang]}</a> · <a href="${pagePath(lang, "contact")}">${CONTACT_LINK_LABEL[lang]}</a></p>
        <p class="site-domain">${DISPLAY_DOMAIN}</p>
      </footer>
    </main>
  </div>
</body>
</html>
`;
}

function contactPageHtml(lang) {
  const title = `${CONTACT_LINK_LABEL[lang]} — ${SITE_TITLES[lang]}`;
  const sections = CONTACT_SECTIONS[lang]
    .map((s) => `        <h3>${s.title}</h3>\n        <p>${s.body}</p>`)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  ${headHtml(lang, "contact", title, CONTACT_META_DESCRIPTION[lang])}
</head>
<body data-topic="">
  <div class="app">
${topBarHtml(lang, "contact")}

    <main class="content">
      <section class="topic active legal-page">
        <h2>${CONTACT_LINK_LABEL[lang]}</h2>

${sections}
      </section>

      <footer>
        <p>${FOOTER_TEXT[lang]}</p>
        <p class="footer-links"><a href="${pagePath(lang, "privacy")}">${PRIVACY_LINK_LABEL[lang]}</a> · <a href="${pagePath(lang, "contact")}">${CONTACT_LINK_LABEL[lang]}</a></p>
        <p class="site-domain">${DISPLAY_DOMAIN}</p>
      </footer>
    </main>
  </div>
</body>
</html>
`;
}

function sitemapXml() {
  const slugs = ["", "privacy", "contact", ...TOPICS.map((t) => t.slug)];
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

function adsTxt() {
  // "DIRECT" entry authorizing this publisher ID to sell ad space on this domain.
  // Required by AdSense once approved, or ad requests will show console warnings /
  // may not fill. The trailing ID is Google's fixed AdSense certification authority ID.
  return `google.com, pub-${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`;
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

  fs.writeFileSync(path.join(PUBLIC_DIR, "privacy.html"), privacyPageHtml("en"));
  fs.writeFileSync(path.join(RU_DIR, "privacy.html"), privacyPageHtml("ru"));

  fs.writeFileSync(path.join(PUBLIC_DIR, "contact.html"), contactPageHtml("en"));
  fs.writeFileSync(path.join(RU_DIR, "contact.html"), contactPageHtml("ru"));

  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapXml());
  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robotsTxt());

  if (ADSENSE_PUBLISHER_ID) {
    fs.writeFileSync(path.join(PUBLIC_DIR, "ads.txt"), adsTxt());
  }

  console.log(`Built ${TOPICS.length} topics x 2 languages + 2 home pages + privacy policy x 2 + contact page x 2 + sitemap.xml + robots.txt${ADSENSE_PUBLISHER_ID ? " + ads.txt" : ""}`);
}

build();
