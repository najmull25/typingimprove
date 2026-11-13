// =====================================================================
//  ডিফল্ট প্যাসেজ (English ও বাংলা)
// =====================================================================
//
//  নতুন ডিফল্ট প্যাসেজ যোগ করতে চাইলে নিচের যে ভাষার তালিকা (en বা bn),
//  তার শেষে (শেষ প্যাসেজের পরে) এই ধরনের একটি লাইন যোগ করুন:
//
//      { title: 'প্যাসেজের নাম', text: 'এখানে পুরো লেখা' },
//
//  নিয়ম:
//   1. প্রতিটি প্যাসেজের শেষে কমা (,) দিতে হবে। শুধু তালিকার একদম শেষটিতে না দিলেও চলে।
//   2. লেখার ভেতরে একক উদ্ধৃতি চিহ্ন (') থাকলে সেই লেখাটি ' ' এর বদলে ` ` (ব্যাকটিক) দিয়ে ঘিরুন।
//   3. একাধিক অনুচ্ছেদ চাইলে ব্যাকটিক ` ` ব্যবহার করুন, তখন Enter দিয়ে নতুন লাইন লেখা যায়।
//   4. ডিফল্ট প্যাসেজ ওয়েবসাইট থেকে ডিলিট করা যায় না, শুধু এই ফাইল থেকে মুছতে হয়।
//   5. ব্যবহারকারীর নিজের যোগ করা প্যাসেজ এখানে আসে না, সেগুলো আলাদা সেভ থাকে।
//
// =====================================================================

export const defaultPassages = {
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
