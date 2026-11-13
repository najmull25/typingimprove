// =====================================================================
//  src/auth.js : Google লগইন, ইউজারের আলাদা ডাটা সেভ/লোড ও লিডারবোর্ড
//  নির্ভর করে src/firebase.js-এর ওপর (auth, googleProvider, db এক্সপোর্ট থাকতে হবে)
//
//  Firestore-এ ডাটা থাকে দুই জায়গায়:
//   users/{uid}                 → পাবলিক: নাম, ছবি, bestWpm (লিডারবোর্ডের জন্য)
//   users/{uid}/private/state   → প্রাইভেট: ইউজারের নিজের history, dailyStats ইত্যাদি
// =====================================================================
import { auth, googleProvider, db } from './firebase.js';
import {
  signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const $ = (id) => document.getElementById(id);
let currentUser = null;

const publicRef = (uid) => doc(db, 'users', uid);
const stateRef = (uid) => doc(db, 'users', uid, 'private', 'state');

// ---------- লগইন / লগআউট ----------
$('loginBtn').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    console.error(e);
    if (e.code !== 'auth/popup-closed-by-user') {
      alert('লগইন করা যায়নি: ' + (e.code || e.message));
    }
  }
});

$('logoutBtn').addEventListener('click', () => signOut(auth));

// ---------- ক্লাউড থেকে ইউজারের ডাটা নামানো ----------
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
      // ক্লাউডে আগের ডাটা আছে, সেটাই এই ইউজারের ডাটা
      writeLocal(uid, snap.data());
      return;
    }

    // প্রথমবার লগইন: এই ব্রাউজারে লগইন ছাড়া যে ডাটা জমেছিল, একবার অ্যাকাউন্টে তুলে নেওয়া হয়
    const alreadyMigrated = localStorage.getItem('migratedAnon');
    const anon = readAnonymous();

    if (!alreadyMigrated && anon.totalTests > 0) {
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

// ---------- লগইন অবস্থার পরিবর্তন ----------
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const photo = $('userPhoto');

  if (user) {
    $('userName').textContent = user.displayName || 'ইউজার';
    if (user.photoURL) { photo.src = user.photoURL; photo.style.display = ''; }
    $('loginBtn').style.display = 'none';
    $('logoutBtn').style.display = '';

    await pullState(user);
    window.setCurrentUser?.(user.uid); // Dashboard/History এখন এই ইউজারের ডাটা দেখাবে
  } else {
    $('userName').textContent = '';
    photo.style.display = 'none';
    $('loginBtn').style.display = '';
    $('logoutBtn').style.display = 'none';

    window.setCurrentUser?.(null); // লগআউট হলে লগইন-ছাড়া ডাটায় ফিরে যাবে
  }

  if ($('leaderboardPage').style.display === 'block') loadLeaderboard();
});

// ---------- টেস্ট শেষে ডাটা সেভ (main.js এটা ডাকে) ----------
export async function saveResult({ wpm, accuracy, snapshot }) {
  if (!currentUser) return; // লগইন না থাকলে শুধু ব্রাউজারে থাকবে
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

// ---------- লিডারবোর্ড পেজ দেখানো ----------
const navIds = ['navHome', 'navPractice', 'navDashboard', 'navHistory'];

$('navLeaderboard').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelectorAll('.page-section').forEach((s) => (s.style.display = 'none'));
  $('leaderboardPage').style.display = 'block';
  document.querySelectorAll('.side-nav a').forEach((a) => a.classList.remove('active'));
  $('navLeaderboard').classList.add('active');
  loadLeaderboard();
});

// অন্য মেনুতে ক্লিক করলে লিডারবোর্ড লুকিয়ে ফেলা
navIds.forEach((id) => {
  $(id).addEventListener('click', () => {
    $('leaderboardPage').style.display = 'none';
    $('navLeaderboard').classList.remove('active');
  });
});
