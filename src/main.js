
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
  seconds = Math.max(0, Math.floor(seconds));

  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;
}


// ================= GET ELAPSED TIME =================

function getElapsedSeconds() {
  if (!started || !startTime) return 0;

  return Math.max(0, (Date.now() - startTime) / 1000);
}


// ================= COUNT WORDS =================

function getWords(text) {
  const trimmed = text.trim();

  if (!trimmed) return [];

  return trimmed.split(/\s+/u);
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
    passageBox.textContent = getCurrentPassage();
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
}


// ================= RESET TEST =================

function resetTest() {
  clearInterval(interval);

  interval = null;
  started = false;
  finished = false;
  startTime = 0;

  timeLeft = Number($('duration').value) * 60;

  $('timer').textContent = formatTime(timeLeft);

  $('typingInput').value = '';
  $('typingInput').disabled = true;

  // Reset both scroll positions

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

  // Array.from correctly counts Unicode code points

  const input = Array.from(typedText);

  const totalCharacters = input.length;

  // Count characters without spaces

  const charactersWithoutSpace = input.filter(
    (char) => !/\s/u.test(char)
  ).length;

  // Count typed words

  const typedWords = getWords(typedText);

  const totalTypedWords = typedWords.length;

  // Calculate elapsed time in minutes

  const elapsedMinutes = started
    ? Math.max(getElapsedSeconds() / 60, 1 / 60)
    : 0;

  // ================= WPM CALCULATIONS =================

  let wpmWithSpace = 0;
  let wpmWithoutSpace = 0;
  let wordWpm = 0;

  if (elapsedMinutes > 0) {

    // Standard character-based WPM

    wpmWithSpace = Math.round(
      totalCharacters / 5 / elapsedMinutes
    );

    wpmWithoutSpace = Math.round(
      charactersWithoutSpace / 5 / elapsedMinutes
    );

    // Word-based WPM

    wordWpm = Math.round(
      totalTypedWords / elapsedMinutes
    );
  }


  // ================= NORMAL PRACTICE =================

  let correctCharacters = 0;
  let mistakes = 0;
  let correctWordCount = 0;
  let accuracy = 100;

  if (!isCustomMode) {

    const targetText = getCurrentPassage();

    const target = Array.from(targetText);

    // Compare every typed character with the target

    for (let i = 0; i < input.length; i++) {

      if (input[i] === target[i]) {
        correctCharacters++;
      } else {
        mistakes++;
      }
    }

    // Character-based accuracy

    accuracy = totalCharacters > 0
      ? Math.round(
          (correctCharacters / totalCharacters) * 100
        )
      : 100;


    // ================= CORRECT WORDS =================

    const targetWords = getWords(targetText);

    for (let i = 0; i < typedWords.length; i++) {

      if (
        targetWords[i] !== undefined &&
        typedWords[i] === targetWords[i]
      ) {
        correctWordCount++;
      }
    }

  }


  // ================= DISPLAY RESULTS =================

  $('wpmWithSpace').textContent = wpmWithSpace;

  $('wpmWithoutSpace').textContent = wpmWithoutSpace;

  $('wordWpm').textContent = wordWpm;

  $('totalTypedWords').textContent = totalTypedWords;

  $('charactersWithSpace').textContent = totalCharacters;

  $('charactersWithoutSpace').textContent =
    charactersWithoutSpace;


  // ================= MODE-BASED RESULTS =================

  if (isCustomMode) {

    $('accuracy').textContent = 'N/A';

    $('correctWords').textContent = 'N/A';

    $('errors').textContent = 'N/A';

  } else {

    $('accuracy').textContent = accuracy + '%';

    $('correctWords').textContent = correctWordCount;

    $('errors').textContent = mistakes;

  }


  // ================= LIVE DURATION =================

  if (started) {

    $('resultDuration').textContent = formatTime(
      Math.round(getElapsedSeconds())
    );

  }

}


// ================= DASHBOARD =================

function renderDashboard() {

  $('bestWpm').textContent =
    localStorage.getItem('bestWpm') || 0;

  $('lowestWpm').textContent =
    localStorage.getItem('lowestWpm') || 0;

  $('totalTests').textContent =
    localStorage.getItem('totalTests') || 0;

  const today = new Date().toLocaleDateString();

  const history = JSON.parse(
    localStorage.getItem('history') || '[]'
  );

  $('todayTests').textContent = history.filter((item) =>
    item.date.startsWith(today)
  ).length;


  // ================= HISTORY DISPLAY =================

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

  if (finished || !started) return;

  // Update final statistics before stopping

  updateStats();

  finished = true;

  clearInterval(interval);

  interval = null;

  $('typingInput').disabled = true;

  $('startBtn').disabled = false;

  $('startBtn').textContent = 'Start Again';


  // Final duration

  const finalDuration = Math.round(getElapsedSeconds());

  $('resultDuration').textContent = formatTime(finalDuration);


  // ================= SAVE TEST DATA =================

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


  // ================= SAVE HISTORY =================

  const history = JSON.parse(
    localStorage.getItem('history') || '[]'
  );

  history.unshift({

    date: new Date().toLocaleString(),

    wpm,

    wordWpm: Number($('wordWpm').textContent),

    accuracy: $('accuracy').textContent,

    totalTypedWords: Number(
      $('totalTypedWords').textContent
    ),

    correctWords: $('correctWords').textContent,

    charactersWithSpace: Number(
      $('charactersWithSpace').textContent
    ),

    charactersWithoutSpace: Number(
      $('charactersWithoutSpace').textContent
    ),

    duration: $('resultDuration').textContent,

    mistakes: $('errors').textContent,

    mode: isCustomMode ? 'Custom' : 'Normal',

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

  if (finished) {
    resetTest();
  }

  if (started) return;

  started = true;

  startTime = Date.now();

  $('typingInput').disabled = false;

  $('typingInput').focus();

  $('startBtn').disabled = true;

  // Show initial statistics

  updateStats();


  interval = setInterval(() => {

    timeLeft--;

    $('timer').textContent = formatTime(timeLeft);

    // Refresh statistics every second

    updateStats();

    if (timeLeft <= 0) {

      timeLeft = 0;

      $('timer').textContent = '00:00';

      finishTest();

    }

  }, 1000);

});


// ================= TYPING INPUT & SCROLL SYNC =================

const typingBox = $('typingInput');

const passageBox = $('passage');


// Synchronize the scroll positions of both boxes

function syncPassageScroll() {

  if (isCustomMode) return;

  if (!typingBox || !passageBox) return;

  passageBox.scrollTop = typingBox.scrollTop;

}


// Update statistics and synchronize scrolling while typing

typingBox.addEventListener('input', () => {

  if (!started || finished) return;

  updateStats();

  syncPassageScroll();


  // Automatically finish when the entire passage is typed

  if (
    !isCustomMode &&
    Array.from(typingBox.value).length >=
      Array.from(getCurrentPassage()).length
  ) {

    finishTest();

  }

});


// Also synchronize when the typing box is scrolled manually

typingBox.addEventListener('scroll', () => {

  syncPassageScroll();

});


// ================= SAVE PASSAGE =================

$('savePassage').addEventListener('click', () => {

  const title = $('passageTitle').value.trim();

  // Preserve original passage text

  const text = $('newPassage').value;

  const lang = $('language').value;

  if (!title || !text.trim()) {

    alert('Passage Title এবং Text লিখুন!');

    return;

  }

  passageLibrary[lang].push({

    title: title,

    text: text,

  });


  localStorage.setItem(
    'passageLibrary',
    JSON.stringify(passageLibrary)
  );


  loadPassages();

  $('passageSelect').value =
    passageLibrary[lang].length - 1;

  $('passageTitle').value = '';

  $('newPassage').value = '';

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

$('passageSelect').addEventListener(
  'change',
  resetTest
);


// ================= DURATION CHANGE =================

$('duration').addEventListener(
  'change',
  resetTest
);


// ================= RESET BUTTON =================

$('resetBtn').addEventListener(
  'click',
  resetTest
);


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
