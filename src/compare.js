// =====================================================================
//  src/compare.js : শব্দ ধরে টাইপ মেলানো
//
//  নিয়ম: প্রতিটি শব্দ নিজের ভেতরেই মাপা হয়।
//   • স্পেস (বা এন্টার) দিয়ে পরের শব্দে গেলে আগের শব্দের ভুলের প্রভাব পরের শব্দে পড়ে না
//   • একটা শব্দে অক্ষর বেশি বা কম লিখলে শুধু ওই শব্দটাই ভুল ধরা হয়
//   • Accuracy, ভুলের সংখ্যা, সঠিক শব্দ আর লাইভ হাইলাইট সবই এই নিয়মে চলে
// =====================================================================

const graphemes = (text) =>
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment)
    : Array.from(text);

const escapeHTML = (text) =>
  text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export function splitWords(text) {
  const t = String(text).trim();
  return t ? t.split(/\s+/u) : [];
}

// টাইপ করা লেখা আর প্যাসেজ শব্দ ধরে মিলিয়ে হিসাব
export function compareText(typedText, targetText) {
  const typedWords = splitWords(typedText);
  const targetWords = splitWords(targetText);
  const endsWithSpace = /\s$/u.test(typedText);

  let correctChars = 0;
  let wrongChars = 0;
  let correctWords = 0;

  typedWords.forEach((word, i) => {
    const target = targetWords[i];
    const completed = i < typedWords.length - 1 || endsWithSpace; // স্পেস দিয়ে শব্দ শেষ হয়েছে কি না

    const a = Array.from(word);
    const b = target === undefined ? [] : Array.from(target);
    const common = Math.min(a.length, b.length);

    for (let j = 0; j < common; j++) {
      if (a[j] === b[j]) correctChars++;
      else wrongChars++;
    }

    if (a.length > b.length) wrongChars += a.length - b.length; // বাড়তি অক্ষর
    if (completed && b.length > a.length) wrongChars += b.length - a.length; // ছুটে যাওয়া অক্ষর

    if (target !== undefined && word === target) correctWords++;
  });

  const total = correctChars + wrongChars;

  return {
    typedWords,
    targetWords,
    endsWithSpace,
    correctChars,
    wrongChars,
    correctWords,
    accuracy: total ? Math.round((correctChars / total) * 100) : 100
  };
}

// প্যাসেজ শেষ হয়েছে কি না (শেষ শব্দটি লেখা হলে বা তার পরে স্পেস দিলে)
export function isPassageComplete(typedText, targetText) {
  const { typedWords, targetWords, endsWithSpace } = compareText(typedText, targetText);

  if (!targetWords.length || typedWords.length < targetWords.length) return false;
  if (typedWords.length > targetWords.length) return true;

  const lastTarget = Array.from(targetWords[targetWords.length - 1]).length;
  const lastTyped = Array.from(typedWords[typedWords.length - 1]).length;

  return endsWithSpace || lastTyped >= lastTarget;
}

// ---------------------------------------------------------------------
//  প্যাসেজকে শব্দ ও ফাঁকা অংশে ভাগ করা (একই প্যাসেজের জন্য একবারই)
// ---------------------------------------------------------------------
let tokenCache = { text: null, tokens: [] };

function tokenize(text) {
  if (tokenCache.text === text) return tokenCache.tokens;

  const tokens = [];
  let wi = 0;

  text.split(/(\s+)/u).forEach((part) => {
    if (part === '') return;

    if (/^\s+$/u.test(part)) {
      tokens.push({ ws: true, str: part });
    } else {
      // বাংলা যুক্তাক্ষর যাতে ভেঙে না যায়, তাই grapheme ধরে ভাগ করা হয়
      tokens.push({ ws: false, str: part, segs: graphemes(part), len: Array.from(part).length, wi: wi++ });
    }
  });

  tokenCache = { text, tokens };

  return tokens;
}

// যেখানে প্যাসেজে এন্টার (নতুন লাইন) আছে, সেখানে স্পেস দিয়ে এগোনো আটকানোর জন্য
export function shouldBlockSpace(typedText, targetText) {
  const typedWords = splitWords(typedText);

  if (!typedWords.length || /\s$/u.test(typedText)) return false;

  const wi = typedWords.length - 1;
  const tokens = tokenize(targetText);
  const idx = tokens.findIndex((t) => !t.ws && t.wi === wi);

  if (idx < 0) return false;

  const next = tokens[idx + 1];

  if (!next || !next.ws || !next.str.includes('\n')) return false;

  return Array.from(typedWords[wi]).length >= tokens[idx].len;
}

// লাইভ হাইলাইটের HTML: সবুজ = ঠিক, লাল = ভুল, cur = এখন যেখানে টাইপ করতে হবে
export function renderPassageHtml(targetText, typedText) {
  const tokens = tokenize(targetText);
  const typedWords = splitWords(typedText).map((w) => Array.from(w));
  const endsWithSpace = /\s$/u.test(typedText);

  // এখন কোন শব্দে টাইপ হচ্ছে
  const curWi = typedWords.length === 0 ? 0 : endsWithSpace ? typedWords.length : typedWords.length - 1;

  let html = '';
  let markCurOnNextSpace = false;

  for (const tk of tokens) {
    if (tk.ws) {
      html += `<span class="${markCurOnNextSpace ? 'cur' : ''}">${escapeHTML(tk.str)}</span>`;
      markCurOnNextSpace = false;
      continue;
    }

    const typed = typedWords[tk.wi]; // এই শব্দের জন্য টাইপ করা অক্ষর (না থাকলে undefined)
    const typedLen = typed ? typed.length : 0;
    const completed = tk.wi < typedWords.length - 1 || (tk.wi === typedWords.length - 1 && endsWithSpace);
    const isCur = tk.wi === curWi;
    const lastIdx = tk.segs.length - 1;

    let pos = 0;
    let curPlaced = false;

    tk.segs.forEach((seg, k) => {
      const len = Array.from(seg).length;
      let cls = '';

      if (typed && typedLen >= pos + len) {
        cls = typed.slice(pos, pos + len).join('') === seg ? 'ok' : 'bad';
      } else if (typed && completed) {
        cls = 'bad'; // শব্দ শেষ না করেই এগিয়ে গেছে, ছুটে যাওয়া অক্ষর লাল
      } else if (isCur && !curPlaced) {
        cls = 'cur';
        curPlaced = true;
      }

      // বাড়তি অক্ষর টাইপ করলে শব্দের শেষ অক্ষর লাল, যাতে শব্দটা ভুল বোঝা যায়
      if (typed && typedLen > tk.len && k === lastIdx && cls === 'ok') cls = 'bad';

      html += `<span class="${cls}">${escapeHTML(seg)}</span>`;
      pos += len;
    });

    // শব্দ পুরো লেখা হয়েছে কিন্তু স্পেস দেওয়া হয়নি: পরের ফাঁকা অংশে কার্সর
    if (isCur && !curPlaced) markCurOnNextSpace = true;
  }

  return html;
}
