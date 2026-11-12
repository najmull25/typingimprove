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

  if ($('historyList')) {
    $('historyList').innerHTML = history.length
      ? history
          .map((h) => {
            const parts = String(h.date).split(', ');

            const datePart = parts[0] || h.date;

            const timePart = parts[1] || '';

            return `
              <div class="history-item">
                <span style="color: #3b82f6; width: 25%; text-align: left;">📅 ${datePart}</span>
                <span style="color: #64748b; width: 25%; text-align: left;">⏰ ${timePart}</span>
                <span style="color: #10b981; font-weight: bold; width: 25%; text-align: left;">⚡ ${h.wpm} WPM</span>
                <span style="color: #f43f5e; font-weight: bold; width: 25%; text-align: left;">🎯 ${h.accuracy}</span>
              </div>
            `;
          })
          .join(
            '<hr style="border: 0; border-top: 1px solid #94a3b8; opacity: 0.3; margin: 0;">'
          )
      : 'এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।';
  }
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
  });

  saveJSON('history', history.slice(0, 20));

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
