// Xem ngày tốt theo việc — dựa trên Hoàng đạo/Hắc đạo, 12 Trực, ngày kỵ (Tam nương, Nguyệt kỵ)
// và tuổi xung của gia chủ. Tính hoàn toàn trên máy.
import { jdToDate, solarToLunar, daySpirit, dayChiIndex, trucIndex, TRUC, CHI, CAN, canChiDay, canChiYear, THU, hoangDaoHours, solarMonthChi, jdFromDate } from './lunar.js';

export const ACTIVITIES = [
  { id: 'cuoi', label: 'Cưới hỏi', good: [4, 8, 10, 2], bad: [6, 7, 11, 1], tamNuong: true },
  { id: 'khaitruong', label: 'Khai trương', good: [2, 8, 10, 0], bad: [6, 7, 11, 9, 1], tamNuong: true },
  { id: 'dongtho', label: 'Động thổ, xây nhà', good: [4, 5, 8, 10], bad: [6, 7, 0, 11], tamNuong: true },
  { id: 'nhaptrach', label: 'Về nhà mới', good: [4, 8, 10, 2], bad: [6, 7, 11], tamNuong: true },
  { id: 'xuathanh', label: 'Xuất hành, đi xa', good: [0, 3, 8, 10], bad: [6, 7, 11, 5, 4], tamNuong: true, nguyetKy: true },
  { id: 'kyket', label: 'Ký kết, giao dịch', good: [4, 5, 8, 10, 2], bad: [6, 7, 11], nguyetKy: true },
  { id: 'muaxe', label: 'Mua xe, tài sản lớn', good: [2, 8, 9, 10], bad: [6, 7, 11], nguyetKy: true }
];

export const TRUC_Y = [
  'Tốt cho khởi đầu, xuất hành; kỵ động thổ',
  'Tốt cho trừ bỏ cái cũ, chữa bệnh; kỵ cưới hỏi, khai trương',
  'Tốt cho cầu tài, khai trương, nhập kho',
  'Ngày bình thường, làm việc thường ngày ổn',
  'Tốt cho cưới hỏi, ký kết, nhập trạch; kỵ kiện tụng',
  'Tốt cho xây dựng, sửa chữa; kỵ xuất hành, khai trương',
  'Ngày xấu, chỉ hợp phá dỡ',
  'Ngày xấu, kỵ đi xa, leo cao',
  'Ngày tốt, hợp hầu hết mọi việc',
  'Tốt cho thu tiền, nhập kho; kỵ khai trương',
  'Tốt cho khai trương, cưới hỏi, khởi công',
  'Ngày xấu, kỵ khai trương, xuất hành'
];

/* ---- Nhị thập bát tú, Thiên Đức, Nguyệt Đức, hướng xuất hành ---- */
export const SAO28 = ['Giác', 'Cang', 'Đê', 'Phòng', 'Tâm', 'Vĩ', 'Cơ', 'Đẩu', 'Ngưu', 'Nữ', 'Hư', 'Nguy', 'Thất', 'Bích', 'Khuê', 'Lâu', 'Vị', 'Mão', 'Tất', 'Chủy', 'Sâm', 'Tỉnh', 'Quỷ', 'Liễu', 'Tinh', 'Trương', 'Dực', 'Chẩn'];
const SAO_TOT = new Set(['Giác', 'Phòng', 'Vĩ', 'Cơ', 'Đẩu', 'Thất', 'Bích', 'Lâu', 'Vị', 'Tất', 'Sâm', 'Tỉnh', 'Trương', 'Chẩn']);
const SAO_ANCHOR = jdFromDate(22, 11, 2026); // ngày Canh Tý, sao Hư (đối chiếu lịch vạn niên)
const THIEN_DUC = ['Đinh', 'Thân', 'Nhâm', 'Tân', 'Hợi', 'Giáp', 'Quý', 'Dần', 'Bính', 'Ất', 'Tỵ', 'Canh'];
const NGUYET_DUC = ['Canh', 'Bính', 'Giáp', 'Nhâm']; // theo tháng % 4
const HY_THAN = ['Đông Bắc', 'Tây Bắc', 'Tây Nam', 'Chính Nam', 'Đông Nam', 'Đông Bắc', 'Tây Bắc', 'Tây Nam', 'Chính Nam', 'Đông Nam'];
const TAI_THAN = ['Đông Nam', 'Đông Nam', 'Chính Đông', 'Chính Đông', 'Chính Bắc', 'Chính Nam', 'Tây Nam', 'Tây Nam', 'Chính Tây', 'Tây Bắc'];

/** Thông tin bổ sung của một ngày: sao, Thiên Đức / Nguyệt Đức, hướng xuất hành */
export function dayExtras(jd) {
  const sao = SAO28[(((jd - SAO_ANCHOR + 10) % 28) + 28) % 28];
  const can = CAN[(jd + 9) % 10];
  const chi = CHI[dayChiIndex(jd)];
  const m = ((solarMonthChi(jd) - 2 + 12) % 12) + 1; // tháng theo tiết khí: Dần = 1
  const td = THIEN_DUC[m - 1];
  return {
    sao, saoTot: SAO_TOT.has(sao),
    thienDuc: td === can || td === chi,
    nguyetDuc: NGUYET_DUC[m % 4] === can,
    hyThan: HY_THAN[(jd + 9) % 10], taiThan: TAI_THAN[(jd + 9) % 10]
  };
}

const TAM_NUONG = new Set([3, 7, 13, 18, 22, 27]);
const NGUYET_KY = new Set([5, 14, 23]);
const LUC_XUNG = (a, b) => (a + 6) % 12 === b;

/** Chi của năm sinh (âm lịch) từ chuỗi 'YYYY-MM-DD' */
export function birthChi(dob) {
  if (!dob) return null;
  const [y, m, d] = dob.split('-').map(Number);
  const l = solarToLunar(d, m, y);
  return (l.year + 8) % 12;
}

/**
 * Chấm điểm một ngày cho một việc. Trả về { score, level: 'tot'|'kha'|'xau', reasons: [{ ok, text }] }
 */
export function rateDay(jd, actId, opts = {}) {
  const act = ACTIVITIES.find((a) => a.id === actId) || ACTIVITIES[0];
  const s = jdToDate(jd);
  const l = solarToLunar(s.day, s.month, s.year);
  const chi = dayChiIndex(jd);
  const sp = daySpirit(l.month, chi);
  const tr = trucIndex(jd);
  const reasons = [];
  let score = 0;
  if (sp.good) { score += 2; reasons.push({ ok: true, text: `Ngày hoàng đạo (${sp.name})` }); }
  else { score -= 2; reasons.push({ ok: false, text: `Ngày hắc đạo (${sp.name})` }); }
  if (act.good.includes(tr)) { score += 2; reasons.push({ ok: true, text: `Trực ${TRUC[tr]}: hợp ${act.label.toLowerCase()}` }); }
  else if (act.bad.includes(tr)) { score -= 3; reasons.push({ ok: false, text: `Trực ${TRUC[tr]}: kỵ ${act.label.toLowerCase()}` }); }
  else reasons.push({ ok: null, text: `Trực ${TRUC[tr]}: bình thường` });
  if (act.tamNuong && TAM_NUONG.has(l.day)) { score -= 3; reasons.push({ ok: false, text: 'Ngày Tam nương (kỵ khởi sự lớn)' }); }
  if ((act.nguyetKy || act.tamNuong) && NGUYET_KY.has(l.day)) { score -= 2; reasons.push({ ok: false, text: 'Ngày Nguyệt kỵ (5, 14, 23 âm)' }); }
  const x = dayExtras(jd);
  if (x.thienDuc) { score += 1; reasons.push({ ok: true, text: 'Có sao Thiên Đức (đại cát)' }); }
  if (x.nguyetDuc) { score += 1; reasons.push({ ok: true, text: 'Có sao Nguyệt Đức (đại cát)' }); }
  if (x.saoTot) { score += 1; reasons.push({ ok: true, text: `Nhị thập bát tú: sao ${x.sao} (tốt)` }); }
  else { score -= 1; reasons.push({ ok: false, text: `Nhị thập bát tú: sao ${x.sao} (xấu)` }); }
  if (opts.chi != null && LUC_XUNG(opts.chi, chi)) { score -= 4; reasons.push({ ok: false, text: `Xung tuổi ${CHI[opts.chi]} của bạn` }); }
  const level = score >= 3 ? 'tot' : score >= 0 ? 'kha' : 'xau';
  return {
    extras: x,
    jd, solar: s, lunar: l, score, level, reasons,
    weekday: THU[(jd + 1) % 7], canChi: canChiDay(jd), truc: TRUC[tr], trucY: TRUC_Y[tr],
    hours: hoangDaoHours(chi)
  };
}

/** Các ngày tốt nhất trong khoảng [fromJd, fromJd + days) */
export function findGoodDays(fromJd, days, actId, opts = {}) {
  const out = [];
  for (let jd = fromJd; jd < fromJd + days; jd++) {
    const r = rateDay(jd, actId, opts);
    if (r.level === 'tot') out.push(r);
  }
  return out.sort((a, b) => b.score - a.score || a.jd - b.jd);
}

/** Cảnh báo theo năm (Kim lâu, Tam tai, Hoang ốc) cho tuổi gia chủ, theo tuổi mụ */
export function yearWarnings(birthLunarYear, lunarYear, actId) {
  if (!birthLunarYear) return [];
  const age = lunarYear - birthLunarYear + 1;
  const out = [];
  const bChi = (birthLunarYear + 8) % 12;
  const yChi = (lunarYear + 8) % 12;
  const TAM_TAI = { 0: [2, 3, 4], 4: [2, 3, 4], 8: [2, 3, 4], 2: [8, 9, 10], 6: [8, 9, 10], 10: [8, 9, 10], 11: [5, 6, 7], 3: [5, 6, 7], 7: [5, 6, 7], 5: [11, 0, 1], 9: [11, 0, 1], 1: [11, 0, 1] };
  if (TAM_TAI[bChi].includes(yChi)) out.push(`Năm ${canChiYear(lunarYear)} là năm Tam tai của tuổi ${CHI[bChi]}`);
  if (actId === 'cuoi' && [1, 3, 6, 8].includes(age % 9)) out.push(`Tuổi mụ ${age} phạm Kim lâu (nên xem tuổi người nữ)`);
  if ((actId === 'dongtho' || actId === 'nhaptrach') && age >= 10) {
    const pos = (Math.floor(age / 10) - 1 + (age % 10)) % 6;
    const NAMES = ['Nhất Cát', 'Nhì Nghi', 'Tam Địa Sát', 'Tứ Tấn Tài', 'Ngũ Thọ Tử', 'Lục Hoang Ốc'];
    if ([2, 4, 5].includes(pos)) out.push(`Tuổi mụ ${age} phạm ${NAMES[pos]} (nên mượn tuổi khi làm nhà)`);
  }
  return out;
}
