// Sao chiếu mệnh (Cửu Diệu) và hạn (bát hạn) theo tuổi mụ và giới tính — cách tính dân gian, để tham khảo.
// Giờ, hướng, số đèn cúng sao: theo cách ghi phổ biến; mỗi nơi có thể khác đôi chút.
import { lunarToSolar, solarToLunar, jdFromDate, jdToDate } from './lunar.js';

export const STARS = [
  { id: 'lahau', name: 'La Hầu', kind: 'xau', day: 8, gio: '21–23 giờ', huong: 'Bắc', den: 9, baiVi: 'Thiên cung Thần thủ La Hầu Tinh quân',
    tom: 'Sao xấu, nam kỵ hơn nữ: dễ vướng thị phi, cãi vã, chuyện giấy tờ; giữ lời ăn tiếng nói, cẩn thận sức khỏe tai mắt, máu huyết.' },
  { id: 'thotu', name: 'Thổ Tú', kind: 'trung', day: 19, gio: '19–21 giờ', huong: 'Tây', den: 5, baiVi: 'Trung ương Mậu Kỷ Thổ Đức Tinh quân',
    tom: 'Sao trung bình: dễ có chuyện thị phi trong nhà, đi xa không thuận; nên hòa nhã, cẩn thận khi xuất hành.' },
  { id: 'thuydieu', name: 'Thủy Diệu', kind: 'trung', day: 21, gio: '21–23 giờ', huong: 'Bắc', den: 7, baiVi: 'Bắc phương Nhâm Quý Thủy Đức Tinh quân',
    tom: 'Sao phúc lộc, nam được nhiều may mắn về tiền bạc; nữ nên giữ lời nói, cẩn thận sông nước.' },
  { id: 'thaibach', name: 'Thái Bạch', kind: 'xau', day: 15, gio: '19–21 giờ', huong: 'Tây', den: 8, baiVi: 'Tây phương Canh Tân Kim Đức Thái Bạch Tinh quân',
    tom: 'Sao xấu về tiền của: dễ hao tài, làm ăn chậm; chi tiêu dè dặt, tránh đầu tư liều, giữ gìn sức khỏe.' },
  { id: 'thaiduong', name: 'Thái Dương', kind: 'tot', day: 27, gio: '21–23 giờ', huong: 'Đông', den: 12, baiVi: 'Nhật cung Thái Dương Thiên tử Tinh quân',
    tom: 'Sao tốt, nhất là với nam: công việc hanh thông, có quý nhân giúp, gia đạo yên vui.' },
  { id: 'vanhon', name: 'Vân Hớn', kind: 'trung', day: 29, gio: '21–23 giờ', huong: 'Nam', den: 15, baiVi: 'Nam phương Bính Đinh Hỏa Đức Tinh quân',
    tom: 'Sao trung bình, thuộc Hỏa: dễ nóng nảy, va chạm, chuyện kiện tụng nhỏ; nên nhẫn nhịn, cẩn thận lửa điện.' },
  { id: 'kedo', name: 'Kế Đô', kind: 'xau', day: 18, gio: '21–23 giờ', huong: 'Tây', den: 21, baiVi: 'Địa cung Thần vĩ Kế Đô Tinh quân',
    tom: 'Sao xấu, nữ kỵ hơn nam: dễ buồn phiền, chuyện ngoài ý muốn trong nhà; giữ hòa khí, cẩn trọng khi đi xa.' },
  { id: 'thaiam', name: 'Thái Âm', kind: 'tot', day: 26, gio: '19–21 giờ', huong: 'Tây', den: 7, baiVi: 'Nguyệt cung Thái Âm Hoàng hậu Tinh quân',
    tom: 'Sao tốt, nhất là với nữ: tiền bạc, danh tiếng tốt dần, mọi việc êm ấm.' },
  { id: 'mocduc', name: 'Mộc Đức', kind: 'tot', day: 25, gio: '19–21 giờ', huong: 'Đông', den: 20, baiVi: 'Đông phương Giáp Ất Mộc Đức Tinh quân',
    tom: 'Sao tốt: gia đạo hòa thuận, có tin vui, việc học hành, làm ăn tiến triển.' }
];
const STAR_NAM = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // dư 1..9 → La Hầu, Thổ Tú, Thủy Diệu, Thái Bạch, Thái Dương, Vân Hớn, Kế Đô, Thái Âm, Mộc Đức
const STAR_NU = [6, 5, 8, 7, 1, 0, 4, 3, 2]; // dư 1..9 → Kế Đô, Vân Hớn, Mộc Đức, Thái Âm, Thổ Tú, La Hầu, Thái Dương, Thái Bạch, Thủy Diệu

export const HANS = {
  huynhtuyen: { name: 'Huỳnh Tuyền', nang: 2, tom: 'Hạn nặng: chú ý bệnh tật, đi khám sức khỏe định kỳ, tránh việc mạo hiểm.' },
  tamkheo: { name: 'Tam Kheo', nang: 1, tom: 'Hạn nhẹ: hay đau nhức tay chân, cẩn thận khi đi lại, lao động.' },
  ngumo: { name: 'Ngũ Mộ', nang: 1, tom: 'Hạn hao tài: giữ của cẩn thận, tránh cho vay mượn lớn.' },
  thientinh: { name: 'Thiên Tinh', nang: 1, tom: 'Dễ gặp thị phi, kiện cáo, bị lừa; xem kỹ giấy tờ trước khi ký.' },
  toantan: { name: 'Toán Tận', nang: 2, tom: 'Hạn nặng về tiền của: hao tài, sức khỏe giảm; chi tiêu dè dặt.' },
  thienla: { name: 'Thiên La', nang: 1, tom: 'Hay lo nghĩ, tâm trạng thất thường; nên nghỉ ngơi, giữ tinh thần thoải mái.' },
  diavong: { name: 'Địa Võng', nang: 1, tom: 'Dễ vướng tai tiếng, chuyện pháp lý; tránh nơi đông người phức tạp.' },
  diemvuong: { name: 'Diêm Vương', nang: 2, tom: 'Hay buồn phiền, lo cho sức khỏe người thân lớn tuổi trong nhà.' }
};
// Vị trí = (số chục − 1 + hàng đơn vị) chia 8 lấy dư — nam và nữ ứng với hạn khác nhau
const HAN_NAM = ['huynhtuyen', 'tamkheo', 'ngumo', 'thientinh', 'toantan', 'thienla', 'diavong', 'diemvuong'];
const HAN_NU = ['toantan', 'thientinh', 'ngumo', 'tamkheo', 'huynhtuyen', 'diemvuong', 'diavong', 'thienla'];

export const tuoiMu = (born, lunarYear) => lunarYear - born + 1;

export function saoOf(age, gender = 'nam') {
  if (age < 1) return null;
  const r = (age - 1) % 9;
  return STARS[(gender === 'nu' ? STAR_NU : STAR_NAM)[r]];
}

export function hanOf(age, gender = 'nam') {
  if (age < 10) return null; // hạn thường xét từ 10 tuổi
  const p = (Math.floor(age / 10) - 1 + (age % 10)) % 8;
  const id = (gender === 'nu' ? HAN_NU : HAN_NAM)[p];
  return { id, ...HANS[id] };
}

/** Các ngày cúng sao sắp tới (ngày âm cố định của sao, trong tháng này và các tháng sau) */
export function nextStarDays(star, fromJd, count = 3) {
  const out = [];
  const s0 = jdToDate(fromJd);
  let { month: lm, year: ly } = solarToLunar(s0.day, s0.month, s0.year);
  for (let k = 0; out.length < count && k < 15; k++) {
    const s = lunarToSolar(star.day, lm, ly, false);
    if (s) {
      const jd = jdFromDate(s.day, s.month, s.year);
      if (jd >= fromJd) out.push({ jd, solar: s, lunar: { day: star.day, month: lm, year: ly } });
    }
    lm += 1; if (lm > 12) { lm = 1; ly += 1; }
  }
  return out;
}

