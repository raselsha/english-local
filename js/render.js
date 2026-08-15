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

function renderHeaderInfo(lang) {
  return `
    <div class="header-info-row">
      <span>${t("date", lang)}: <span class="fill-line short"></span></span>
      <span>${t("timeLimit", lang)}: <span class="fill-line short"></span></span>
      <span>${t("marks", lang)}: <span class="fill-line short"></span></span>
    </div>`;
}

function renderTensePage(page, settings) {
  const lang = settings.language;
  const chapterName = lang === "bn" ? page.chapter.bn : page.chapter.en;
  const verbEn = page.verb;
  const verbBn = page.bnMeaning || "—";

  const verbCard =
    settings.direction === "bn_en"
      ? `${givenSpan(verbBn, "verb-given")} <span class="verb-arrow">➜</span> ${answerSpan(verbEn, "verb-answer")}`
      : `${givenSpan(verbEn, "verb-given")} <span class="verb-arrow">➜</span> ${answerSpan(verbBn, "verb-answer")}`;

  const rowsHtml = page.rows
    .map(
      (r) => `
      <tr>
        <td class="subject-cell">${esc(r.en)}<br><span class="bn-sub">${esc(r.bn)}</span></td>
        <td class="sentence-cell">${answerSpan(r.pos)}</td>
        <td class="sentence-cell">${answerSpan(r.neg)}</td>
        <td class="sentence-cell">${answerSpan(r.int)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="page">
      <div class="sheet-header">
        <h1>${t("sheetTitleTense", lang)}</h1>
        ${settings.showHeaderInfo ? renderHeaderInfo(lang) : ""}
      </div>
      <div class="chapter-banner">
        <span class="chapter-tag">${t("chapter", lang)} ${page.chapterIndex + 1} ${t("chapterOf", lang)} ${CHAPTERS.length}</span>
        <span class="chapter-name">${esc(chapterName)}</span>
      </div>
      <div class="verb-card">
        <span class="verb-card-label">${t("verb", lang)}:</span>
        ${verbCard}
      </div>
      <table class="tense-table">
        <thead>
          <tr>
            <th>${t("subject", lang)}</th>
            <th>${t("positive", lang)}</th>
            <th>${t("negative", lang)}</th>
            <th>${t("interrogative", lang)}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function renderIrregularPage(page, settings) {
  const lang = settings.language;
  const dirBnGiven = settings.direction === "bn_en";

  const rowsHtml = page.verbs
    .map((v) => {
      const v1Cell = dirBnGiven ? answerSpan(v.v1) : givenSpan(v.v1);
      const bnCell = dirBnGiven ? givenSpan(v.bn) : answerSpan(v.bn);
      return `
      <tr>
        <td class="verb-cell">${v1Cell}${v.note ? `<br><span class="note">${esc(v.note)}</span>` : ""}</td>
        <td class="meaning-cell">${bnCell}</td>
        <td class="form-cell">${answerSpan(v.v2)}</td>
        <td class="form-cell">${answerSpan(v.v3)}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="page">
      <div class="sheet-header">
        <h1>${t("sheetTitleIrregular", lang)}</h1>
        ${settings.showHeaderInfo ? renderHeaderInfo(lang) : ""}
      </div>
      <table class="irregular-table">
        <thead>
          <tr>
            <th>${t("verbBase", lang)}</th>
            <th>${t("meaning", lang)}</th>
            <th>${t("verbPast", lang)}</th>
            <th>${t("verbPP", lang)}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function renderVocabPage(page, settings) {
  const lang = settings.language;
  const dirBnGiven = settings.direction !== "bn_en" ? false : true;
  // en_bn (default): Bangla given ("আমার ...") -> English blank ("My ...")
  // bn_en: English given ("My ...") -> Bangla blank ("আমার ...")
  const cardsHtml = page.words
    .map((w) => {
      const bnText = "আমার " + w.bn;
      const enText = "My " + w.en;
      const given = settings.direction === "bn_en" ? enText : bnText;
      const answer = settings.direction === "bn_en" ? bnText : enText;
      return `
      <div class="vocab-card">
        <div class="vocab-given">${esc(given)}</div>
        <div class="vocab-blank">${answerSpan(answer)}</div>
      </div>`;
    })
    .join("");

  return `
    <div class="page">
      <div class="sheet-header">
        <h1>${t("sheetTitleVocab", lang)}</h1>
        ${settings.showHeaderInfo ? renderHeaderInfo(lang) : ""}
      </div>
      <div class="vocab-grid">${cardsHtml}</div>
    </div>`;
}

function renderSheets(settings) {
  const container = document.getElementById("sheetsContent");
  container.innerHTML = sheetsData
    .map((page) => {
      if (page.mode === "irregular") return renderIrregularPage(page, settings);
      if (page.mode === "vocab") return renderVocabPage(page, settings);
      return renderTensePage(page, settings);
    })
    .join("");
  container.classList.toggle("show-all-answers", !!settings.showAnswers);
}
