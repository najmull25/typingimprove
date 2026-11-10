<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// ২০টি ইংরেজি এবং ২০টি বাংলা প্যাসেজ
const passages = {
  english: [
    { id: 1, title: "English Passage 1: Early Morning", text: "The morning air is soft and quiet. Sunbeams flicker through the leaves of the old tree outside. Birds begin their morning song as the town slowly wakes up." },
    { id: 2, title: "English Passage 2: Technology", text: "Technology has changed the way we live and communicate. With computers and smartphones, information is accessible from anywhere in the world within seconds." },
    { id: 3, title: "English Passage 3: Ocean Life", text: "The ocean is home to millions of creature species. From tiny plankton to giant whales, marine life balances the world's ecosystem in remarkable ways." },
    { id: 4, title: "English Passage 4: Books and Reading", text: "Reading opens a world of novel ideas and imagination. A good book can transport you to different historical eras and introduce you to unforgettable characters." },
    { id: 5, title: "English Passage 5: Healthy Habits", text: "Drinking plenty of water and walking daily improves overall physical health. Balanced nutrition and adequate sleep are essential components of long term wellbeing." },
    { id: 6, title: "English Passage 6: Practice Makes Perfect", text: "Consistency is the master key to mastering typing. Daily exercise helps build muscle memory, increasing speed while keeping typing error rates minimal." },
    { id: 7, title: "English Passage 7: Changing Seasons", text: "Autumn brings crisp breezes and golden leaves. As temperature drops, nature prepares for winter rest, painting landscapes in rich shades of orange and yellow." },
    { id: 8, title: "English Passage 8: Music", text: "Music speaks a global language understood by every culture. Rhythms and harmonies evoke emotions, bringing comfort, joy, and inspiration to listeners." },
    { id: 9, title: "English Passage 9: Travel Insights", text: "Exploring foreign places expands perspective and deepens understanding. Meeting people with distinct backgrounds enriches our appreciation of diverse life paths." },
    { id: 10, title: "English Passage 10: Environmental Care", text: "Protecting natural habitats is vital for planetary survival. Planting trees and reducing plastic waste ensure cleaner air and water for future generations." },
    { id: 11, title: "English Passage 11: Teamwork", text: "Working together achieves goals faster than solo effort. Collaborative projects thrive when team members communicate clearly and respect diverse opinions." },
    { id: 12, title: "English Passage 12: Morning Coffee", text: "The rich aroma of freshly brewed coffee fills the kitchen. A warm cup in the morning offers a gentle boost before diving into daily responsibilities." },
    { id: 13, title: "English Passage 13: Space Exploration", text: "Space exploration unveils the mysteries of distant galaxies. Scientists study planetary orbits and stars to discover secrets about the origins of the universe." },
    { id: 14, title: "English Passage 14: Art and Design", text: "Art reflects human imagination and creative spirit. Artists express visual narratives through color composition, texture choices, and striking forms." },
    { id: 15, title: "English Passage 15: Time Management", text: "Managing time efficiently reduces stress and enhances focus. Prioritizing daily duties leaves room for personal hobbies and quality rest." },
    { id: 16, title: "English Passage 16: Education", text: "Education equips people with knowledge and critical analytical skills. Lifelong learning enables individuals to adapt smoothly in an evolving world." },
    { id: 17, title: "English Passage 17: Friendship", text: "True friends offer unwavering support through life's highs and lows. Genuine connection relies on mutual trust, honesty, and shared moments." },
    { id: 18, title: "English Passage 18: Digital Security", text: "Protecting digital identity requires robust security measures. Strong passwords and continuous caution online safeguard sensitive personal accounts." },
    { id: 19, title: "English Passage 19: Sustainable Energy", text: "Renewable power sources such as solar and wind energy lower carbon footprints. Transitioning away from fossil fuels safeguards the global climate system." },
    { id: 20, title: "English Passage 20: Determination", text: "Overcoming obstacles builds resilience and inner strength. Steadfast determination allows individuals to overcome difficult setbacks and achieve success." }
  ],
  bengali: [
    { id: 1, title: "বাংলা প্যাসেজ ১: নদীর রূপ", text: "নদীর কূলে বাতাস মৃদুভাবে বয়ে যায়। সকালের নরম রোদ যখন জলের ওপর পড়ে, তখন নদীর পানি ঝিকমিক করে ওঠে। দূর থেকে জেলেদের নৌকা ভাসতে দেখা যায়।" },
    { id: 2, title: "বাংলা প্যাসেজ ২: ডিজিটাল বাংলাদেশ", text: "প্রযুক্তির সুবাদে জীবনযাপন সহজ হয়ে উঠেছে। ইন্টারনেটের মাধ্যমে এখন খুব সহজেই প্রয়োজনীয় যেকোনো তথ্য মুহূর্তের মধ্যে জানা সম্ভব হচ্ছে।" },
    { id: 3, title: "বাংলা প্যাসেজ ৩: সবুজ প্রকৃতি", text: "আমাদের দেশ সবুজ শ্যামল রূপ বৈচিত্র্যে ভরপুর। গাছে গাছে পাখির কলকাকলি এবং সোনালী ধানের খেত গ্রামীণ জীবনের সৌন্দর্য বহু গুণে বাড়িয়ে দেয়।" },
    { id: 4, title: "বাংলা প্যাসেজ ৪: বই পড়ার আনন্দ", text: "বই মানুষের প্রকৃত বন্ধু। নিয়মিত ভালো বই পড়লে জানার পরিধি বাড়ে এবং চিন্তা শক্তির বিকাশ ঘটে। নতুন বইয়ের সুবাস মনকে আনন্দ দেয়।" },
    { id: 5, title: "বাংলা প্যাসেজ ৫: স্বাস্থ্য বজায় রাখা", text: "সুস্বাস্থ্যই সকল সুখের মূল। নিয়মিত সুষম খাবার খাওয়া, পর্যাপ্ত পানি পান করা এবং দৈনিক হাঁটার অভ্যাস মানুষকে চিরকাল সুস্থ রাখে।" },
    { id: 6, title: "বাংলা প্যাসেজ ৬: টাইপিং অনুশীলন", text: "দ্রুত ও সঠিক টাইপিং শেখার একমাত্র উপায় নিয়মিত চর্চা করা। প্রতিদিন কিছুটা সময় মনোযোগ দিয়ে অনুশীলন করলে টাইপিংয়ের গতি বহুগুণ বৃদ্ধি পায়।" },
    { id: 7, title: "বাংলা প্যাসেজ ৭: ঋতু পরিবর্তন", text: "আমাদের দেশে ছয়টি ঋতু পর্যায়ক্রমে আসে। বর্ষার বৃষ্টি প্রকৃতিকে সতেজ করে, আর শীতের সকালে কুয়াশার চাদরে গ্রাম বাংলা ঢেকে যায়।" },
    { id: 8, title: "বাংলা প্যাসেজ ৮: সঙ্গীতের মূর্ছনা", text: "সঙ্গীত মানুষের মনের খোরাক যোগায়। একতারা আর বাঁশির সুর মনের সব ক্লান্তি দূর করে আত্মাকে এক অপার্থিব প্রশান্তি দেয়।" },
    { id: 9, title: "বাংলা প্যাসেজ ৯: ভ্রমণের শিক্ষা", text: "নতুন জায়গা ভ্রমণ করলে মনের দিগন্ত প্রসারিত হয়। ভিন্ন সংস্কৃতির মানুষের সাথে পরিচিত হওয়া ও ইতিহাস জানা ভ্রমণের প্রধান আনন্দ।" },
    { id: 10, title: "বাংলা প্যাসেজ ১০: পরিবেশ সংরক্ষণ", text: "গাছপালা আমাদের অক্সিজেন দেয় ও পরিবেশের ভারসাম্য বজায় রাখে। বেশি করে গাছ লাগানো এবং পলিথিনের ব্যবহার কমানো আমাদের সবার দায়িত্ব।" },
    { id: 11, title: "বাংলা প্যাসেজ ১১: একতা ও সততা", text: "একতাই বল। সকলে মিলে একসাথে কাজ করলে যেকোনো কঠিন সমস্যা সহজে সমাধান করা যায়। সততা জীবনের সবচেয়ে মূল্যবান গুণ।" },
    { id: 12, title: "বাংলা প্যাসেজ ১২: ভোরের বাতাস", text: "ভোরের নির্মল বাতাস স্বাস্থ্য ও মনের জন্য অত্যন্ত উপকারী। সকালে ঘুম থেকে উঠে হাঁটাহাঁটি করলে সারাদিন মন প্রফুল্ল ও কর্মক্ষম থাকে।" },
    { id: 13, title: "বাংলা প্যাসেজ ১৩: বিজ্ঞান ও মানবজাতি", text: "বিজ্ঞান ও প্রযুক্তির নতুন নতুন আবিষ্কার আধুনিক জীবনকে করেছে গতিশীল। চিকিৎসা ও গবেষণার ক্ষেত্রে বিজ্ঞান অলৌকিক পরিবর্তন এনেছে।" },
    { id: 14, title: "বাংলা প্যাসেজ ১৪: আর্ট ও চিত্রশিল্প", text: "তুলির এক আঁচড়ে শিল্পী মনের গভীর ভাবনা ফুটিয়ে তোলেন। চিত্রকলা একটি জাতির কৃষ্টি, সংস্কৃতি ও ইতিহাসকে জীবন্ত রূপ দান করে।" },
    { id: 15, title: "বাংলা প্যাসেজ ১৫: সময়ের মূল্য", text: "সময় ও নদীর স্রোত কারও জন্য অপেক্ষা করে না। প্রতিটি মুহূর্ত সঠিকভাবে ব্যবহার করলে জীবনে সাফল্য নিশ্চিত করা সম্ভব হয়।" },
    { id: 16, title: "বাংলা প্যাসেজ ১৬: শিক্ষার আলো", text: "শিক্ষাই জাতির মেরুদণ্ড। সঠিক শিক্ষা মানুষকে সচেতন, দায়িত্বশীল ও মানবিক গুণাবলীতে সমৃদ্ধ নাগরিক হিসেবে গড়ে তোলে।" },
    { id: 17, title: "বাংলা প্যাসেজ ১৭: বন্ধুত্বের বন্ধন", text: "প্রকৃত বন্ধু জীবনের এক অমূল্য সম্পদ। সুখ-দুঃখে পাশে থেকে একে অপরকে সহযোগিতা করার মাধ্যমেই বন্ধুত্বের সম্পর্ক স্থায়ী হয়।" },
    { id: 18, title: "বাংলা প্যাসেজ ১৮: ইন্টারনেট নিরাপত্তা", text: "অনলাইন যুগে ব্যক্তিগত তথ্যের নিরাপত্তা নিশ্চিত করা আবশ্যক। শক্তিশালী পাসওয়ার্ড ব্যবহার এবং অচেনা লিঙ্কে ক্লিক না করাই বুদ্ধিমত্তার কাজ।" },
    { id: 19, title: "বাংলা প্যাসেজ ১৯: সৌরশক্তি", text: "নবায়নযোগ্য শক্তির ব্যবহার দিন দিন বৃদ্ধি পাচ্ছে। সৌরবিদ্যুৎ ব্যবহারের মাধ্যমে পরিবেশ রক্ষা করে বিদ্যুৎ চাহিদা মেটানো সম্ভব।" },
    { id: 20, title: "বাংলা প্যাসেজ ২০: অধ্যবসায়", text: "কঠোর পরিশ্রম ও অধ্যবসায় ছাড়া জীবনে উন্নতি করা অসম্ভব। বারবার চেষ্টা করার মাধ্যমে যেকোনো কঠিন বাধা অতিক্রম করা সম্ভব।" }
  ]
}

const selectedLang = ref('english')
const selectedPassageIndex = ref(0)
const userInput = ref('')
const isDarkMode = ref(false)

// টাইম ব্যবস্থাপনা
const duration = ref(300) // ৫ মিনিট (সেকেন্ডে)
const timeRemaining = ref(300)
const timer = ref(null)
const isStarted = ref(false)

const currentPassage = computed(() => {
  return passages[selectedLang.value][selectedPassageIndex.value] || passages[selectedLang.value][0]
})

// ভাষা পরিবর্তন হলে রিসেট
watch(selectedLang, () => {
  selectedPassageIndex.value = 0
  resetPractice()
})

watch(selectedPassageIndex, () => {
  resetPractice()
})

function startTimer() {
  if (!isStarted.value && userInput.value.length > 0) {
    isStarted.value = true
    timer.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        clearInterval(timer.value)
      }
    }, 1000)
  }
}

function resetPractice() {
  clearInterval(timer.value)
  timer.value = null
  isStarted.value = false
  timeRemaining.value = duration.value
  userInput.value = ''
}

const wpm = computed(() => {
  const words = userInput.value.trim().split(/\s+/).filter(Boolean).length
  const minutes = (duration.value - timeRemaining.value) / 60
  return minutes > 0 ? Math.round(words / minutes) : 0
})

const accuracy = computed(() => {
  if (!userInput.value.length) return 100
  let correct = 0
  const target = currentPassage.value.text
  for (let i = 0; i < userInput.value.length; i++) {
    if (userInput.value[i] === target[i]) correct++
  }
  return Math.round((correct / userInput.value.length) * 100)
})

const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<template>
  <div :class="['app-container', { 'dark': isDarkMode }]">
    <!-- Header / Navbar -->
    <header class="navbar">
      <div class="logo">⌨️ TypingBD</div>
      <button class="dark-btn" @click="isDarkMode = !isDarkMode">
        {{ isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
      </button>
    </header>

    <!-- Controls Bar -->
    <main class="main-content">
      <h2>Typing Practice</h2>
      
      <div class="controls">
        <!-- Language Select -->
        <select v-model="selectedLang" class="select-box">
          <option value="english">English Typing</option>
          <option value="bengali">বাংলা টাইপিং</option>
        </select>

        <!-- Timer Duration -->
        <select v-model.number="duration" @change="resetPractice" class="select-box">
          <option :value="60">1 Minute</option>
          <option :value="180">3 Minutes</option>
          <option :value="300">5 Minutes</option>
        </select>

        <!-- Passage Select (২০ টি অপশন) -->
        <select v-model.number="selectedPassageIndex" class="select-box passage-select">
          <option v-for="(item, index) in passages[selectedLang]" :key="item.id" :value="index">
            {{ item.title }}
          </option>
        </select>

        <button @click="resetPractice" class="reset-btn">Reset Practice</button>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-card">Time: <span>{{ formattedTime }}</span></div>
        <div class="stat-card">Speed: <span>{{ wpm }} WPM</span></div>
        <div class="stat-card">Accuracy: <span>{{ accuracy }}%</span></div>
      </div>

      <!-- Display Box -->
      <div class="passage-box">
        {{ currentPassage.text }}
      </div>

      <!-- Input Area -->
      <textarea
        v-model="userInput"
        @input="startTimer"
        :disabled="timeRemaining === 0"
        placeholder="এখানে টাইপিং শুরু করুন..."
        class="input-box"
        rows="6"
      ></textarea>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.3s, color 0.3s;
  padding: 20px;
}

.app-container.dark {
  background-color: #0f172a;
  color: #f8fafc;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto 30px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.dark-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  cursor: pointer;
}

.dark .dark-btn {
  background: #1e293b;
  color: white;
  border-color: #334155;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.select-box {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
}

.dark .select-box {
  background: #1e293b;
  color: white;
  border-color: #334155;
}

.passage-select {
  flex-grow: 1;
}

.reset-btn {
  padding: 10px 18px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.dark .stat-card {
  background: #1e293b;
}

.stat-card span {
  font-weight: bold;
  color: #10b981;
}

.passage-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 15px;
  border: 1px solid #e2e8f0;
}

.dark .passage-box {
  background: #1e293b;
  border-color: #334155;
}

.input-box {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  outline: none;
  box-sizing: border-box;
}

.dark .input-box {
  background: #1e293b;
  color: white;
  border-color: #334155;
}
</style>
