let settings = loadSettings();
let timerRunning = false;

const el = (id) => document.getElementById(id);

function populateChapterSelect() {
  const sel = el("chapterSelect");
  sel.innerHTML = "";
  CHAPTERS.forEach((ch, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i + 1}. ${ch.en}`;
    sel.appendChild(opt);
  });
}

function populateTopicSelect() {
  const sel = el("topicSelect");
  sel.innerHTML = "";
  VOCAB_TOPICS.forEach((tp, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i + 1}. ${tp.en}`;
    sel.appendChild(opt);
  });
}

function populatePronounSelect() {
  const sel = el("pronounSelect");
  sel.innerHTML = "";
  POSSESSIVE_PRONOUNS.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.en} / ${p.bn}`;
    sel.appendChild(opt);
  });
}

function populatePosCategorySelect() {
  const sel = el("posCategorySelect");
  sel.innerHTML = "";
  PARTS_OF_SPEECH.forEach((cat, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i + 1}. ${cat.en}`;
    sel.appendChild(opt);
  });
}

function populateQuizPoolSelect() {
  const sel = el("quizPoolSelect");
  sel.innerHTML = "";
  QUIZ_POOLS.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.en;
    sel.appendChild(opt);
  });
}

function populateVerbSelect() {
  const sel = el("verbSelect");
  sel.innerHTML = "";
  VERB_LIST.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
  const customOpt = document.createElement("option");
  customOpt.value = "__custom__";
  customOpt.textContent = "✏️ " + t("customVerb", settings.language);
  sel.appendChild(customOpt);
}

function refreshPanelLabels() {
  const lang = settings.language;
  document.title = t("docTitle", lang);
  el("panelTitle").textContent = t("settings", lang);
  el("labelLanguage").textContent = t("language", lang);
  el("modeTenseBtn").textContent = t("menuTense", lang);
  el("modeRegularVerbsBtn").textContent = t("menuRegularVerbs", lang);
  el("modeVocabBtn").textContent = t("menuVocab", lang);
  el("modePosBtn").textContent = t("menuPos", lang);
  el("modeSynonymsBtn").textContent = t("menuSynonyms", lang);
  el("modeSentenceBtn").textContent = t("menuSentence", lang);
  el("modeQuizBtn").textContent = t("menuQuiz", lang);
  el("labelChapter").textContent = t("chapter", lang);
  el("labelVerb").textContent = t("verb", lang);
  el("labelRegularVerbsCount").textContent = t("verbCount", lang);
  el("labelVocabCount").textContent = t("vocabCount", lang);
  el("labelPronoun").textContent = t("pronoun", lang);
  el("labelTopic").textContent = t("topic", lang);
  el("labelCategory").textContent = t("category", lang);
  el("labelSynonymsCount").textContent = t("synonymsCount", lang);
  el("labelQuizPool").textContent = t("quizPool", lang);
  el("labelQuizCount").textContent = t("quizCount", lang);
  el("labelDirection").textContent = settings.direction === "bn_en" ? t("dirBnEn", lang) : t("dirEnBn", lang);
  const answerTargetLabel = settings.direction === "bn_en" ? "English" : "বাংলা";
  const answerVerb = settings.showAnswers ? t("hideAnswerBtn", lang) : t("showAnswerBtn", lang);
  el("showAnswerBtn").textContent = `${answerVerb} (${answerTargetLabel})`;
  el("labelTimer").textContent = t("timer", lang);
  el("labelTimerMinutes").textContent = t("timerMinutes", lang);
  updateTimerButtonUI();
  el("timerResetBtn").title = t("reset", lang);
  el("fsResetBtn").title = t("reset", lang);
  el("fsGenerateBtn").textContent = t("generate", lang);

  el("tutorialLink").textContent = t("tutorialLink", lang);
  el("fullscreenBtn").textContent = document.fullscreenElement ? t("exitFullscreen", lang) : t("fullscreen", lang);

  const chapterOpts = el("chapterSelect").options;
  for (let i = 0; i < chapterOpts.length; i++) {
    const ch = CHAPTERS[i];
    chapterOpts[i].textContent = `${i + 1}. ${lang === "bn" ? ch.bn : ch.en}`;
  }
  el("chapterSelect").value = String(settings.chapterIndex);

  const topicOpts = el("topicSelect").options;
  for (let i = 0; i < topicOpts.length; i++) {
    const tp = VOCAB_TOPICS[i];
    topicOpts[i].textContent = `${i + 1}. ${lang === "bn" ? tp.bn : tp.en}`;
  }
  el("topicSelect").value = String(settings.vocabTopicIndex);

  const posOpts = el("posCategorySelect").options;
  for (let i = 0; i < posOpts.length; i++) {
    const cat = PARTS_OF_SPEECH[i];
    posOpts[i].textContent = `${i + 1}. ${lang === "bn" ? cat.bn : cat.en}`;
  }
  el("posCategorySelect").value = String(settings.posCategoryIndex);

  const quizOpts = el("quizPoolSelect").options;
  for (let i = 0; i < quizOpts.length; i++) {
    const p = QUIZ_POOLS[i];
    quizOpts[i].textContent = lang === "bn" ? p.bn : p.en;
  }
  el("quizPoolSelect").value = settings.quizPool;

  const customOpt = el("verbSelect").querySelector('option[value="__custom__"]');
  if (customOpt) customOpt.textContent = "✏️ " + t("customVerb", lang);
}

const COUNT_INPUT_ID_BY_MODE = {
  regularVerbs: "regularVerbsCountInput",
  vocab: "vocabCountInput",
  synonyms: "synonymsCountInput",
};

// The single shared direction-toggle field gets moved next to whichever
// mode's "Number of ___" count field is currently active, so the two
// sit in one row instead of stacking as separate full-width fields.
function positionDirectionField() {
  const directionField = el("directionField");
  const countInputId = COUNT_INPUT_ID_BY_MODE[settings.mode];

  if (!countInputId) {
    el("worksheetControls").insertBefore(directionField, el("worksheetControls").firstChild);
    return;
  }

  const countField = el(countInputId).closest(".field");
  let wrapper = countField.parentElement;
  if (!wrapper.classList.contains("field-row")) {
    wrapper = document.createElement("div");
    wrapper.className = "field-row";
    countField.replaceWith(wrapper);
    wrapper.appendChild(countField);
  }
  wrapper.appendChild(directionField);
}

function syncModeUI() {
  el("modeTenseBtn").classList.toggle("active", settings.mode === "tense");
  el("modeRegularVerbsBtn").classList.toggle("active", settings.mode === "regularVerbs");
  el("modeVocabBtn").classList.toggle("active", settings.mode === "vocab");
  el("modePosBtn").classList.toggle("active", settings.mode === "pos");
  el("modeSynonymsBtn").classList.toggle("active", settings.mode === "synonyms");
  el("modeSentenceBtn").classList.toggle("active", settings.mode === "sentence");
  el("modeQuizBtn").classList.toggle("active", settings.mode === "quiz");

  el("tenseControls").hidden = settings.mode !== "tense";
  el("regularVerbsControls").hidden = settings.mode !== "regularVerbs";
  el("vocabControls").hidden = settings.mode !== "vocab";
  el("posControls").hidden = settings.mode !== "pos";
  el("synonymsControls").hidden = settings.mode !== "synonyms";
  el("quizControls").hidden = settings.mode !== "quiz";

  const isWorksheetMode = ["tense", "regularVerbs", "vocab", "pos", "synonyms"].includes(settings.mode);
  el("worksheetControls").hidden = !isWorksheetMode;
  if (isWorksheetMode) positionDirectionField();
}

function syncPanelInputs() {
  el("languageSelect").value = settings.language;
  el("chapterSelect").value = String(settings.chapterIndex);
  if (VERB_LIST.includes(settings.verb)) {
    el("verbSelect").value = settings.verb;
  } else {
    el("verbSelect").value = "__custom__";
  }
  el("regularVerbsCountInput").value = settings.regularVerbsCount;
  el("vocabCountInput").value = settings.vocabCount;
  el("topicSelect").value = String(settings.vocabTopicIndex);
  el("pronounSelect").value = settings.possessivePronoun;
  el("posCategorySelect").value = String(settings.posCategoryIndex);
  el("synonymsCountInput").value = settings.synonymsCount;
  el("quizPoolSelect").value = settings.quizPool;
  el("quizCountInput").value = settings.quizCount;
  el("directionToggle").checked = settings.direction === "bn_en";
  syncModeUI();
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  const target = el("sheets");
  if (!target.requestFullscreen) {
    alert("Fullscreen is not supported in this browser.");
    return;
  }
  target.requestFullscreen().catch((err) => {
    alert("Could not enter fullscreen: " + err.message);
  });
}

function updateTimerButtonUI() {
  const lang = settings.language;
  const icon = timerRunning ? "⏸" : "▶";
  ["timerStartBtn", "fsPlayPauseBtn"].forEach((id) => {
    el(id).textContent = icon;
  });
}

function toggleTimerStartPause() {
  const lang = settings.language;
  if (timerRunning) {
    pauseTimer();
    timerRunning = false;
  } else {
    startTimer(lang);
    timerRunning = true;
  }
  setTitleTimerActive(true);
  updateTimerButtonUI();
}

function resetTimerAndUI() {
  timerRunning = false;
  setTitleTimerActive(false);
  updateTimerButtonUI();
  resetTimer(parseInt(el("timerMinutesInput").value, 10) || 1, settings.language);
}

function rerender() {
  saveSettings(settings);
  refreshPanelLabels();
  syncModeUI();
  if (settings.mode === "quiz") {
    renderQuiz();
  } else {
    renderSheets(settings);
  }
  updateTimerDisplay(settings.language);
}

function generateAndRender() {
  saveSettings(settings);
  refreshPanelLabels();
  syncModeUI();
  if (settings.mode === "quiz") {
    startQuiz();
  } else {
    generateAllSheetsData(settings);
    renderSheets(settings);
  }
  updateTimerDisplay(settings.language);
}

function goToChapter(index) {
  settings.chapterIndex = Math.max(0, Math.min(CHAPTERS.length - 1, index));
  settings.tenseColumnIndex = 0;
  generateAndRender();
}

function goToTenseColumn(index) {
  settings.tenseColumnIndex = Math.max(0, Math.min(3, index));
  generateAndRender();
}

function goToTopic(index) {
  settings.vocabTopicIndex = Math.max(0, Math.min(VOCAB_TOPICS.length - 1, index));
  settings.vocabWordPage = 0;
  generateAndRender();
}

function goToWordPage(index) {
  settings.vocabWordPage = Math.max(0, index);
  generateAndRender();
}

function goToRegularVerbsPage(index) {
  settings.regularVerbsPage = Math.max(0, index);
  generateAndRender();
}

function goToPosCategory(index) {
  settings.posCategoryIndex = Math.max(0, Math.min(PARTS_OF_SPEECH.length - 1, index));
  generateAndRender();
}

// --- Quiz mode: interactive session state (not persisted in settings) ---
let quizState = null;

function startQuiz() {
  const questions = buildQuizQuestions(settings.quizPool, settings.quizCount);
  quizState = { questions, currentIndex: 0, score: 0, selected: null, locked: false };
  renderQuiz();
}

function renderQuiz() {
  const lang = settings.language;
  const container = el("sheetsContent");

  if (!quizState || !quizState.questions.length) {
    container.innerHTML = `
      <div class="page quiz-page">
        <div class="sheet-header"><h1>${t("menuQuiz", lang)}</h1></div>
        <p class="quiz-empty-msg">${t("startQuiz", lang)}</p>
      </div>`;
    return;
  }

  if (quizState.currentIndex >= quizState.questions.length) {
    const pct = Math.round((quizState.score / quizState.questions.length) * 100);
    container.innerHTML = `
      <div class="page quiz-page quiz-results">
        <div class="sheet-header"><h1>${t("quizResultsTitle", lang)}</h1></div>
        <div class="quiz-score-big">${quizState.score} / ${quizState.questions.length}</div>
        <div class="quiz-score-pct">${pct}%</div>
        <button type="button" class="quiz-retry-btn" id="quizRetryBtn">${t("quizRetry", lang)}</button>
      </div>`;
    return;
  }

  const q = quizState.questions[quizState.currentIndex];
  const optionsHtml = q.options
    .map((opt, i) => {
      let cls = "quiz-option";
      if (quizState.locked) {
        if (i === q.correctIndex) cls += " correct";
        else if (i === quizState.selected) cls += " incorrect";
      }
      return `<button type="button" class="${cls}" data-option-index="${i}"${quizState.locked ? " disabled" : ""}>${esc(opt)}</button>`;
    })
    .join("");

  const feedbackHtml = quizState.locked
    ? `<div class="quiz-feedback ${quizState.selected === q.correctIndex ? "quiz-feedback-correct" : "quiz-feedback-incorrect"}">
        ${quizState.selected === q.correctIndex ? t("quizCorrect", lang) : `${t("quizIncorrect", lang)} — ${t("quizCorrectAnswerWas", lang)} ${esc(q.options[q.correctIndex])}`}
      </div>`
    : "";

  const isLast = quizState.currentIndex + 1 >= quizState.questions.length;
  const nextBtnHtml = quizState.locked
    ? `<button type="button" class="quiz-next-btn" id="quizNextBtn">${isLast ? t("quizFinish", lang) : t("quizNext", lang)}</button>`
    : "";

  container.innerHTML = `
    <div class="page quiz-page">
      <div class="sheet-header">
        <h1>${t("menuQuiz", lang)}</h1>
        <div class="quiz-progress">${t("question", lang)} ${quizState.currentIndex + 1} / ${quizState.questions.length} &middot; ${t("quizScore", lang)}: ${quizState.score}</div>
      </div>
      ${q.bnHint ? `<div class="quiz-hint">(${esc(q.bnHint)})</div>` : ""}
      <div class="quiz-question">${esc(q.prompt)}</div>
      <div class="quiz-options">${optionsHtml}</div>
      ${feedbackHtml}
      ${nextBtnHtml}
    </div>`;
}

function selectQuizAnswer(idx) {
  if (!quizState || quizState.locked) return;
  quizState.selected = idx;
  quizState.locked = true;
  if (idx === quizState.questions[quizState.currentIndex].correctIndex) quizState.score++;
  renderQuiz();
}

function nextQuizQuestion() {
  if (!quizState) return;
  quizState.currentIndex++;
  quizState.selected = null;
  quizState.locked = false;
  renderQuiz();
}

function init() {
  populateVerbSelect();
  populateChapterSelect();
  populateTopicSelect();
  populatePronounSelect();
  populatePosCategorySelect();
  populateQuizPoolSelect();
  syncPanelInputs();
  refreshPanelLabels();
  if (settings.mode === "quiz") {
    renderQuiz();
  } else {
    generateAllSheetsData(settings);
    renderSheets(settings);
  }

  el("languageSelect").addEventListener("change", (e) => {
    settings.language = e.target.value;
    populateVerbSelect();
    syncPanelInputs();
    rerender();
  });

  el("modeTenseBtn").addEventListener("click", () => {
    settings.mode = "tense";
    generateAndRender();
  });
  el("modeRegularVerbsBtn").addEventListener("click", () => {
    settings.mode = "regularVerbs";
    generateAndRender();
  });
  el("modeVocabBtn").addEventListener("click", () => {
    settings.mode = "vocab";
    generateAndRender();
  });
  el("modePosBtn").addEventListener("click", () => {
    settings.mode = "pos";
    generateAndRender();
  });
  el("modeSynonymsBtn").addEventListener("click", () => {
    settings.mode = "synonyms";
    generateAndRender();
  });
  el("modeSentenceBtn").addEventListener("click", () => {
    settings.mode = "sentence";
    generateAndRender();
  });
  el("modeQuizBtn").addEventListener("click", () => {
    settings.mode = "quiz";
    generateAndRender();
  });

  el("chapterSelect").addEventListener("change", (e) => {
    goToChapter(parseInt(e.target.value, 10));
  });

  el("topicSelect").addEventListener("change", (e) => {
    goToTopic(parseInt(e.target.value, 10));
  });

  el("posCategorySelect").addEventListener("change", (e) => {
    goToPosCategory(parseInt(e.target.value, 10));
  });

  el("synonymsCountInput").addEventListener("change", (e) => {
    settings.synonymsCount = Math.max(1, Math.min(SYNONYMS_ANTONYMS.length, parseInt(e.target.value, 10) || 10));
    generateAndRender();
  });

  el("quizPoolSelect").addEventListener("change", (e) => {
    settings.quizPool = e.target.value;
    generateAndRender();
  });

  el("quizCountInput").addEventListener("change", (e) => {
    settings.quizCount = Math.max(3, Math.min(30, parseInt(e.target.value, 10) || 10));
    generateAndRender();
  });

  el("verbSelect").addEventListener("change", (e) => {
    if (e.target.value === "__custom__") {
      const lang = settings.language;
      const entered = prompt(t("customVerb", lang) + ":", settings.verb);
      if (entered && entered.trim()) {
        settings.verb = entered.trim().toLowerCase();
      }
      syncPanelInputs();
    } else {
      settings.verb = e.target.value;
    }
    generateAndRender();
  });

  el("regularVerbsCountInput").addEventListener("change", (e) => {
    settings.regularVerbsCount = Math.max(1, Math.min(89, parseInt(e.target.value, 10) || 20));
    settings.regularVerbsPage = 0;
    generateAndRender();
  });

  el("vocabCountInput").addEventListener("change", (e) => {
    settings.vocabCount = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 20));
    settings.vocabWordPage = 0;
    generateAndRender();
  });

  el("pronounSelect").addEventListener("change", (e) => {
    settings.possessivePronoun = e.target.value;
    rerender();
  });

  el("directionToggle").addEventListener("change", (e) => {
    settings.direction = e.target.checked ? "bn_en" : "en_bn";
    rerender();
  });

  el("showAnswerBtn").addEventListener("click", () => {
    settings.showAnswers = !settings.showAnswers;
    rerender();
  });

  resetTimer(parseInt(el("timerMinutesInput").value, 10) || 1, settings.language);
  onTimerComplete = () => {
    settings.showAnswers = true;
    rerender();
  };

  el("timerMinutesInput").addEventListener("change", resetTimerAndUI);
  el("timerStartBtn").addEventListener("click", toggleTimerStartPause);
  el("timerResetBtn").addEventListener("click", resetTimerAndUI);
  el("fsPlayPauseBtn").addEventListener("click", toggleTimerStartPause);
  el("fsResetBtn").addEventListener("click", resetTimerAndUI);
  el("fsGenerateBtn").addEventListener("click", generateAndRender);

  el("fullscreenBtn").addEventListener("click", toggleFullscreen);
  el("exitFullscreenBtn").addEventListener("click", () => document.exitFullscreen());
  document.addEventListener("fullscreenchange", refreshPanelLabels);

  el("tutorialLink").addEventListener("click", () => {
    const frame = el("tutorialFrame");
    if (!frame.src) frame.src = "tutorial.html";
    el("tutorialModal").hidden = false;
  });

  const closeTutorial = () => {
    el("tutorialModal").hidden = true;
  };
  el("tutorialModalClose").addEventListener("click", closeTutorial);
  el("tutorialModal").addEventListener("click", (e) => {
    if (e.target.id === "tutorialModal") closeTutorial();
  });

  el("sheetsContent").addEventListener("click", (e) => {
    // vocab/pos/tense cards: click toggles the card's active (bordered)
    // highlight only — purely a select/highlight affordance, entirely
    // separate from revealing the answer. Answers only ever come from
    // the global Show Answer button now.
    const vocabCard = e.target.closest(".vocab-card");
    if (vocabCard && vocabCard.querySelector(".vocab-blank")) {
      vocabCard.classList.toggle("active");
      return;
    }
    const answerTarget = e.target.closest(".answer");
    if (answerTarget) {
      answerTarget.classList.toggle("revealed");
      return;
    }
    if (e.target.closest(".onpage-prev-chapter")) {
      goToChapter(settings.chapterIndex - 1);
      return;
    }
    if (e.target.closest(".onpage-next-chapter")) {
      goToChapter(settings.chapterIndex + 1);
      return;
    }
    if (e.target.closest(".onpage-prev-topic")) {
      goToTopic(settings.vocabTopicIndex - 1);
      return;
    }
    if (e.target.closest(".onpage-next-topic")) {
      goToTopic(settings.vocabTopicIndex + 1);
      return;
    }
    if (e.target.closest(".onpage-prev-wordpage")) {
      goToWordPage(settings.vocabWordPage - 1);
      return;
    }
    if (e.target.closest(".onpage-next-wordpage")) {
      goToWordPage(settings.vocabWordPage + 1);
      return;
    }
    if (e.target.closest(".onpage-prev-regularpage")) {
      goToRegularVerbsPage(settings.regularVerbsPage - 1);
      return;
    }
    if (e.target.closest(".onpage-next-regularpage")) {
      goToRegularVerbsPage(settings.regularVerbsPage + 1);
      return;
    }
    if (e.target.closest(".onpage-prev-column")) {
      goToTenseColumn(settings.tenseColumnIndex - 1);
      return;
    }
    if (e.target.closest(".onpage-next-column")) {
      goToTenseColumn(settings.tenseColumnIndex + 1);
      return;
    }
    if (e.target.closest(".onpage-prev-pos")) {
      goToPosCategory(settings.posCategoryIndex - 1);
      return;
    }
    if (e.target.closest(".onpage-next-pos")) {
      goToPosCategory(settings.posCategoryIndex + 1);
      return;
    }
    const quizOption = e.target.closest(".quiz-option");
    if (quizOption) {
      selectQuizAnswer(parseInt(quizOption.dataset.optionIndex, 10));
      return;
    }
    if (e.target.closest("#quizNextBtn")) {
      nextQuizQuestion();
      return;
    }
    if (e.target.closest("#quizRetryBtn")) {
      startQuiz();
      return;
    }
  });
}

init();
