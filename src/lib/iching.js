// Kinh Dịch: gieo 3 đồng xu, tra 64 quẻ theo thứ tự Văn Vương.
const TRI = { '111': 0, '110': 1, '101': 2, '100': 3, '011': 4, '010': 5, '001': 6, '000': 7 };
export const TRIGRAM_NATURE = ['Thiên', 'Trạch', 'Hỏa', 'Lôi', 'Phong', 'Thủy', 'Sơn', 'Địa'];
export const TRIGRAM_NAME = ['Càn', 'Đoài', 'Ly', 'Chấn', 'Tốn', 'Khảm', 'Cấn', 'Khôn'];
const KW = [
  [1, 10, 13, 25, 44, 6, 33, 12], [43, 58, 49, 17, 28, 47, 31, 45], [14, 38, 30, 21, 50, 64, 56, 35], [34, 54, 55, 51, 32, 40, 62, 16],
  [9, 61, 37, 42, 57, 59, 53, 20], [5, 60, 63, 3, 48, 29, 39, 8], [26, 41, 22, 27, 18, 4, 52, 23], [11, 19, 36, 24, 46, 7, 15, 2]
];
export const NAMES = ['', 'Càn', 'Khôn', 'Truân', 'Mông', 'Nhu', 'Tụng', 'Sư', 'Tỷ', 'Tiểu Súc', 'Lý', 'Thái', 'Bĩ', 'Đồng Nhân', 'Đại Hữu', 'Khiêm', 'Dự', 'Tùy', 'Cổ', 'Lâm', 'Quán', 'Phệ Hạp', 'Bí', 'Bác', 'Phục', 'Vô Vọng', 'Đại Súc', 'Di', 'Đại Quá', 'Khảm', 'Ly', 'Hàm', 'Hằng', 'Độn', 'Đại Tráng', 'Tấn', 'Minh Di', 'Gia Nhân', 'Khuê', 'Kiển', 'Giải', 'Tổn', 'Ích', 'Quải', 'Cấu', 'Tụy', 'Thăng', 'Khốn', 'Tỉnh', 'Cách', 'Đỉnh', 'Chấn', 'Cấn', 'Tiệm', 'Quy Muội', 'Phong', 'Lữ', 'Tốn', 'Đoài', 'Hoán', 'Tiết', 'Trung Phu', 'Tiểu Quá', 'Ký Tế', 'Vị Tế'];
export const KEYWORDS = ['', 'Sáng tạo, cương kiện. Bền bỉ tự cường thì hanh thông.', 'Nhu thuận, bao dung. Theo sau, nâng đỡ thì được lợi.', 'Khó khăn buổi đầu. Kiên nhẫn gây dựng, tìm người giúp.', 'Non nớt, cần học hỏi. Khiêm tốn hỏi người hiểu biết.', 'Chờ đợi đúng thời. Giữ lòng tin, chưa nên vội.', 'Tranh chấp. Nên hòa giải, tránh kiện tụng kéo dài.', 'Kỷ luật, tập hợp lực lượng. Cần người dẫn dắt chính đáng.', 'Gắn bó, liên kết. Chọn đúng người để đồng hành.', 'Tích lũy từng chút. Việc nhỏ thuận, việc lớn chờ thêm.', 'Thận trọng từng bước. Lễ độ giúp qua chỗ hiểm.', 'Hanh thông, trời đất giao hòa. Thời điểm tốt để tiến.', 'Bế tắc, trên dưới không thông. Giữ mình, chờ thời.', 'Đồng lòng. Hợp tác cởi mở thì thành công.', 'Sở hữu lớn. Sáng suốt, rộng rãi thì giữ được lâu.', 'Khiêm tốn được lợi. Càng nhún nhường càng được nể.', 'Vui vẻ, chuẩn bị. Lên kế hoạch trước khi hành động.', 'Thuận theo thời. Linh hoạt nhưng giữ chính đạo.', 'Sửa chữa cái hỏng. Dọn dẹp việc cũ để làm mới.', 'Tiến tới, gần gũi. Thời vận đang lên, nên nắm bắt.', 'Quan sát, chiêm nghiệm. Nhìn rõ trước khi làm.', 'Cắn đứt trở ngại. Quyết đoán, rõ ràng, công bằng.', 'Vẻ ngoài, trang sức. Chú ý thực chất hơn hình thức.', 'Suy giảm, bóc mòn. Không nên khởi sự, giữ nền tảng.', 'Trở lại, hồi phục. Sau khó khăn là khởi đầu mới.', 'Chân thật, không vọng động. Làm đúng thì không lo.', 'Tích lũy lớn. Dưỡng sức, học hỏi để làm việc lớn.', 'Nuôi dưỡng. Cẩn trọng lời nói và ăn uống.', 'Quá tải, gánh nặng. Cần điều chỉnh, san sẻ bớt.', 'Hiểm nguy trùng trùng. Giữ lòng thành, bình tĩnh vượt qua.', 'Sáng sủa, nương tựa. Bám vào điều đúng sẽ sáng tỏ.', 'Cảm ứng. Chân thành thì lòng người tự đến.', 'Bền lâu. Giữ vững hướng đi, kiên trì.', 'Lui ẩn đúng lúc. Biết lùi để bảo toàn.', 'Sức mạnh lớn. Dùng sức đúng chỗ, tránh hiếu thắng.', 'Tiến lên. Được trọng dụng, đường đi sáng sủa.', 'Ánh sáng bị che. Giữ mình kín đáo, chờ thời.', 'Gia đình. Mỗi người đúng vai thì nhà yên.', 'Khác biệt, chia lìa. Tìm điểm chung trong khác biệt.', 'Trắc trở. Dừng lại tìm hướng khác, nhờ người giúp.', 'Giải tỏa. Khó khăn qua đi, nên làm nhanh gọn.', 'Bớt đi để được. Tiết giảm hôm nay, lợi về sau.', 'Thêm vào, lợi ích. Thời điểm tốt để làm việc có ích.', 'Quyết đoán. Dứt khoát loại bỏ điều sai.', 'Gặp gỡ bất ngờ. Cẩn trọng với mối quan hệ mới.', 'Tụ họp. Đoàn kết, chuẩn bị chu đáo.', 'Đi lên từ từ. Tiến bước vững chắc, được giúp đỡ.', 'Khốn khó. Giữ chí, ít nói, nhiều làm.', 'Giếng nước, nguồn nuôi. Bồi đắp giá trị lâu dài.', 'Thay đổi. Đổi mới đúng lúc thì được ủng hộ.', 'Ổn định, đổi mới. Thời điểm tốt để gây dựng.', 'Chấn động. Bình tĩnh trước biến cố sẽ an.', 'Dừng lại, tĩnh tâm. Biết dừng đúng lúc.', 'Tiến dần. Từng bước chắc chắn thì thành.', 'Chưa đúng vị trí. Không nên vội vàng quyết định.', 'Thịnh lớn. Tận dụng lúc sung mãn nhưng nhớ giữ gìn.', 'Lữ khách. Cẩn trọng, khiêm nhường nơi xa lạ.', 'Mềm mỏng thâm nhập. Kiên trì nhẹ nhàng thì được.', 'Vui vẻ, đẹp lòng. Hòa nhã, chân thành.', 'Phân tán. Gom góp lại, hướng về mục tiêu chung.', 'Tiết chế. Có chừng mực thì bền.', 'Thành tín. Lòng thành cảm động được người.', 'Hơi quá. Chỉ nên làm việc nhỏ, giữ khiêm tốn.', 'Đã thành. Giữ gìn, đề phòng sơ suất về sau.', 'Chưa xong. Còn cơ hội nếu cẩn thận đến cùng.'];

/** Gieo 3 đồng xu: ngửa = 3, sấp = 2. Tổng 6 (lão âm, động), 7 (thiếu dương), 8 (thiếu âm), 9 (lão dương, động) */
export function tossCoins(rand = Math.random) {
  const coins = [0, 1, 2].map(() => (rand() < 0.5 ? 3 : 2));
  return { coins, value: coins[0] + coins[1] + coins[2] };
}

export const isYang = (v) => v === 7 || v === 9;
export const isMoving = (v) => v === 6 || v === 9;

/** bits: mảng 6 phần tử 0/1 từ hào 1 (dưới) lên hào 6 (trên) */
export function hexagramFromBits(bits) {
  const lo = TRI[bits.slice(0, 3).join('')];
  const up = TRI[bits.slice(3, 6).join('')];
  const no = KW[up][lo];
  const name = up === lo ? 'Thuần ' + TRIGRAM_NAME[up] : `${TRIGRAM_NATURE[up]} ${TRIGRAM_NATURE[lo]} ${NAMES[no]}`;
  return { no, name, short: NAMES[no], text: KEYWORDS[no], upper: TRIGRAM_NAME[up], lower: TRIGRAM_NAME[lo] };
}

/** lines: mảng giá trị 6/7/8/9 từ dưới lên */
export function readCast(lines) {
  const main = hexagramFromBits(lines.map((v) => (isYang(v) ? 1 : 0)));
  const moving = lines.map((v, i) => (isMoving(v) ? i + 1 : 0)).filter(Boolean);
  const changed = moving.length ? hexagramFromBits(lines.map((v) => (v === 9 ? 0 : v === 6 ? 1 : isYang(v) ? 1 : 0))) : null;
  return { main, moving, changed };
}
