// =====================================================================
//  src/dashboard/dashboard.js : Dashboard পেজ
//
//  কাজ:
//   • #dashboardPage সেকশনের ভেতরে পুরো নতুন ডিজাইন বসায় (আলাদা HTML ফাইল লাগে না)
//   • main.js প্রতিবার window.renderDashboardPage(ডাটা) ডাকে, তখন পেজ আপডেট হয়
//   • ডাটা আসে ইউজারের নিজের সেভ করা টেস্ট থেকে (লগইন করলে অ্যাকাউন্টের ডাটা)
// =====================================================================
import './dashboard.css';

// ---------------------------------------------------------------------
//  সাহায্যকারী ফাংশন (DOM লাগে না)
// ---------------------------------------------------------------------
// HELPERS-START
const pad = (n) => String(n).padStart(2, '0');

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

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function normalize(item) {
  return {
    ts: Number(item.ts) || parseOldDate(item.date),
    wpm: Number(item.wpm) || 0
  };
}

function computeStats(entries, data, now = Date.now()) {
  const today = dayKey(now);
  const wpms = entries.map((e) => e.wpm).filter((n) => n > 0);

  return {
    best: Math.max(Number(data.bestWpm) || 0, ...wpms),
    lowest: Number(data.lowestWpm) || (wpms.length ? Math.min(...wpms) : 0),
    today: entries.filter((e) => e.ts && dayKey(e.ts) === today).length,
    total: Math.max(Number(data.totalTests) || 0, entries.length)
  };
}

// গ্রাফের লাইন: ৭/৩০ দিনে প্রতিদিনের গড় WPM, All Time-এ প্রতিটি টেস্ট আলাদা
function buildSeries(entries, period, now = Date.now()) {
  if (period === 'all') {
    const ordered = entries.slice().reverse(); // main.js নতুন আগে রাখে, এখানে পুরোনো আগে
    return {
      labels: ordered.map((_, i) => `Test ${i + 1}`),
      values: ordered.map((e) => e.wpm)
    };
  }

  const days = lastDayKeys(Number(period), now);
  const byDay = {};
  entries.forEach((e) => {
    if (!e.ts) return;
    (byDay[dayKey(e.ts)] = byDay[dayKey(e.ts)] || []).push(e.wpm);
  });

  return {
    labels: days.map((k) =>
      period === '7'
        ? keyToDate(k).toLocaleDateString('en-US', { weekday: 'short' })
        : keyToDate(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    values: days.map((k) => {
      const list = byDay[k];
      return list ? Math.round(list.reduce((s, v) => s + v, 0) / list.length) : null;
    })
  };
}

function labelIndexes(n) {
  if (n <= 8) return Array.from({ length: n }, (_, i) => i);
  const set = new Set();
  for (let k = 0; k <= 6; k++) set.add(Math.round((k * (n - 1)) / 6));
  return [...set];
}

// SVG-এর ভেতরের অংশ (গ্রিড, এরিয়া, মসৃণ লাইন, দাগ, মান-বাবল, লেখা)
function chartSvg({ labels, values }) {
  const W = 900, H = 300, L = 46, R = 18, T = 30, B = 40;
  const pw = W - L - R;
  const ph = H - T - B;
  const n = values.length;
  const f = (v) => v.toFixed(1);

  const have = values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0);

  if (!have.length) {
    return `<text class="td-empty" x="${W / 2}" y="${H / 2}" text-anchor="middle">টেস্ট দিলে এখানে গ্রাফ দেখা যাবে</text>`;
  }

  const maxV = Math.max(...have.map((i) => values[i]));
  const max = Math.max(40, Math.ceil((maxV * 1.1) / 20) * 20); // ওপরে একটু জায়গা রাখা হয়
  const x = (i) => (n <= 1 ? L + pw / 2 : L + (i * pw) / (n - 1));
  const y = (v) => T + ph - (v / max) * ph;
  const base = T + ph;

  const pts = have.map((i) => ({ i, x: x(i), y: y(values[i]), v: values[i] }));

  // দুই বিন্দুর মাঝে নরম বাঁকা লাইন (ওভারশুট ছাড়া)
  let line = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1];
    const b = pts[k];
    const mx = (a.x + b.x) / 2;
    line += ` C ${f(mx)} ${f(a.y)}, ${f(mx)} ${f(b.y)}, ${f(b.x)} ${f(b.y)}`;
  }
  const area = `${line} L ${f(pts[pts.length - 1].x)} ${base} L ${f(pts[0].x)} ${base} Z`;

  let out = `<defs><linearGradient id="tdArea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2676f5" stop-opacity=".30"/>
    <stop offset="100%" stop-color="#2676f5" stop-opacity=".02"/>
  </linearGradient></defs>`;

  for (let k = 0; k <= 4; k++) {
    const v = max - (max / 4) * k;
    const gy = T + (ph / 4) * k;
    out += `<line class="td-grid" x1="${L}" y1="${f(gy)}" x2="${W - R}" y2="${f(gy)}"/>`;
    out += `<text class="td-axis" x="${L - 12}" y="${f(gy + 4)}" text-anchor="end">${Math.round(v)}</text>`;
  }
  out += `<line class="td-axis-line" x1="${L}" y1="${base}" x2="${W - R}" y2="${base}"/>`;

  out += `<path d="${area}" fill="url(#tdArea)"/>`;
  out += `<path class="td-line" d="${line}"/>`;

  if (pts.length <= 60) {
    pts.forEach((p) => {
      out += `<circle class="td-dot" cx="${f(p.x)}" cy="${f(p.y)}" r="4.5"><title>${labels[p.i]}: ${p.v} WPM</title></circle>`;
    });
  }

  // প্রথম ও শেষ বিন্দুর মান বাবলে দেখানো
  const marked = pts.length > 1 ? [pts[0], pts[pts.length - 1]] : [pts[0]];
  marked.forEach((p) => {
    out += `<rect class="td-bubble" x="${f(p.x - 17)}" y="${f(p.y - 38)}" width="34" height="22" rx="11"/>`;
    out += `<path class="td-bubble" d="M ${f(p.x - 5)} ${f(p.y - 17)} L ${f(p.x)} ${f(p.y - 11)} L ${f(p.x + 5)} ${f(p.y - 17)} Z"/>`;
    out += `<text class="td-bubble-text" x="${f(p.x)}" y="${f(p.y - 22.5)}" text-anchor="middle">${p.v}</text>`;
  });

  labelIndexes(n).forEach((i) => {
    out += `<text class="td-axis" x="${f(x(i))}" y="${H - 10}" text-anchor="middle">${labels[i]}</text>`;
  });

  return out;
}
// HELPERS-END

// ---------------------------------------------------------------------
//  পেজ তৈরি ও আপডেট
// ---------------------------------------------------------------------
const root = document.getElementById('dashboardPage');

const ICON = {
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 17a9 9 0 1 1 17 0"/><path d="M12 14l4-5"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6 6 4-4 8 8"/><path d="M15 16h6v-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/></svg>',
  bars: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4.5" height="9" rx="1.2"/><rect x="9.8" y="6" width="4.5" height="15" rx="1.2"/><rect x="16.5" y="9" width="4.5" height="12" rx="1.2"/></svg>'
};

const card = (cls, icon, label, sub, id) => `
  <article class="td-stat ${cls}">
    <div class="td-stat-icon">${icon}</div>
    <div class="td-stat-body">
      <div class="td-stat-label">${label}</div>
      <div class="td-stat-sub">${sub}</div>
      <div class="td-stat-value" id="${id}">0</div>
    </div>
  </article>`;

const TEMPLATE = `
<div class="td-wrap">

  <h1 class="td-title">Your Dashboard</h1>
  <div class="td-title-bar"></div>

  <section class="td-stats">
    ${card('green', ICON.gauge, 'Best WPM', '(With Space)', 'tdBest')}
    ${card('red', ICON.down, 'Lowest WPM', '(With Space)', 'tdLow')}
    ${card('orange', ICON.check, "Today's Tests", '(Completed)', 'tdToday')}
    ${card('blue', ICON.doc, 'Total Tests', '(Completed)', 'tdTotal')}
  </section>

  <section class="td-chart-card">
    <div class="td-chart-head">
      <h2 class="td-chart-title">${ICON.bars}WPM Progress (With Space)</h2>
      <div class="td-filters" id="tdFilters">
        <button type="button" class="td-filter active" data-period="7">7 Days</button>
        <button type="button" class="td-filter" data-period="30">30 Days</button>
        <button type="button" class="td-filter" data-period="all">All Time</button>
      </div>
    </div>
    <svg class="td-chart" id="tdChart" viewBox="0 0 900 300" role="img" aria-label="WPM progress chart"></svg>
    <p class="td-note" id="tdNote"></p>
  </section>

</div>`;

const NOTES = {
  7: 'শেষ ৭ দিনের প্রতিদিনের গড় WPM',
  30: 'শেষ ৩০ দিনের প্রতিদিনের গড় WPM',
  all: 'প্রতিটি টেস্টের WPM (পুরোনো থেকে নতুন)'
};

let data = {};
let entries = [];
let period = '7';

const $ = (id) => document.getElementById(id);

function renderStats() {
  const s = computeStats(entries, data);
  $('tdBest').textContent = s.best;
  $('tdLow').textContent = s.lowest;
  $('tdToday').textContent = s.today;
  $('tdTotal').textContent = s.total;
}

function renderChart() {
  $('tdChart').innerHTML = chartSvg(buildSeries(entries, period));
  $('tdNote').textContent = NOTES[period];
}

function isHidden() {
  return window.getComputedStyle(root).display === 'none';
}

function init() {
  root.innerHTML = TEMPLATE;

  $('tdFilters').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-period]');
    if (!btn) return;
    period = btn.dataset.period;
    $('tdFilters').querySelectorAll('.td-filter').forEach((b) => b.classList.toggle('active', b === btn));
    renderChart();
  });

  // main.js এটা ডাকে: নতুন ডাটা পেলে (টেস্ট শেষ, লগইন, পেজ খোলা) পেজ আপডেট হয়
  window.renderDashboardPage = (snapshot) => {
    data = snapshot || {};
    entries = (Array.isArray(data.history) ? data.history : []).map(normalize);
    if (isHidden()) return; // পেজ খোলা না থাকলে দেখানোর সময় আঁকা হবে
    renderStats();
    renderChart();
  };

  renderStats();
  renderChart();
}

if (root) init();
