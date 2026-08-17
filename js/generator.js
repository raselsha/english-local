let sheetsData = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const VOCAB_PAGE_SIZE = 10; // 2 columns x 5 rows per page

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// "Number of words" is the total to include from the topic (capped at
// the topic's own size). That total is then paginated 10 at a time —
// a topic with more than one page's worth is reachable via a separate
// "words X-Y of Z" pager, distinct from the topic Prev/Next, which
// always moves to the next/previous topic.
function pickVocabForTopic(topicIndex, count, wordPage) {
  const topic = VOCAB_TOPICS[topicIndex] || VOCAB_TOPICS[0];
  const pool = VOCAB_WORDS.filter((w) => w.topic === topic.id);
  const total = Math.min(Math.max(1, count), pool.length);
  const pageCount = Math.max(1, Math.ceil(total / VOCAB_PAGE_SIZE));
  const page = Math.max(0, Math.min(wordPage || 0, pageCount - 1));
  const start = page * VOCAB_PAGE_SIZE;
  return {
    words: pool.slice(start, Math.min(start + VOCAB_PAGE_SIZE, total)),
    start,
    total,
    page,
    pageCount,
  };
}

// Like pickVocabForTopic, but over the flat IRREGULAR_VERBS list — no
// topic grouping, just "first N verbs" paginated 10 at a time.
function pickRegularVerbsPage(count, page) {
  const pool = IRREGULAR_VERBS;
  const total = Math.min(Math.max(1, count), pool.length);
  const pageCount = Math.max(1, Math.ceil(total / VOCAB_PAGE_SIZE));
  const p = Math.max(0, Math.min(page || 0, pageCount - 1));
  const start = p * VOCAB_PAGE_SIZE;
  return {
    verbs: pool.slice(start, Math.min(start + VOCAB_PAGE_SIZE, total)),
    start,
    total,
    page: p,
    pageCount,
  };
}

function generateAllSheetsData(settings) {
  sheetsData = [];
  if (settings.mode === "regularVerbs") {
    const picked = pickRegularVerbsPage(settings.regularVerbsCount, settings.regularVerbsPage);
    sheetsData.push({ mode: "regularVerbs", ...picked });
  } else if (settings.mode === "vocab") {
    const topic = VOCAB_TOPICS[settings.vocabTopicIndex] || VOCAB_TOPICS[0];
    const picked = pickVocabForTopic(settings.vocabTopicIndex, settings.vocabCount, settings.vocabWordPage);
    sheetsData.push({
      mode: "vocab",
      topic,
      topicIndex: settings.vocabTopicIndex,
      words: picked.words,
      wordPage: picked.page,
      wordPageCount: picked.pageCount,
      wordStart: picked.start,
      wordTotal: picked.total,
    });
  } else if (settings.mode === "pos") {
    const category = PARTS_OF_SPEECH[settings.posCategoryIndex] || PARTS_OF_SPEECH[0];
    sheetsData.push({
      mode: "pos",
      category,
      categoryIndex: settings.posCategoryIndex,
      examples: category.examples,
    });
  } else if (settings.mode === "synonyms") {
    const words = SYNONYMS_ANTONYMS.slice(0, Math.max(1, Math.min(settings.synonymsCount, SYNONYMS_ANTONYMS.length)));
    sheetsData.push({ mode: "synonyms", wordChunks: chunkArray(words, VOCAB_PAGE_SIZE) });
  } else if (settings.mode === "sentence") {
    sheetsData.push({ mode: "sentence" });
  } else if (settings.mode === "quiz") {
    // quiz is an interactive session, not a printable sheet; handled
    // separately in main.js (startQuiz), not through this pipeline.
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
