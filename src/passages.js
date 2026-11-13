// =====================================================================
//  প্যাসেজের মূল ফাইল (src/passages.js)
//  main.js এই ফাইল থেকেই প্যাসেজ নেয়। এখানে তিনটি ফাইল জোড়া লাগানো হয়েছে:
//
//   passages-base.js    : আগের ২০টি করে প্যাসেজ (English ও বাংলা)
//   passages-en-long.js : নতুন বড় ইংরেজি প্যাসেজ
//   passages-bn-long.js : নতুন বড় বাংলা প্যাসেজ
//
//  এই ফাইলে কিছু বদলানোর দরকার নেই।
// =====================================================================

import { defaultPassages as basePassages } from './passages-base.js';
import { longPassagesEn } from './passages-en-long.js';
import { longPassagesBn } from './passages-bn-long.js';

export const defaultPassages = {
  en: [...basePassages.en, ...longPassagesEn],
  bn: [...basePassages.bn, ...longPassagesBn],
};
