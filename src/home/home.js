// হোম পেজের স্ক্রিপ্ট (src/home/home.js)
// home.html-এর লেখা #homePage-এ বসায়, পরিসংখ্যান দেখায় এবং ডেমো টাইপিং চালায়।
// এই ফাইল index.html-এ main.js-এর আগে লোড হতে হবে।

import './home.css';
import markup from './home.html?raw';

const $ = (id) => document.getElementById(id);
const load = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };

// ---------- হোম পেজের কাঠামো বসানো ----------
$('homePage').innerHTML = markup;

// ---------- পরিসংখ্যান কার্ড (আসল সেভ করা ডেটা থেকে) ----------
function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function refreshHomeStats() {
  const history = load('history', []);
  const today = load('dailyStats', {})[dayKey()] || {};
  $('hpBest').textContent = localStorage.getItem('bestWpm') || 0;
  $('hpLast').textContent = history[0]?.wpm ?? 0;
  $('hpToday').textContent = (today.en?.count || 0) + (today.bn?.count || 0);
  $('hpTotal').textContent = localStorage.getItem('totalTests') || 0;
}

// ---------- ডেমো টাইপিং (এখানের বাক্য বদলালেই ডেমো বদলে যাবে) ----------
const demo = {
  en: 'Practice makes perfect. Keep typing and you will be faster than before.',
  bn: 'অনুশীলনই সফলতার চাবিকাঠি। প্রতিদিন একটু একটু করে টাইপ করুন।',
};
const SPEED = 110; // মিলিসেকেন্ড, কম হলে দ্রুত

const split = (t) => typeof Intl.Segmenter === 'function'
  ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(t), (s) => s.segment)
  : Array.from(t);

let chars = split(demo.en), step = 0, timer = null;

function paint(n) {
  $('hpTyped').textContent = chars.slice(0, n).join('');
  $('hpRest').textContent = chars.slice(n).join('');
  $('hpProgress').style.width = (n / chars.length) * 100 + '%';
}

function startDemo(lang) {
  clearInterval(timer);
  chars = split(demo[lang]);
  step = 0;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return paint(chars.length);
  timer = setInterval(() => {
    if ($('homePage').style.display === 'none') return;
    step = step > chars.length + 10 ? 0 : step + 1;
    paint(Math.min(step, chars.length));
  }, SPEED);
}

document.querySelectorAll('.hp-tabs button').forEach((btn) =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.hp-tabs button').forEach((b) => b.classList.toggle('on', b === btn));
    startDemo(btn.dataset.lang);
  })
);

// ---------- বাটন: আগের নেভিগেশনেই পাঠানো হয় ----------
$('hpStartBtn').addEventListener('click', () => $('navPractice').click());
$('hpResultsBtn').addEventListener('click', () => $('navDashboard').click());
$('navHome').addEventListener('click', refreshHomeStats);

refreshHomeStats();
startDemo('en');
