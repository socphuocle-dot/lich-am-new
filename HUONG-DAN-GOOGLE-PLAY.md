# Đưa Lịch Âm & Nhắc Giỗ lên Google Play — từng bước

Mọi thứ cần tải lên đã có sẵn: file `LichAm-NhacGio-GooglePlay.aab` (GitHub tự build mỗi lần gắn tag),
nội dung cửa hàng, ảnh chụp, chính sách riêng tư trong thư mục `store/` (xem `store/HO-SO-GOOGLE-PLAY.md`).

## Bước 1 — Mở tài khoản nhà phát triển (1 lần, 25 USD)
1. Vào https://play.google.com/console → đăng nhập Gmail → **Tạo tài khoản**.
2. Chọn **Cá nhân** (Personal) — trừ khi anh/chị có công ty và mã D-U-N-S (tài khoản Tổ chức không phải chạy thử 14 ngày, nhưng xác minh lâu hơn).
3. Trả phí 25 USD, xác minh danh tính (CCCD), xác minh số điện thoại.

## Bước 2 — Tạo app
1. Play Console → **Tạo ứng dụng** → Tên: `Lịch Âm & Nhắc Giỗ` · Ngôn ngữ: Tiếng Việt · Ứng dụng · **Miễn phí**.
2. Làm hết danh sách **Thiết lập ứng dụng** (Dashboard), lấy nội dung từ `store/HO-SO-GOOGLE-PLAY.md`:
   - Chính sách quyền riêng tư: `https://socphuocle-dot.github.io/lich-am-new/privacy.html`
   - Quyền truy cập ứng dụng: *Không cần đăng nhập*.
   - Quảng cáo: *Không có quảng cáo*.
   - Phân loại nội dung, Đối tượng mục tiêu (18+ hoặc 13+ — app không nhắm tới trẻ em), An toàn dữ liệu: theo mục 3–4 của hồ sơ.
   - Trang thông tin cửa hàng: tên, mô tả ngắn, mô tả đầy đủ, biểu tượng 512px, ảnh bìa 1024×500, 8 ảnh chụp trong `store/`.

## Bước 3 — Chạy thử kín 14 ngày (bắt buộc với tài khoản cá nhân mới)
Google yêu cầu: **ít nhất 12 người thử, tham gia liên tục 14 ngày** trước khi được phát hành công khai.
1. **Kiểm thử → Kiểm thử kín (Closed testing)** → tạo kênh → thêm danh sách email Gmail của người thử (người nhà, bạn bè — nên mời 15–20 người phòng có người rời).
2. **Tạo bản phát hành** → tải lên `LichAm-NhacGio-GooglePlay.aab` (tải từ trang Releases trên GitHub).
   - Lần đầu Play hỏi **Ký ứng dụng bởi Google Play** → chọn *Dùng khóa do Google tạo* (khóa ký của anh/chị vẫn dùng làm khóa tải lên).
3. Gửi link tham gia thử cho mọi người; nhắc họ **giữ app đủ 14 ngày, không gỡ**.
4. Trong 14 ngày: hạn chế đưa bản mới lên kênh thử kín; nếu cần sửa lỗi, sửa gộp một lần.
5. Hết 14 ngày → **Đăng ký quyền phát hành chính thức (Apply for production)**, trả lời các câu hỏi: ai đã thử, họ góp ý gì, anh/chị đã sửa gì (ghi cụ thể — câu trả lời chung chung hay bị từ chối).

## Bước 4 — Phát hành chính thức
Khi được duyệt: **Phát hành chính thức → Tạo bản phát hành** → chọn AAB mới nhất → gửi xét duyệt (thường 1–3 ngày).

## Bước 5 (không bắt buộc) — Tự đẩy bản mới lên Play mỗi lần gắn tag
GitHub có thể tự đưa AAB lên Play, anh/chị chỉ cần bấm "Phát hành" trong Play Console.
1. Play Console → **Thiết lập → Truy cập API** → liên kết Google Cloud → **Tạo tài khoản dịch vụ** → tải file khóa JSON.
2. Quay lại Play Console → **Người dùng và quyền** → mời email của tài khoản dịch vụ → cấp quyền *Phát hành lên kênh thử nghiệm* (và *chính thức* nếu muốn).
3. GitHub → kho `lich-am-new` → **Settings → Secrets and variables → Actions**:
   - **Secret** `PLAY_SERVICE_ACCOUNT_JSON` = dán toàn bộ nội dung file JSON.
   - (Tùy chọn) **Variables** `PLAY_TRACK` = `internal` | `alpha` (kiểm thử kín) | `production`; `PLAY_STATUS` = `draft` (mặc định, an toàn) hoặc `completed`.
4. Từ đó mỗi lần gắn tag `v…`, bản AAB tự lên kênh đã chọn ở dạng **bản nháp**; vào Play Console xem lại và bấm phát hành.
   - Ghi chú "Có gì mới" lấy từ `store/whatsnew/whatsnew-vi-VN` (tối đa 500 ký tự) — sửa file này trước mỗi lần gắn tag.
   - Lần tải lên **đầu tiên** phải làm tay (bước 3) — Google không cho tải tự động khi app chưa có bản nào.

## Lưu ý
- Bản Google Play (`VITE_CHANNEL=store`) tự ẩn mã QR chuyển khoản, đổi lời mời cà phê thành "Đánh giá 5 sao", không tự báo bản mới (Play lo việc cập nhật) — đúng chính sách thanh toán của Play.
- App đã nhắm Android 16 (API 36), đạt yêu cầu mới nhất của Google Play.
- Bản APK tải trực tiếp trên GitHub vẫn dùng song song cho người không dùng Play.
- iPhone: cần tài khoản Apple Developer (99 USD/năm) và một máy Mac (hoặc dịch vụ build iOS trên mây) để ký và gửi lên App Store; khi sẵn sàng sẽ làm hướng dẫn riêng.
