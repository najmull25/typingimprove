// =====================================================================
//  src/auth.js : লগইন বাধ্যতামূলক + প্ল্যান/মেয়াদ + অ্যাডমিন অ্যাপ্রুভাল + ইউজারের আলাদা ডাটা + লিডারবোর্ড
//
//  Firestore-এ ডাটা থাকে তিন জায়গায়:
//   members/{uid}               → status (pending/approved/rejected), plan, expiresAt (মিলিসেকেন্ড)
//   users/{uid}                 → পাবলিক: নাম, ছবি, bestWpm (লিডারবোর্ডের জন্য)
//   users/{uid}/private/state   → প্রাইভেট: ইউজারের নিজের history, dailyStats ইত্যাদি
// =====================================================================
import { auth, googleProvider, db } from './firebase.js';
import {
  signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit, where,
  getDocs, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// ★★★ এখানে আপনার নিজের Gmail বসান। Firestore Rules-এও ঠিক একই ইমেইল দিতে হবে। ★★★
const ADMIN_EMAIL = 'najmul0174.bd@gmail.com';

// প্ল্যানের নাম → কত মাস
const PLANS = { '1 Month': 1, '2 Months': 2, '3 Months': 3, '6 Months': 6, '1 Year': 12 };
const FAR_FUTURE = 4102444800000; // ১ জানুয়ারি ২১০০ (অ্যাডমিনের জন্য)

const $ = (id) => document.getElementById(id);

let currentUser = null;
let member = null; // members/{uid} ডকুমেন্টের সর্বশেষ ডাটা
let isAdmin = false;
let unsubMember = null;
let stateLoadedFor = null;

const memberRef = (uid) => doc(db, 'members', uid);
const publicRef = (uid) => doc(db, 'users', uid);
const stateRef = (uid) => doc(db, 'users', uid, 'private', 'state');

window.typingAllowed = false; // অ্যাপ্রুভ ও মেয়াদ না থাকলে টাইপিং বন্ধ

// ---------- মেয়াদ সংক্রান্ত সাহায্যকারী ----------
const isActive = (m) =>
  !!m && m.status === 'approved' && Number(m.expiresAt || 0) > Date.now();

function effectiveStatus(m) {
  if (m.status === 'approved') return isActive(m) ? 'approved' : 'expired';
  return m.status || 'pending';
}

function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(ms) {
  return Math.max(0, Math.ceil((ms - Date.now()) / 86400000));
}

// ---------- লগইন / লগআউট ----------
async function login() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    console.error(e);
    if (e.code !== 'auth/popup-closed-by-user') {
      alert('লগইন করা যায়নি: ' + (e.code || e.message));
    }
  }
}

$('loginBtn').addEventListener('click', login);
$('gateLoginBtn').addEventListener('click', login);
$('logoutBtn').addEventListener('click', () => signOut(auth));
$('gatePlanBtn').addEventListener('click', () => $('navSubscription').click());

// ---------- টাইপিং গেট (কী দেখাবে) ----------
function setAllowed(allowed) {
  window.typingAllowed = allowed;
  document.body.classList.toggle('approved', allowed);
}

function showGate(state) {
  const title = $('gateTitle');
  const text = $('gateText');
  $('gateLoginBtn').style.display = 'none';
  $('gatePlanBtn').style.display = 'none';

  if (state === 'loggedout') {
    title.textContent = '🔒 টাইপ করতে লগইন করুন';
    text.textContent = 'এই সাইটে টাইপিং প্র্যাকটিস করতে Google দিয়ে লগইন করা বাধ্যতামূলক। লগইনের পর একটি প্ল্যান চালু থাকলে টাইপ করতে পারবেন।';
    $('gateLoginBtn').style.display = '';
  } else if (state === 'pending') {
    title.textContent = '⏳ প্ল্যান চালুর অপেক্ষায়';
    text.textContent = 'আপনার অ্যাকাউন্ট তৈরি হয়েছে। একটি প্ল্যান বেছে টাকা পাঠান, অ্যাডমিন যাচাই করে চালু করলে এই পেজ নিজে থেকেই খুলে যাবে, রিফ্রেশ করার দরকার নেই।';
    $('gatePlanBtn').style.display = '';
  } else if (state === 'expired') {
    title.textContent = '⌛ প্ল্যানের মেয়াদ শেষ';
    text.textContent = 'আপনার প্ল্যানের মেয়াদ শেষ হয়ে গেছে। টাইপিং চালিয়ে যেতে নতুন প্ল্যান নিন। অ্যাডমিন চালু করলে পেজ নিজে থেকেই খুলে যাবে।';
    $('gatePlanBtn').style.display = '';
  } else if (state === 'rejected') {
    title.textContent = '⛔ অ্যাকাউন্ট অনুমোদিত নয়';
    text.textContent = 'অ্যাডমিন আপনার অ্যাকাউন্ট অনুমোদন করেননি। টাইপিং শুরু করতে একটি প্ল্যান নিন, অথবা প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।';
    $('gatePlanBtn').style.display = '';
  } else if (state === 'error') {
    title.textContent = '⚠️ সমস্যা হয়েছে';
    text.textContent = 'সার্ভারের সাথে যোগাযোগ করা যায়নি। ইন্টারনেট দেখুন আর Firestore Rules Publish হয়েছে কি না যাচাই করুন, তারপর পেজ রিফ্রেশ করুন।';
  }
}

// ---------- ফ্রি ট্রায়াল (প্রিমিয়ামের আগে প্রতি টাইপ অপশনে ২টি টেস্ট) ----------
const FREE_LIMIT = 2;
let trial = { en: 0, bn: 0 }; // কোন অপশনে কয়টি ফ্রি টেস্ট ব্যবহার হয়েছে
let trialLoaded = false;
let wasActive = false;

const trialRef = (uid) => doc(db, 'trials', uid);
const currentLang = () => ($('language') && $('language').value === 'bn' ? 'bn' : 'en');
const trialLeft = (k) => Math.max(0, FREE_LIMIT - (trial[k] || 0));
const isPendingUser = () => !!member && (member.status || 'pending') === 'pending';

function setTrialMode(on) {
  document.body.classList.toggle('trial', on); // গেট থাকলেও ভাষা বদলের অপশনগুলো দেখা যাবে
}

async function loadTrial(user) {
  try {
    const snap = await getDoc(trialRef(user.uid));
    const d = snap.exists() ? snap.data() : {};
    trial = { en: Number(d.en || 0), bn: Number(d.bn || 0) };
  } catch (e) {
    console.error('ফ্রি ট্রায়ালের তথ্য আনা যায়নি:', e);
    trial = { en: FREE_LIMIT, bn: FREE_LIMIT }; // সমস্যা হলে ফ্রি টেস্ট বন্ধ রাখা হয়
  }
  trialLoaded = true;
}

function updateTrialNote() {
  const el = $('trialNote');
  if (!el) return;

  const show = !!currentUser && trialLoaded && isPendingUser() && !isActive(member);
  el.style.display = show ? '' : 'none';
  if (!show) return;

  $('trialText').textContent =
    `🎁 ফ্রি ট্রায়াল বাকি: English ${trialLeft('en')}/${FREE_LIMIT} · বাংলা ${trialLeft('bn')}/${FREE_LIMIT}`;
}

// টাইপিং এরিয়া দেখাবে নাকি গেট পেজ, সেটা এখানে ঠিক হয়
function refreshAccess() {
  if (!currentUser) {
    setAllowed(false);
    setTrialMode(false);
    showGate('loggedout');
    updateTrialNote();
    return;
  }
  if (!member || !trialLoaded) return; // এখনো লোড হচ্ছে

  const status = member.status || 'pending';
  wasActive = isActive(member);

  if (wasActive) {
    setAllowed(true);
    setTrialMode(false);
  } else if (status === 'pending') {
    const anyLeft = trialLeft('en') > 0 || trialLeft('bn') > 0;
    setTrialMode(anyLeft);
    if (trialLeft(currentLang()) > 0) {
      setAllowed(true);
    } else {
      setAllowed(false);
      showGate('pending'); // এই অপশনের ফ্রি টেস্ট শেষ, আগের গেট পেজই দেখাবে
    }
  } else {
    setAllowed(false);
    setTrialMode(false);
    showGate(status === 'approved' ? 'expired' : 'rejected');
  }

  updateTrialNote();
}

// নতুন টেস্ট শুরু করা যাবে কি না (main.js এটা জিজ্ঞেস করে)
window.canStartTest = () => {
  if (!currentUser || !member || !trialLoaded) return false;
  if (isActive(member)) return true;
  return isPendingUser() && trialLeft(currentLang()) > 0;
};

// টেস্ট শুরু হলে ফ্রি ট্রায়ালের একটা গণনা কমে (প্রিমিয়ামের জন্য গোনা হয় না)
window.onTestStart = async (lang) => {
  if (!currentUser || !isPendingUser() || isActive(member)) return;

  const k = lang === 'bn' ? 'bn' : 'en';
  trial[k] = Math.min(FREE_LIMIT, (trial[k] || 0) + 1);
  updateTrialNote(); // এখানে এরিয়া লুকানো হয় না, চলমান টেস্ট শেষ করা যাবে

  try {
    await setDoc(trialRef(currentUser.uid), {
      en: trial.en,
      bn: trial.bn,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.error('ফ্রি ট্রায়ালের গণনা সেভ হয়নি:', e);
  }
};

window.refreshAccess = refreshAccess;

$('language').addEventListener('change', () => refreshAccess());
$('trialUpgradeBtn').addEventListener('click', () => $('navSubscription').click());

// ---------- Subscription পেজের "আপনার প্ল্যান" বক্স ----------
function renderMyPlan() {
  const box = $('myPlanBox');
  if (!box) return;
  box.className = 'my-plan';

  if (!currentUser) {
    box.textContent = 'আপনার প্ল্যান দেখতে আগে লগইন করুন।';
    return;
  }
  if (isAdmin) {
    box.className = 'my-plan active';
    box.textContent = '🛡️ আপনি অ্যাডমিন, আপনার জন্য কোনো মেয়াদ নেই।';
    return;
  }
  if (isActive(member)) {
    box.className = 'my-plan active';
    box.textContent = `✅ বর্তমান প্ল্যান: ${member.plan || '—'} | মেয়াদ: ${fmtDate(member.expiresAt)} পর্যন্ত (${daysLeft(member.expiresAt)} দিন বাকি)`;
    return;
  }
  if (member && member.status === 'approved') {
    box.className = 'my-plan expired';
    box.textContent = `⌛ আপনার প্ল্যানের মেয়াদ শেষ হয়েছে (${member.expiresAt ? fmtDate(member.expiresAt) : '—'})। নিচ থেকে নতুন প্ল্যান বেছে নিন।`;
    return;
  }
  if (member && member.status === 'rejected') {
    box.className = 'my-plan expired';
    box.textContent = '⛔ আপনার অ্যাকাউন্ট অনুমোদিত নয়। অ্যাডমিনের সাথে যোগাযোগ করুন।';
    return;
  }
  box.textContent = 'এখনো কোনো প্ল্যান চালু নেই। নিচ থেকে একটি প্ল্যান বেছে টাকা পাঠান।';
}

// ---------- ক্লাউড থেকে ইউজারের নিজের ডাটা নামানো ----------
function writeLocal(uid, s) {
  try {
    localStorage.setItem(`history:${uid}`, s.history || '[]');
    localStorage.setItem(`dailyStats:${uid}`, s.dailyStats || '{}');
    localStorage.setItem(`bestWpm:${uid}`, String(s.bestWpm || 0));
    localStorage.setItem(`lowestWpm:${uid}`, String(s.lowestWpm || 0));
    localStorage.setItem(`totalTests:${uid}`, String(s.totalTests || 0));
  } catch (e) {
    console.error(e);
  }
}

// লগইন ছাড়া অবস্থায় এই ব্রাউজারে জমা হওয়া পুরোনো ডাটা
function readAnonymous() {
  const get = (k) => localStorage.getItem(k);
  return {
    history: get('history') || '[]',
    dailyStats: get('dailyStats') || '{}',
    bestWpm: Number(get('bestWpm') || 0),
    lowestWpm: Number(get('lowestWpm') || 0),
    totalTests: Number(get('totalTests') || 0),
  };
}

async function pullState(user) {
  const uid = user.uid;
  try {
    const snap = await getDoc(stateRef(uid));

    if (snap.exists()) {
      writeLocal(uid, snap.data());
      return;
    }

    // ক্লাউডে কিছু নেই। আগে দেখা হয়, ফ্রি ট্রায়ালে দেওয়া টেস্ট এই ডিভাইসে জমা আছে কি না
    const localTotal = Number(localStorage.getItem(`totalTests:${uid}`) || 0);

    if (localTotal > 0) {
      await setDoc(stateRef(uid), {
        history: localStorage.getItem(`history:${uid}`) || '[]',
        dailyStats: localStorage.getItem(`dailyStats:${uid}`) || '{}',
        bestWpm: Number(localStorage.getItem(`bestWpm:${uid}`) || 0),
        lowestWpm: Number(localStorage.getItem(`lowestWpm:${uid}`) || 0),
        totalTests: localTotal,
        updatedAt: serverTimestamp()
      });
      return;
    }

    // তারপর: লগইন ছাড়া অবস্থায় এই ব্রাউজারে জমা হওয়া পুরোনো ডাটা, একবার অ্যাকাউন্টে তুলে নেওয়া হয়
    const anon = readAnonymous();

    if (!localStorage.getItem('migratedAnon') && anon.totalTests > 0) {
      writeLocal(uid, anon);
      await setDoc(stateRef(uid), { ...anon, updatedAt: serverTimestamp() });
      await setDoc(publicRef(uid), {
        name: user.displayName || 'ইউজার',
        photo: user.photoURL || '',
        bestWpm: Math.min(400, anon.bestWpm),
        totalTests: anon.totalTests,
        updatedAt: serverTimestamp()
      }, { merge: true });
      localStorage.setItem('migratedAnon', '1');
    } else {
      writeLocal(uid, { history: '[]', dailyStats: '{}', bestWpm: 0, lowestWpm: 0, totalTests: 0 });
    }
  } catch (e) {
    console.error('ক্লাউড থেকে ডাটা আনা যায়নি:', e);
  }
}

// ---------- প্রথমবার লগইনে সদস্য রেকর্ড তৈরি ----------
async function ensureMember(user) {
  const ref = memberRef(user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const base = {
      name: user.displayName || 'ইউজার',
      email: user.email || '',
      photo: user.photoURL || '',
      createdAt: serverTimestamp()
    };
    await setDoc(ref, isAdmin
      ? { ...base, status: 'approved', plan: 'Admin', expiresAt: FAR_FUTURE }
      : { ...base, status: 'pending' });
  } else if (isAdmin) {
    const d = snap.data();
    if (d.status !== 'approved' || Number(d.expiresAt || 0) < FAR_FUTURE) {
      await updateDoc(ref, { status: 'approved', plan: 'Admin', expiresAt: FAR_FUTURE }); // অ্যাডমিন কখনো আটকাবে না
    }
  }
}

// ---------- সদস্যের অবস্থা বদলালে (অ্যাপ্রুভ, মেয়াদ শেষ ইত্যাদি) ----------
async function applyMember(user, data) {
  member = data;

  if (isActive(data)) {
    if (stateLoadedFor !== user.uid) {
      await pullState(user);
      stateLoadedFor = user.uid;
      window.setCurrentUser?.(user.uid);
    }
  } else {
    window.setCurrentUser?.(user.uid); // লগইন-ছাড়া পুরোনো ডাটা যেন না দেখায়
  }

  refreshAccess();
  renderMyPlan();
}

// প্রিমিয়ামের মেয়াদ টাইপ করার মাঝখানে শেষ হলে নিজে থেকেই ধরা হয় (প্রতি ১৫ সেকেন্ডে যাচাই)
setInterval(() => {
  if (currentUser && member && wasActive && !isActive(member)) {
    refreshAccess();
    renderMyPlan();
  }
}, 15000);

// ---------- লগইন অবস্থার পরিবর্তন ----------
onAuthStateChanged(auth, async (user) => {
  if (unsubMember) { unsubMember(); unsubMember = null; }

  currentUser = user;
  member = null;
  stateLoadedFor = null;
  trial = { en: 0, bn: 0 };
  trialLoaded = false;
  wasActive = false;
  setAllowed(false);
  setTrialMode(false);

  const photo = $('userPhoto');

  if (!user) {
    isAdmin = false;
    $('userName').textContent = '';
    photo.style.display = 'none';
    $('loginBtn').style.display = '';
    $('logoutBtn').style.display = 'none';
    $('navAdmin').style.display = 'none';
    window.setCurrentUser?.(null);
    refreshAccess();
    renderMyPlan();
    loadMyPayments();
    if ($('leaderboardPage').style.display === 'block') loadLeaderboard();
    return;
  }

  isAdmin = !!user.email && user.email === ADMIN_EMAIL && user.emailVerified;

  $('userName').textContent = user.displayName || 'ইউজার';
  if (user.photoURL) { photo.src = user.photoURL; photo.style.display = ''; }
  $('loginBtn').style.display = 'none';
  $('logoutBtn').style.display = '';
  $('navAdmin').style.display = isAdmin ? '' : 'none';

  try {
    await ensureMember(user);
  } catch (e) {
    console.error(e);
    showGate('error');
    return;
  }

  await loadTrial(user);
  loadMyPayments();

  // রিয়েল-টাইম: অ্যাডমিন প্ল্যান চালু করলেই ইউজারের পেজ নিজে থেকে খুলে যাবে
  unsubMember = onSnapshot(
    memberRef(user.uid),
    (snap) => applyMember(user, snap.data() || { status: 'pending' }),
    (err) => { console.error(err); showGate('error'); }
  );

  if ($('leaderboardPage').style.display === 'block') loadLeaderboard();
});

// ---------- টেস্ট শেষে ডাটা সেভ (main.js এটা ডাকে) ----------
export async function saveResult({ wpm, accuracy, snapshot }) {
  if (!currentUser || !isActive(member)) return;
  const uid = currentUser.uid;

  // ১) ইউজারের নিজের প্রাইভেট ডাটা
  if (snapshot) {
    try {
      await setDoc(stateRef(uid), {
        history: JSON.stringify(snapshot.history || []),
        dailyStats: JSON.stringify(snapshot.dailyStats || {}),
        bestWpm: snapshot.bestWpm || 0,
        lowestWpm: snapshot.lowestWpm || 0,
        totalTests: snapshot.totalTests || 0,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('প্রাইভেট ডাটা সেভ হয়নি:', e);
    }
  }

  // ২) লিডারবোর্ডের পাবলিক ডাটা
  const w = Math.round(Number(wpm));
  if (!Number.isFinite(w) || w < 0 || w > 400) return;

  try {
    const snap = await getDoc(publicRef(uid));
    const old = snap.exists() ? snap.data() : {};
    await setDoc(publicRef(uid), {
      name: currentUser.displayName || 'ইউজার',
      photo: currentUser.photoURL || '',
      bestWpm: Math.max(old.bestWpm || 0, w),
      lastWpm: w,
      lastAccuracy: Math.round(Number(accuracy)) || 0,
      totalTests: snapshot ? snapshot.totalTests : (old.totalTests || 0) + 1,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.error('লিডারবোর্ডের স্কোর সেভ হয়নি:', e);
  }
}
window.saveResultToCloud = saveResult;

// ---------- লিডারবোর্ড ----------
async function loadLeaderboard() {
  const box = $('leaderboardBox');
  box.textContent = 'লোড হচ্ছে...';
  try {
    const q = query(collection(db, 'users'), orderBy('bestWpm', 'desc'), limit(20));
    const snap = await getDocs(q);
    if (snap.empty) { box.textContent = 'এখনো কেউ স্কোর দেয়নি।'; return; }

    const table = document.createElement('table');
    table.className = 'lb-table';
    table.innerHTML = '<thead><tr><th>#</th><th>নাম</th><th>Best WPM</th><th>টেস্ট</th></tr></thead>';
    const tbody = document.createElement('tbody');

    let rank = 1;
    snap.forEach((d) => {
      const u = d.data();
      const tr = document.createElement('tr');
      if (currentUser && d.id === currentUser.uid) tr.className = 'me';
      [rank++, u.name || 'ইউজার', u.bestWpm || 0, u.totalTests || 0].forEach((val) => {
        const td = document.createElement('td');
        td.textContent = val; // textContent দিয়ে, যাতে নামে HTML ঢুকতে না পারে
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    box.replaceChildren(table);
  } catch (e) {
    console.error(e);
    box.textContent = 'লিডারবোর্ড লোড করা যায়নি। Firestore Rules আর ইন্টারনেট দেখুন।';
  }
}

// ---------- অ্যাডমিন প্যানেল ----------
const STATUS_LABEL = { pending: 'Pending', approved: 'Active', expired: 'Expired', rejected: 'Rejected' };

// প্ল্যান চালু বা মেয়াদ বাড়ানো। মেয়াদ থাকলে বাকি সময়ের ওপর যোগ হয়, শেষ হলে আজ থেকে গোনা হয়।
async function applyPlan(m, planName) {
  const months = PLANS[planName];
  if (!months) throw new Error('অজানা প্ল্যান: ' + planName);

  const base = isActive(m) ? Number(m.expiresAt) : Date.now();
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);

  await updateDoc(memberRef(m.id), { status: 'approved', plan: planName, expiresAt: d.getTime() });
}

async function approveWithPlan(m, planName) {
  try {
    await applyPlan(m, planName);
    loadAdmin();
  } catch (e) {
    console.error(e);
    alert('পরিবর্তন করা যায়নি: ' + (e.code || e.message));
  }
}

async function rejectMember(uid) {
  try {
    await updateDoc(memberRef(uid), { status: 'rejected' });
    loadAdmin();
  } catch (e) {
    console.error(e);
    alert('পরিবর্তন করা যায়নি: ' + (e.code || e.message));
  }
}

async function loadAdmin() {
  const box = $('adminBox');
  if (!isAdmin) { box.textContent = 'এই পেজ শুধু অ্যাডমিনের জন্য।'; return; }
  box.textContent = 'লোড হচ্ছে...';
  loadAdminPayments();

  try {
    const snap = await getDocs(query(collection(db, 'members'), limit(500)));
    if (snap.empty) { box.textContent = 'এখনো কেউ লগইন করেনি।'; return; }

    const rank = { pending: 0, expired: 1, rejected: 2, approved: 3 };
    const time = (m) => (m.createdAt && m.createdAt.seconds) || 0;
    const members = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) =>
        (rank[effectiveStatus(a)] ?? 4) - (rank[effectiveStatus(b)] ?? 4) || time(b) - time(a)
      ); // Pending ও Expired আগে, নতুন আগে

    const frag = document.createDocumentFragment();

    members.forEach((m) => {
      const eff = effectiveStatus(m);
      const row = document.createElement('div');
      row.className = 'admin-row';

      const name = document.createElement('strong');
      name.textContent = m.name || 'ইউজার';

      const email = document.createElement('small');
      email.textContent = m.email || '';

      const status = document.createElement('span');
      const badge = document.createElement('span');
      badge.className = 'badge ' + eff;
      badge.textContent = STATUS_LABEL[eff] || 'Pending';
      status.appendChild(badge);
      if (m.plan && m.expiresAt) {
        const sub = document.createElement('span');
        sub.className = 'admin-sub';
        sub.textContent = m.id === currentUser.uid
          ? 'Admin'
          : `${m.plan} · ${fmtDate(m.expiresAt)} পর্যন্ত` + (isActive(m) ? ` (${daysLeft(m.expiresAt)} দিন বাকি)` : '');
        status.appendChild(sub);
      }

      const actions = document.createElement('div');
      actions.className = 'admin-actions';

      if (m.id !== currentUser.uid) { // অ্যাডমিন নিজের অ্যাকাউন্ট বদলাতে পারবে না
        const select = document.createElement('select');
        Object.keys(PLANS).forEach((p) => {
          const o = document.createElement('option');
          o.value = p;
          o.textContent = p;
          if (p === m.plan) o.selected = true;
          select.appendChild(o);
        });

        const ok = document.createElement('button');
        ok.className = 'btn-ok';
        ok.textContent = eff === 'approved' ? '➕ Extend' : '✔ Approve';
        ok.addEventListener('click', () => approveWithPlan(m, select.value));

        actions.append(select, ok);

        if (m.status !== 'rejected') {
          const no = document.createElement('button');
          no.className = 'btn-no';
          no.textContent = eff === 'approved' ? '⛔ Revoke' : '✖ Reject';
          no.addEventListener('click', () => rejectMember(m.id));
          actions.appendChild(no);
        }
      }

      row.append(name, email, status, actions);
      frag.appendChild(row);
    });

    box.replaceChildren(frag);
  } catch (e) {
    console.error(e);
    box.textContent = 'তালিকা লোড করা যায়নি (' + (e.code || e.message) + '). Firestore Rules-এ আপনার ইমেইল ঠিক আছে কি না আর Publish হয়েছে কি না দেখুন।';
  }
}

// ---------- পেমেন্ট কনফার্ম ফর্ম ----------
let payPlan = null;
const tsOf = (x) => (x.createdAt && x.createdAt.seconds) || 0;
const PAY_STATUS = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

function openPayForm(name, price) {
  if (!currentUser) {
    alert('পেমেন্ট কনফার্ম করতে আগে Google দিয়ে লগইন করুন।');
    login();
    return;
  }
  payPlan = { name, price };
  $('payPlanLabel').textContent = `${name} — ${price} TK`;
  $('payUser').value = currentUser.email || '';
  $('payAmount').value = price;
  $('payTrx').value = '';
  $('paySender').value = '';
  document.querySelectorAll('input[name="payMethod"]').forEach((r) => (r.checked = false));
  setPayMsg('');
  $('paySubmitBtn').disabled = false;
  $('payOverlay').classList.add('open');
}

function closePayForm() {
  $('payOverlay').classList.remove('open');
}

function setPayMsg(text, ok = false) {
  const el = $('payMsg');
  el.textContent = text;
  el.className = 'pay-msg' + (ok ? ' ok' : '');
}

document.querySelectorAll('.btn-confirm[data-name]').forEach((btn) => {
  btn.addEventListener('click', () => openPayForm(btn.dataset.name, Number(btn.dataset.price)));
});
$('payCloseBtn').addEventListener('click', closePayForm);
$('payOverlay').addEventListener('click', (e) => {
  if (e.target === $('payOverlay')) closePayForm();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('payOverlay').classList.contains('open')) closePayForm();
});

$('payForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || !payPlan) return;

  const method = document.querySelector('input[name="payMethod"]:checked')?.value;
  const trx = $('payTrx').value.trim().toUpperCase();
  const amount = Number($('payAmount').value);
  const sender = $('paySender').value.trim();

  if (!method) return setPayMsg('পেমেন্ট মেথড বেছে নিন।');
  if (!/^[A-Z0-9]{6,20}$/.test(trx)) return setPayMsg('TrxID শুধু ইংরেজি অক্ষর ও সংখ্যা হবে (৬ থেকে ২০টি)।');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) return setPayMsg('সঠিক টাকার পরিমাণ লিখুন।');
  if (!/^01[3-9][0-9]{8}$/.test(sender)) return setPayMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন 01XXXXXXXXX)।');

  $('paySubmitBtn').disabled = true;
  setPayMsg('জমা দেওয়া হচ্ছে...', true);

  try {
    // ডকুমেন্টের নাম মেথড+TrxID, তাই একই TrxID দ্বিতীয়বার জমা দেওয়া যায় না
    await setDoc(doc(db, 'payments', `${method}_${trx}`), {
      uid: currentUser.uid,
      email: currentUser.email || '',
      name: currentUser.displayName || 'ইউজার',
      plan: payPlan.name,
      amount,
      method,
      trxId: trx,
      senderNumber: sender,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    setPayMsg('✔ রিকোয়েস্ট জমা হয়েছে। অ্যাডমিন যাচাই করে প্ল্যান চালু করে দেবেন।', true);
    loadMyPayments();
    setTimeout(closePayForm, 1800);
  } catch (err) {
    console.error(err);
    setPayMsg('জমা দেওয়া যায়নি। এই TrxID আগেই জমা দেওয়া হয়ে থাকতে পারে, অথবা Firestore Rules Publish হয়নি।');
    $('paySubmitBtn').disabled = false;
  }
});

// ---------- ইউজারের নিজের পেমেন্ট রিকোয়েস্ট ----------
async function loadMyPayments() {
  const box = $('myPayments');
  if (!box) return;

  if (!currentUser) {
    box.textContent = 'পেমেন্ট রিকোয়েস্ট দেখতে লগইন করুন।';
    return;
  }

  try {
    const snap = await getDocs(query(collection(db, 'payments'), where('uid', '==', currentUser.uid), limit(20)));
    if (snap.empty) { box.textContent = 'এখনো কোনো পেমেন্ট রিকোয়েস্ট জমা দেননি।'; return; }

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => tsOf(b) - tsOf(a));
    const frag = document.createDocumentFragment();

    list.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'my-pay-row';

      const info = document.createElement('span');
      info.textContent = `${p.plan} · ${p.amount} TK · ${p.method} · TrxID: ${p.trxId}`;

      const badge = document.createElement('span');
      badge.className = 'badge ' + (p.status || 'pending');
      badge.textContent = PAY_STATUS[p.status] || 'Pending';

      row.append(info, badge);
      frag.appendChild(row);
    });

    box.replaceChildren(frag);
  } catch (e) {
    console.error(e);
    box.textContent = 'রিকোয়েস্ট লোড করা যায়নি।';
  }
}

// ---------- অ্যাডমিন: পেমেন্ট রিকোয়েস্ট ----------
async function approvePayment(p) {
  try {
    const ms = await getDoc(memberRef(p.uid));
    if (!ms.exists()) { alert('এই ইউজারের অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।'); return; }

    await applyPlan({ id: p.uid, ...ms.data() }, p.plan); // মেয়াদ বসানো বা বাড়ানো
    await updateDoc(doc(db, 'payments', p.id), { status: 'approved' });
    loadAdmin();
  } catch (e) {
    console.error(e);
    alert('Approve করা যায়নি: ' + (e.code || e.message));
  }
}

async function rejectPayment(p) {
  try {
    await updateDoc(doc(db, 'payments', p.id), { status: 'rejected' });
    loadAdmin();
  } catch (e) {
    console.error(e);
    alert('পরিবর্তন করা যায়নি: ' + (e.code || e.message));
  }
}

async function loadAdminPayments() {
  const box = $('adminPayments');
  if (!box) return;

  try {
    const snap = await getDocs(query(collection(db, 'payments'), limit(300)));
    if (snap.empty) { box.textContent = 'এখনো কোনো পেমেন্ট রিকোয়েস্ট আসেনি।'; return; }

    const rank = { pending: 0, rejected: 1, approved: 2 };
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || tsOf(b) - tsOf(a)); // Pending আগে

    const lines = (...texts) => {
      const cell = document.createElement('div');
      texts.forEach((t, i) => {
        const el = document.createElement(i === 0 ? 'strong' : 'small');
        el.textContent = t;
        el.style.display = 'block';
        cell.appendChild(el);
      });
      return cell;
    };

    const frag = document.createDocumentFragment();

    list.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'admin-row';

      const when = tsOf(p) ? fmtDate(tsOf(p) * 1000) : '';

      const actions = document.createElement('div');
      actions.className = 'admin-actions';

      if (p.status === 'pending') {
        const ok = document.createElement('button');
        ok.className = 'btn-ok';
        ok.textContent = '✔ Approve';
        ok.addEventListener('click', () => approvePayment(p));

        const no = document.createElement('button');
        no.className = 'btn-no';
        no.textContent = '✖ Reject';
        no.addEventListener('click', () => rejectPayment(p));

        actions.append(ok, no);
      } else {
        const badge = document.createElement('span');
        badge.className = 'badge ' + p.status;
        badge.textContent = PAY_STATUS[p.status] || p.status;
        actions.appendChild(badge);
      }

      row.append(
        lines(p.name || 'ইউজার', p.email || ''),
        lines(`${p.plan} · ${p.amount} TK`, `${p.method} · Sender: ${p.senderNumber}`),
        lines(`TrxID: ${p.trxId}`, when),
        actions
      );
      frag.appendChild(row);
    });

    box.replaceChildren(frag);
  } catch (e) {
    console.error(e);
    box.textContent = 'পেমেন্ট রিকোয়েস্ট লোড করা যায়নি (' + (e.code || e.message) + ')। Firestore Rules-এ payments অংশ যোগ ও Publish হয়েছে কি না দেখুন।';
  }
}

// ---------- অতিরিক্ত পেজ (লিডারবোর্ড, অ্যাডমিন) দেখানো ----------
const extraPages = ['leaderboardPage', 'adminPage'];
const extraNavs = ['navLeaderboard', 'navAdmin'];
const mainNavs = ['navHome', 'navSubscription', 'navPractice', 'navDashboard', 'navHistory'];

function showExtra(pageId, navId, loader) {
  document.querySelectorAll('.page-section').forEach((s) => (s.style.display = 'none'));
  $(pageId).style.display = 'block';
  document.querySelectorAll('.side-nav a').forEach((a) => a.classList.remove('active'));
  $(navId).classList.add('active');
  loader();
}

$('navLeaderboard').addEventListener('click', (e) => {
  e.preventDefault();
  showExtra('leaderboardPage', 'navLeaderboard', loadLeaderboard);
});

$('navAdmin').addEventListener('click', (e) => {
  e.preventDefault();
  showExtra('adminPage', 'navAdmin', loadAdmin);
});

// মূল মেনুতে ক্লিক করলে অতিরিক্ত পেজগুলো লুকিয়ে ফেলা
mainNavs.forEach((id) => {
  $(id).addEventListener('click', () => {
    extraPages.forEach((p) => ($(p).style.display = 'none'));
    extraNavs.forEach((n) => $(n).classList.remove('active'));
    if (id === 'navSubscription') { renderMyPlan(); loadMyPayments(); }
  });
});

renderMyPlan();
