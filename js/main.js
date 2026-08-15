let settings = loadSettings();
let timerRunning = false;

const el = (id) => document.getElementById(id);

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
  el("modeIrregularBtn").textContent = t("menuIrregular", lang);
  el("modeVocabBtn").textContent = t("menuVocab", lang);
  el("labelChapter").textContent = t("chapter", lang);
  el("prevChapterBtn").textContent = t("prevChapter", lang);
  el("nextChapterBtn").textContent = t("nextChapter", lang);
  el("labelVerb").textContent = t("verb", lang);
  el("labelVerbCount").textContent = t("verbCount", lang);
  el("labelVocabCount").textContent = t("vocabCount", lang);
  el("labelDirection").textContent = t("direction", lang) + ": " + (settings.direction === "bn_en" ? t("dirBnEn", lang) : t("dirEnBn", lang));
  el("labelPages").textContent = t("pages", lang);
  el("labelShowHeaderInfo").textContent = t("showHeaderInfo", lang);
  el("showAnswerBtn").textContent = settings.showAnswers ? t("hideAnswerBtn", lang) : t("showAnswerBtn", lang);
  el("labelTimer").textContent = t("timer", lang);
  el("labelTimerMinutes").textContent = t("timerMinutes", lang);
  updateTimerButtonUI();
  el("timerResetBtn").title = t("reset", lang);
  el("fsResetBtn").title = t("reset", lang);
  el("fsGenerateBtn").textContent = t("generate", lang);

  el("generateBtn").textContent = t("generate", lang);
  el("exportBtn").textContent = t("exportJson", lang);
  el("importLabelText").textContent = t("importJson", lang);
  el("resetBtn").textContent = t("reset", lang);
  el("printBtn").textContent = t("print", lang);
  el("downloadImageBtn").textContent = t("downloadImage", lang);
  el("tutorialLink").textContent = t("tutorialLink", lang);
  el("fullscreenBtn").textContent = document.fullscreenElement ? t("exitFullscreen", lang) : t("fullscreen", lang);

  const chapter = CHAPTERS[settings.chapterIndex];
  el("chapterIndicator").textContent = `${settings.chapterIndex + 1} / ${CHAPTERS.length}`;
  el("chapterNameLabel").textContent = lang === "bn" ? chapter.bn : chapter.en;

  const customOpt = el("verbSelect").querySelector('option[value="__custom__"]');
  if (customOpt) customOpt.textContent = "✏️ " + t("customVerb", lang);
}

function syncModeUI() {
  el("modeTenseBtn").classList.toggle("active", settings.mode === "tense");
  el("modeIrregularBtn").classList.toggle("active", settings.mode === "irregular");
  el("modeVocabBtn").classList.toggle("active", settings.mode === "vocab");
  el("tenseControls").hidden = settings.mode !== "tense";
  el("irregularControls").hidden = settings.mode !== "irregular";
  el("vocabControls").hidden = settings.mode !== "vocab";
  el("prevChapterBtn").disabled = settings.chapterIndex <= 0;
  el("nextChapterBtn").disabled = settings.chapterIndex >= CHAPTERS.length - 1;
}

function syncPanelInputs() {
  el("languageSelect").value = settings.language;
  if (VERB_LIST.includes(settings.verb)) {
    el("verbSelect").value = settings.verb;
  } else {
    el("verbSelect").value = "__custom__";
  }
  el("irregularCountInput").value = settings.irregularCount;
  el("vocabCountInput").value = settings.vocabCount;
  el("directionToggle").checked = settings.direction === "bn_en";
  el("pagesInput").value = settings.pages;
  el("showHeaderInfoToggle").checked = settings.showHeaderInfo;
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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadSheetsAsImages() {
  const pages = document.querySelectorAll("#sheets .page");
  const blobs = [];
  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff" });
    blobs.push(await new Promise((resolve) => canvas.toBlob(resolve, "image/png")));
  }
  if (blobs.length === 1) {
    downloadBlob(blobs[0], "english-practice.png");
    return;
  }
  const zip = new JSZip();
  blobs.forEach((blob, i) => zip.file(`english-practice-${i + 1}.png`, blob));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, "english-practice.zip");
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
  renderSheets(settings);
  updateTimerDisplay(settings.language);
}

function generateAndRender() {
  saveSettings(settings);
  refreshPanelLabels();
  syncModeUI();
  generateAllSheetsData(settings);
  renderSheets(settings);
  updateTimerDisplay(settings.language);
}

function goToChapter(index) {
  settings.chapterIndex = Math.max(0, Math.min(CHAPTERS.length - 1, index));
  generateAndRender();
}

function init() {
  populateVerbSelect();
  syncPanelInputs();
  refreshPanelLabels();
  generateAllSheetsData(settings);
  renderSheets(settings);

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
  el("modeIrregularBtn").addEventListener("click", () => {
    settings.mode = "irregular";
    generateAndRender();
  });
  el("modeVocabBtn").addEventListener("click", () => {
    settings.mode = "vocab";
    generateAndRender();
  });

  el("prevChapterBtn").addEventListener("click", () => goToChapter(settings.chapterIndex - 1));
  el("nextChapterBtn").addEventListener("click", () => goToChapter(settings.chapterIndex + 1));

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

  el("irregularCountInput").addEventListener("change", (e) => {
    settings.irregularCount = Math.max(1, Math.min(89, parseInt(e.target.value, 10) || 12));
    generateAndRender();
  });

  el("vocabCountInput").addEventListener("change", (e) => {
    settings.vocabCount = Math.max(1, Math.min(120, parseInt(e.target.value, 10) || 20));
    generateAndRender();
  });

  el("directionToggle").addEventListener("change", (e) => {
    settings.direction = e.target.checked ? "bn_en" : "en_bn";
    rerender();
  });

  el("pagesInput").addEventListener("change", (e) => {
    settings.pages = Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1));
    generateAndRender();
  });

  el("showHeaderInfoToggle").addEventListener("change", (e) => {
    settings.showHeaderInfo = e.target.checked;
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

  el("generateBtn").addEventListener("click", generateAndRender);
  el("printBtn").addEventListener("click", () => window.print());
  el("downloadImageBtn").addEventListener("click", downloadSheetsAsImages);
  el("fullscreenBtn").addEventListener("click", toggleFullscreen);
  el("exitFullscreenBtn").addEventListener("click", () => document.exitFullscreen());
  document.addEventListener("fullscreenchange", refreshPanelLabels);

  el("exportBtn").addEventListener("click", () => exportSettingsJSON(settings));

  el("importInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importSettingsJSON(file, (loaded) => {
      settings = loaded;
      syncPanelInputs();
      generateAndRender();
    });
    e.target.value = "";
  });

  el("resetBtn").addEventListener("click", () => {
    settings = { ...DEFAULT_SETTINGS };
    syncPanelInputs();
    generateAndRender();
  });

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
    const target = e.target.closest(".answer");
    if (target) target.classList.toggle("revealed");
  });
}

init();
