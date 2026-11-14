// =====================================================================
//  src/history/history.js : History পেজ
//
//  কাজ:
//   • #historyPage সেকশনের ভেতরে পুরো নতুন ডিজাইন বসায় (আলাদা HTML ফাইল লাগে না)
//   • main.js প্রতিবার window.renderHistoryPage(ডাটা) ডাকে, তখন পেজ আপডেট হয়
//   • ডাটা আসে ইউজারের নিজের সেভ করা টেস্ট থেকে (লগইন করলে অ্যাকাউন্টের ডাটা)
// =====================================================================
import './history.css';

// ---------------------------------------------------------------------
//  সাহায্যকারী ফাংশন (DOM লাগে না)
// ---------------------------------------------------------------------
// HELPERS-START
const pad = (n) => String(n).padStart(2, '0');

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// পুরোনো টেস্টে শুধু toLocaleString() এর লেখা ছিল, সেখান থেকে সময় বের করার চেষ্টা
function parseOldDate(str) {
  if (!str) return 0;
  const direct = Date.parse(str);
  if (Number.isFinite(direct)) return direct;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(str));
  if (m) {
    const t = new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +(m[6] || 0)).getTime();
    if (Number.isFinite(t)) return t;
  }
  return 0;
}

function parseDuration(str) {
  const m = /^(\d+):(\d{2})$/.exec(String(str || ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// আজ সহ শেষ n দিনের তারিখ-কী (পুরোনো থেকে নতুন)
function lastDayKeys(n, now = Date.now()) {
  const t = new Date(now);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(dayKey(new Date(t.getFullYear(), t.getMonth(), t.getDate() - i).getTime()));
  }
  return out;
}

// শেষ n দিনের শুরুর সময় (ফিল্টারের জন্য)
function cutoffFor(n, now = Date.now()) {
  const t = new Date(now);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() - (n - 1)).getTime();
}

function normalize(item, index) {
  const ts = Number(item.ts) || parseOldDate(item.date);
  const acc = parseFloat(String(item.accuracy));
  return {
    ...item,
    id: index,
    ts,
    wpm: Number(item.wpm) || 0,
    accuracyNum: Number.isFinite(acc) ? acc : null, // "95%" → 95, "N/A" → null
    seconds: parseDuration(item.duration),
    modeKey: item.mode === 'Custom' ? 'custom' : item.lang === 'bn' ? 'bn' : 'en'
  };
}

const MODE_LABEL = { en: 'English', bn: 'বাংলা', custom: 'Custom' };

function passageOf(e) {
  return e.passage || (e.modeKey === 'custom' ? 'Custom Practice' : '—');
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDur(s) {
  if (!s) return '—';
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${pad(s % 60)}s`;
}

function fmtTotal(sec) {
  if (sec < 3600) return `${Math.round(sec / 60)} Min`;
  return `${Math.floor(sec / 3600)}h ${Math.round((sec % 3600) / 60)}m`;
}

function accClass(n) {
  if (n == null) return 'na';
  if (n >= 90) return '';
  if (n >= 75) return 'mid';
  return 'low';
}

function computeStats(entries, data) {
  const bestWpm = Math.max(Number(data.bestWpm) || 0, ...entries.map((e) => e.wpm));
  const accs = entries.map((e) => e.accuracyNum).filter((n) => n != null);
  return {
    bestWpm,
    bestAcc: accs.length ? Math.max(...accs) : null,
    totalSec: entries.reduce((s, e) => s + e.seconds, 0),
    totalTests: Math.max(Number(data.totalTests) || 0, entries.length)
  };
}

// গ্রাফের জন্য প্রতিদিনের গড় WPM ও Accuracy
function buildChartData(entries, period, now = Date.now()) {
  const byDay = {};
  entries.forEach((e) => {
    if (!e.ts) return;
    (byDay[dayKey(e.ts)] = byDay[dayKey(e.ts)] || []).push(e);
  });

  const days = period === 'all' ? Object.keys(byDay).sort() : lastDayKeys(Number(period), now);

  const pts = [];
  days.forEach((k, i) => {
    const list = byDay[k];
    if (!list) return;
    const accs = list.map((e) => e.accuracyNum).filter((n) => n != null);
    pts.push({
      i,
      key: k,
      wpm: Math.round(list.reduce((s, e) => s + e.wpm, 0) / list.length),
      acc: accs.length ? Math.round(accs.reduce((s, n) => s + n, 0) / accs.length) : null
    });
  });

  return { days, pts };
}

function labelIndexes(n) {
  if (n <= 8) return Array.from({ length: n }, (_, i) => i);
  const set = new Set();
  for (let k = 0; k <= 6; k++) set.add(Math.round((k * (n - 1)) / 6));
  return [...set];
}

function shortDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// SVG-এর ভেতরের অংশ (লাইন, দাগ, লেখা)
function chartSvg(days, pts) {
  const W = 900, H = 260, L = 44, R = 16, T = 14, B = 34;
  const pw = W - L - R;
  const ph = H - T - B;

  if (!pts.length) {
    return `<text class="th-empty-svg" x="${W / 2}" y="${H / 2}" text-anchor="middle">No data available</text>`;
  }

  const max = Math.max(100, Math.ceil(Math.max(...pts.map((p) => p.wpm)) / 10) * 10);
  const x = (i) => (days.length <= 1 ? L + pw / 2 : L + (i * pw) / (days.length - 1));
  const y = (v) => T + ph - (v / max) * ph;
  const f = (n) => n.toFixed(1);

  const line = (key) =>
    pts.filter((p) => p[key] != null)
      .map((p, j) => `${j ? 'L' : 'M'} ${f(x(p.i))} ${f(y(p[key]))}`)
      .join(' ');

  let out = '';

  for (let k = 0; k <= 5; k++) {
    const v = Math.round((max / 5) * k);
    out += `<line class="th-grid" x1="${L}" y1="${f(y(v))}" x2="${W - R}" y2="${f(y(v))}"/>`;
    out += `<text class="th-axis" x="${L - 10}" y="${f(y(v) + 4)}" text-anchor="end">${v}</text>`;
  }

  const base = T + ph;
  const first = pts[0];
  const last = pts[pts.length - 1];
  out += `<path d="${line('wpm')} L ${f(x(last.i))} ${base} L ${f(x(first.i))} ${base} Z" fill="#60a5fa" opacity=".14"/>`;
  out += `<path d="${line('acc')}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  out += `<path d="${line('wpm')}" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  pts.forEach((p) => {
    if (p.acc != null) {
      out += `<circle class="th-dot-ring" cx="${f(x(p.i))}" cy="${f(y(p.acc))}" r="4.5" fill="#10b981"><title>${shortDay(p.key)}: Accuracy ${p.acc}%</title></circle>`;
    }
    out += `<circle class="th-dot-ring" cx="${f(x(p.i))}" cy="${f(y(p.wpm))}" r="5" fill="#2563eb"><title>${shortDay(p.key)}: ${p.wpm} WPM</title></circle>`;
  });

  labelIndexes(days.length).forEach((i) => {
    out += `<text class="th-axis" x="${f(x(i))}" y="${H - 9}" text-anchor="middle">${shortDay(days[i])}</text>`;
  });

  return out;
}

// ফিল্টার ও সার্চ প্রয়োগ
function filterEntries(entries, { query, days }, now = Date.now()) {
  const q = String(query || '').trim().toLowerCase();
  const cutoff = days === 'all' ? 0 : cutoffFor(Number(days), now);

  return entries.filter((e) => {
    if (cutoff && e.ts < cutoff) return false;
    if (!q) return true;
    const hay = [
      e.ts ? fmtDate(e.ts) : e.date,
      MODE_LABEL[e.modeKey],
      passageOf(e),
      e.wpm,
      e.accuracy
    ].join(' ').toLowerCase();
    return hay.includes(q);
  });
}
// HELPERS-END

// ---------------------------------------------------------------------
//  পেজ তৈরি ও আপডেট
// ---------------------------------------------------------------------
const root = document.getElementById('historyPage');

const TEMPLATE = `
<div class="th-wrap">

  <section class="th-heading">
    <div class="th-heading-row">
      <div class="th-heading-icon">◷</div>
      <div>
        <h1 class="th-title">Typing History</h1>
        <div class="th-sub">Your past practice records and performance summary</div>
      </div>
    </div>
  </section>

  <section class="th-stats">
    <article class="th-stat blue">
      <div class="th-stat-icon">◉</div>
      <div>
        <div class="th-stat-label">Best WPM</div>
        <div class="th-stat-value" id="thBest">0 WPM</div>
        <div class="th-stat-note">Your highest speed</div>
      </div>
    </article>
    <article class="th-stat green">
      <div class="th-stat-icon">◎</div>
      <div>
        <div class="th-stat-label">Best Accuracy</div>
        <div class="th-stat-value" id="thAcc">—</div>
        <div class="th-stat-note">Your highest accuracy</div>
      </div>
    </article>
    <article class="th-stat purple">
      <div class="th-stat-icon">◴</div>
      <div>
        <div class="th-stat-label">Total Practice</div>
        <div class="th-stat-value" id="thTime">0 Min</div>
        <div class="th-stat-note">Total practice time</div>
      </div>
    </article>
    <article class="th-stat orange">
      <div class="th-stat-icon">🏆</div>
      <div>
        <div class="th-stat-label">Total Tests</div>
        <div class="th-stat-value" id="thTests">0</div>
        <div class="th-stat-note">Total practice sessions</div>
      </div>
    </article>
  </section>

  <section class="th-panel">
    <div class="th-panel-head">
      <div class="th-panel-title">
        <div class="th-panel-icon">▥</div>
        <div>
          <h2 class="th-h2">Your Typing Progress</h2>
          <div class="th-desc">Track your progress over time</div>
        </div>
      </div>
      <div class="th-periods" id="thPeriods">
        <button type="button" class="th-period active" data-period="7">Last 7 Days</button>
        <button type="button" class="th-period" data-period="30">Last 30 Days</button>
        <button type="button" class="th-period" data-period="all">All Time</button>
      </div>
    </div>
    <div class="th-chart-wrap">
      <div class="th-legend">
        <span><i class="th-dot blue"></i>WPM</span>
        <span><i class="th-dot green"></i>Accuracy</span>
      </div>
      <svg class="th-chart" id="thChart" viewBox="0 0 900 260" role="img" aria-label="Typing progress chart"></svg>
    </div>
  </section>

  <section class="th-panel">
    <div class="th-panel-head">
      <div class="th-panel-title">
        <div class="th-panel-icon">◷</div>
        <div>
          <h2 class="th-h2">Recent Practice History</h2>
          <div class="th-desc">View your latest practice records</div>
        </div>
      </div>
      <div class="th-tools">
        <label class="th-search">
          <span class="th-search-ico">⌕</span>
          <input class="th-input" id="thSearch" type="search" placeholder="Search history..." autocomplete="off" />
        </label>
        <select class="th-select" id="thFilter">
          <option value="all">All Dates</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>
    </div>

    <div class="th-table-scroll">
      <table class="th-table">
        <thead>
          <tr>
            <th>Date</th><th>Typing Mode</th><th>Passage</th><th>Speed</th>
            <th>Accuracy</th><th>Time</th><th>Details</th>
          </tr>
        </thead>
        <tbody id="thBody"></tbody>
      </table>
      <div class="th-empty" id="thEmpty">এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।</div>
    </div>

    <div class="th-more-row" id="thMore">
      <button type="button" class="th-more-btn" id="thMoreBtn">আরও দেখুন</button>
    </div>
  </section>

</div>`;

const MODAL = `
<div class="th-modal" role="dialog" aria-modal="true" aria-labelledby="thModalTitle">
  <div class="th-modal-head">
    <h3 id="thModalTitle">Practice Details</h3>
    <button type="button" class="th-close" id="thClose" aria-label="বন্ধ করুন">×</button>
  </div>
  <div class="th-detail-grid" id="thDetails"></div>
</div>`;

const STEP = 10;

let data = {};
let entries = [];
let period = '7';
let visible = STEP;
let modal = null;

const $ = (id) => document.getElementById(id);

function renderStats() {
  const s = computeStats(entries, data);
  $('thBest').textContent = `${s.bestWpm} WPM`;
  $('thAcc').textContent = s.bestAcc == null ? '—' : `${s.bestAcc}%`;
  $('thTime').textContent = fmtTotal(s.totalSec);
  $('thTests').textContent = s.totalTests;
}

function renderChart() {
  const { days, pts } = buildChartData(entries, period);
  $('thChart').innerHTML = chartSvg(days, pts);
}

function renderTable() {
  const rows = filterEntries(entries, { query: $('thSearch').value, days: $('thFilter').value });
  const shown = rows.slice(0, visible);

  $('thBody').innerHTML = shown.map((e) => {
    const dateCell = e.ts
      ? `${esc(fmtDate(e.ts))}<span class="th-time-small">${esc(fmtTime(e.ts))}</span>`
      : esc(e.date || '—');
    const accCell = e.accuracyNum == null ? 'N/A' : `${e.accuracyNum}%`;

    return `
      <tr>
        <td>${dateCell}</td>
        <td><span class="th-mode ${e.modeKey}">${esc(MODE_LABEL[e.modeKey])}</span></td>
        <td>${esc(passageOf(e))}</td>
        <td><strong>${e.wpm} WPM</strong></td>
        <td><span class="th-acc ${accClass(e.accuracyNum)}">${esc(accCell)}</span></td>
        <td>${esc(fmtDur(e.seconds))}</td>
        <td><button type="button" class="th-view-btn" data-id="${e.id}">◎ View</button></td>
      </tr>`;
  }).join('');

  $('thEmpty').textContent = entries.length
    ? 'এই ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।'
    : 'এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।';
  $('thEmpty').style.display = rows.length ? 'none' : 'block';
  $('thMore').style.display = rows.length > visible ? 'block' : 'none';
}

function render() {
  renderStats();
  renderChart();
  renderTable();
}

function openDetails(id) {
  const e = entries.find((x) => x.id === Number(id));
  if (!e) return;

  const v = (x, suffix = '') => (x === undefined || x === null || x === '' ? '—' : `${esc(x)}${suffix}`);
  const item = (label, value, wide = false) =>
    `<div class="th-detail${wide ? ' wide' : ''}"><small>${label}</small><strong>${value}</strong></div>`;

  const when = e.ts ? `${esc(fmtDate(e.ts))}, ${esc(fmtTime(e.ts))}` : v(e.date);

  $('thDetails').innerHTML =
    item('Date & Time', when, true) +
    item('Typing Mode', esc(MODE_LABEL[e.modeKey])) +
    item('Duration', esc(fmtDur(e.seconds))) +
    item('Passage', esc(passageOf(e)), true) +
    item('Speed (WPM)', `${e.wpm} WPM`) +
    item('Word-based WPM', v(e.wordWpm, ' WPM')) +
    item('Accuracy', e.accuracyNum == null ? 'N/A' : `${e.accuracyNum}%`) +
    item('Mistakes', v(e.mistakes)) +
    item('Typed Words', v(e.totalTypedWords)) +
    item('Correct Words', v(e.correctWords)) +
    item('Characters (With Space)', v(e.charactersWithSpace)) +
    item('Characters (Without Space)', v(e.charactersWithoutSpace));

  modal.classList.add('show');
}

function closeDetails() {
  modal.classList.remove('show');
}

function isHidden() {
  return window.getComputedStyle(root).display === 'none';
}

function init() {
  root.innerHTML = TEMPLATE;

  modal = document.createElement('div');
  modal.className = 'th-modal-backdrop';
  modal.innerHTML = MODAL;
  document.body.appendChild(modal);

  $('thPeriods').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-period]');
    if (!btn) return;
    period = btn.dataset.period;
    $('thPeriods').querySelectorAll('.th-period').forEach((b) => b.classList.toggle('active', b === btn));
    renderChart();
  });

  $('thSearch').addEventListener('input', () => { visible = STEP; renderTable(); });
  $('thFilter').addEventListener('change', () => { visible = STEP; renderTable(); });
  $('thMoreBtn').addEventListener('click', () => { visible += STEP; renderTable(); });

  $('thBody').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-id]');
    if (btn) openDetails(btn.dataset.id);
  });

  $('thClose').addEventListener('click', closeDetails);
  modal.addEventListener('click', (ev) => { if (ev.target === modal) closeDetails(); });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal.classList.contains('show')) closeDetails();
  });

  // main.js এটা ডাকে: নতুন ডাটা পেলে (টেস্ট শেষ, লগইন, পেজ খোলা) পেজ আপডেট হয়
  window.renderHistoryPage = (snapshot) => {
    data = snapshot || {};
    entries = (Array.isArray(data.history) ? data.history : []).map(normalize);
    visible = STEP;
    if (isHidden()) return; // পেজ খোলা না থাকলে দেখানোর সময় আঁকা হবে
    render();
  };

  render();
}

if (root) init();
