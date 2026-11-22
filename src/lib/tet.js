// Tết & tuổi: nạp âm ngũ hành, màu hợp tuổi, chọn tuổi xông đất, lịch ăn chay, mốc Tết sắp tới.
// Cách tính theo lệ dân gian phổ biến — để tham khảo.
import { CAN, CHI, canChiYear, solarToLunar, lunarToSolar, jdFromDate, jdToDate, lunarMonthLength } from './lunar.js';

const NAP_AM = ['Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim', 'Sơn Đầu Hỏa', 'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc',
  'Tuyền Trung Thủy', 'Ốc Thượng Thổ', 'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy', 'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc', 'Bích Thượng Thổ', 'Kim Bạch Kim',
  'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim', 'Tang Đố Mộc', 'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy'];
export const HANH = ['Kim', 'Thủy', 'Mộc', 'Hỏa', 'Thổ']; // thứ tự tương sinh: Kim → Thủy → Mộc → Hỏa → Thổ → Kim
const ofName = (n) => HANH.find((h) => n.endsWith(h));
const canIdx = (y) => (((y + 6) % 10) + 10) % 10;
const chiIdx = (y) => (((y + 8) % 12) + 12) % 12;
/** Vị trí trong vòng 60 Giáp Tý (0 = Giáp Tý) */
export const giapTyIndex = (y) => (((y - 1984) % 60) + 60) % 60;

export function napAm(y) {
  const name = NAP_AM[Math.floor(giapTyIndex(y) / 2)];
  return { name, hanh: ofName(name) };
}

/** a sinh b? */
export const sinh = (a, b) => HANH[(HANH.indexOf(a) + 1) % 5] === b;
/** a khắc b? (Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim) */
export const khac = (a, b) => ({ Kim: 'Mộc', Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim' })[a] === b;

export const MAU = {
  Kim: ['Trắng', 'Bạc', 'Xám'], Thủy: ['Đen', 'Xanh dương'], Mộc: ['Xanh lá'], Hỏa: ['Đỏ', 'Cam', 'Hồng', 'Tím'], Thổ: ['Vàng', 'Nâu đất']
};
export const MAU_HEX = { Trắng: '#FFFFFF', Bạc: '#C9CED6', Xám: '#8A8F98', Đen: '#1F1F24', 'Xanh dương': '#2F6FD6', 'Xanh lá': '#2E9E5B', Đỏ: '#D7261E', Cam: '#F08A24', Hồng: '#F17DA6', Tím: '#8A4FD1', Vàng: '#F2C230', 'Nâu đất': '#8C5A32' };
export const SO = { Kim: [6, 7], Thủy: [1], Mộc: [3, 4], Hỏa: [9], Thổ: [2, 5, 8] };

/** Mệnh, màu hợp (bản mệnh + được sinh), màu kỵ (bị khắc), tuổi hợp / xung */
export function menhInfo(y) {
  const na = napAm(y);
  const h = na.hanh;
  const duocSinh = HANH.find((x) => sinh(x, h));
  const biKhac = HANH.find((x) => khac(x, h));
  const ci = chiIdx(y);
  return {
    canChi: canChiYear(y), ...na,
    hopMau: [...MAU[h], ...MAU[duocSinh]], tuongSinh: duocSinh, kyMau: MAU[biKhac], kyHanh: biKhac,
    so: [...SO[h], ...SO[duocSinh]],
    tamHop: [0, 4, 8].map((x) => CHI[(x + (ci % 4)) % 12]).filter((c) => c !== CHI[ci]),
    lucHop: CHI[LUC_HOP[ci]],
    tuHanhXung: [3, 6, 9].map((x) => CHI[(ci + x) % 12])
  };
}

const LUC_HOP = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tỵ-Thân, Ngọ-Mùi
const HAI = [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8]; // Tý-Mùi, Sửu-Ngọ, Dần-Tỵ, Mão-Thìn, Thân-Hợi, Dậu-Tuất
const CAN_HOP = [5, 6, 7, 8, 9, 0, 1, 2, 3, 4]; // Giáp-Kỷ, Ất-Canh, Bính-Tân, Đinh-Nhâm, Mậu-Quý

function chiRel(a, b) {
  if (a % 4 === b % 4 && a !== b) return ['tamhop', 1, 'tam hợp'];
  if (LUC_HOP[a] === b) return ['luchop', 1, 'lục hợp'];
  if ((a + 6) % 12 === b) return ['xung', -2, 'lục xung'];
  if (HAI[a] === b) return ['hai', -1, 'tương hại'];
  return ['', 0, ''];
}
function canRel(a, b) {
  if (CAN_HOP[a] === b) return [1, 'thiên can hợp'];
  // Can khắc: hành của can (Giáp Ất Mộc, Bính Đinh Hỏa, Mậu Kỷ Thổ, Canh Tân Kim, Nhâm Quý Thủy) cùng âm dương
  const hanhCan = (c) => ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'][Math.floor(c / 2)];
  if (a % 2 === b % 2 && (khac(hanhCan(a), hanhCan(b)) || khac(hanhCan(b), hanhCan(a)))) return [-1, 'thiên can khắc'];
  return [0, ''];
}

/**
 * Chấm một tuổi khách xông đất cho gia chủ trong năm mới.
 * Xét: ngũ hành nạp âm với năm và với gia chủ, địa chi, thiên can.
 */
export function xongDatScore(guest, host, year) {
  const g = napAm(guest).hanh; const h = napAm(host).hanh; const yh = napAm(year).hanh;
  const notes = [];
  let s = 0;
  if (sinh(g, h)) { s += 2; notes.push(['+', `Mệnh ${g} sinh mệnh ${h} của gia chủ`]); }
  else if (sinh(h, g)) { s += 1; notes.push(['+', `Mệnh gia chủ sinh mệnh khách (${h} → ${g})`]); }
  else if (khac(g, h)) { s -= 2; notes.push(['-', `Mệnh ${g} khắc mệnh ${h} của gia chủ`]); }
  else if (khac(h, g)) { s -= 1; notes.push(['-', `Mệnh gia chủ khắc mệnh khách (${h} khắc ${g})`]); }
  if (sinh(g, yh) || sinh(yh, g) || g === yh) { s += 1; notes.push(['+', `Mệnh hợp năm (${yh})`]); }
  else if (khac(g, yh) || khac(yh, g)) { s -= 1; notes.push(['-', `Mệnh khắc năm (${yh})`]); }
  const [, cy, ny] = chiRel(chiIdx(guest), chiIdx(year));
  if (cy) { s += cy; notes.push([cy > 0 ? '+' : '-', `Tuổi ${CHI[chiIdx(guest)]} ${ny} với năm ${CHI[chiIdx(year)]}`]); }
  const [, ch, nh] = chiRel(chiIdx(guest), chiIdx(host));
  if (ch) { s += ch; notes.push([ch > 0 ? '+' : '-', `Tuổi ${CHI[chiIdx(guest)]} ${nh} với gia chủ tuổi ${CHI[chiIdx(host)]}`]); }
  const [cc, nc] = canRel(canIdx(guest), canIdx(year));
  if (cc) { s += cc; notes.push([cc > 0 ? '+' : '-', `Can ${CAN[canIdx(guest)]} ${nc} với năm ${CAN[canIdx(year)]}`]); }
  const [ch2, nc2] = canRel(canIdx(guest), canIdx(host));
  if (ch2) { s += ch2; notes.push([ch2 > 0 ? '+' : '-', `Can ${CAN[canIdx(guest)]} ${nc2} với gia chủ`]); }
  return { year: guest, canChi: canChiYear(guest), menh: napAm(guest), score: s, notes };
}

/** Gợi ý tuổi xông đất: người từ 16 đến 70 tuổi mụ, xếp theo điểm */
export function goiYXongDat(host, year, limit = 8) {
  const out = [];
  for (let y = year - 69; y <= year - 15; y++) out.push(xongDatScore(y, host, year));
  return out.sort((a, b) => b.score - a.score || Math.abs(a.year - host) - Math.abs(b.year - host)).slice(0, limit);
}

/* ===== Tết sắp tới ===== */
export function tetYear(now = new Date()) {
  const l = solarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
  return l.month === 1 && l.day <= 10 && !l.leap ? l.year : l.year + 1;
}
export function lunarJd(day, month, year) {
  const s = lunarToSolar(day, month, year, false);
  return jdFromDate(s.day, s.month, s.year);
}
/** Ngày cuối tháng Chạp (29 hoặc 30) của năm âm trước Tết */
export const ngay30 = (tetY) => lunarMonthLength(12, tetY - 1);

/* ===== Ăn chay ===== */
export const CHAY = {
  2: { name: '2 ngày', days: [1, 15] },
  4: { name: '4 ngày', days: [1, 14, 15, 30] },
  6: { name: '6 ngày', days: [1, 8, 14, 15, 23, 30] },
  8: { name: '8 ngày', days: [1, 8, 14, 15, 18, 23, 24, 30] },
  10: { name: '10 ngày', days: [1, 8, 14, 15, 18, 23, 24, 28, 29, 30] }
};
/** Tháng thiếu (29 ngày): ngày 30 dời về 29, ngày 28–29 dời lùi một ngày (lệ thường) */
export function chayDaysOfMonth(kind, lm, ly, leap = false) {
  const set = CHAY[kind]?.days || [];
  const len = lunarMonthLength(lm, ly, leap);
  if (len === 30) return set;
  if (kind === '10' || kind === 10) return set.map((d) => (d >= 28 ? d - 1 : d));
  return set.map((d) => (d === 30 ? 29 : d));
}
export function isChay(kind, lunar) {
  if (!kind || kind === 'off') return false;
  return chayDaysOfMonth(kind, lunar.month, lunar.year, lunar.leap).includes(lunar.day);
}
/** Các ngày chay trong n ngày tới */
export function nextChayDays(kind, fromJd, n = 45) {
  const out = [];
  for (let jd = fromJd; jd < fromJd + n; jd++) {
    const s = jdToDate(jd);
    const l = solarToLunar(s.day, s.month, s.year);
    if (isChay(kind, l)) out.push({ jd, solar: s, lunar: l });
  }
  return out;
}
