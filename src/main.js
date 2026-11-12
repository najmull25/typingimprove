import { defaultPassages } from './passages.js';

const $ = (id) => document.getElementById(id);

// ================= STORAGE HELPERS =================

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}

// ================= PASSAGE LIBRARY =================
// ডিফল্ট প্যাসেজ থাকে passages.js ফাইলে।
// ব্যবহারকারীর নিজের প্যাসেজ আলাদাভাবে "customPassages" নামে সেভ হয়।

function loadCustomPassages() {
  const stored = loadJSON('customPassages', null);

  if (stored && Array.isArray(stored.en) && Array.isArray(stored.bn)) {
    return stored;
  }

  // পুরোনো সংস্করণ (passageLibrary) থেকে নিজের প্যাসেজগুলো উদ্ধার করা
  const old = loadJSON('passageLibrary', null);
  const migrated = { en: [], bn: [] };

  if (old) {
    const defaultTitles = new Set(
      [...defaultPassages.en, ...defaultPassages.bn].map((p) => p.title)
    );

    ['en', 'bn'].forEach((lang) => {
      if (!Array.isArray(old[lang])) return;

      const defaults = defaultPassages[lang];

      const hasNewDefaults = defaults.every(
        (p, i) =>
          old[lang][i]?.title === p.title && old[lang][i]?.text === p.text
      );

      migrated[lang] = old[lang]
        .slice(hasNewDefaults ? defaults.length : 2)
        .filter((p) => p && p.title && !defaultTitles.has(p.title));
    });
  }

  saveJSON('customPassages', migrated);

  return migrated;
}

let customPassages = loadCustomPassages();

function getLibrary(lang) {
  return [...defaultPassages[lang], ...customPassages[lang]];
}

// ================= STATE =================

let timeLeft = 300;
let totalSeconds = 300;
let interval = null;
let started = false;
let finished = false;
let startTime = 0;
let isCustomMode = false;

// ================= CURRENT PASSAGE =================

function getCurrentPassage() {
  if (isCustomMode) return '';

  return (
    getLibrary($('language').value)[Number($('passageSelect').value)]?.text ||
    ''
  );
}

// ================= HELPERS =================

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));

  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;
}

function getElapsedSeconds() {
  if (!started || !startTime) return 0;

  return Math.max(0, (Date.now() - startTime) / 1000);
}

function getWords(text) {
  const trimmed = text.trim();

  if (!trimmed) return [];

  return trimmed.split(/\s+/u);
}

function escapeHTML(text) {
  return text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ================= LIVE HIGHLIGHT (সবুজ = ঠিক, লাল = ভুল) =================

let segmentCache = { text: null, segments: [] };

// বাংলা যুক্তাক্ষর যাতে ভেঙে না যায়, তাই grapheme ধরে ভাগ করা হয়
function getSegments(text) {
  if (segmentCache.text === text) return segmentCache.segments;

  const segments =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
          (s) => s.segment
        )
      : Array.from(text);

  segmentCache = { text, segments };

  return segments;
}

function renderHighlight() {
  const box = $('passage');

  if (!box || isCustomMode) return;

  const text = getCurrentPassage();
  const typed = Array.from($('typingInput').value);
  const segments = getSegments(text);

  let position = 0;
  let currentMarked = false;
  let html = '';

  for (const segment of segments) {
    const length = Array.from(segment).length;

    let cls = '';

    if (typed.length >= position + length) {
      cls = typed.slice(position, position + length).join('') === segment ? 'ok' : 'bad';
    } else if (!currentMarked) {
      cls = 'cur';
      currentMarked = true;
    }

    html += `<span class="${cls}">${escapeHTML(segment)}</span>`;

    position += length;
  }

  box.innerHTML = html;

  const cur = box.querySelector('.cur');

  if (cur) {
    box.scrollTop = Math.max(0, cur.offsetTop - box.clientHeight / 2);
  }
}

// ================= LOAD PASSAGES =================

function loadPassages() {
  if (isCustomMode) return;

  const select = $('passageSelect');

  if (!select) return;

  select.innerHTML = '';

  getLibrary($('language').value).forEach((p, idx) => {
    const opt = document.createElement('option');

    opt.value = idx;
    opt.textContent = p.title;

    select.appendChild(opt);
  });

  showPassage();
}

// ================= SHOW PASSAGE =================

function showPassage() {
  const passageBox = $('passage');

  if (!passageBox) return;

  if (isCustomMode) {
    passageBox.textContent = '';
  } else {
    renderHighlight();
  }
}

// ================= RESET RESULT DISPLAY =================

function resetResultDisplay() {
  $('wpmWithSpace').textContent = 0;
  $('wpmWithoutSpace').textContent = 0;
  $('wordWpm').textContent = 0;

  $('accuracy').textContent = '100%';

  $('totalTypedWords').textContent = 0;
  $('correctWords').textContent = 0;

  $('charactersWithSpace').textContent = 0;
  $('charactersWithoutSpace').textContent = 0;

  $('errors').textContent = 0;
  $('resultDuration').textContent = 'N/A';

  $('liveStats').textContent = 'WPM: 0 | Accuracy: 100%';
}

// ================= RESET TEST =================

function resetTest() {
  clearInterval(interval);

  interval = null;
  started = false;
  finished = false;
  startTime = 0;

  totalSeconds = Number($('duration').value) * 60;
  timeLeft = totalSeconds;

  $('timer').textContent = formatTime(timeLeft);

  $('typingInput').value = '';
  $('typingInput').disabled = false; // টাইপ শুরু করলেই টাইমার চালু হবে

  $('typingInput').scrollTop = 0;
  $('passage').scrollTop = 0;

  $('startBtn').disabled = false;
  $('startBtn').textContent = 'Start Test';

  resetResultDisplay();

  showPassage();
}

// ================= UPDATE STATISTICS =================

function updateStats() {
  const typedText = $('typingInput').value;

  const input = Array.from(typedText);

  const totalCharacters = input.length;

  const charactersWithoutSpace = input.filter((char) => !/\s/u.test(char)).length;

  const typedWords = getWords(typedText);

  const totalTypedWords = typedWords.length;

  const elapsedMinutes = started
    ? Math.max(getElapsedSeconds() / 60, 1 / 60)
    : 0;

  let wpmWithSpace = 0;
  let wpmWithoutSpace = 0;
  let wordWpm = 0;

  if (elapsedMinutes > 0) {
    wpmWithSpace = Math.round(totalCharacters / 5 / elapsedMinutes);

    wpmWithoutSpace = Math.round(charactersWithoutSpace / 5 / elapsedMinutes);

    wordWpm = Math.round(totalTypedWords / elapsedMinutes);
  }

  let correctCharacters = 0;
  let mistakes = 0;
  let correctWordCount = 0;
  let accuracy = 100;

  if (!isCustomMode) {
    const targetText = getCurrentPassage();

    const target = Array.from(targetText);

    for (let i = 0; i < input.length; i++) {
      if (input[i] === target[i]) {
        correctCharacters++;
      } else {
        mistakes++;
      }
    }

    accuracy =
      totalCharacters > 0
        ? Math.round((correctCharacters / totalCharacters) * 100)
        : 100;

    const targetWords = getWords(targetText);

    for (let i = 0; i < typedWords.length; i++) {
      if (targetWords[i] !== undefined && typedWords[i] === targetWords[i]) {
        correctWordCount++;
      }
    }
  }

  $('wpmWithSpace').textContent = wpmWithSpace;
  $('wpmWithoutSpace').textContent = wpmWithoutSpace;
  $('wordWpm').textContent = wordWpm;

  $('totalTypedWords').textContent = totalTypedWords;

  $('charactersWithSpace').textContent = totalCharacters;

  $('charactersWithoutSpace').textContent = charactersWithoutSpace;

  if (isCustomMode) {
    $('accuracy').textContent = 'N/A';
    $('correctWords').textContent = 'N/A';
    $('errors').textContent = 'N/A';
  } else {
    $('accuracy').textContent = accuracy + '%';
    $('correctWords').textContent = correctWordCount;
    $('errors').textContent = mistakes;
  }

  if (started) {
    $('resultDuration').textContent = formatTime(
      Math.min(Math.round(getElapsedSeconds()), totalSeconds)
    );
  }

  $('liveStats').textContent = `WPM: ${wpmWithSpace} | Accuracy: ${
    isCustomMode ? 'N/A' : accuracy + '%'
  }`;
}

// ================= WPM CHART =================

function renderChart(history) {
  const el = $('wpmChart');

  if (!el) return;

  const data = history
    .slice(0, 20)
    .map((h) => Number(h.wpm) || 0)
    .reverse();

  if (data.length < 2) {
    el.textContent = 'গ্রাফ দেখতে কমপক্ষে ২টি টেস্ট সম্পন্ন করুন।';
    return;
  }

  const W = 600;
  const H = 180;
  const P = 30;

  const max = Math.max(...data, 1);

  const x = (i) => P + (i / (data.length - 1)) * (W - 2 * P);
  const y = (v) => H - P - (v / max) * (H - 2 * P);

  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');

  const dots = data
    .map(
      (v, i) =>
        `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#3b82f6"><title>${v} WPM</title></circle>`
    )
    .join('');

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="WPM progress chart">
      <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="#94a3b8" stroke-width="1" />
      <line x1="${P}" y1="${P}" x2="${P}" y2="${H - P}" stroke="#94a3b8" stroke-width="1" />
      <text x="${P - 6}" y="${P + 4}" text-anchor="end" font-size="12" fill="#94a3b8">${max}</text>
      <text x="${P - 6}" y="${H - P + 4}" text-anchor="end" font-size="12" fill="#94a3b8">0</text>
      <polyline points="${points}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round" />
      ${dots}
    </svg>
  `;
}

// ================= DASHBOARD =================

function renderDashboard() {
  $('bestWpm').textContent = localStorage.getItem('bestWpm') || 0;

  $('lowestWpm').textContent = localStorage.getItem('lowestWpm') || 0;

  $('totalTests').textContent = localStorage.getItem('totalTests') || 0;

  const today = new Date().toLocaleDateString();

  const history = loadJSON('history', []);

  $('todayTests').textContent = history.filter((item) =>
    String(item.date).startsWith(today)
  ).length;

  renderChart(history);

  renderHistory();
}

// ================= HISTORY (প্রতিদিনের হিসাব ও গ্রাফ) =================

function getDayKey(date = new Date()) {
  const y = date.getFullYear();

  const mo = String(date.getMonth() + 1).padStart(2, '0');

  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${mo}-${d}`;
}

function formatDay(key, withYear = true) {
  const [y, mo, d] = key.split('-').map(Number);

  return new Date(y, mo - 1, d).toLocaleDateString(
    'en-GB',
    withYear
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { day: 'numeric', month: 'short' }
  );
}

// প্রতিদিনের হিসাব: { '2026-11-13': { en: {sum, count, best}, bn: {...} } }
function loadDailyStats() {
  const stored = loadJSON('dailyStats', null);

  if (stored) return stored;

  // আগের "dailyBest" (শুধু সর্বোচ্চ গতি) থেকে একবার রূপান্তর
  const migrated = {};

  const old = loadJSON('dailyBest', {});

  Object.keys(old).forEach((day) => {
    migrated[day] = {};

    ['en', 'bn'].forEach((lang) => {
      const v = old[day]?.[lang] || 0;

      if (v > 0) migrated[day][lang] = { sum: v, count: 1, best: v };
    });
  });

  saveJSON('dailyStats', migrated);

  return migrated;
}

function getLastDays(count) {
  const list = [];

  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    list.push(
      getDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))
    );
  }

  return list;
}

function buildLangChart(title, lang, stats, days, color) {
  const points = [];

  let sum = 0;
  let count = 0;
  let best = 0;

  days.forEach((day, i) => {
    const s = stats[day]?.[lang];

    if (!s || !s.count) return;

    sum += s.sum;
    count += s.count;
    best = Math.max(best, s.best);

    points.push({
      i,
      day,
      avg: Math.round(s.sum / s.count),
      best: s.best,
      count: s.count,
    });
  });

  const heading = `<h4 style="margin: 0 0 4px;">${title}</h4>`;

  if (!points.length) {
    return `
      <div style="margin-bottom: 26px;">
        ${heading}
        <p class="result-note" style="margin: 4px 0 0;">গত ${days.length} দিনে কোনো টেস্ট দেওয়া হয়নি।</p>
      </div>
    `;
  }

  const W = 600;
  const H = 210;
  const PL = 38;
  const PR = 14;
  const PT = 14;
  const PB = 28;

  const max = Math.max(
    10,
    Math.ceil(Math.max(...points.map((p) => p.best)) / 10) * 10
  );

  const x = (i) => PL + (i / (days.length - 1)) * (W - PL - PR);
  const y = (v) => H - PB - (v / max) * (H - PT - PB);

  const line = (key) => points.map((p) => `${x(p.i)},${y(p[key])}`).join(' ');

  const grid = [0, max / 2, max]
    .map(
      (v) => `
        <line x1="${PL}" y1="${y(v)}" x2="${W - PR}" y2="${y(v)}" stroke="#94a3b8" stroke-opacity="0.35" stroke-width="1" />
        <text x="${PL - 6}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="#94a3b8">${v}</text>
      `
    )
    .join('');

  const labelIndexes = [0, Math.floor((days.length - 1) / 2), days.length - 1];

  const xLabels = labelIndexes
    .map(
      (i, k) =>
        `<text x="${x(i)}" y="${H - 8}" text-anchor="${
          k === 0 ? 'start' : k === 2 ? 'end' : 'middle'
        }" font-size="12" fill="#94a3b8">${formatDay(days[i], false)}</text>`
    )
    .join('');

  const dots = points
    .map(
      (p) =>
        `<circle cx="${x(p.i)}" cy="${y(p.avg)}" r="4" fill="${color}"><title>${formatDay(
          p.day
        )}: গড় ${p.avg} WPM, সর্বোচ্চ ${p.best} WPM (${p.count}টি টেস্ট)</title></circle>`
    )
    .join('');

  return `
    <div style="margin-bottom: 26px;">
      ${heading}
      <p class="result-note" style="margin: 0 0 6px;">
        গড়: <strong>${Math.round(sum / count)} WPM</strong> ·
        সর্বোচ্চ: <strong>${best} WPM</strong> ·
        মোট টেস্ট: <strong>${count}</strong>
        &nbsp;|&nbsp;
        <span style="color: ${color}; font-weight: 600;">● দৈনিক গড়</span>
        &nbsp;
        <span style="opacity: 0.8;">┄ দৈনিক সর্বোচ্চ</span>
      </p>
      <svg viewBox="0 0 ${W} ${H}" style="width: 100%; height: auto;" role="img" aria-label="${title}">
        ${grid}
        <polyline points="${line('best')}" fill="none" stroke="${color}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round" />
        <polyline points="${line('avg')}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" />
        ${dots}
        ${xLabels}
      </svg>
    </div>
  `;
}

function renderHistory() {
  const box = $('historyList');

  if (!box) return;

  const stats = loadDailyStats();

  const allDays = Object.keys(stats)
    .filter((d) => stats[d] && (stats[d].en || stats[d].bn))
    .sort()
    .reverse();

  if (!allDays.length) {
    box.textContent = loadJSON('history', []).length
      ? 'এখন থেকে ইংরেজি ও বাংলা গতি আলাদাভাবে সেভ হচ্ছে। নতুন টেস্ট দিলে এখানে প্রতিদিনের হিসাব ও গ্রাফ দেখা যাবে।'
      : 'এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।';

    return;
  }

  const last30 = getLastDays(30);

  const charts =
    buildLangChart('বাংলা টাইপিং (গত ৩০ দিন)', 'bn', stats, last30, '#f59e0b') +
    buildLangChart('English Typing (গত ৩০ দিন)', 'en', stats, last30, '#10b981');

  const gridStyle =
    'display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 8px; align-items: center; padding: 12px 10px;';

  const divider =
    '<hr style="border: 0; border-top: 1px solid #94a3b8; opacity: 0.3; margin: 0;">';

  const cell = (s, color) =>
    s && s.count
      ? `<span><span style="color: ${color}; font-weight: bold;">⚡ ${s.best} WPM</span><br><small style="opacity: 0.7;">গড় ${Math.round(
          s.sum / s.count
        )} WPM</small></span>`
      : '<span style="opacity: 0.5;">—</span>';

  const today = getDayKey();

  const head = `
    <div style="${gridStyle} font-weight: bold; opacity: 0.8;">
      <span>📅 তারিখ</span>
      <span>English (সর্বোচ্চ / গড়)</span>
      <span>বাংলা (সর্বোচ্চ / গড়)</span>
    </div>
  `;

  const rows = allDays
    .slice(0, 60)
    .map(
      (day) => `
        <div style="${gridStyle}">
          <span style="color: #3b82f6; font-weight: 500;">${formatDay(day)}${
            day === today ? ' (আজ)' : ''
          }</span>
          ${cell(stats[day].en, '#10b981')}
          ${cell(stats[day].bn, '#f59e0b')}
        </div>
      `
    )
    .join(divider);

  box.innerHTML =
    charts +
    '<h4 style="margin: 0 0 6px;">প্রতিদিনের হিসাব</h4>' +
    head +
    divider +
    rows;
}

// ================= FINISH TEST =================

function finishTest() {
  if (finished || !started) return;

  updateStats();

  finished = true;

  clearInterval(interval);

  interval = null;

  $('typingInput').disabled = true;

  $('startBtn').disabled = false;

  $('startBtn').textContent = 'Start Again';

  const finalDuration = Math.min(Math.round(getElapsedSeconds()), totalSeconds);

  $('resultDuration').textContent = formatTime(finalDuration);

  const wpm = Number($('wpmWithSpace').textContent);

  const total = Number(localStorage.getItem('totalTests') || 0) + 1;

  const best = Math.max(wpm, Number(localStorage.getItem('bestWpm') || 0));

  const oldLowest = Number(localStorage.getItem('lowestWpm') || 0);

  const lowest = oldLowest === 0 ? wpm : Math.min(wpm, oldLowest);

  localStorage.setItem('totalTests', total);

  localStorage.setItem('bestWpm', best);

  localStorage.setItem('lowestWpm', lowest);

  const history = loadJSON('history', []);

  history.unshift({
    date: new Date().toLocaleString(),

    wpm,

    wordWpm: Number($('wordWpm').textContent),

    accuracy: $('accuracy').textContent,

    totalTypedWords: Number($('totalTypedWords').textContent),

    correctWords: $('correctWords').textContent,

    charactersWithSpace: Number($('charactersWithSpace').textContent),

    charactersWithoutSpace: Number($('charactersWithoutSpace').textContent),

    duration: $('resultDuration').textContent,

    mistakes: $('errors').textContent,

    mode: isCustomMode ? 'Custom' : 'Normal',

    lang: $('language').value,
  });

  saveJSON('history', history.slice(0, 20));

  // প্রতিদিনের হিসাব: গড় ও সর্বোচ্চ গতি (ইংরেজি ও বাংলা আলাদা)
  if (wpm > 0) {
    const stats = loadDailyStats();

    const day = getDayKey();

    const lang = $('language').value;

    stats[day] = stats[day] || {};

    const current = stats[day][lang] || { sum: 0, count: 0, best: 0 };

    stats[day][lang] = {
      sum: current.sum + wpm,
      count: current.count + 1,
      best: Math.max(current.best, wpm),
    };

    const trimmed = {};

    Object.keys(stats)
      .sort()
      .reverse()
      .slice(0, 365)
      .forEach((k) => {
        trimmed[k] = stats[k];
      });

    saveJSON('dailyStats', trimmed);
  }

  renderDashboard();

  // alert-এর বদলে সরাসরি রেজাল্টে স্ক্রল করে নিয়ে যাওয়া হয়
  const resultPanel = document.querySelector('.result-panel');

  if (resultPanel) {
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ================= START TEST =================

function tick() {
  const remaining = Math.max(0, totalSeconds - Math.floor(getElapsedSeconds()));

  if (remaining !== timeLeft) {
    timeLeft = remaining;

    $('timer').textContent = formatTime(timeLeft);

    updateStats();
  }

  if (remaining <= 0) {
    $('timer').textContent = '00:00';

    finishTest();
  }
}

function startTest() {
  if (finished) {
    resetTest();
  }

  if (started) return;

  started = true;

  startTime = Date.now();

  totalSeconds = Number($('duration').value) * 60;

  timeLeft = totalSeconds;

  $('typingInput').disabled = false;

  $('startBtn').disabled = true;

  updateStats();

  interval = setInterval(tick, 250);
}

$('startBtn').addEventListener('click', () => {
  startTest();

  $('typingInput').focus();
});

// ================= TYPING INPUT =================

const typingBox = $('typingInput');

typingBox.addEventListener('input', () => {
  if (finished) return;

  // প্রথম অক্ষর টাইপ করলেই টাইমার শুরু হবে
  if (!started) startTest();

  updateStats();

  renderHighlight();

  if (
    !isCustomMode &&
    Array.from(typingBox.value).length >= Array.from(getCurrentPassage()).length
  ) {
    finishTest();
  }
});

// কপি-পেস্ট বন্ধ, যাতে সঠিক গতি মাপা যায়
typingBox.addEventListener('paste', (e) => e.preventDefault());
typingBox.addEventListener('drop', (e) => e.preventDefault());

// ================= SAVE PASSAGE =================

$('savePassage').addEventListener('click', () => {
  const title = $('passageTitle').value.trim();

  const text = $('newPassage').value;

  const lang = $('language').value;

  if (!title || !text.trim()) {
    alert('Passage Title এবং Text লিখুন!');

    return;
  }

  customPassages[lang].push({ title, text });

  saveJSON('customPassages', customPassages);

  loadPassages();

  $('passageSelect').value = getLibrary(lang).length - 1;

  $('passageTitle').value = '';

  $('newPassage').value = '';

  resetTest();

  $('saveMessage').textContent = 'Passage Successfully Saved!';

  setTimeout(() => {
    $('saveMessage').textContent = '';

    closeDrawer();
  }, 1200);
});

// ================= LANGUAGE / PASSAGE / DURATION CHANGE =================

$('language').addEventListener('change', () => {
  loadPassages();

  resetTest();
});

$('passageSelect').addEventListener('change', resetTest);

$('duration').addEventListener('change', resetTest);

// ================= RESET BUTTON =================

$('resetBtn').addEventListener('click', resetTest);

// ================= END BUTTON =================

$('endBtn').addEventListener('click', () => {
  if (!started || finished) return;

  finishTest();
});

// ================= SIDE DRAWER (My Passages) =================

const drawer = $('passageDrawer');

const drawerOverlay = $('drawerOverlay');

function updateDrawerInfo() {
  const lang = $('language').value;

  const idx = Number($('passageSelect').value);

  const current = getLibrary(lang)[idx];

  const isDefault = idx < defaultPassages[lang].length;

  $('drawerLang').textContent = lang === 'bn' ? 'বাংলা' : 'English';

  $('currentPassageName').textContent = current ? current.title : '—';

  $('deletePassageBtn').disabled = isDefault;

  $('deleteHint').textContent = isDefault
    ? 'এটি ডিফল্ট প্যাসেজ, তাই ডিলিট করা যায় না।'
    : 'এটি আপনার নিজের প্যাসেজ, ডিলিট করা যাবে।';
}

function openDrawer() {
  updateDrawerInfo();

  $('saveMessage').textContent = '';

  drawer.classList.add('open');

  drawerOverlay.classList.add('open');

  drawer.setAttribute('aria-hidden', 'false');

  setTimeout(() => $('passageTitle').focus(), 300);
}

function closeDrawer() {
  drawer.classList.remove('open');

  drawerOverlay.classList.remove('open');

  drawer.setAttribute('aria-hidden', 'true');
}

$('passageManagerBtn').addEventListener('click', openDrawer);

$('closeDrawerBtn').addEventListener('click', closeDrawer);

drawerOverlay.addEventListener('click', closeDrawer);

// ================= ESC: ড্রয়ার খোলা থাকলে বন্ধ, নইলে টেস্ট রিসেট =================

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  if (drawer.classList.contains('open')) {
    closeDrawer();

    return;
  }

  resetTest();
});

// ================= DARK MODE =================

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);

  $('themeBtn').textContent = dark ? '☀ Light Mode' : '🌙 Dark Mode';

  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  } catch {
    /* ignore */
  }
}

$('themeBtn').addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

// ================= PAGE SECTIONS =================

const sections = {
  home: $('homePage'),
  practice: $('practicePage'),
  dashboard: $('dashboardPage'),
  history: $('historyPage'),
};

const navs = {
  home: $('navHome'),
  practice: $('navPractice'),
  dashboard: $('navDashboard'),
  history: $('navHistory'),
};

function showSection(name) {
  Object.keys(sections).forEach((k) => {
    sections[k].style.display = 'none';

    navs[k].classList.remove('active');
  });

  sections[name].style.display = 'block';

  navs[name].classList.add('active');

  if (name === 'dashboard' || name === 'history') {
    renderDashboard();
  }

  if (name === 'practice') {
    showPassage();
  }
}

Object.keys(navs).forEach((k) =>
  navs[k].addEventListener('click', (e) => {
    e.preventDefault();

    showSection(k);
  })
);

$('goToPracticeBtn').addEventListener('click', () => {
  showSection('practice');
});

// ================= DELETE PASSAGE =================

$('deletePassageBtn').addEventListener('click', () => {
  const idx = Number($('passageSelect').value);

  const lang = $('language').value;

  const defaultCount = defaultPassages[lang].length;

  // ডিফল্ট প্যাসেজ ডিলিট করা যায় না
  if (idx < defaultCount) {
    return alert('ডিফল্ট প্যাসেজ ডিলিট করা সম্ভব নয়!');
  }

  if (confirm('ডিলিট করবেন?')) {
    customPassages[lang].splice(idx - defaultCount, 1);

    saveJSON('customPassages', customPassages);

    loadPassages();

    resetTest();

    closeDrawer();
  }
});

// ================= CUSTOM PRACTICE MODE =================

$('customPracticeBtn').addEventListener('click', () => {
  isCustomMode = !isCustomMode;

  if (isCustomMode) {
    $('normalPassageSection').style.display = 'none';

    $('passageSelect').style.display = 'none';

    $('passageManagerBtn').style.display = 'none';

    closeDrawer();

    $('customPracticeBtn').textContent = 'Normal Practice';

    $('customPracticeBtn').classList.add('activeMode');

    $('typingInput').placeholder =
      'মোড একটিভ হয়েছে! অফলাইন বই দেখে টাইপ করা শুরু করুন, প্রথম অক্ষর টাইপ করলেই টাইমার চালু হবে...';
  } else {
    $('normalPassageSection').style.display = 'block';

    $('passageSelect').style.display = 'block';

    $('passageManagerBtn').style.display = '';

    $('customPracticeBtn').textContent = 'Customize Practice';

    $('customPracticeBtn').classList.remove('activeMode');

    $('typingInput').placeholder =
      'এখানে টাইপ করা শুরু করুন... (প্রথম অক্ষর টাইপ করলেই টাইমার চালু হবে)';

    loadPassages();
  }

  resetTest();
});

// ================= INITIALIZE WEBSITE =================

applyTheme(localStorage.getItem('theme') === 'dark');

loadPassages();

resetTest();

renderDashboard();
