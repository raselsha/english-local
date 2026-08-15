let sheetsData = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomVerbs(count) {
  const pool = IRREGULAR_VERBS.filter((v) => v.v1.toLowerCase() !== "be");
  const n = Math.min(Math.max(1, count), pool.length);
  return shuffle(pool).slice(0, n);
}

function pickRandomVocab(count) {
  const n = Math.min(Math.max(1, count), VOCAB_WORDS.length);
  return shuffle(VOCAB_WORDS).slice(0, n);
}

function generateAllSheetsData(settings) {
  sheetsData = [];
  const pageCount = Math.min(50, Math.max(1, settings.pages));
  for (let i = 0; i < pageCount; i++) {
    if (settings.mode === "irregular") {
      sheetsData.push({ mode: "irregular", verbs: pickRandomVerbs(settings.irregularCount) });
    } else if (settings.mode === "vocab") {
      sheetsData.push({ mode: "vocab", words: pickRandomVocab(settings.vocabCount) });
    } else {
      const chapter = CHAPTERS[settings.chapterIndex];
      sheetsData.push({
        mode: "tense",
        chapter,
        chapterIndex: settings.chapterIndex,
        verb: settings.verb,
        bnMeaning: verbBnMeaning(settings.verb),
        rows: buildChapterRows(settings.chapterIndex, settings.verb),
      });
    }
  }
}
