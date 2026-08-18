function esc(s) {
  const d = document.createElement("div");
  d.textContent = String(s == null ? "" : s);
  return d.innerHTML;
}

function answerSpan(text, extraClass) {
  return `<span class="answer${extraClass ? " " + extraClass : ""}">${esc(text)}</span>`;
}

function givenSpan(text, extraClass) {
  return `<span class="given${extraClass ? " " + extraClass : ""}">${esc(text)}</span>`;
}

const CHEVRON_LEFT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
const CHEVRON_RIGHT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

const SUBJECT_ICONS = {
  i: "🙋",
  we: "👥",
  you_sg: "👉",
  you_pl: "👉",
  he: "👨",
  she: "👩",
  it: "📦",
  they: "👨‍👩‍👧‍👦",
};

// Page 0 is the subject/pronoun itself (English <-> Bangla, direction-
// aware, just like a vocab card). Pages 1-3 are the three sentence
// types — each card's given/answer flip with the direction toggle just
// like Vocabulary: English main text reveals the Bangla translation, or
// vice versa when toggled.
const TENSE_COLUMNS = [
  { key: null, bnKey: null, labelKey: "subject" },
  { key: "pos", bnKey: "bnPos", labelKey: "positive" },
  { key: "neg", bnKey: "bnNeg", labelKey: "negative" },
  { key: "int", bnKey: "bnInt", labelKey: "interrogative" },
];

function renderTensePage(page, settings) {
  const lang = settings.language;
  const chapterName = lang === "bn" ? page.chapter.bn : page.chapter.en;
  const verbEn = page.verb;
  const verbBn = page.bnMeaning || "—";

  const verbCard =
    settings.direction === "bn_en"
      ? `${givenSpan(verbBn, "verb-given")} <span class="verb-arrow">➜</span> ${answerSpan(verbEn, "verb-answer")}`
      : `${givenSpan(verbEn, "verb-given")} <span class="verb-arrow">➜</span> ${answerSpan(verbBn, "verb-answer")}`;

  const columnIndex = Math.max(0, Math.min(settings.tenseColumnIndex || 0, TENSE_COLUMNS.length - 1));
  const column = TENSE_COLUMNS[columnIndex];
  const isSubjectPage = column.key === null;

  const cardsHtml = page.rows
    .map((r, i) => {
      // Subject page: pronoun <-> Bangla, direction-aware, like a vocab
      // card. Sentence pages: same direction-aware given/answer flip,
      // using the generated Bangla sentence translation — falling back
      // to just the verb's meaning gloss if no full translation could
      // be generated (e.g. a freely-typed custom verb with no Bangla
      // gloss on file at all).
      let given, answer;
      if (isSubjectPage) {
        given = settings.direction === "bn_en" ? r.bn : r.en;
        answer = settings.direction === "bn_en" ? r.en : r.bn;
      } else {
        const enText = r[column.key];
        const bnText = r[column.bnKey];
        if (bnText) {
          given = settings.direction === "bn_en" ? bnText : enText;
          answer = settings.direction === "bn_en" ? enText : bnText;
        } else {
          given = enText;
          answer = verbBn;
        }
      }
      return `
      <div class="vocab-card tense-card">
        <div class="vocab-card-row">
          <div class="vocab-number">${i + 1}</div>
          <div class="vocab-icon-circle">${SUBJECT_ICONS[r.id] || "🗣️"}</div>
          <div class="vocab-given">${esc(given)}</div>
        </div>
        <div class="vocab-blank">${answerSpan(answer)}</div>
      </div>`;
    })
    .join("");

  const header = renderNavHeader({
    title: `${page.chapterIndex + 1}. ${chapterName}`,
    prevClass: "onpage-prev-chapter",
    nextClass: "onpage-next-chapter",
    prevDisabled: page.chapterIndex <= 0,
    nextDisabled: page.chapterIndex >= CHAPTERS.length - 1,
    lang,
  });

  const columnPager = `
    <div class="word-page-nav">
      <button type="button" class="onpage-prev-column"${columnIndex <= 0 ? " disabled" : ""}>${CHEVRON_LEFT_SVG}</button>
      <span class="word-page-indicator">${t(column.labelKey, lang)} · ${columnIndex + 1} ${t("chapterOf", lang)} ${TENSE_COLUMNS.length}</span>
      <button type="button" class="onpage-next-column"${columnIndex >= TENSE_COLUMNS.length - 1 ? " disabled" : ""}>${CHEVRON_RIGHT_SVG}</button>
    </div>`;

  return `
    <div class="page vocab-page">
      ${header}
      <div class="verb-card">
        <span class="verb-card-label">${t("verb", lang)}:</span>
        ${verbCard}
      </div>
      <div class="vocab-list">${cardsHtml}</div>
      ${columnPager}
    </div>`;
}

// Vocabulary-card-styled version of the verb-forms data: one card per
// verb, icon + a single given line chaining all three forms
// (V1 → V2 → V3 — V2/V3 have no Bangla equivalent, so they never flip
// with direction, only V1 does), and the Bangla meaning collapsed
// underneath as the reveal-on-click answer, exactly like a vocab card —
// just one full-width card per row instead of the usual 2-column grid.
function renderRegularVerbsPage(page, settings) {
  const lang = settings.language;
  const dirBnGiven = settings.direction === "bn_en";

  const cardsHtml = page.verbs
    .map((v, i) => {
      const v1Given = dirBnGiven ? v.bn : v.v1;
      const v1Answer = dirBnGiven ? v.v1 : v.bn;
      const noteHtml = v.note && !dirBnGiven ? ` <span class="verb-form-note">${esc(v.note)}</span>` : "";
      const given =
        `<span class="verb-form-col">${esc(v1Given)}${noteHtml}</span>` +
        `<span class="verb-form-arrow">→</span>` +
        `<span class="verb-form-col">${esc(v.v2)}</span>` +
        `<span class="verb-form-arrow">→</span>` +
        `<span class="verb-form-col">${esc(v.v3)}</span>`;
      return `
      <div class="vocab-card">
        <div class="vocab-card-row">
          <div class="vocab-number">${page.start + i + 1}</div>
          <div class="vocab-icon-circle">🏃</div>
          <div class="vocab-given">${given}</div>
        </div>
        <div class="vocab-blank">${answerSpan(v1Answer)}</div>
      </div>`;
    })
    .join("");

  const header = renderNavHeader({
    title: t("sheetTitleRegularVerbs", lang),
    lang,
  });

  const wordPager =
    page.pageCount > 1
      ? `
    <div class="word-page-nav">
      <button type="button" class="onpage-prev-regularpage"${page.page <= 0 ? " disabled" : ""}>${CHEVRON_LEFT_SVG}</button>
      <span class="word-page-indicator">${t("words", lang)} ${page.start + 1}–${page.start + page.verbs.length} ${t("chapterOf", lang)} ${page.total}</span>
      <button type="button" class="onpage-next-regularpage"${page.page >= page.pageCount - 1 ? " disabled" : ""}>${CHEVRON_RIGHT_SVG}</button>
    </div>`
      : "";

  return `
    <div class="page vocab-page">
      ${header}
      <div class="vocab-list verb-form-list">${cardsHtml}</div>
      ${wordPager}
    </div>`;
}

// Shared on-page header: the live timer first, then Prev at the far left
// edge / title centered / Next at the far right edge — used by modes
// that browse a sequence of topics/categories (Vocabulary, Parts of
// Speech). prevClass/nextClass are optional — omit them for a flat list
// with no topic-level Prev/Next (title just centers on its own).
function renderNavHeader({ title, prevClass, nextClass, prevDisabled, nextDisabled, lang }) {
  const prevBtn = prevClass
    ? `<button type="button" class="${prevClass}"${prevDisabled ? " disabled" : ""}>${CHEVRON_LEFT_SVG}<span>${t("prevChapter", lang)}</span></button>`
    : "";
  const nextBtn = nextClass
    ? `<button type="button" class="${nextClass}"${nextDisabled ? " disabled" : ""}><span>${t("nextChapter", lang)}</span>${CHEVRON_RIGHT_SVG}</button>`
    : "";
  return `
    <div class="sheet-header">
      <div class="title-timer">
        <div class="title-timer-text"></div>
        <div class="timer-bar"><div class="timer-bar-fill"></div></div>
      </div>
      <div class="vocab-header-row">
        ${prevBtn}
        <div class="vocab-header-title">
          <h1>${esc(title)}</h1>
        </div>
        ${nextBtn}
      </div>
    </div>`;
}

const POS_ICONS = {
  noun: "🏷️",
  pronoun: "👤",
  verb: "🏃",
  adjective: "🎨",
  adverb: "⚡",
  preposition: "📍",
  conjunction: "🔗",
  interjection: "❗",
};

function renderPosPage(page, settings) {
  const lang = settings.language;
  const catName = lang === "bn" ? page.category.bn : page.category.en;

  const cardsHtml = page.examples
    .map((ex) => {
      const parts = ex.sentence.split("{w}");
      const highlighted = `${esc(parts[0])}<strong class="pos-target">${esc(ex.w)}</strong>${esc(parts[1] || "")}`;
      const answer = settings.direction === "bn_en" ? page.category.en : page.category.bn;
      return `
      <div class="vocab-card pos-card">
        <div class="vocab-card-row">
          <div class="vocab-icon-circle">${POS_ICONS[page.category.id] || "📝"}</div>
          <div class="vocab-given pos-sentence">${highlighted}</div>
        </div>
        <div class="vocab-blank">${answerSpan(answer)}</div>
      </div>`;
    })
    .join("");

  const header = renderNavHeader({
    title: `${page.categoryIndex + 1}. ${catName}`,
    prevClass: "onpage-prev-pos",
    nextClass: "onpage-next-pos",
    prevDisabled: page.categoryIndex <= 0,
    nextDisabled: page.categoryIndex >= PARTS_OF_SPEECH.length - 1,
    lang,
  });

  return `
    <div class="page vocab-page">
      ${header}
      <div class="pos-definition">${esc(lang === "bn" ? page.category.defBn : page.category.defEn)}</div>
      <div class="vocab-list">${cardsHtml}</div>
    </div>`;
}

function renderSynonymsPage(page, settings) {
  const lang = settings.language;
  const cardHtml = (w) => `
      <div class="synant-card">
        <div class="synant-word">${esc(w.word)} <span class="synant-bn">(${esc(w.bn)})</span></div>
        <div class="synant-row"><span class="synant-label">${t("synonym", lang)}:</span> ${answerSpan(w.synonym)}</div>
        <div class="synant-row"><span class="synant-label">${t("antonym", lang)}:</span> ${answerSpan(w.antonym)}</div>
      </div>`;

  const gridsHtml = page.wordChunks
    .map((chunk) => `<div class="synant-grid">${chunk.map(cardHtml).join("")}</div>`)
    .join("");

  return `
    <div class="page vocab-page">
      <div class="sheet-header">
        <h1>${t("sheetTitleSynonyms", lang)}</h1>
      </div>
      ${gridsHtml}
    </div>`;
}

function renderSentencePage(settings) {
  const lang = settings.language;
  const cardsHtml = SENTENCE_PATTERNS.map((p) => {
    const examplesHtml = p.examples.map((s) => `<li>${esc(s)}</li>`).join("");
    return `
      <div class="pattern-card">
        <div class="pattern-formula">${esc(p.formula)}</div>
        <div class="pattern-formula-bn">${esc(p.bnFormula)}</div>
        <ul class="pattern-examples">${examplesHtml}</ul>
      </div>`;
  }).join("");

  return `
    <div class="page">
      <div class="sheet-header">
        <h1>${t("sheetTitleSentence", lang)}</h1>
      </div>
      <div class="pattern-list">${cardsHtml}</div>
    </div>`;
}

function renderVocabPage(page, settings) {
  const lang = settings.language;
  const topicName = lang === "bn" ? page.topic.bn : page.topic.en;
  const pronoun = POSSESSIVE_PRONOUNS.find((p) => p.id === settings.possessivePronoun) || POSSESSIVE_PRONOUNS[0];
  // en_bn (default): Bangla given ("আমার ...") -> English blank ("My ...")
  // bn_en: English given ("My ...") -> Bangla blank ("আমার ...")
  const cardHtml = (w, i) => {
    const bnText = pronoun.bn + " " + w.bn;
    const enText = pronoun.en + " " + w.en;
    const given = settings.direction === "bn_en" ? enText : bnText;
    const answer = settings.direction === "bn_en" ? bnText : enText;
    return `
      <div class="vocab-card">
        <div class="vocab-card-row">
          <div class="vocab-number">${page.wordStart + i + 1}</div>
          <div class="vocab-icon-circle">${w.icon || ""}</div>
          <div class="vocab-given">${esc(given)}</div>
        </div>
        <div class="vocab-blank">${answerSpan(answer)}</div>
      </div>`;
  };

  const header = renderNavHeader({
    title: `${page.topicIndex + 1}. ${topicName}`,
    prevClass: "onpage-prev-topic",
    nextClass: "onpage-next-topic",
    prevDisabled: page.topicIndex <= 0,
    nextDisabled: page.topicIndex >= VOCAB_TOPICS.length - 1,
    lang,
  });

  const wordPager =
    page.wordPageCount > 1
      ? `
    <div class="word-page-nav">
      <button type="button" class="onpage-prev-wordpage"${page.wordPage <= 0 ? " disabled" : ""}>${CHEVRON_LEFT_SVG}</button>
      <span class="word-page-indicator">${t("words", lang)} ${page.wordStart + 1}–${page.wordStart + page.words.length} ${t("chapterOf", lang)} ${page.wordTotal}</span>
      <button type="button" class="onpage-next-wordpage"${page.wordPage >= page.wordPageCount - 1 ? " disabled" : ""}>${CHEVRON_RIGHT_SVG}</button>
    </div>`
      : "";

  return `
    <div class="page vocab-page">
      ${header}
      <div class="vocab-list">${page.words.map(cardHtml).join("")}</div>
      ${wordPager}
    </div>`;
}

function renderSheets(settings) {
  const container = document.getElementById("sheetsContent");
  if (settings.mode === "sentence") {
    container.innerHTML = renderSentencePage(settings);
  } else if (settings.mode === "quiz") {
    // quiz has its own interactive renderer (renderQuiz in main.js)
  } else {
    container.innerHTML = sheetsData
      .map((page) => {
        if (page.mode === "regularVerbs") return renderRegularVerbsPage(page, settings);
        if (page.mode === "vocab") return renderVocabPage(page, settings);
        if (page.mode === "pos") return renderPosPage(page, settings);
        if (page.mode === "synonyms") return renderSynonymsPage(page, settings);
        return renderTensePage(page, settings);
      })
      .join("");
  }
  container.classList.toggle("show-all-answers", !!settings.showAnswers);
}
