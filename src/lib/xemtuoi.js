// Xem tuổi làm việc lớn: Kim Lâu, Hoang Ốc, Tam Tai (tính theo năm âm lịch, tuổi mụ).
import { canChiYear } from './lunar.js';

export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const chiOfYear = (y) => CHI[(((y + 8) % 12) + 12) % 12];

/** Tuổi mụ = năm xem − năm sinh + 1 */
export const tuoiMu = (born, year) => year - born + 1;

/** Kim Lâu: lấy tuổi mụ chia 9, dư 1, 3, 6, 8 là phạm. */
export function kimLau(age) {
  const r = age % 9;
  const map = { 1: 'Kim Lâu Thân (hại bản thân)', 3: 'Kim Lâu Thê (hại vợ/chồng)', 6: 'Kim Lâu Tử (hại con cái)', 8: 'Kim Lâu Lục Súc (hại vật nuôi, làm ăn)' };
  return map[r] ? { bad: true, name: map[r] } : { bad: false, name: 'Không phạm Kim Lâu' };
}

/** Hoang Ốc: 6 cung, 10 tuổi ở Nhất Cát, mỗi chục tiến một cung, rồi đếm tiếp theo hàng đơn vị. */
export const HOANG_OC = [
  { name: 'Nhất Cát', bad: false, note: 'tốt, làm nhà yên ổn' },
  { name: 'Nhì Nghi', bad: false, note: 'tốt, làm nhà hưng vượng' },
  { name: 'Tam Địa Sát', bad: true, note: 'xấu, dễ gặp ốm đau' },
  { name: 'Tứ Tấn Tài', bad: false, note: 'tốt, tiền tài vào' },
  { name: 'Ngũ Thọ Tử', bad: true, note: 'xấu, kỵ chia ly' },
  { name: 'Lục Hoang Ốc', bad: true, note: 'xấu, khó thành đạt' }
];
export function hoangOc(age) {
  if (age < 10) return { ...HOANG_OC[0], idx: 0 };
  const idx = (Math.floor(age / 10) - 1 + (age % 10)) % 6;
  return { ...HOANG_OC[idx], idx };
}

/** Tam Tai: theo nhóm tam hợp của tuổi */
const TAM_TAI = {
  'Thân,Tý,Thìn': ['Dần', 'Mão', 'Thìn'],
  'Dần,Ngọ,Tuất': ['Thân', 'Dậu', 'Tuất'],
  'Hợi,Mão,Mùi': ['Tỵ', 'Ngọ', 'Mùi'],
  'Tỵ,Dậu,Sửu': ['Hợi', 'Tý', 'Sửu']
};
export function tamTaiYears(bornChi) {
  const k = Object.keys(TAM_TAI).find((x) => x.split(',').includes(bornChi));
  return TAM_TAI[k];
}
export function tamTai(born, year) {
  const ys = tamTaiYears(chiOfYear(born));
  const i = ys.indexOf(chiOfYear(year));
  return i >= 0 ? { bad: true, name: `Tam Tai năm thứ ${i + 1}`, years: ys } : { bad: false, name: 'Không phạm Tam Tai', years: ys };
}

/**
 * Xét một năm cho một việc: 'cuoi' (cưới hỏi — Kim Lâu, Tam Tai) hoặc 'nha' (làm nhà — Kim Lâu, Hoang Ốc, Tam Tai).
 * Trả về điểm: 0 tốt, 1 cân nhắc (phạm 1), 2 nên tránh (phạm từ 2).
 */
export function xemNam(born, year, viec = 'nha') {
  const age = tuoiMu(born, year);
  const kl = kimLau(age);
  const ho = viec === 'nha' ? hoangOc(age) : null;
  const tt = tamTai(born, year);
  const hits = [kl.bad, ho?.bad, tt.bad].filter(Boolean).length;
  return { year, canChi: canChiYear(year), age, kimLau: kl, hoangOc: ho, tamTai: tt, hits, level: hits === 0 ? 0 : hits === 1 ? 1 : 2 };
}
