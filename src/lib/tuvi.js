// Lá số Tử Vi — dùng thư viện iztro (MIT), ngôn ngữ vi-VN, chạy offline.
import { astro } from 'iztro';
import { pad2 } from './events.js';

const PALACE_RENAME = { 'Tử Nữ': 'Tử Tức' };
const HOA = { 'Lộc': 'Hóa Lộc', 'Quyền': 'Hóa Quyền', 'Khoa': 'Hóa Khoa', 'Kỵ': 'Hóa Kỵ' };

export const STAR_TEXT = {
  'Tử Vi': 'uy nghi, có tố chất lãnh đạo, thích tự chủ',
  'Thiên Phủ': 'điềm đạm, giỏi giữ gìn và quản lý tài sản',
  'Thái Âm': 'tinh tế, sâu sắc, thiên về nội tâm',
  'Tham Lang': 'đa tài, giao thiệp rộng, nhiều mong muốn',
  'Cự Môn': 'ăn nói sắc sảo, hay suy xét, dễ vướng thị phi',
  'Liêm Trinh': 'nguyên tắc, cứng rắn, coi trọng kỷ luật',
  'Thiên Tướng': 'hào hiệp, thích giúp đỡ, giữ lời hứa',
  'Thiên Lương': 'nhân hậu, có tâm che chở người khác',
  'Thất Sát': 'quyết liệt, dám dấn thân, ưa thử thách',
  'Thiên Đồng': 'ôn hòa, dễ thích nghi, ưa sự an nhàn',
  'Vũ Khúc': 'thực tế, giỏi tính toán chuyện tiền bạc',
  'Thái Dương': 'cởi mở, nhiệt tình, thích cống hiến',
  'Phá Quân': 'thích đổi mới, phá cũ lập mới',
  'Thiên Cơ': 'nhanh trí, linh hoạt, giỏi mưu tính'
};

// Vị trí 12 cung trên lưới 4×4 theo địa chi
export const GRID = {
  'Tỵ': [1, 1], 'Ngọ': [1, 2], 'Mùi': [1, 3], 'Thân': [1, 4],
  'Thìn': [2, 1], 'Dậu': [2, 4], 'Mão': [3, 1], 'Tuất': [3, 4],
  'Dần': [4, 1], 'Sửu': [4, 2], 'Tý': [4, 3], 'Hợi': [4, 4]
};

/** hourChi: 0 = Tý (23–1h) … 11 = Hợi */
export function buildChart({ dob, hourChi, gender }) {
  const [y, m, d] = dob.split('-').map(Number);
  const a = astro.bySolar(`${y}-${m}-${d}`, hourChi, gender === 'Nữ' ? 'female' : 'male', true, 'vi-VN');
  const palaces = a.palaces.map((p) => {
    const majors = p.majorStars.map((s) => ({ name: s.name, brightness: s.brightness || '', hoa: s.mutagen ? HOA[s.mutagen] || s.mutagen : '' }));
    return {
      name: PALACE_RENAME[p.name] || p.name,
      stem: p.heavenlyStem, branch: p.earthlyBranch, isBody: p.isBodyPalace,
      majors, minors: p.minorStars.map((s) => s.name + (s.mutagen ? ` (${HOA[s.mutagen] || s.mutagen})` : '')),
      decadal: `${p.decadal.range[0]}–${p.decadal.range[1]}`,
      pos: GRID[p.earthlyBranch]
    };
  });
  return {
    lunarText: a.lunarDate.replace('Âm lịch ', ''), chinese: a.chineseDate, five: a.fiveElementsClass,
    soul: a.soul, body: a.body, palaces,
    menhBranch: a.earthlyBranchOfSoulPalace, bodyBranch: a.earthlyBranchOfBodyPalace,
    yinYang: (y % 2 === 0 ? 'Dương ' : 'Âm ') + (gender === 'Nữ' ? 'Nữ' : 'Nam'),
    birth: `${pad2(d)}/${pad2(m)}/${y}`
  };
}

export function palaceText(p) {
  if (!p.majors.length) return `Cung ${p.name} vô chính diệu (không có chính tinh), nên xem thêm các sao ở cung đối diện để luận.`;
  const parts = p.majors.map((m) => `${m.name}${m.brightness === 'Hãm' ? ' (hãm địa, giảm sức)' : ''}: ${STAR_TEXT[m.name] || ''}`);
  let t = `Cung ${p.name} có ${parts.join('; ')}.`;
  if (p.majors.some((m) => m.hoa === 'Hóa Kỵ')) t += ' Gặp Hóa Kỵ nên cẩn trọng giấy tờ, lời nói.';
  if (p.majors.some((m) => m.hoa === 'Hóa Lộc')) t += ' Có Hóa Lộc, thuận lợi về tài lộc, phúc khí.';
  if (p.majors.some((m) => m.hoa === 'Hóa Quyền')) t += ' Có Hóa Quyền, tăng uy tín và khả năng quyết định.';
  if (p.majors.some((m) => m.hoa === 'Hóa Khoa')) t += ' Có Hóa Khoa, thuận cho học hành, danh tiếng.';
  return t;
}
