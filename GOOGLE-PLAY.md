# Đưa Lịch Âm & Nhắc Giỗ lên Google Play

Mọi thứ cần điền đều có sẵn ở đây — chỉ việc sao chép.

## 1. Tạo tài khoản nhà phát triển (một lần, 25 USD)
1. Vào **play.google.com/console** → đăng nhập Gmail → **Tạo tài khoản**.
2. Chọn **Cá nhân** → điền họ tên LE HUU PHUOC, địa chỉ, số điện thoại → trả phí 25 USD bằng thẻ Visa/Mastercard.
3. Xác minh danh tính bằng CCCD (Google gửi hướng dẫn, thường 1–3 ngày).
4. Tài khoản cá nhân mới phải **thử nghiệm kín với ít nhất 12 người trong 14 ngày** trước khi phát hành công khai — nhờ người thân, bạn bè có Gmail tham gia (bước 5).

## 2. File để tải lên
Mỗi lần gắn tag (ví dụ `v1.3.0`), trang Releases trên GitHub có file **`LichAm-NhacGio-GooglePlay.aab`**.
Bản này tự **ẩn mã QR ủng hộ** và **tắt tự báo bản mới** (Google Play tự cập nhật) để đúng chính sách cửa hàng.

Khi tải lên lần đầu, Play hỏi về **Ký ứng dụng bởi Google Play** → chọn **Sử dụng khóa do Google tạo** (khuyên dùng). Khóa `release.jks` của bạn trở thành *khóa tải lên* — vẫn giữ kín như cũ.

## 3. Thông tin cửa hàng (Store listing)
**Tên ứng dụng** (≤30 ký tự):
```
Lịch Âm & Nhắc Giỗ
```
**Mô tả ngắn** (≤80 ký tự):
```
Lịch âm, nhắc giỗ, rằm, mùng 1, văn khấn và xem ngày tốt. Không cần mạng.
```
**Mô tả đầy đủ:**
```
Lịch Âm & Nhắc Giỗ giúp gia đình bạn không bao giờ quên ngày giỗ, ngày rằm, mùng 1 và lễ Tết — chạy hoàn toàn trên máy, không cần mạng, không quảng cáo, không cần tài khoản.

📅 LỊCH ÂM CHÍNH XÁC
• Tờ lịch hôm nay: ngày âm, can chi, tiết khí, giờ hoàng đạo
• Lịch tháng đánh dấu rằm, mùng 1, ngày giỗ, ngày lễ
• Đổi ngày âm ↔ dương nhanh

🔔 NHẮC GIỖ ĐÚNG HẸN
• Nhập ngày giỗ theo âm lịch, app tự tính ngày dương mỗi năm (kể cả tháng nhuận, tháng thiếu)
• Nhắc trước 1, 3, 7 ngày; nhắc tối hôm trước ngày rằm
• Sinh nhật, ngày kỷ niệm; nhóm Bên Nội / Bên Ngoại
• Chia sẻ danh sách giỗ cho cả họ bằng link hoặc mã QR

🙏 VĂN KHẤN & MÂM CÚNG
• 24 bài văn khấn cổ truyền: giỗ, rằm, mùng 1, Tết, ông Công ông Táo, Vu Lan, nhập trạch, khai trương, đầy tháng…
• Người mới mất: tự nhắc cúng 7 ngày, 49 ngày, 100 ngày, giỗ đầu, giỗ hết
• Tự điền ngày âm, năm can chi, tên gia chủ, người đã khuất
• Đọc to bằng giọng tiếng Việt, chữ to cho người lớn tuổi
• Danh sách mâm cúng từng dịp, đánh dấu đồ đã chuẩn bị

⭐ XEM NGÀY TỐT
• Cưới hỏi, khai trương, động thổ, về nhà mới, xuất hành, ký kết, mua xe
• Theo hoàng đạo, 12 trực, Nhị thập bát tú, Thiên Đức, Nguyệt Đức, Tam nương, Nguyệt kỵ, tuổi xung; hướng xuất hành; cảnh báo Kim lâu, Tam tai, Hoang ốc

💌 THIỆP MỜI GIỖ
• Tạo ảnh thiệp mời đẹp, gửi họ hàng qua Zalo, Messenger

📱 WIDGET MÀN HÌNH CHÍNH
• Ngày hôm nay (1×1), tờ lịch, lịch tháng, sắp tới, đếm ngược Tết / ngày giỗ
• Bấm widget ngày rằm, ngày giỗ → mở thẳng văn khấn

☁️ ĐỒNG BỘ & SAO LƯU
• Ghi ngày giỗ vào Google Calendar
• Nhập ngày sinh từ danh bạ
• Sao lưu lên Google Drive

🔒 RIÊNG TƯ TUYỆT ĐỐI
Không thu thập dữ liệu. Mọi thông tin chỉ nằm trên điện thoại của bạn.

📞 Hỗ trợ: 0903 545 334 (gọi / Zalo) — Lê Hữu Phước
```
**Hình ảnh** (thư mục `store-assets/`):
- Biểu tượng: `bieu-tuong-512.png`
- Ảnh bìa: `anh-bia-1024x500.png`
- Ảnh chụp điện thoại: `anh-1.png` … `anh-6.png` (1080×1920)

**Danh mục:** Lịch (Calendar) · **Thẻ:** Lịch, Năng suất
**Email liên hệ:** Gmail của bạn · **Điện thoại:** 0903545334 (Google cho phép hiện số điện thoại trên trang cửa hàng)
**Chính sách quyền riêng tư:**
```
https://socphuocle-dot.github.io/lich-am-new/privacy.html
```

## 4. Nội dung ứng dụng (App content) — câu trả lời
| Mục | Trả lời |
|---|---|
| Chính sách quyền riêng tư | link ở trên |
| Quảng cáo | **Không** chứa quảng cáo |
| Quyền truy cập ứng dụng | Mọi chức năng dùng được **không cần đăng nhập** |
| Xếp hạng nội dung | Danh mục **Tiện ích / Năng suất**; trả lời **Không** cho mọi câu về bạo lực, tình dục, cờ bạc, ngôn từ… → kết quả 3+ |
| Đối tượng | **18 tuổi trở lên** (tránh thủ tục ứng dụng trẻ em) |
| Ứng dụng tin tức | Không |
| Ứng dụng chính phủ | Không |
| Tính năng tài chính | Không có |
| Sức khỏe | Không |

**An toàn dữ liệu (Data safety):**
- Ứng dụng có thu thập hoặc chia sẻ dữ liệu người dùng không? → **Không**
- Dữ liệu có được mã hóa khi truyền? → Không áp dụng (không truyền dữ liệu)
- Người dùng có thể yêu cầu xóa dữ liệu? → Có (Cài đặt → Xóa toàn bộ dữ liệu, hoặc gỡ app)

> Quyền Lịch và Danh bạ chỉ dùng trên máy, không gửi đi → theo định nghĩa của Google không tính là "thu thập".

## 5. Phát hành
1. **Kiểm thử → Thử nghiệm kín** → Tạo bản phát hành → tải `LichAm-NhacGio-GooglePlay.aab` → thêm danh sách Gmail người thử (≥12) → gửi họ link tham gia.
2. Sau 14 ngày → **Đăng ký quyền truy cập bản phát hành công khai** → trả lời vài câu về quá trình thử nghiệm.
3. Được duyệt → **Phát hành công khai → Tạo bản phát hành** → chọn lại file .aab → **Bắt đầu phát hành**.

Các lần cập nhật sau: gắn tag mới trên GitHub → tải file .aab mới lên **Phát hành công khai** (mã phiên bản tự tăng).

## 6. Ủng hộ trên bản Google Play
Chính sách Google không cho nhận tiền qua mã QR ngân hàng trong app tải từ Play, nên bản Play đã ẩn mã QR. Bạn vẫn giữ mã QR ở **bản APK trên GitHub** và **trang web**; mô tả cửa hàng có thể ghi "Ủng hộ tác giả tại trang web của app".
