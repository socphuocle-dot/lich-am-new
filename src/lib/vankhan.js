// Văn khấn cổ truyền và mâm cúng gợi ý cho từng dịp — chạy hoàn toàn trên máy.
// Văn bản viết theo khuôn văn khấn dân gian phổ biến; chỗ {…} được điền tự động.
import { LUNAR_MONTH_NAME } from './lunar.js';

const THANG = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'];

const PHAT = 'Nam mô A Di Đà Phật! (3 lần)';
const LAY_TROI = 'Con lạy chín phương Trời, mười phương chư Phật, chư Phật mười phương.';
const LAY_THAN = 'Con kính lạy Hoàng thiên Hậu thổ, chư vị Tôn thần.\nCon kính lạy ngài Bản cảnh Thành hoàng, ngài Bản xứ Thổ địa, ngài Bản gia Táo quân cùng chư vị Thần linh cai quản trong khu vực này.';
const LAY_TIEN = 'Con kính lạy các cụ Cao tằng Tổ khảo, Cao tằng Tổ tỷ, Tổ khảo, Tổ tỷ, bá thúc huynh đệ, cô di tỷ muội và chư vị hương linh nội ngoại họ {hoTen}.';
const TIN_CHU = 'Tín chủ con là {tinChu}, ngụ tại {diaChi}.';
const KET = ['Chúng con lễ bạc tâm thành, trước án kính lễ, cúi xin chứng giám.', PHAT];

export const OCCASIONS = [
  {
    id: 'gio', title: 'Văn khấn ngày giỗ', group: 'Giỗ chạp', when: 'Sáng ngày giỗ chính (ngày mất theo âm lịch)',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}, là ngày giỗ của {nguoiMat}.',
      TIN_CHU,
      'Nhân ngày giỗ, chúng con cùng toàn gia con cháu thành tâm sửa biện hương hoa, lễ vật, trà quả và thắp nén tâm hương dâng lên trước án, kính mời hương linh {nguoiMat} về chứng giám, thụ hưởng lễ vật.',
      'Chúng con thành tâm kính mời các vị Tổ tiên nội ngoại, chư vị hương linh cùng về hâm hưởng.',
      'Cúi xin phù hộ độ trì cho toàn gia con cháu luôn mạnh khỏe, bình an, công việc hanh thông, gia đạo hòa thuận, vạn sự tốt lành.',
      ...KET],
    mam: ['Hương, nến (đèn dầu)', 'Hoa tươi (cúc, huệ, sen)', 'Mâm ngũ quả', 'Trầu cau, rượu, nước sạch', 'Xôi, gà luộc', 'Canh, món xào, món nem', 'Bánh chưng hoặc bánh giầy (tùy vùng)', 'Vàng mã (nếu gia đình dùng)']
  },
  {
    id: 'tienthuong', title: 'Văn khấn Tiên thường', group: 'Giỗ chạp', when: 'Chiều hôm trước ngày giỗ chính',
    text: [PHAT, LAY_TROI, LAY_THAN,
      'Hôm nay là {ngayAm} năm {nam}, ngày mai là ngày giỗ của {nguoiMat}.',
      TIN_CHU,
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, kính cáo chư vị Tôn thần cho phép hương linh {nguoiMat} cùng Tổ tiên nội ngoại được về hâm hưởng lễ giỗ của gia đình.',
      'Kính mời hương linh {nguoiMat} về chứng giám lòng thành, phù hộ cho con cháu bình an, mạnh khỏe.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Hoa quả', 'Trầu cau, rượu, nước', 'Lễ chay hoặc vài món mặn đơn giản']
  },
  {
    id: 'mung1', title: 'Văn khấn mùng Một hằng tháng', group: 'Hằng tháng', when: 'Sáng mùng 1 âm lịch',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Nhân ngày đầu tháng, chúng con thành tâm sắm lễ hương hoa, trà quả, thắp nén tâm hương dâng lên trước án.',
      'Kính mời chư vị Tôn thần, Tổ tiên nội ngoại về chứng giám lòng thành, thụ hưởng lễ vật.',
      'Cúi xin phù hộ cho toàn gia tháng mới bình an, mạnh khỏe, làm ăn thuận lợi, mọi sự hanh thông.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Hoa quả', 'Trầu cau, nước sạch', 'Xôi, chè (tùy gia đình)']
  },
  {
    id: 'ram', title: 'Văn khấn ngày Rằm hằng tháng', group: 'Hằng tháng', when: 'Ngày 15 âm lịch (có thể cúng từ tối 14)',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Nhân ngày Rằm, chúng con thành tâm sắm lễ hương hoa, trà quả, thắp nén tâm hương dâng lên trước án.',
      'Kính mời chư vị Tôn thần, Tổ tiên nội ngoại về chứng giám, thụ hưởng lễ vật.',
      'Cúi xin phù hộ cho gia đình luôn bình an, khỏe mạnh, công việc thuận buồm xuôi gió, gia đạo hưng long.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Trầu cau, rượu, nước', 'Xôi, gà luộc hoặc mâm chay']
  },
  {
    id: 'thantai', title: 'Văn khấn Thần Tài, Thổ Địa', group: 'Hằng tháng', when: 'Mùng 1, Rằm và mùng 10 tháng Giêng',
    text: [PHAT, LAY_TROI,
      'Con kính lạy ngài Đông Trù Tư mệnh Táo phủ Thần quân.\nCon kính lạy ngài Thần Tài vị tiền, ngài Thổ Địa cùng chư vị Thần linh cai quản trong khu vực này.',
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, dâng lên trước án, kính mời chư vị Tôn thần về chứng giám, thụ hưởng.',
      'Cúi xin phù hộ cho việc buôn bán, làm ăn của gia đình được thuận lợi, tài lộc dồi dào, khách đến đông vui, mọi việc như ý.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Hoa quả', 'Trầu cau, rượu, nước', 'Heo quay hoặc thịt luộc (tùy dịp)', 'Vàng thỏi giấy (nếu gia đình dùng)']
  },
  {
    id: 'ongtao', title: 'Văn khấn ông Công ông Táo', group: 'Tết', when: 'Trước 12 giờ trưa ngày 23 tháng Chạp',
    text: [PHAT, LAY_TROI,
      'Con kính lạy ngài Đông Trù Tư mệnh Táo phủ Thần quân.',
      'Hôm nay là {ngayAm} năm {nam}, là ngày Táo quân về chầu Trời.',
      TIN_CHU,
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, mũ áo, cá chép, dâng lên trước án, tiễn đưa ngài về chầu Thiên đình.',
      'Ngài là vị chủ quản việc bếp núc trong gia đình, soi xét mọi việc tốt xấu trong năm. Có điều gì sơ suất, lỗi lầm, cúi xin ngài lượng thứ và tâu trình những điều tốt lành lên Ngọc Hoàng.',
      'Cúi xin ngài phù hộ cho toàn gia năm mới mạnh khỏe, bình an, làm ăn phát đạt, vạn sự như ý.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi, mâm ngũ quả', 'Mũ ông Công (2 mũ ông, 1 mũ bà), áo, hia', 'Cá chép sống (thả sau khi cúng)', 'Xôi, gà luộc hoặc mâm chay', 'Trầu cau, rượu, nước', 'Vàng mã']
  },
  {
    id: 'tatnien', title: 'Văn khấn tất niên', group: 'Tết', when: 'Chiều 30 (hoặc 29) tháng Chạp',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}, năm cũ sắp qua, năm mới sắp đến.',
      TIN_CHU,
      'Nhân tiết cuối năm, chúng con thành tâm sắm sửa hương hoa, lễ vật, trà quả và thắp nén tâm hương, kính mời chư vị Tôn thần, Tổ tiên nội ngoại về chứng giám, cùng gia đình đón Tết.',
      'Một năm qua nhờ ơn Tổ tiên phù hộ, gia đình được bình an. Cúi xin tiếp tục độ trì cho năm mới toàn gia mạnh khỏe, công việc hanh thông, con cháu học hành tấn tới, gia đạo an khang.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi (đào, mai, cúc)', 'Mâm ngũ quả', 'Bánh chưng, bánh tét', 'Gà luộc, xôi gấc', 'Giò, nem, canh măng (tùy vùng)', 'Trầu cau, rượu, trà, bánh mứt']
  },
  {
    id: 'giaothua', title: 'Văn khấn giao thừa', group: 'Tết', when: 'Đúng thời khắc giao thừa, lễ ngoài trời trước',
    text: [PHAT, LAY_TROI,
      'Con kính lạy Đức Đương lai Hạ giới Hành khiển Thái tuế Chí đức Tôn thần, ngài Cựu niên Đương cai và ngài Tân niên Đương cai.',
      'Con kính lạy các ngài Ngũ phương, Ngũ thổ, Phúc đức Tôn thần.',
      'Nay phút giao thừa năm cũ sang năm mới {nam}.',
      TIN_CHU,
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, kính dâng lên trước án. Kính tiễn ngài Cựu niên Đương cai, kính đón ngài Tân niên Đương cai.',
      'Cúi xin chư vị Tôn thần phù hộ cho toàn gia năm mới an khang thịnh vượng, sức khỏe dồi dào, vạn sự cát tường.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Gà trống luộc (miệng ngậm hoa hồng), xôi', 'Bánh chưng, bánh tét', 'Trầu cau, rượu, nước', 'Mũ áo Quan Hành khiển (tùy năm), vàng mã']
  },
  {
    id: 'tet', title: 'Văn khấn mùng Một Tết', group: 'Tết', when: 'Sáng mùng 1 Tết',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là ngày mùng Một tháng Giêng năm {nam}, ngày đầu xuân năm mới.',
      TIN_CHU,
      'Nhân dịp đầu xuân, chúng con cùng toàn gia con cháu thành tâm sắm sửa hương hoa, lễ vật, trà quả, kính mời chư vị Tôn thần, Tổ tiên nội ngoại về chứng giám, cùng đón xuân với con cháu.',
      'Cúi xin phù hộ cho toàn gia năm mới mạnh khỏe, bình an, tài lộc dồi dào, học hành tấn tới, gia đình hạnh phúc.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Bánh chưng, bánh tét', 'Gà luộc, xôi', 'Các món ngày Tết của gia đình', 'Trầu cau, rượu, trà, bánh mứt']
  },
  {
    id: 'hoavang', title: 'Văn khấn hóa vàng (tiễn ông bà)', group: 'Tết', when: 'Mùng 3 hoặc mùng 4 Tết',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Ngày Tết đã qua, chúng con thành tâm sắm sửa lễ vật, hương hoa, trà quả, kính dâng trước án để tiễn đưa Tổ tiên trở về.',
      'Lễ bạc lòng thành, kính mong Tổ tiên nội ngoại chứng giám, phù hộ cho con cháu cả năm mạnh khỏe, bình an, làm ăn thuận lợi.',
      'Chúng con xin phép hóa vàng tiễn Tổ tiên.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi, hoa quả', 'Mâm cơm (gà, xôi, canh, giò)', 'Trầu cau, rượu, nước', 'Vàng mã để hóa']
  },
  {
    id: 'ramgieng', title: 'Văn khấn Rằm tháng Giêng', group: 'Lễ Tết trong năm', when: 'Ngày 15 tháng Giêng (Tết Nguyên Tiêu)',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là ngày Rằm tháng Giêng năm {nam}, Tết Thượng Nguyên.',
      TIN_CHU,
      'Nhân tiết Thượng Nguyên, chúng con thành tâm sắm lễ hương hoa, trà quả, dâng lên trước án, kính mời chư vị Tôn thần, Tổ tiên nội ngoại về chứng giám.',
      'Cúi xin phù hộ cho toàn gia một năm mới bình an, mạnh khỏe, mọi việc hanh thông, cầu được ước thấy.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Xôi, chè trôi nước', 'Gà luộc hoặc mâm chay', 'Trầu cau, rượu, nước']
  },
  {
    id: 'thanhminh', title: 'Văn khấn Tết Thanh Minh (tảo mộ)', group: 'Lễ Tết trong năm', when: 'Tiết Thanh Minh (khoảng đầu tháng 4 dương lịch), tại mộ',
    text: [PHAT, LAY_TROI,
      'Con kính lạy các ngài Thần linh, Thổ địa cai quản khu vực này.',
      'Hôm nay là {ngayAm} năm {nam}, tiết Thanh Minh.',
      TIN_CHU,
      'Chúng con đến phần mộ {nguoiMat} để tảo mộ, sửa sang, thắp nén tâm hương, dâng lễ vật.',
      'Kính xin các ngài Thần linh, Thổ địa chứng giám, che chở cho phần mộ được yên ổn. Kính mong hương linh {nguoiMat} an nghỉ, phù hộ cho con cháu bình an, mạnh khỏe.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Hoa quả', 'Xôi, gà luộc (tùy gia đình)', 'Trầu cau, rượu, nước', 'Dụng cụ dọn dẹp, sửa sang mộ']
  },
  {
    id: 'doanngo', title: 'Văn khấn Tết Đoan Ngọ', group: 'Lễ Tết trong năm', when: 'Ngày 5 tháng Năm âm lịch',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là ngày mùng 5 tháng Năm năm {nam}, Tết Đoan Ngọ.',
      TIN_CHU,
      'Nhân tiết Đoan Ngọ, chúng con thành tâm sắm sửa hương hoa, lễ vật dâng lên trước án, kính mời chư vị Tôn thần, Tổ tiên nội ngoại về chứng giám.',
      'Cúi xin phù hộ cho toàn gia trừ tà, diệt bệnh, khỏe mạnh, bình an.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Rượu nếp, bánh tro (bánh gio)', 'Hoa quả (mận, vải, dưa hấu)', 'Chè, xôi', 'Trầu cau, nước']
  },
  {
    id: 'vulan', title: 'Văn khấn Rằm tháng Bảy (gia tiên)', group: 'Lễ Tết trong năm', when: 'Ngày 15 tháng Bảy (Vu Lan), cúng trong nhà',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là ngày Rằm tháng Bảy năm {nam}, ngày lễ Vu Lan báo hiếu, Tết Trung Nguyên.',
      TIN_CHU,
      'Nhân tiết Trung Nguyên, chúng con nhớ đến công đức sinh thành, dưỡng dục của Tổ tiên, ông bà, cha mẹ, thành tâm sắm lễ hương hoa, trà quả dâng lên trước án.',
      'Kính mời Tổ tiên nội ngoại về chứng giám lòng thành, phù hộ cho con cháu bình an, mạnh khỏe, gia đạo hưng thịnh.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi (sen, cúc)', 'Mâm ngũ quả', 'Xôi, gà luộc hoặc mâm chay', 'Canh, nem, các món mặn', 'Trầu cau, rượu, nước', 'Vàng mã, quần áo giấy']
  },
  {
    id: 'chungsinh', title: 'Văn khấn cúng chúng sinh (cô hồn)', group: 'Lễ Tết trong năm', when: 'Chiều Rằm tháng Bảy, cúng ngoài trời',
    text: [PHAT, LAY_TROI,
      'Con kính lạy Đức Đại Bi Quán Thế Âm Bồ Tát, các ngài Thần linh cai quản khu vực này.',
      'Hôm nay là ngày Rằm tháng Bảy năm {nam}.',
      TIN_CHU,
      'Nhân tiết Trung Nguyên, chúng con thành tâm sắm sửa hương hoa, cháo, gạo muối, bánh kẹo, hoa quả, đặt lễ ngoài trời để cúng dường các vong linh cô hồn không nơi nương tựa.',
      'Kính mời các vong linh về đây thụ hưởng lễ vật, nghe kinh, sớm được siêu thoát, không quấy nhiễu dương gian.',
      'Cúi xin chư vị chứng giám, phù hộ cho gia đình chúng con được bình an.',
      ...KET],
    mam: ['Hương, nến', 'Cháo trắng loãng (đổ vào lá đa hoặc chén nhỏ)', 'Gạo, muối', 'Bỏng ngô, bánh kẹo', 'Hoa quả', 'Nước', 'Tiền lẻ, quần áo giấy (tùy gia đình)']
  },
  // ===== Tang lễ =====
  {
    id: 'cungtuan', title: 'Văn khấn cúng tuần, 49 ngày', group: 'Tang lễ', when: 'Ngày thứ 7 (tuần đầu) đến ngày thứ 49 sau khi mất',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, trà quả, cúng tuần cho hương linh {nguoiMat}.',
      'Từ ngày {nguoiMat} khuất bóng, con cháu thương nhớ khôn nguôi. Nay theo lệ cúng tuần, chúng con kính mời hương linh về chứng giám, thụ hưởng lễ vật.',
      'Cúi xin chư vị Tôn thần, Tổ tiên nội ngoại dẫn dắt hương linh sớm được siêu thoát, về nơi an lạc, phù hộ cho con cháu bình an.',
      ...KET],
    mam: ['Hương, nến (đèn dầu)', 'Hoa tươi (cúc trắng, huệ)', 'Hoa quả', 'Mâm cơm chay hoặc mặn (tùy gia đình)', 'Trầu cau, rượu, nước', 'Ảnh thờ, bát hương người mất', 'Vàng mã (nếu gia đình dùng)']
  },
  {
    id: 'tuan100', title: 'Văn khấn cúng 100 ngày (tốt khốc)', group: 'Tang lễ', when: 'Ngày thứ 100 sau khi mất',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}, là ngày tuần Tốt khốc (100 ngày) của {nguoiMat}.',
      TIN_CHU,
      'Thấm thoắt đã tròn trăm ngày {nguoiMat} khuất núi. Theo lễ xưa, từ nay con cháu thôi khóc, giữ lòng tưởng nhớ.',
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, kính mời hương linh {nguoiMat} cùng Tổ tiên nội ngoại về chứng giám, thụ hưởng.',
      'Cúi xin hương linh được an nghỉ nơi cực lạc, phù hộ độ trì cho con cháu mạnh khỏe, bình an, gia đạo hòa thuận.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Mâm cơm (xôi, gà, canh, các món người mất thích)', 'Trầu cau, rượu, nước', 'Vàng mã (nếu gia đình dùng)']
  },
  {
    id: 'giodau', title: 'Văn khấn giỗ đầu (tiểu tường)', group: 'Tang lễ', when: 'Tròn 1 năm ngày mất (âm lịch)',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}, là ngày giỗ đầu (Tiểu tường) của {nguoiMat}.',
      TIN_CHU,
      'Ngày tháng thoi đưa, đã tròn một năm {nguoiMat} về cõi vĩnh hằng. Con cháu thương nhớ, thành tâm sắm sửa hương hoa, lễ vật, cỗ bàn, dâng lên trước linh vị.',
      'Kính mời hương linh {nguoiMat} cùng chư vị Tổ tiên nội ngoại về chứng giám lòng thành, thụ hưởng lễ vật.',
      'Cúi xin phù hộ cho toàn gia con cháu mạnh khỏe, bình an, làm ăn thuận lợi, trên dưới thuận hòa.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi (cúc, huệ)', 'Mâm ngũ quả', 'Xôi, gà luộc', 'Mâm cỗ mặn (canh, nem, giò, món xào)', 'Trầu cau, rượu, nước', 'Vàng mã, quần áo giấy (nếu gia đình dùng)']
  },
  {
    id: 'giohet', title: 'Văn khấn giỗ hết (đại tường)', group: 'Tang lễ', when: 'Tròn 2 năm ngày mất (âm lịch); có nơi làm sau 3 năm',
    text: [PHAT, LAY_TROI, LAY_THAN, LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}, là ngày giỗ hết (Đại tường) của {nguoiMat}.',
      TIN_CHU,
      'Đã tròn hai năm {nguoiMat} về cõi vĩnh hằng. Nay mãn tang, chúng con thành tâm sắm sửa hương hoa, lễ vật, cỗ bàn, kính dâng trước linh vị.',
      'Kính mời hương linh {nguoiMat} cùng chư vị Tổ tiên nội ngoại về chứng giám, thụ hưởng. Từ nay hương linh được phối thờ cùng Tổ tiên, hằng năm con cháu giữ lệ cúng giỗ.',
      'Cúi xin phù hộ cho con cháu mạnh khỏe, bình an, gia đạo hưng thịnh.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Xôi, gà luộc', 'Mâm cỗ mặn', 'Trầu cau, rượu, nước', 'Vàng mã, quần áo giấy để hóa (nếu gia đình dùng)']
  },
  // ===== Việc lớn =====
  {
    id: 'nhaptrach', title: 'Văn khấn nhập trạch (về nhà mới)', group: 'Việc lớn', when: 'Ngày giờ tốt khi dọn về nhà mới',
    text: [PHAT, LAY_TROI, LAY_THAN,
      'Con kính lạy các ngài Thần linh, Thổ địa, Táo quân và chư vị Tôn thần cai quản ngôi nhà này.',
      'Hôm nay là {ngayAm} năm {nam}, ngày lành tháng tốt.',
      'Tín chủ con là {tinChu}, nay dọn về ngụ tại {diaChi}.',
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, kính cáo chư vị Tôn thần cho phép gia đình chúng con được nhập trạch, an cư lạc nghiệp tại nơi đây.',
      'Kính mời Tổ tiên nội ngoại cùng về nhà mới chứng giám, phù hộ cho cả nhà mạnh khỏe, bình an, làm ăn phát đạt, gia đạo hưng long.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Xôi, gà luộc (hoặc heo quay)', 'Trầu cau, rượu, nước, muối, gạo', 'Bếp lửa hoặc bếp than nhỏ (mang vào nhà đầu tiên)', 'Vàng mã (nếu gia đình dùng)']
  },
  {
    id: 'dongtho', title: 'Văn khấn động thổ', group: 'Việc lớn', when: 'Ngày giờ tốt trước khi khởi công xây, sửa nhà',
    text: [PHAT, LAY_TROI,
      'Con kính lạy Hoàng thiên Hậu thổ, chư vị Tôn thần, ngài Bản cảnh Thành hoàng, ngài Bản xứ Thổ địa, ngài Định phúc Táo quân cùng các ngài Thần linh cai quản khu đất này.',
      'Hôm nay là {ngayAm} năm {nam}, ngày lành tháng tốt.',
      'Tín chủ con là {tinChu}, ngụ tại {diaChi}.',
      'Nay chúng con khởi công xây dựng, sửa chữa ngôi nhà trên mảnh đất này. Chúng con thành tâm sắm sửa hương hoa, lễ vật, kính cáo chư vị Tôn thần, xin được động thổ.',
      'Cúi xin chư vị chấp thuận, phù hộ cho công việc được thuận lợi, người làm được bình an, công trình sớm hoàn thành, vững bền lâu dài.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Xôi, gà luộc (hoặc thịt luộc)', 'Trầu cau, rượu, nước, muối, gạo', 'Vàng mã', 'Cuốc, xẻng để làm lễ động thổ']
  },
  {
    id: 'khaitruong', title: 'Văn khấn khai trương', group: 'Việc lớn', when: 'Sáng ngày giờ tốt mở cửa hàng, công ty',
    text: [PHAT, LAY_TROI,
      'Con kính lạy Hoàng thiên Hậu thổ, chư vị Tôn thần, ngài Thần Tài, ngài Thổ Địa cùng chư vị Thần linh cai quản khu vực này.',
      'Hôm nay là {ngayAm} năm {nam}, ngày lành tháng tốt.',
      'Tín chủ con là {tinChu}, mở cửa hàng tại {diaChi}.',
      'Chúng con thành tâm sắm sửa hương hoa, lễ vật, kính mời chư vị Tôn thần về chứng giám, phù hộ cho việc khai trương được thuận lợi.',
      'Cúi xin chư vị độ trì cho việc buôn bán hanh thông, khách hàng tấp nập, tài lộc dồi dào, mọi việc như ý.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Heo quay hoặc gà luộc, xôi', 'Trầu cau, rượu, nước, muối, gạo', 'Vàng mã', 'Bánh kẹo, thuốc lá (tùy vùng)']
  },
  {
    id: 'daythang', title: 'Văn khấn đầy tháng', group: 'Việc lớn', when: 'Bé tròn 1 tháng (bé trai thường lùi 1 ngày, bé gái lùi 2 ngày)',
    text: [PHAT, LAY_TROI,
      'Con kính lạy chư vị Tôn thần, mười hai Bà Mụ, ba Đức Ông và chư vị Tiên Bà.',
      LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Vợ chồng con sinh được cháu {tenBe}. Nay cháu tròn một tháng, gia đình thành tâm sắm sửa hương hoa, lễ vật, xôi chè dâng lên trước án.',
      'Kính mong chư vị Tôn thần, các Bà Mụ, Đức Ông và Tổ tiên phù hộ cho cháu hay ăn chóng lớn, mạnh khỏe, ngoan ngoãn, sau này nên người.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Xôi, chè (12 đĩa nhỏ cho 12 Bà Mụ, 3 đĩa cho Đức Ông)', 'Gà luộc', 'Trầu cau, rượu, nước', 'Giấy tiền, hài, áo các Bà Mụ (tùy vùng)']
  },
  {
    id: 'thoinoi', title: 'Văn khấn thôi nôi', group: 'Việc lớn', when: 'Bé tròn 1 tuổi',
    text: [PHAT, LAY_TROI,
      'Con kính lạy chư vị Tôn thần, mười hai Bà Mụ, ba Đức Ông và chư vị Tiên Bà.',
      LAY_TIEN,
      'Hôm nay là {ngayAm} năm {nam}.',
      TIN_CHU,
      'Cháu {tenBe} nay đã tròn một tuổi. Gia đình thành tâm sắm sửa hương hoa, lễ vật dâng lên, đội ơn chư vị đã che chở cho cháu một năm qua.',
      'Cúi xin chư vị Tôn thần, các Bà Mụ, Đức Ông và Tổ tiên tiếp tục phù hộ cho cháu mạnh khỏe, thông minh, ngoan ngoãn, lớn lên thành người tốt.',
      ...KET],
    mam: ['Hương, nến', 'Hoa tươi', 'Mâm ngũ quả', 'Xôi, chè (12 phần cho Bà Mụ, 3 phần cho Đức Ông)', 'Gà luộc hoặc heo quay', 'Trầu cau, rượu, nước', 'Mâm đồ chơi cho bé "bốc thôi nôi" (sách, bút, kéo, tiền…)']
  }
];

export const occasion = (id) => OCCASIONS.find((o) => o.id === id);

/** Văn khấn phù hợp với một sự kiện trong lịch (null nếu không có) */
export function vanKhanFor(ev) {
  if (!ev) return null;
  const l = ev.lunar || {};
  if (ev.kind === 'gio') {
    if (ev.gio && ev.gio.type && ev.gio.type !== 'gio') return null;
    return { tuan: 'cungtuan', 49: 'cungtuan', 100: 'tuan100', giodau: 'giodau', giohet: 'giohet' }[ev.milestone] || 'gio';
  }
  if (l.month === 12 && l.day === 23) return 'ongtao';
  if (l.month === 1 && l.day === 1) return 'tet';
  if (l.month === 1 && (l.day === 3 || l.day === 4)) return 'hoavang';
  if (l.month === 1 && l.day === 10) return 'thantai';
  if (l.month === 1 && l.day === 15) return 'ramgieng';
  if (l.month === 5 && l.day === 5) return 'doanngo';
  if (l.month === 7 && l.day === 15) return 'vulan';
  if (!l.leap && l.day === 15) return 'ram';
  if (!l.leap && l.day === 1) return 'mung1';
  if (l.day === 15) return 'ram';
  if (l.day === 1) return 'mung1';
  return null;
}

export function ngayAmText(day, month, leap = false) {
  const d = day === 15 ? 'ngày Rằm' : day === 1 ? 'ngày mùng Một' : day <= 10 ? `ngày mùng ${day}` : `ngày ${day}`;
  return `${d} tháng ${THANG[month] || LUNAR_MONTH_NAME[month]}${leap ? ' nhuận' : ''}`;
}

/**
 * Điền chỗ trống. ctx: { ngayAm, nam, tinChu, diaChi, hoTen, nguoiMat }
 * Trả về mảng đoạn: mỗi đoạn là mảng mảnh { t: chữ, fill?: true, missing?: true }
 */
export function fillText(paragraphs, ctx) {
  return paragraphs.map((p) => {
    const parts = [];
    let last = 0;
    p.replace(/\{(\w+)\}/g, (m, k, i) => {
      if (i > last) parts.push({ t: p.slice(last, i) });
      const v = ctx[k];
      parts.push(v ? { t: v, fill: true, key: k } : { t: '……', missing: true, key: k });
      last = i + m.length;
      return m;
    });
    if (last < p.length) parts.push({ t: p.slice(last) });
    return parts;
  });
}

/** Văn bản thuần để sao chép / chia sẻ */
export const plainText = (filled) => filled.map((p) => p.map((x) => x.t).join('')).join('\n\n');
