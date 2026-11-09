
const $ = (id) => document.getElementById(id);

// ================= DEFAULT PASSAGES =================

const defaultPassages = {
  en: [
    {
      title: 'English Passage 1',
      text: 'Education is one of the most important things in human life. It helps us develop knowledge, skills and good character.',
    },
    {
      title: 'English Passage 2',
      text: 'Technology has changed the way we live, work and communicate. Computers and the internet have made information available.',
    },
  ],

  bn: [
    {
      title: 'বাংলা প্যাসেজ ১',
      text: 'শিক্ষা মানুষের জীবনের একটি গুরুত্বপূর্ণ অংশ। শিক্ষার মাধ্যমে মানুষ জ্ঞান অর্জন করে এবং নিজের দক্ষতা বৃদ্ধি করতে পারে।',
    },
    {
      title: 'বাংলা প্যাসেজ ২',
      text: 'বর্তমান যুগ তথ্য ও প্রযুক্তির যুগ। কম্পিউটার এবং ইন্টারনেট আমাদের জীবনকে অনেক সহজ করে দিয়েছে।',
    },
  ],
};

// ================= PASSAGE LIBRARY =================

let passageLibrary =
  JSON.parse(localStorage.getItem('passageLibrary') || 'null') ||
  JSON.parse(JSON.stringify(defaultPassages));

let timeLeft = 300;
let interval = null;
let started = false;
let finished = false;
let startTime = 0;
let isCustomMode = false;


// ================= CURRENT PASSAGE =================

function getCurrentPassage() {
  if (isCustomMode) return '';

  return (
    passageLibrary[$('language').value][Number($('passageSelect').value)]
      ?.text || ''
  );
}


// ================= TIME FORMAT =================

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;
}


// ================= LOAD PASSAGES =================

function loadPassages() {
  if (isCustomMode) return;

  const select = $('passageSelect');

  if (!select) return;

  select.innerHTML = '';

  passageLibrary[$('language').value].forEach((p, idx) => {
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
    // textContent preserves the original text.
    // CSS white-space: pre-wrap displays new lines.
    passageBox.textContent = getCurrentPassage();
  }
}


// ================= RESET TEST =================

function resetTest() {
  clearInterval(interval);

  interval = null;
  started = false;
  finished = false;

  timeLeft = Number($('duration').value) * 60;

  $('timer').textContent = formatTime(timeLeft);

  $('typingInput').value = '';
  $('typingInput').disabled = true;

  $('startBtn').disabled = false;
  $('startBtn').textContent = 'Start Test';

  $('resultDuration').textContent = 'N/A';

  updateStats();
  showPassage();
}


// ================= UPDATE STATISTICS =================

function updateStats() {
  const input = Array.from($('typingInput').value);

  const elapsed = started
    ? Math.max((Date.now() - startTime) / 60000, 1 / 60)
    : 1;

  if (isCustomMode) {
    $('wpmWithSpace').textContent = Math.round(
      input.length / 5 / elapsed
    );

    $('wpmWithoutSpace').textContent = Math.round(
      input.filter((c) => !/\s/.test(c)).length / 5 / elapsed
    );

    $('accuracy').textContent = '100%';
    $('errors').textContent = 0;

  } else {
    const target = Array.from(getCurrentPassage());

    let correct = 0;
    let mistakes = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === target[i]) {
        correct++;
      } else {
        mistakes++;
      }
    }

    const accuracy = input.length
      ? Math.round((correct / input.length) * 100)
      : 100;

    $('wpmWithSpace').textContent = Math.round(
      input.length / 5 / elapsed
    );

    $('wpmWithoutSpace').textContent = Math.round(
      input.filter((c) => !/\s/.test(c)).length / 5 / elapsed
    );

    $('accuracy').textContent = accuracy + '%';
    $('errors').textContent = mistakes;
  }
}


// ================= DASHBOARD =================

function renderDashboard() {
  $('bestWpm').textContent = localStorage.getItem('bestWpm') || 0;

  $('lowestWpm').textContent = localStorage.getItem('lowestWpm') || 0;

  $('totalTests').textContent = localStorage.getItem('totalTests') || 0;

  const today = new Date().toLocaleDateString();

  const history = JSON.parse(
    localStorage.getItem('history') || '[]'
  );

  $('todayTests').textContent = history.filter((item) =>
    item.date.startsWith(today)
  ).length;

  if ($('historyList')) {
    $('historyList').innerHTML = history.length
      ? history
          .map((h) => {
            const parts = h.date.split(', ');
            const datePart = parts[0] || h.date;
            const timePart = parts[1] || '';

            return `
              <div class="history-item">
                <span style="color: #3b82f6; width: 25%; text-align: left;">
                  📅 ${datePart}
                </span>

                <span style="color: #64748b; width: 25%; text-align: left;">
                  ⏰ ${timePart}
                </span>

                <span style="color: #10b981; font-weight: bold; width: 25%; text-align: left;">
                  ⚡ ${h.wpm} WPM
                </span>

                <span style="color: #f43f5e; font-weight: bold; width: 25%; text-align: left;">
                  🎯 ${h.accuracy}
                </span>
              </div>
            `;
          })
          .join(
            '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;">'
          )
      : 'এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।';
  }
}


// ================= FINISH TEST =================

function finishTest() {
  if (finished) return;

  finished = true;

  clearInterval(interval);

  interval = null;

  $('typingInput').disabled = true;

  $('startBtn').disabled = false;
  $('startBtn').textContent = 'Start Again';

  $('resultDuration').textContent = formatTime(
    Math.round((Date.now() - startTime) / 1000)
  );

  const wpm = Number($('wpmWithSpace').textContent);

  const total =
    Number(localStorage.getItem('totalTests') || 0) + 1;

  const best = Math.max(
    wpm,
    Number(localStorage.getItem('bestWpm') || 0)
  );

  const lowest =
    Number(localStorage.getItem('lowestWpm') || 0) === 0
      ? wpm
      : Math.min(
          wpm,
          Number(localStorage.getItem('lowestWpm'))
        );

  localStorage.setItem('totalTests', total);
  localStorage.setItem('bestWpm', best);
  localStorage.setItem('lowestWpm', lowest);

  const history = JSON.parse(
    localStorage.getItem('history') || '[]'
  );

  history.unshift({
    date: new Date().toLocaleString(),
    wpm,
    accuracy: $('accuracy').textContent,
  });

  localStorage.setItem(
    'history',
    JSON.stringify(history.slice(0, 20))
  );

  renderDashboard();

  alert('Test Completed!');
}


// ================= START TEST =================

$('startBtn').addEventListener('click', () => {
  if (finished) resetTest();

  if (started) return;

  started = true;

  startTime = Date.now();

  $('typingInput').disabled = false;

  $('typingInput').focus();

  $('startBtn').disabled = true;

  interval = setInterval(() => {
    timeLeft--;

    $('timer').textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      finishTest();
    }
  }, 1000);
});


// ================= TYPING INPUT =================

$('typingInput').addEventListener('input', () => {
  if (!started || finished) return;

  updateStats();

  if (
    !isCustomMode &&
    $('typingInput').value.length >= getCurrentPassage().length
  ) {
    finishTest();
  }
});


// ================= SAVE PASSAGE =================

$('savePassage').addEventListener('click', () => {

  const title = $('passageTitle').value.trim();

  // Do not trim the actual passage text.
  // This preserves Enter, blank lines and spaces.
  const text = $('newPassage').value;

  const lang = $('language').value;

  // Check whether the text is empty without changing it.
  if (!title || !text.trim()) {
    alert('Passage Title এবং Text লিখুন!');
    return;
  }

  // Save the original text exactly as entered.
  passageLibrary[lang].push({
    title: title,
    text: text,
  });

  localStorage.setItem(
    'passageLibrary',
    JSON.stringify(passageLibrary)
  );

  // Reload passage list.
  loadPassages();

  // Automatically select the newly added passage.
  $('passageSelect').value =
    passageLibrary[lang].length - 1;

  // Clear input fields.
  $('passageTitle').value = '';
  $('newPassage').value = '';

  // Reset test and display the new passage.
  resetTest();

  $('saveMessage').textContent =
    'Passage Successfully Saved!';

});


// ================= LANGUAGE CHANGE =================

$('language').addEventListener('change', () => {
  loadPassages();
  resetTest();
});


// ================= PASSAGE SELECTION =================

$('passageSelect').addEventListener('change', resetTest);


// ================= DURATION CHANGE =================

$('duration').addEventListener('change', resetTest);


// ================= RESET BUTTON =================

$('resetBtn').addEventListener('click', resetTest);


// ================= DARK MODE =================

$('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');

  $('themeBtn').textContent =
    document.body.classList.contains('dark')
      ? '☀ Light Mode'
      : '🌙 Dark Mode';
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


// ================= SHOW SECTION =================

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
}


// ================= NAVIGATION =================

Object.keys(navs).forEach((k) =>
  navs[k].addEventListener('click', (e) => {
    e.preventDefault();

    showSection(k);
  })
);


// ================= GO TO PRACTICE =================

$('goToPracticeBtn').addEventListener('click', () => {
  showSection('practice');
});


// ================= DELETE PASSAGE =================

$('deletePassageBtn').addEventListener('click', () => {

  const idx = Number($('passageSelect').value);

  const lang = $('language').value;

  if (idx < 2) {
    return alert('ডিফল্ট প্যাসেজ ডিলিট করা সম্ভব নয়!');
  }

  if (confirm('ডিলিট করবেন?')) {

    passageLibrary[lang].splice(idx, 1);

    localStorage.setItem(
      'passageLibrary',
      JSON.stringify(passageLibrary)
    );

    loadPassages();

    resetTest();
  }
});


// ================= CUSTOM PRACTICE MODE =================

$('customPracticeBtn').addEventListener('click', () => {

  isCustomMode = !isCustomMode;

  resetTest();

  if (isCustomMode) {

    $('normalPassageSection').style.display = 'none';

    $('passageSelect').style.display = 'none';

    $('customPracticeBtn').textContent = 'Normal Practice';

    $('customPracticeBtn').classList.add('activeMode');

    $('typingInput').placeholder =
      'মোড একটিভ হয়েছে! অফলাইন বই দেখে টাইপ করা শুরু করতে নিচে Start Test বাটনে ক্লিক করুন...';

  } else {

    $('normalPassageSection').style.display = 'block';

    $('passageSelect').style.display = 'block';

    $('customPracticeBtn').textContent = 'Customize Practice';

    $('customPracticeBtn').classList.remove('activeMode');

    $('typingInput').placeholder =
      'এখানে টাইপ করা শুরু করুন...';

    loadPassages();
  }
});


// ================= INITIALIZE WEBSITE =================

loadPassages();

resetTest();

renderDashboard();
