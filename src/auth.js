// =====================================================================
//  src/auth.js : লগইন বাধ্যতামূলক + অ্যাডমিন অ্যাপ্রুভাল + ইউজারের আলাদা ডাটা + লিডারবোর্ড
//
//  Firestore-এ ডাটা থাকে তিন জায়গায়:
//   members/{uid}               → অ্যাকাউন্টের অবস্থা: pending / approved / rejected
//   users/{uid}                 → পাবলিক: নাম, ছবি, bestWpm (লিডারবোর্ডের জন্য)
//   users/{uid}/private/state   → প্রাইভেট: ইউজারের নিজের history, dailyStats ইত্যাদি
// =====================================================================
import { auth, googleProvider, db } from './firebase.js';
import {
  signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, limit,
  getDocs, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// ★★★ এখানে আপনার নিজের Gmail বসান। Firestore Rules-এও ঠিক একই ইমেইল দিতে হবে। ★★★
const ADMIN_EMAIL = 'najmul0174.bd@gmail.com';

const $ = (id) => document.getElementById(id);

let currentUser = null;
let memberStatus = null; // 'pending' | 'approved' | 'rejected' | null
let isAdmin = false;
let unsubMember = null;
let stateLoadedFor = null;

const memberRef = (uid) => doc(db, 'members', uid);
const publicRef = (uid) => doc(db, 'users', uid);
const stateRef = (uid) => doc(db, 'users', uid, 'private', 'state');

window.typingAllowed = false; // অ্যাপ্রুভ না হওয়া পর্যন্ত টাইপিং বন্ধ

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

// ---------- টাইপিং গেট (কী দেখাবে) ----------
function setAllowed(allowed) {
  window.typingAllowed = allowed;
  document.body.classList.toggle('approved', allowed);
}

function showGate(state) {
  const title = $('gateTitle');
  const text = $('gateText');
  const btn = $('gateLoginBtn');
  btn.style.display = 'none';

  if (state === 'loggedout') {
    title.textContent = '🔒 টাইপ করতে লগইন করুন';
    text.textContent = 'এই সাইটে টাইপিং প্র্যাকটিস করতে Google দিয়ে লগইন করা বাধ্যতামূলক। লগইনের পর অ্যাডমিন আপনার অ্যাকাউন্ট অ্যাপ্রুভ করলে টাইপ করতে পারবেন।';
    btn.style.display = '';
  } else if (state === 'pending') {
    title.textContent = '⏳ অ্যাপ্রুভালের অপেক্ষায়';
    text.textContent = 'আপনার অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু অ্যাডমিন এখনো অ্যাপ্রুভ করেননি। অ্যাপ্রুভ হলে এই পেজ নিজে থেকেই খুলে যাবে, রিফ্রেশ করার দরকার নেই।';
  } else if (state === 'rejected') {
    title.textContent = '⛔ অ্যাকাউন্ট অনুমোদিত হয়নি';
    text.textContent = 'অ্যাডমিন আপনার অ্যাকাউন্ট অনুমোদন করেননি। প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।';
  } else if (state === 'error') {
    title.textContent = '⚠️ সমস্যা হয়েছে';
    text.textContent = 'সার্ভারের সাথে যোগাযোগ করা যায়নি। ইন্টারনেট দেখুন আর Firestore Rules Publish হয়েছে কি না যাচাই করুন, তারপর পেজ রিফ্রেশ করুন।';
  }
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

    // প্রথমবার: এই ব্রাউজারে লগইন ছাড়া যে ডাটা জমেছিল, একবার অ্যাকাউন্টে তুলে নেওয়া হয়
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
    await setDoc(ref, {
      name: user.displayName || 'ইউজার',
      email: user.email || '',
      photo: user.photoURL || '',
      status: isAdmin ? 'approved' : 'pending',
      createdAt: serverTimestamp()
    });
  } else if (isAdmin && snap.data().status !== 'approved') {
    await updateDoc(ref, { status: 'approved' }); // অ্যাডমিন নিজেকে কখনো আটকাবে না
  }
}

// ---------- অ্যাপ্রুভাল স্ট্যাটাস বদলালে ----------
async function applyStatus(user, status) {
  memberStatus = status;

  if (status === 'approved') {
    if (stateLoadedFor !== user.uid) {
      await pullState(user);
      stateLoadedFor = user.uid;
      window.setCurrentUser?.(user.uid);
    }
    setAllowed(true);
  } else {
    setAllowed(false);
    window.setCurrentUser?.(user.uid); // লগইন-ছাড়া পুরোনো ডাটা যেন না দেখায়
    showGate(status === 'rejected' ? 'rejected' : 'pending');
  }
}

// ---------- লগইন অবস্থার পরিবর্তন ----------
onAuthStateChanged(auth, async (user) => {
  if (unsubMember) { unsubMember(); unsubMember = null; }

  currentUser = user;
  memberStatus = null;
  stateLoadedFor = null;
  setAllowed(false);

  const photo = $('userPhoto');

  if (!user) {
    isAdmin = false;
    $('userName').textContent = '';
    photo.style.display = 'none';
    $('loginBtn').style.display = '';
    $('logoutBtn').style.display = 'none';
    $('navAdmin').style.display = 'none';
    window.setCurrentUser?.(null);
    showGate('loggedout');
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

  // রিয়েল-টাইম: অ্যাডমিন অ্যাপ্রুভ করলেই ইউজারের পেজ নিজে থেকে খুলে যাবে
  unsubMember = onSnapshot(
    memberRef(user.uid),
    (snap) => applyStatus(user, snap.data()?.status || 'pending'),
    (err) => { console.error(err); showGate('error'); }
  );

  if ($('leaderboardPage').style.display === 'block') loadLeaderboard();
});

// ---------- টেস্ট শেষে ডাটা সেভ (main.js এটা ডাকে) ----------
export async function saveResult({ wpm, accuracy, snapshot }) {
  if (!currentUser || memberStatus !== 'approved') return;
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
const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

async function setMemberStatus(uid, status) {
  try {
    await updateDoc(memberRef(uid), { status });
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

  try {
    const snap = await getDocs(query(collection(db, 'members'), limit(500)));
    if (snap.empty) { box.textContent = 'এখনো কেউ লগইন করেনি।'; return; }

    const rank = { pending: 0, rejected: 1, approved: 2 };
    const time = (m) => (m.createdAt && m.createdAt.seconds) || 0;
    const members = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || time(b) - time(a)); // Pending আগে, নতুন আগে

    const frag = document.createDocumentFragment();

    members.forEach((m) => {
      const row = document.createElement('div');
      row.className = 'admin-row';

      const name = document.createElement('strong');
      name.textContent = m.name || 'ইউজার';

      const email = document.createElement('small');
      email.textContent = m.email || '';

      const status = document.createElement('span');
      const badge = document.createElement('span');
      badge.className = 'badge ' + (m.status || 'pending');
      badge.textContent = STATUS_LABEL[m.status] || 'Pending';
      status.appendChild(badge);

      const actions = document.createElement('div');
      actions.className = 'admin-actions';

      if (m.id !== currentUser.uid) { // অ্যাডমিন নিজের অ্যাকাউন্ট বদলাতে পারবে না
        if (m.status !== 'approved') {
          const ok = document.createElement('button');
          ok.className = 'btn-ok';
          ok.textContent = '✔ Approve';
          ok.addEventListener('click', () => setMemberStatus(m.id, 'approved'));
          actions.appendChild(ok);
        }
        if (m.status !== 'rejected') {
          const no = document.createElement('button');
          no.className = 'btn-no';
          no.textContent = m.status === 'approved' ? '⛔ Revoke' : '✖ Reject';
          no.addEventListener('click', () => setMemberStatus(m.id, 'rejected'));
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

// ---------- অতিরিক্ত পেজ (লিডারবোর্ড, অ্যাডমিন) দেখানো ----------
const extraPages = ['leaderboardPage', 'adminPage'];
const extraNavs = ['navLeaderboard', 'navAdmin'];
const mainNavs = ['navHome', 'navPractice', 'navDashboard', 'navHistory'];

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
  });
});
