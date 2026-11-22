// Âm lịch Việt Nam — thuật toán của Hồ Ngọc Đức (múi giờ +7).
// Chạy hoàn toàn trên máy, không cần mạng.

const PI = Math.PI;
const INT = Math.floor;
export const TZ = 7;

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const TIET_KHI = ['Xuân Phân', 'Thanh Minh', 'Cốc Vũ', 'Lập Hạ', 'Tiểu Mãn', 'Mang Chủng', 'Hạ Chí', 'Tiểu Thử', 'Đại Thử', 'Lập Thu', 'Xử Thử', 'Bạch Lộ', 'Thu Phân', 'Hàn Lộ', 'Sương Giáng', 'Lập Đông', 'Tiểu Tuyết', 'Đại Tuyết', 'Đông Chí', 'Tiểu Hàn', 'Đại Hàn', 'Lập Xuân', 'Vũ Thủy', 'Kinh Trập'];
export const THU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
export const LUNAR_MONTH_NAME = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'];

export function jdFromDate(dd, mm, yy) {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  return jd;
}

export function jdToDate(jd) {
  let b, c;
  if (jd > 2299160) {
    const a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return { day, month, year };
}

function newMoon(k) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat;
  if (T < -11) deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  else deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - deltat;
}

function sunLongitudeRad(jdn) {
  const T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - PI * 2 * INT(L / (PI * 2));
  return L;
}

const getNewMoonDay = (k, tz = TZ) => INT(newMoon(k) + 0.5 + tz / 24);
const getSunLongitude = (dayNumber, tz = TZ) => INT((sunLongitudeRad(dayNumber - 0.5 - tz / 24) / PI) * 6);

function getLunarMonth11(yy, tz = TZ) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, tz);
  const sunLong = getSunLongitude(nm, tz);
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, tz);
  return nm;
}

function getLeapMonthOffset(a11, tz = TZ) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
  } while (arc !== last && i < 14);
  return i - 1;
}

/** Dương → Âm. Trả về { day, month, year, leap } */
export function solarToLunar(dd, mm, yy, tz = TZ) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, tz);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz);
  let a11 = getLunarMonth11(yy, tz);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, tz);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, tz);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, tz);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = 1;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap === 1 };
}

/** Âm → Dương. Trả về { day, month, year } hoặc null nếu ngày không tồn tại */
export function lunarToSolar(lunarDay, lunarMonth, lunarYear, lunarLeap = false, tz = TZ) {
  let a11, b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, tz);
    b11 = getLunarMonth11(lunarYear, tz);
  } else {
    a11 = getLunarMonth11(lunarYear, tz);
    b11 = getLunarMonth11(lunarYear + 1, tz);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, tz);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) return null;
    if (lunarLeap || off >= leapOff) off += 1;
  } else if (lunarLeap) {
    return null;
  }
  const monthStart = getNewMoonDay(k + off, tz);
  return jdToDate(monthStart + lunarDay - 1);
}

/** Số ngày của một tháng âm (29 hoặc 30) */
export function lunarMonthLength(lunarMonth, lunarYear, leap = false) {
  const s = lunarToSolar(1, lunarMonth, lunarYear, leap);
  if (!s) return 0;
  const jd = jdFromDate(s.day, s.month, s.year);
  const next = solarToLunar(...Object.values(jdToDate(jd + 29)));
  return next.day === 1 ? 29 : 30;
}

/** Tháng nhuận của năm âm (0 nếu không có) */
export function leapMonthOfYear(lunarYear) {
  for (let m = 1; m <= 12; m++) {
    if (lunarToSolar(1, m, lunarYear, true)) return m;
  }
  return 0;
}

export const canChiYear = (ly) => CAN[(ly + 6) % 10] + ' ' + CHI[(ly + 8) % 12];
export const canChiMonth = (lm, ly) => CAN[(ly * 12 + lm + 3) % 10] + ' ' + CHI[(lm + 1) % 12];
export const dayChiIndex = (jd) => (jd + 1) % 12;
export const canChiDay = (jd) => CAN[(jd + 9) % 10] + ' ' + CHI[(jd + 1) % 12];

/** Chỉ số tiết khí 0..23 (0 = Xuân Phân) của ngày jd */
export const sunTermIndex = (jd) => INT((sunLongitudeRad(jd + 1 - 0.5 - TZ / 24) / PI) * 12);

/** Chi của tháng theo tiết khí (tháng Dần bắt đầu từ Lập Xuân) — dùng cho 12 trực */
export const solarMonthChi = (jd) => (2 + Math.floor(((sunTermIndex(jd) - 21 + 24) % 24) / 2)) % 12;

export const TRUC = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];
/** Trực của ngày: 0 = Kiến … 11 = Bế */
export const trucIndex = (jd) => (dayChiIndex(jd) - solarMonthChi(jd) + 12) % 12;

export function solarTerm(jd) {
  return TIET_KHI[INT((sunLongitudeRad(jd + 1 - 0.5 - TZ / 24) / PI) * 12)];
}

// Giờ hoàng đạo theo chi của ngày
const HD = ['110100101100', '001101001011', '110011010010', '101100110100', '001011001101', '010010110011'];
export function hoangDaoHours(dayChi) {
  const s = HD[dayChi % 6];
  const out = [];
  for (let i = 0; i < 12; i++) {
    if (s[i] === '1') {
      const start = (i * 2 + 23) % 24;
      out.push({ chi: CHI[i], from: start, to: (start + 2) % 24, label: `${start}–${(start + 2) % 24}h` });
    }
  }
  return out;
}

// 12 thần trực ngày: ngày hoàng đạo / hắc đạo
const SPIRITS = ['Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Kim Đường', 'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trần'];
const GOOD_SPIRITS = new Set([0, 1, 4, 5, 7, 10]);
export function daySpirit(lunarMonth, dayChi) {
  const monthChi = (lunarMonth + 1) % 12;
  const start = ((monthChi - 2 + 12) % 6) * 2;
  const idx = (dayChi - start + 12) % 12;
  return { name: SPIRITS[idx], good: GOOD_SPIRITS.has(idx) };
}

export const xungChi = (chi) => CHI[(chi + 6) % 12];
export const tamHop = (chi) => [0, 4, 8].map((x) => CHI[(x + (chi % 4)) % 12]);

/** Thông tin đầy đủ của một ngày dương */
export function dayInfo(dd, mm, yy) {
  const jd = jdFromDate(dd, mm, yy);
  const l = solarToLunar(dd, mm, yy);
  const chi = dayChiIndex(jd);
  const sp = daySpirit(l.month, chi);
  return {
    jd, solar: { day: dd, month: mm, year: yy }, weekday: THU[(jd + 1) % 7], weekdayIndex: (jd + 1) % 7,
    lunar: l,
    canChi: { day: canChiDay(jd), month: canChiMonth(l.month, l.year), year: canChiYear(l.year) },
    solarTerm: solarTerm(jd), hours: hoangDaoHours(chi), spirit: sp,
    xung: xungChi(chi), tamHop: tamHop(chi)
  };
}

export function lunarMonthLabel(m, leap) {
  return 'tháng ' + LUNAR_MONTH_NAME[m] + (leap ? ' nhuận' : '');
}
