const STORAGE_KEY = "englishPracticeSettings";

const DEFAULT_SETTINGS = {
  language: "en",
  mode: "tense", // "tense" | "irregular" | "vocab"
  chapterIndex: 0, // index into CHAPTERS (tense mode)
  verb: "write", // current verb for tense mode
  direction: "en_bn", // "en_bn" | "bn_en"
  irregularCount: 12,
  vocabCount: 20,
  pages: 1,
  showHeaderInfo: true,
  showAnswers: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function exportSettingsJSON(settings) {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "english-practice-settings.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importSettingsJSON(file, onLoaded) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      onLoaded({ ...DEFAULT_SETTINGS, ...parsed });
    } catch (e) {
      alert("Invalid settings JSON file.");
    }
  };
  reader.readAsText(file);
}
