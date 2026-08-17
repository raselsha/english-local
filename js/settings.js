const STORAGE_KEY = "englishPracticeSettings";

const DEFAULT_SETTINGS = {
  language: "en",
  mode: "tense", // "tense" | "regularVerbs" | "vocab" | "pos" | "synonyms" | "sentence" | "quiz"
  chapterIndex: 0, // index into CHAPTERS (tense mode)
  tenseColumnIndex: 0, // 0=positive, 1=negative, 2=interrogative
  verb: "write", // current verb for tense mode
  direction: "en_bn", // "en_bn" | "bn_en"
  regularVerbsPage: 0, // which batch of `regularVerbsCount` verbs
  regularVerbsCount: 20,
  vocabTopicIndex: 0, // index into VOCAB_TOPICS
  vocabWordPage: 0, // which batch of `vocabCount` words within the topic
  vocabCount: 20,
  possessivePronoun: "my", // id into POSSESSIVE_PRONOUNS
  posCategoryIndex: 0, // index into PARTS_OF_SPEECH
  synonymsCount: 10,
  quizPool: "vocab", // id into QUIZ_POOLS
  quizCount: 10,
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
