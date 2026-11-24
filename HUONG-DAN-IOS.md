# Build bản iPhone và cài thử qua TestFlight — từng bước

Không cần máy Mac: GitHub build trên máy Mac của họ, ký bằng khóa Apple của anh/chị và gửi thẳng lên TestFlight.
Chưa có khóa Apple thì GitHub vẫn build bản **chưa ký** (`LichAm-NhacGio-unsigned.ipa`) để kiểm tra mã biên dịch được.

## Bước 1 — Tài khoản Apple Developer (99 USD/năm)
1. Vào https://developer.apple.com/programs/enroll → đăng nhập Apple ID (nên bật xác thực 2 lớp) → đăng ký **Cá nhân** (Individual).
2. Trả phí, chờ Apple duyệt (vài giờ đến 2 ngày).
3. Vào https://developer.apple.com/account → **Membership details** → chép **Team ID** (10 ký tự, vd `AB12CD34EF`).

## Bước 2 — Đăng ký mã app và nhóm dữ liệu (làm 1 lần)
Tại https://developer.apple.com/account/resources/identifiers :
1. Bấm **+** → **App Groups** → Identifier: `group.vn.lichamnhacgio.app` → Register.
2. Bấm **+** → **App IDs** → App → Bundle ID (Explicit): `vn.lichamnhacgio.app` → tick **App Groups** → Configure → chọn nhóm ở trên → Register.
3. Lặp lại cho widget: Bundle ID `vn.lichamnhacgio.app.LichAmWidget`, cũng tick **App Groups** và chọn cùng nhóm.

(Nhóm dữ liệu chung để widget đọc được ngày giỗ, linh vật… mà app ghi.)

## Bước 3 — Tạo app trên App Store Connect
1. https://appstoreconnect.apple.com → **Apps** → **+** → **New App**.
2. Nền tảng **iOS** · Tên `Lịch Âm & Nhắc Giỗ` · Ngôn ngữ chính **Vietnamese** · Bundle ID `vn.lichamnhacgio.app` · SKU `lichamnhacgio`.
3. Mở app vừa tạo → **App Information** → chép **Apple ID** (dãy số, vd `6741234567`) — dùng ở bước 5 để nút "Đánh giá 5 sao" trong app mở đúng trang.

## Bước 4 — Tạo khóa API cho GitHub
1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API** → **Team Keys** → **+**.
2. Tên `GitHub Build` · Quyền **Admin** (cần để GitHub tự tạo chứng chỉ ký) → Generate.
3. **Download API Key** → được file `AuthKey_XXXXXXXXXX.p8` (**chỉ tải được 1 lần**, cất kỹ như khóa ký Android).
4. Chép **Key ID** (dòng của khóa) và **Issuer ID** (phía trên bảng).

## Bước 5 — Đưa khóa lên GitHub
Kho `lich-am-new` → **Settings → Secrets and variables → Actions**:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `APPLE_TEAM_ID` | Team ID (bước 1) |
| Secret | `ASC_KEY_ID` | Key ID (bước 4) |
| Secret | `ASC_ISSUER_ID` | Issuer ID (bước 4) |
| Secret | `ASC_KEY_P8` | Mở file `.p8` bằng Notepad, chép **toàn bộ** (cả dòng `-----BEGIN PRIVATE KEY-----` và `-----END…`) |
| Variable (tab Variables) | `APPSTORE_ID` | Apple ID của app (bước 3) |

## Bước 6 — Build và gửi lên TestFlight
- Gắn tag phiên bản mới (vd `v1.15.1`) như mọi lần, **hoặc** vào **Actions → Build & Publish → Run workflow** (nhánh main) để build iPhone mà không phát hành Android.
- Bước **ios** chạy khoảng 15–25 phút. Xong sẽ có dòng "Đã gửi bản … lên TestFlight" ở trang tóm tắt.
- Nếu bước ios bị hủy với lỗi *"The job was not acquired by Runner"*: do GitHub thiếu máy Mac, không phải lỗi app → **Re-run jobs → Re-run failed jobs** (có thể phải chờ vài giờ, buổi tối giờ Việt Nam thường dễ hơn).
- Nếu báo đỏ kèm dòng `error:` → tải artifact `ios-build-log` hoặc chụp các dòng `error:` gửi để sửa.

## Bước 7 — Cài lên iPhone
1. App Store Connect → app → **TestFlight**. Bản build hiện sau 10–30 phút (Apple xử lý).
2. **Internal Testing** → tạo nhóm → thêm chính anh/chị (và tối đa 100 người trong nhóm, cần là thành viên tài khoản). Muốn mời người ngoài (tới 10.000 người) dùng **External Testing** — lần đầu Apple duyệt nhanh khoảng 1 ngày.
3. Trên iPhone: cài app **TestFlight** từ App Store → mở thư mời → **Install**.
4. Mỗi lần có bản mới, TestFlight báo cập nhật. Bản TestFlight dùng được 90 ngày.

## Bước 8 — Phát hành lên App Store (khi đã thử ổn)
Trong App Store Connect, mục phiên bản **1.0 Prepare for Submission**:
- **Ảnh chụp**: iPhone 6.9" (1320×2868) — bắt buộc. App đang khai chạy cả trên iPad nên cần thêm iPad 13" (2064×2752). (Có thể nhờ tạo bộ ảnh này.)
- **Mô tả, từ khóa**: lấy từ `store/HO-SO-GOOGLE-PLAY.md` (mô tả ngắn → "Subtitle", mô tả đầy đủ → "Description").
- **Privacy Policy URL**: `https://socphuocle-dot.github.io/lich-am-new/privacy.html`
- **App Privacy**: chọn **Data Not Collected** (app không thu thập dữ liệu).
- **Age Rating**: trả lời bảng câu hỏi (không có nội dung nhạy cảm).
- **Review notes**: "App không cần đăng nhập. Mọi dữ liệu lưu trên máy."
- Chọn bản build từ TestFlight → **Submit for Review** (thường 1–2 ngày).

## Đã chuẩn bị sẵn trong mã (bản 1.15.1)
- Bản iPhone build theo chuẩn cửa hàng: **không** có mã QR chuyển khoản, link tải APK, kiểm tra bản mới; nút ủng hộ thành "Đánh giá 5 sao" + "Giới thiệu app" (đúng quy định thanh toán của Apple). Tab Văn hóa (Tử Vi…) ẩn mặc định, người dùng bật lại được.
- File khai báo quyền riêng tư `PrivacyInfo.xcprivacy` cho app và widget; khai báo không dùng mã hóa đặc biệt (khỏi trả lời câu hỏi xuất khẩu mỗi lần gửi bản).
- Số phiên bản tự lấy từ `package.json`, số build tăng theo mỗi lần chạy GitHub.
- Xcode 26 trở lên (Apple bắt buộc từ 28/4/2026) — GitHub tự kiểm tra và báo nếu thiếu.
