// ================= DEFAULT PASSAGES =================
// এই ফাইলে ডিফল্ট প্যাসেজগুলো আছে। নতুন ডিফল্ট প্যাসেজ যোগ করতে চাইলে
// নিচের তালিকার শেষে যোগ করুন (ডিফল্ট প্যাসেজ ডিলিট করা যায় না)।

const defaultPassages = {
  en: [
    {
      title: 'English Passage 1',
      text: `Education has always been one of the most powerful forces behind human progress. It shapes the way people think, influences their decisions, creates opportunities for personal development and determines the direction of national growth.

Throughout history, societies have depended on education to develop skilled individuals, strengthen institutions and improve living standards. However, the methods through which people acquire knowledge have changed considerably over time.

From traditional classrooms and printed textbooks to computers, smartphones and artificial intelligence, the educational landscape has experienced a remarkable transformation. Today, digital technology is not simply an additional resource for students and teachers; it is gradually becoming an important part of the entire learning process.

The expansion of the internet has fundamentally changed the relationship between individuals and information. In earlier generations, students generally depended on teachers, libraries and printed educational materials to understand different subjects.

Access to specialised knowledge was often restricted by geographical location, financial circumstances and the availability of educational institutions. A student living in a remote village might have had limited opportunities to consult experienced teachers or access advanced learning materials.

Today, however, the internet has created possibilities that were almost unimaginable for previous generations. A student with an appropriate digital device and a reliable internet connection can explore scientific discoveries, study historical developments, attend educational lectures and communicate with learners from different parts of the world.

This transformation has created a new understanding of education. Learning is no longer necessarily restricted to a particular classroom, institution or period of life. People can acquire knowledge independently, participate in online programmes and develop professional skills without following the traditional educational route.

The increasing availability of digital resources has also encouraged individuals to take greater responsibility for their own learning. Nevertheless, technological progress has brought complicated questions about educational quality, equal access, academic honesty and the changing responsibilities of teachers.`
    },
    {
      title: 'English Passage 2',
      text: `The challenge is not simply to introduce more technology into classrooms but to ensure that technological development contributes to meaningful learning and the intellectual development of students.

In Bangladesh, the transformation is particularly significant because education is closely connected with the country's economic and social future.

A large proportion of the population consists of young people who will eventually become part of the national workforce. Their ability to compete in an increasingly technology-driven global economy will depend considerably on the quality of education they receive.

Although the country has made progress in expanding educational opportunities, substantial differences remain between urban and rural institutions, wealthy and disadvantaged families, and students with different levels of technological access.

The introduction of digital education could help address some of these differences, but only if the necessary infrastructure, training and financial support are provided.

The traditional classroom has served as the foundation of formal education for generations. Teachers explained lessons, students followed textbooks, examinations measured academic performance and educational institutions provided an organised environment for intellectual development.

This arrangement helped establish discipline and created opportunities for students to interact with their peers. Classroom discussions, group assignments and direct communication with teachers also encouraged cooperation and social development.

Even today, these characteristics remain valuable because education involves much more than the transfer of information. Students must learn how to communicate, respect different opinions, work with others and become responsible members of society.

However, traditional educational methods have not always been equally effective for every student. In a classroom containing many learners, teachers often have limited time to address individual difficulties. Some students understand complicated subjects quickly, while others require repeated explanations and additional exercises.`
    },
    {
      title: 'English Passage 3',
      text: ` When lessons follow a fixed schedule, those who fall behind may struggle to understand subsequent topics. Students who require greater academic challenges may also become less interested when instruction moves at a slower pace. 
Digital learning tools can help address some of these difficulties by offering recorded explanations, interactive exercises and additional educational materials.
The availability of online resources has also changed the way students conduct academic research. Previously, research often required access to physical libraries, specialised books and printed journals. These resources remain important, but digital libraries now allow students to explore a much wider range of academic materials. 
They can examine scientific studies, compare historical interpretations and consult publications from international institutions. Such opportunities can strengthen independent learning and encourage students to investigate subjects beyond the limits of their prescribed textbooks.
Nevertheless, having access to information does not necessarily mean possessing knowledge. The internet contains accurate academic research alongside misleading claims, incomplete explanations and fabricated information. 
Students who cannot evaluate the reliability of online materials may develop incorrect understandings of important subjects. Therefore, digital education must include the development of critical thinking and research skills. 
Learners should understand how to identify original sources, compare different accounts and distinguish evidence-based conclusions from unsupported opinions. These abilities are becoming increasingly important in a world where information spreads rapidly through social media and other digital platforms.
Artificial intelligence is introducing another significant change to the educational environment. Intelligent computer systems can explain complicated concepts, generate practice exercises, assist with language learning and help students organise academic information. 
They can also support teachers by preparing educational materials, developing classroom activities and identifying common learning difficulties. Such applications may become particularly useful in institutions where teachers have limited time or access to specialised resources.`
    },

    { title: 'English Passage 4', text: 'Trees are very important for the environment. They provide oxygen, fruits, wood and shelter for birds and animals. We should plant more trees and protect forests for future generations.' },
    { title: 'English Passage 5', text: 'Time is one of the most valuable resources in our lives. Once lost, it never comes back. Therefore, we should make proper plans and use every moment wisely.' },
    { title: 'English Passage 6', text: 'Reading books is a good habit that improves our knowledge and imagination. Books introduce us to different cultures, ideas and experiences. Regular reading also improves our language skills.' },
    { title: 'English Passage 7', text: 'Honesty is a great human virtue. An honest person always speaks the truth and earns the trust of others. Honesty creates peace and strengthens relationships in society.' },
    { title: 'English Passage 8', text: 'Health is the greatest wealth in human life. We should eat balanced food, exercise regularly and maintain personal cleanliness. Adequate sleep and a positive attitude also help us remain healthy.' },
    { title: 'English Passage 9', text: 'The internet has become an important part of modern life. Students use it to attend online classes, collect information and communicate with teachers. However, it should be used carefully and responsibly.' },
    { title: 'English Passage 10', text: 'A good citizen performs duties honestly and respects the laws of the country. Citizens should help others, protect public property and maintain social harmony. Responsible citizens contribute to national development.' },
    { title: 'English Passage 11', text: 'The importance of education cannot be described in a few words. It removes ignorance and helps people understand their rights and responsibilities. Every child should have access to quality education.' },
    { title: 'English Passage 12', text: 'Morning is a beautiful time of the day. The fresh air and peaceful environment make us feel energetic. People who wake up early can start their daily activities in an organized way.' },
    { title: 'English Passage 13', text: 'Science has made our lives more comfortable and convenient. It has brought remarkable changes in medicine, agriculture, transport and communication. Scientific knowledge should be used for the welfare of humanity.' },
    { title: 'English Passage 14', text: 'Trees and plants maintain the balance of nature. They absorb carbon dioxide and release oxygen into the atmosphere. Cutting down forests causes environmental problems and threatens wildlife.' },
    { title: 'English Passage 15', text: 'Hard work is the key to achieving success. Talent alone cannot bring good results without patience and continuous effort. People who work sincerely can overcome difficulties and reach their goals.' },
    { title: 'English Passage 16', text: 'Cleanliness is necessary for a healthy and beautiful environment. We should keep our homes, schools and public places clean. Proper waste management can prevent pollution and many diseases.' },
    { title: 'English Passage 17', text: 'Communication is an important skill in everyday life. It helps us share ideas, express feelings and understand other people. Good communication requires clear language and careful listening.' },
    { title: 'English Passage 18', text: 'The natural beauty of a country is one of its greatest treasures. Rivers, hills, forests and green fields make the landscape attractive. We should protect these natural resources for the future.' },
    { title: 'English Passage 19', text: 'Kindness makes human relationships stronger. A kind person respects others and offers help whenever possible. Even a small act of kindness can bring happiness to someone in need.' },
    { title: 'English Passage 20', text: 'Success does not come overnight. It requires clear goals, patience, confidence and regular practice. We should learn from our mistakes and continue working until we achieve our objectives.' }
  ],

  bn: [
    { title: 'বাংলা প্যাসেজ ১', text: 'শিক্ষা মানুষের জীবনের একটি গুরুত্বপূর্ণ অংশ। শিক্ষার মাধ্যমে মানুষ জ্ঞান অর্জন করে এবং নিজের দক্ষতা বৃদ্ধি করতে পারে। প্রকৃত শিক্ষা মানুষকে নৈতিক, মানবিক ও দায়িত্বশীল হতে শেখায়।' },
    { title: 'বাংলা প্যাসেজ ২', text: 'বর্তমান যুগ তথ্য ও প্রযুক্তির যুগ। কম্পিউটার এবং ইন্টারনেট আমাদের জীবনকে অনেক সহজ করে দিয়েছে। শিক্ষা, চিকিৎসা, ব্যবসা ও যোগাযোগের ক্ষেত্রে প্রযুক্তি গুরুত্বপূর্ণ ভূমিকা পালন করছে।' },
    { title: 'বাংলা প্যাসেজ ৩', text: 'সময় মানুষের জীবনের সবচেয়ে মূল্যবান সম্পদ। হারানো অর্থ আবার ফিরে পাওয়া সম্ভব, কিন্তু হারানো সময় কখনো ফিরে আসে না। তাই প্রতিটি মানুষের উচিত সময়ের সঠিক ব্যবহার করা।' },
    { title: 'বাংলা প্যাসেজ ৪', text: 'বৃক্ষ আমাদের পরম বন্ধু। গাছ আমাদের অক্সিজেন, ফল, কাঠ ও ছায়া প্রদান করে। পরিবেশের ভারসাম্য রক্ষায় বৃক্ষের ভূমিকা অপরিসীম। তাই প্রত্যেকের উচিত বেশি করে গাছ লাগানো।' },
    { title: 'বাংলা প্যাসেজ ৫', text: 'সততা মানুষের অন্যতম শ্রেষ্ঠ গুণ। একজন সৎ মানুষ সব সময় সত্য কথা বলে এবং অন্যের বিশ্বাস অর্জন করে। ব্যক্তিগত ও সামাজিক জীবনে সততা শান্তি ও সম্মান প্রতিষ্ঠা করে।' },
    { title: 'বাংলা প্যাসেজ ৬', text: 'শৃঙ্খলা মানুষের জীবনকে সুন্দর ও সুশৃঙ্খল করে। নিয়ম মেনে চলা, সময়ের কাজ সময়ে করা এবং অন্যের প্রতি শ্রদ্ধাশীল হওয়া শৃঙ্খলার পরিচয়। জীবনে সফল হতে হলে শৃঙ্খলার প্রয়োজন রয়েছে।' },
    { title: 'বাংলা প্যাসেজ ৭', text: 'বাংলাদেশ একটি সুন্দর ও প্রাকৃতিক সম্পদে সমৃদ্ধ দেশ। এ দেশের নদী, খাল, বিল, সবুজ মাঠ ও শ্যামল প্রকৃতি মানুষের মনকে আনন্দিত করে। আমাদের উচিত দেশের প্রাকৃতিক সৌন্দর্য রক্ষা করা।' },
    { title: 'বাংলা প্যাসেজ ৮', text: 'স্বাস্থ্যই সকল সুখের মূল। সুস্থ থাকার জন্য আমাদের পুষ্টিকর খাবার গ্রহণ, নিয়মিত ব্যায়াম এবং পর্যাপ্ত ঘুম প্রয়োজন। পাশাপাশি ব্যক্তিগত পরিচ্ছন্নতা বজায় রাখা এবং স্বাস্থ্যকর পরিবেশে বসবাস করা জরুরি।' },
    { title: 'বাংলা প্যাসেজ ৯', text: 'বই মানুষের প্রকৃত বন্ধু। বই পড়ার মাধ্যমে আমরা দেশ-বিদেশের ইতিহাস, সংস্কৃতি, বিজ্ঞান ও সাহিত্য সম্পর্কে জানতে পারি। নিয়মিত বই পড়লে জ্ঞান বৃদ্ধি পায় এবং চিন্তাশক্তির বিকাশ ঘটে।' },
    { title: 'বাংলা প্যাসেজ ১০', text: 'একজন আদর্শ নাগরিক দেশের আইন মেনে চলে এবং নিজের দায়িত্ব যথাযথভাবে পালন করে। সে অন্যের অধিকারকে সম্মান করে এবং সমাজের কল্যাণে কাজ করে। দায়িত্বশীল নাগরিক একটি উন্নত রাষ্ট্র গঠনে সহায়তা করে।' },
    { title: 'বাংলা প্যাসেজ ১১', text: 'পরিশ্রম সৌভাগ্যের প্রসূতি। জীবনে কোনো কিছু অর্জন করতে হলে নিয়মিত চেষ্টা ও কঠোর পরিশ্রম প্রয়োজন। যারা ধৈর্য ধরে কাজ করে, তারা একসময় সফলতার মুখ দেখতে পায়।' },
    { title: 'বাংলা প্যাসেজ ১২', text: 'পরিবেশ আমাদের জীবনের অবিচ্ছেদ্য অংশ। বায়ু, পানি, মাটি, গাছপালা ও প্রাণী মিলে পরিবেশ গড়ে ওঠে। পরিবেশ দূষণ মানুষের স্বাস্থ্য এবং জীববৈচিত্র্যের জন্য মারাত্মক হুমকি সৃষ্টি করে।' },
    { title: 'বাংলা প্যাসেজ ১৩', text: 'বাংলাদেশের অর্থনীতিতে কৃষির গুরুত্ব অনেক। দেশের বিপুলসংখ্যক মানুষ প্রত্যক্ষ ও পরোক্ষভাবে কৃষির সঙ্গে জড়িত। আধুনিক প্রযুক্তি ও উন্নত কৃষিব্যবস্থা খাদ্য উৎপাদন বৃদ্ধিতে গুরুত্বপূর্ণ ভূমিকা রাখছে।' },
    { title: 'বাংলা প্যাসেজ ১৪', text: 'ভাষা মানুষের ভাব প্রকাশের প্রধান মাধ্যম। মাতৃভাষার মাধ্যমে মানুষ নিজের অনুভূতি, চিন্তা ও অভিজ্ঞতা সহজে প্রকাশ করতে পারে। আমাদের বাংলা ভাষার ইতিহাস গৌরবময় এবং আত্মত্যাগে সমৃদ্ধ।' },
    { title: 'বাংলা প্যাসেজ ১৫', text: 'দেশপ্রেম মানুষের একটি মহৎ গুণ। নিজের দেশ, দেশের মানুষ, ইতিহাস ও সংস্কৃতির প্রতি ভালোবাসাই দেশপ্রেম। দেশের উন্নয়ন, স্বাধীনতা ও সার্বভৌমত্ব রক্ষায় প্রত্যেক নাগরিকের দায়িত্ব রয়েছে।' },
    { title: 'বাংলা প্যাসেজ ১৬', text: 'বিজ্ঞান আধুনিক সভ্যতার অন্যতম চালিকাশক্তি। চিকিৎসা, যোগাযোগ, কৃষি ও শিল্পক্ষেত্রে বিজ্ঞানের অবদান অসামান্য। বিজ্ঞান ও প্রযুক্তির সঠিক ব্যবহার মানুষের জীবনকে আরও উন্নত করতে পারে।' },
    { title: 'বাংলা প্যাসেজ ১৭', text: 'পরিবার মানুষের প্রথম শিক্ষাপ্রতিষ্ঠান। পরিবার থেকেই শিশু ভালো-মন্দ, শিষ্টাচার ও নৈতিকতার শিক্ষা লাভ করে। পারিবারিক ভালোবাসা, সহযোগিতা ও দায়িত্ববোধ মানুষের ব্যক্তিত্ব গঠনে সহায়তা করে।' },
    { title: 'বাংলা প্যাসেজ ১৮', text: 'পরোপকার একটি মহৎ মানবিক গুণ। বিপদে মানুষের পাশে দাঁড়ানো এবং অসহায় ব্যক্তিকে সাহায্য করা আমাদের নৈতিক দায়িত্ব। পারস্পরিক সহযোগিতা ও সহমর্মিতার মাধ্যমে একটি সুন্দর সমাজ গড়ে তোলা সম্ভব।' },
    { title: 'বাংলা প্যাসেজ ১৯', text: 'নিয়মিত শরীরচর্চা সুস্থ জীবনের জন্য অত্যন্ত প্রয়োজনীয়। হাঁটা, দৌড়ানো ও খেলাধুলা শরীরকে কর্মক্ষম রাখে। শরীরচর্চার পাশাপাশি সুষম খাদ্য গ্রহণ করলে শারীরিক ও মানসিক সুস্থতা বজায় থাকে।' },
    { title: 'বাংলা প্যাসেজ ২০', text: 'জীবনে সফল হতে হলে নির্দিষ্ট লক্ষ্য থাকা প্রয়োজন। লক্ষ্য অর্জনের জন্য পরিকল্পনা, অধ্যবসায়, আত্মবিশ্বাস ও ধৈর্য দরকার। ব্যর্থতাকে ভয় না পেয়ে ভুল থেকে শিক্ষা নিয়ে সামনে এগিয়ে যেতে হবে।' }
  ]
};


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
  }, 2500);
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

// ================= ESC = RESET =================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') resetTest();
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
  }
});

// ================= CUSTOM PRACTICE MODE =================

$('customPracticeBtn').addEventListener('click', () => {
  isCustomMode = !isCustomMode;

  if (isCustomMode) {
    $('normalPassageSection').style.display = 'none';

    $('passageSelect').style.display = 'none';

    $('customPracticeBtn').textContent = 'Normal Practice';

    $('customPracticeBtn').classList.add('activeMode');

    $('typingInput').placeholder =
      'মোড একটিভ হয়েছে! অফলাইন বই দেখে টাইপ করা শুরু করুন, প্রথম অক্ষর টাইপ করলেই টাইমার চালু হবে...';
  } else {
    $('normalPassageSection').style.display = 'block';

    $('passageSelect').style.display = 'block';

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
