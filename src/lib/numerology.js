// Thần số học Pythagoras — tính trên máy.
const MASTERS = new Set([11, 22, 33]);

export function reduce(n, keepMaster = true) {
  while (n > 9 && !(keepMaster && MASTERS.has(n))) {
    n = String(n).split('').reduce((a, c) => a + Number(c), 0);
  }
  return n;
}

const sumDigits = (n) => String(n).split('').reduce((a, c) => a + Number(c), 0);

export function normalizeName(name) {
  return String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toUpperCase().replace(/[^A-Z]/g, '');
}

const letterValue = (c) => ((c.charCodeAt(0) - 65) % 9) + 1;
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function lifePath(d, m, y) {
  const total = sumDigits(d) + sumDigits(m) + sumDigits(y);
  return { value: reduce(total), total, digits: `${d}${m}${y}` };
}

export function nameNumbers(name) {
  const letters = normalizeName(name).split('');
  const all = letters.reduce((a, c) => a + letterValue(c), 0);
  const v = letters.filter((c) => VOWELS.has(c)).reduce((a, c) => a + letterValue(c), 0);
  const k = letters.filter((c) => !VOWELS.has(c)).reduce((a, c) => a + letterValue(c), 0);
  return { expression: reduce(all), soul: reduce(v), personality: reduce(k), totals: { all, v, k }, letters: letters.join('') };
}

export const birthdayNumber = (d) => reduce(d);
export const personalYear = (d, m, year) => reduce(reduce(d, false) + reduce(m, false) + reduce(sumDigits(year), false), false);

/** Biểu đồ ngày sinh 3×3 (thứ tự hiển thị 3-6-9 / 2-5-8 / 1-4-7) */
export function birthChart(d, m, y) {
  const digits = (`${d}${m}${y}`).split('').map(Number);
  return [3, 6, 9, 2, 5, 8, 1, 4, 7].map((n) => ({ n, count: digits.filter((x) => x === n).length }));
}

export const MEANINGS = {
  1: { title: 'Người tiên phong, độc lập', text: 'Số 1 mang năng lượng khởi đầu: chủ động, quyết đoán, thích tự mình làm. Bài học là biết lắng nghe và hợp tác thay vì làm một mình.' },
  2: { title: 'Người kết nối, tinh tế', text: 'Số 2 nhạy cảm, khéo léo, giỏi hòa giải và làm việc nhóm. Bài học là tin vào bản thân, đừng quá phụ thuộc vào ý kiến người khác.' },
  3: { title: 'Người sáng tạo, giàu biểu đạt', text: 'Số 3 vui vẻ, có khiếu nói, viết, nghệ thuật. Bài học là tập trung, hoàn thành việc đã bắt đầu.' },
  4: { title: 'Người xây nền, kỷ luật', text: 'Số 4 thực tế, chăm chỉ, đáng tin. Bạn làm việc có hệ thống. Bài học là linh hoạt hơn khi hoàn cảnh thay đổi.' },
  5: { title: 'Người tự do, thích trải nghiệm', text: 'Số 5 năng động, ham khám phá, thích đổi mới. Bài học là giữ cam kết và biết điểm dừng.' },
  6: { title: 'Người chăm lo, giàu trách nhiệm', text: 'Số 6 hướng về gia đình và cộng đồng: tình cảm, chu đáo, muốn mọi thứ hài hòa. Bài học là chăm lo cho chính mình, tránh ôm việc của người khác.' },
  7: { title: 'Người chiêm nghiệm, tìm bản chất', text: 'Số 7 thích suy ngẫm, phân tích, học hỏi sâu. Bài học là mở lòng chia sẻ, đừng khép mình quá lâu.' },
  8: { title: 'Người quản lý, có tham vọng', text: 'Số 8 mạnh về tổ chức, tài chính, thành tựu. Bài học là cân bằng giữa vật chất và các mối quan hệ.' },
  9: { title: 'Người nhân ái, bao dung', text: 'Số 9 rộng lượng, thích giúp đỡ, nhìn bức tranh lớn. Bài học là biết buông bỏ và chăm sóc bản thân.' },
  11: { title: 'Số bậc thầy: trực giác, truyền cảm hứng', text: 'Số 11 có trực giác mạnh, dễ thấy điều người khác bỏ qua, hợp vai trò dẫn dắt tinh thần, giảng dạy, sáng tạo. Bài học là giữ vững tinh thần trước áp lực.' },
  22: { title: 'Số bậc thầy: người kiến tạo lớn', text: 'Số 22 kết hợp tầm nhìn và năng lực thực thi, có thể xây dựng những việc lớn, lâu dài. Bài học là không để áp lực kỳ vọng đè nặng.' },
  33: { title: 'Số bậc thầy: người thầy yêu thương', text: 'Số 33 giàu lòng trắc ẩn, mong nâng đỡ người khác. Bài học là đặt ranh giới để không kiệt sức.' }
};

export const YEAR_MEANINGS = {
  1: 'Năm khởi đầu chu kỳ mới: hợp để bắt đầu dự định, gieo hạt.',
  2: 'Năm vun đắp quan hệ, kiên nhẫn chờ kết quả.',
  3: 'Năm sáng tạo, giao lưu, thể hiện bản thân.',
  4: 'Năm làm việc chăm chỉ, củng cố nền tảng.',
  5: 'Năm thay đổi, dịch chuyển, trải nghiệm mới.',
  6: 'Năm của gia đình, trách nhiệm, chăm sóc.',
  7: 'Năm tĩnh lặng, học hỏi, nhìn lại bên trong.',
  8: 'Năm gặt hái thành quả, tài chính, sự nghiệp.',
  9: 'Năm khép lại chu kỳ: hoàn tất việc dang dở, buông bỏ điều không còn phù hợp.'
};
