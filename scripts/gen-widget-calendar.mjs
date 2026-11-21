// Sinh bảng lịch tĩnh cho widget Android + iOS. Chạy: npm run widgets:data
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildStaticCalendar } from '../src/lib/widgetData.js';

const FROM = 2025, TO = 2036;
const cal = buildStaticCalendar(FROM, TO);
const json = JSON.stringify(cal);
for (const p of ['android/app/src/main/assets/widget_calendar.json', 'ios/App/LichAmWidget/calendar.json']) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, json);
  console.log(`${p}: ${cal.count} ngày (${FROM}–${TO}), ${(json.length / 1024).toFixed(0)} KB`);
}
