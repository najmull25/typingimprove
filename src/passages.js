// =====================================================================
//  প্যাসেজের মূল ফাইল (src/passages.js)
//  main.js এই ফাইল থেকেই প্যাসেজ নেয়।
//
//  ইংরেজি : শুধু passages-en-long.js ফাইলের প্যাসেজ
//  বাংলা  : শুধু passages-bn-long.js ফাইলের প্যাসেজ
//
//  নতুন প্যাসেজ যোগ করতে হলে ওই দুটো ফাইলের কোনোটি বদলাতে হবে, এই ফাইল নয়।
// =====================================================================

import { longPassagesEn } from './passages-en-long.js';
import { longPassagesBn } from './passages-bn-long.js';

export const defaultPassages = {
  en: [...longPassagesEn],
  bn: [...longPassagesBn],
};
