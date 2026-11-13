// =====================================================================
//  src/auth.js : Google লগইন, স্কোর সেভ ও লিডারবোর্ড
//  নির্ভর করে src/firebase.js-এর ওপর (auth, googleProvider, db এক্সপোর্ট থাকতে হবে)
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

// ---------- লগইন / লগআউট ----------
$('loginBtn').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    console.error(e);
    alert('লগইন করা যায়নি: ' + (e.code || e.message));
  }
});

$('logoutBtn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const photo = $('userPhoto');
  if (user) {
    $('userName').textContent = user.displayName || 'ইউজার';
    if (user.photoURL) { photo.src = user.photoURL; photo.style.display = ''; }
    $('loginBtn').style.display = 'none';
    $('logoutBtn').style.display = '';
  } else {
    $('userName').textContent = '';
    photo.style.display = 'none';
    $('loginBtn').style.display = '';
    $('logoutBtn').style.display = 'none';
  }
  if ($('leaderboardPage').style.display === 'block') loadLeaderboard();
});

// ---------- স্কোর সেভ ----------
// main.js থেকে টেস্ট শেষে এভাবে ডাকবেন:
//   window.saveResultToCloud?.({ wpm: 45, accuracy: 96 });
export async function saveResult({ wpm, accuracy }) {
  if (!currentUser) return; // লগইন না থাকলে কিছু হবে না
  const w = Math.round(Number(wpm));
  if (!Number.isFinite(w) || w < 0 || w > 400) return;

  const ref = doc(db, 'users', currentUser.uid);
  try {
    const snap = await getDoc(ref);
    const old = snap.exists() ? snap.data() : {};
    await setDoc(ref, {
      name: currentUser.displayName || 'ইউজার',
      photo: currentUser.photoURL || '',
      bestWpm: Math.max(old.bestWpm || 0, w),
      lastWpm: w,
      lastAccuracy: Math.round(Number(accuracy)) || 0,
      totalTests: (old.totalTests || 0) + 1,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.error('স্কোর সেভ হয়নি:', e);
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
