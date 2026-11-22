# Hướng dẫn đưa app lên GitHub và phát hành cho khách (miễn phí)

Sau khi làm xong, bạn có:
- **Trang web chạy app**: `https://<tên-tài-khoản>.github.io/<tên-kho>/` — khách mở bằng trình duyệt (Android, iPhone, máy tính), thêm vào màn hình chính, chạy được cả khi mất mạng.
- **Link tải APK cố định**: `https://github.com/<tên-tài-khoản>/<tên-kho>/releases/latest/download/LichAm-NhacGio.apk` — luôn trỏ tới bản mới nhất, gửi cho khách một lần là dùng mãi.
- Mỗi lần sửa code và đẩy lên, GitHub tự test, tự build, tự cập nhật trang web.

> Kho phải để **Public** thì GitHub Pages và máy build mới miễn phí không giới hạn. Không lo lộ khóa ký: khóa nằm trong **Secrets** (mã hóa), không nằm trong code.

## Bước 1 — Tạo tài khoản

Vào https://github.com → **Sign up** (dùng email thật, bật xác thực 2 lớp). Tên tài khoản sẽ nằm trong link gửi khách, nên chọn tên ngắn, dễ nhớ.

## Bước 2 — Đưa code lên (dùng GitHub Desktop, không cần gõ lệnh)

> Trang web của GitHub chỉ cho kéo thả tối đa 100 file một lần, project có gần 200 file, nên dùng GitHub Desktop cho chắc.

1. Giải nén `LichAm-NhacGio-source.zip` ra, ví dụ `D:\lich-am\app`.
2. Tải và cài **GitHub Desktop**: https://desktop.github.com → đăng nhập tài khoản GitHub.
3. **File → Add local repository** → chọn thư mục `app` → nó báo "not a Git repository" → bấm **create a repository** → **Create repository**.
4. Bấm **Publish repository** (góc trên):
   - Name: `lich-am`
   - **Bỏ tích** "Keep this code private" (để Public).
   - Bấm **Publish repository**.

(Nếu đã tạo kho trống ở Bước 1 trùng tên thì xóa kho đó trước, hoặc đặt tên khác ở đây — GitHub Desktop tự tạo kho.)

Về sau, mỗi lần sửa code: mở GitHub Desktop → gõ mô tả ở ô **Summary** → **Commit to main** → **Push origin**.

**Nếu quen dòng lệnh**, cài https://git-scm.com rồi trong thư mục `app`:
```
git init
git add .
git commit -m "Phiên bản đầu tiên"
git branch -M main
git remote add origin https://github.com/<tên-tài-khoản>/lich-am.git
git push -u origin main
```

## Bước 3 — Thêm khóa ký Android vào Secrets

Mở file trong gói **KHOA-KY-GIU-KIN.zip** (gửi riêng, cất kỹ, không chia sẻ).

1. Trong kho: **Settings → Secrets and variables → Actions → New repository secret**.
2. Tạo 2 secret:
   | Name | Secret (dán nội dung file) |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | toàn bộ nội dung `ANDROID_KEYSTORE_BASE64.txt` |
   | `ANDROID_KEYSTORE_PASSWORD` | nội dung `ANDROID_KEYSTORE_PASSWORD.txt` |

⚠️ Luôn dùng **cùng một khóa**. Đổi khóa thì khách đã cài app cũ sẽ không cập nhật được.

## Bước 4 — Bật trang web (GitHub Pages)

1. **Settings → Pages**.
2. Mục **Source** chọn **GitHub Actions**.

## Bước 5 — Chạy build

1. Vào tab **Actions**. Nếu GitHub hỏi, bấm **I understand… enable them**.
2. Chọn **Build & Publish → Run workflow → Run workflow** (hoặc đợi tự chạy sau lần đẩy code).
3. Đợi các bước có dấu ✅ (10–20 phút). Bấm vào bước **web** để thấy link trang web.

Nếu bước nào ❌: bấm vào nó, kéo tới dòng đỏ, chụp màn hình gửi lại để sửa.

## Bước 6 — Phát hành phiên bản (tạo link tải APK cố định)

1. Trang kho → **Releases** (cột phải) → **Create a new release**.
2. **Choose a tag** → gõ `v1.0.0` → **Create new tag**.
3. Bấm **Publish release**.
4. GitHub tự build và gắn file `LichAm-NhacGio.apk`, `.aab`, `.ipa` vào bản phát hành (khoảng 15 phút).

Link gửi khách:
- Android: `https://github.com/<tên-tài-khoản>/lich-am/releases/latest/download/LichAm-NhacGio.apk`
- Mọi máy (kể cả iPhone): `https://<tên-tài-khoản>.github.io/lich-am/`

## Cập nhật về sau

Sửa code → GitHub Desktop: Commit → Push → trang web tự cập nhật.
Muốn khách Android nhận bản mới: tạo release mới với tag lớn hơn (`v1.0.1`, `v1.5.0`…). Link tải APK cũ tự trỏ sang bản mới.

## Lưu ý quan trọng

- **"Vĩnh viễn"**: trang web và link tải còn mãi chừng nào tài khoản GitHub còn hoạt động và kho còn để Public. Đừng xóa kho, đừng đổi tên tài khoản/kho (link sẽ đổi theo).
- **iPhone**: bản web là cách miễn phí lâu dài. File `.ipa` cài bằng Sideloadly chỉ chạy 7 ngày với Apple ID miễn phí. Muốn có app thật trên App Store cần tài khoản Apple Developer (99 USD/năm).
- **Bản web không tự gửi thông báo nhắc** khi đóng (giới hạn của trình duyệt). App Android thì nhắc đầy đủ.
- **Google Play** (25 USD, trả một lần): giúp khách tìm thấy app dễ hơn. Phải build bản cửa hàng (ẩn mã QR) theo README mục 4, nộp file `.aab`.
- Tên miền riêng (vd. `licham.vn`): mua tên miền rồi khai ở **Settings → Pages → Custom domain**.

---

## Cập nhật lên phiên bản mới (ví dụ 1.5.0)

1. Giải nén bản mã nguồn mới, **chép đè** vào thư mục repo `lich-am-new` trên máy (giữ nguyên thư mục `.git`).
2. Mở **GitHub Desktop** → thấy danh sách file thay đổi → ô Summary gõ `Bản 1.5.0` → **Commit to main** → **Push origin**.
3. Vào repo trên GitHub → **Releases** → **Draft a new release** → **Choose a tag** gõ `v1.5.0` → **Create new tag** → Title `Lịch Âm & Nhắc Giỗ 1.5.0` → **Publish release**.
4. Đợi tab **Actions** chạy xanh (~10 phút). Link tải APK cố định không đổi, khách tải lại là có bản mới (cài đè, giữ nguyên dữ liệu vì cùng khóa ký).

## Có gì mới ở 1.5.0
- **Linh vật Bé Thỏ Ngọc** (thỏ trên cung trăng) với 9 dáng: vẫy chào, cầm đèn lồng, chắp tay, cầm sao, bưng bánh, cầm thư, cầm điện thoại, ôm sách, ngồi trên trăng — có lời nhắn theo ngày ở màn Hôm nay.
- **12 con giáp kiểu Việt** (Mão = Mèo, Sửu = Trâu): ở năm/ngày/tháng can chi, giờ hoàng đạo, tuổi xung, tam hợp, giờ tốt, hồ sơ; **con giáp của năm** đứng cạnh Bé Thỏ, tự đổi theo năm âm.
- **Trăng đúng pha** theo ngày âm trên tờ lịch; mây cát tường, đèn lồng, sao lấp lánh.
- **23 biểu tượng màu** (bát hương, bánh sinh nhật, nhẫn cưới, hoa sen, mâm ngũ quả, cá chép ông Táo…) trong ô pastel nổi khối; mỗi bài văn khấn có biểu tượng riêng; băng-rôn minh họa đầu các màn.
- Build: thống nhất một phiên bản Kotlin cho mọi plugin Android.

## Có gì mới ở 1.4.0
- **Người mới mất**: bật khi thêm ngày giỗ → app tự tính và nhắc cúng tuần đầu (7 ngày), 49 ngày, 100 ngày, giỗ đầu (tiểu tường), giỗ hết (đại tường).
- **9 bài văn khấn mới**: cúng tuần / 49 ngày, 100 ngày, giỗ đầu, giỗ hết, nhập trạch, động thổ, khai trương, đầy tháng, thôi nôi (tổng 24 bài, kèm mâm cúng). Chọn người đã khuất ngay trong bài khấn.
- **Xem ngày tốt chi tiết**: thêm Nhị thập bát tú, sao Thiên Đức, Nguyệt Đức, hướng xuất hành (Hỷ thần, Tài thần); trực và sao hiện luôn ở màn Lịch. Ngày tốt khai trương / động thổ / về nhà mới có nút mở văn khấn tương ứng.
- **Góp ý & báo lỗi** (Cài đặt): gửi qua Zalo, email hoặc GitHub, tự kèm phiên bản app và đời máy.
- **Tab Tiện ích** thay tab Văn hóa: danh mục dịch vụ gom 5 nhóm (Ngày của gia đình, Cúng lễ, Xem ngày, Kết nối gia đình, Văn hóa), biểu tượng 3D đổ bóng; liên hệ tác giả 0903 545 334 (gọi / Zalo).
- **Văn khấn điền sẵn**: thẻ "Thông tin trong bài khấn" — chọn ngày cúng (tự đổi ngày âm, năm can chi), tên gia chủ, địa chỉ, người được khấn (chọn trong danh sách hoặc gõ tên), tên bé; bấm chữ tô màu trong bài để sửa; nút **Đọc to** lớn và tùy chọn **Tự đọc khi mở bài**.
- Nhắc việc có bộ lọc riêng **Sinh nhật, kỷ niệm**; ô ngày sinh nhật màu hồng để dễ phân biệt.

## Có gì mới ở 1.3.0
- **Báo có bản mới** ngay trong app (bản APK): mỗi ngày hỏi GitHub 1 lần, có thẻ "Tải bản mới" trên màn Hôm nay; tắt được trong Cài đặt → Cập nhật.
- **Chia sẻ cho cả họ**: chọn ngày giỗ → gửi link qua Zalo hoặc cho quét mã QR; người nhận bấm link là thấy danh sách, nhập 1 chạm, tự bỏ qua ngày đã có.
- **Đọc to văn khấn** bằng giọng tiếng Việt có sẵn trên máy (không cần mạng), chỉnh tốc độ, tô sáng đoạn đang đọc.
- **Widget mở thẳng văn khấn** vào ngày rằm, mùng 1, lễ, ngày giỗ.
- **Trang chính sách quyền riêng tư**: https://socphuocle-dot.github.io/lich-am-new/privacy.html
- **Sẵn sàng lên Google Play**: mỗi bản phát hành có thêm file `LichAm-NhacGio-GooglePlay.aab`; hướng dẫn và ảnh cửa hàng trong `GOOGLE-PLAY.md`, `store-assets/`.
- Sửa iPhone: widget nay nhận được dữ liệu ngày giỗ từ app.

## Có gì mới ở 1.2.0
- **Văn khấn** 15 dịp (giỗ, tiên thường, mùng 1, rằm, Thần Tài, ông Táo, tất niên, giao thừa, mùng 1 Tết, hóa vàng, rằm tháng Giêng, Thanh Minh, Đoan Ngọ, Vu Lan, cúng chúng sinh) — tự điền ngày âm, năm can chi, tên, địa chỉ, người mất; chữ to nhỏ, giữ màn hình sáng, sao chép / gửi.
- **Mâm cúng** từng dịp, đánh dấu đồ đã chuẩn bị.
- **Xem ngày tốt** cho 7 việc (cưới hỏi, khai trương, động thổ, về nhà mới, xuất hành, ký kết, mua xe) theo hoàng đạo, 12 trực, Tam nương, Nguyệt kỵ, tuổi xung; cảnh báo Kim lâu, Tam tai, Hoang ốc.
- **Thiệp mời giỗ** dạng ảnh, gửi Zalo / Messenger.
- **Đổi ngày âm ↔ dương** ngay trên màn Hôm nay; hàng tiện ích 4 nút.
- **Nhấn giữ một ngày** trên Lịch để thêm nhanh giỗ / sinh nhật / kỷ niệm.
- Thông báo có nút **Xem văn khấn** và **Nhắc lại sau 1 giờ**; bấm thông báo mở thẳng bài khấn.
- Tìm kiếm, nhóm **Bên Nội / Bên Ngoại**, sắp xếp theo ngày gần nhất.
- Màn chào có bước bật đồng bộ Google Calendar.
- Sửa: giờ 24h (19:00 thay 07:00 PM), nút Thêm thu gọn khi cuộn, chữ không còn vỡ dòng, ngày mặc định là hôm nay.

## Có gì mới ở 1.1.0
- Widget **Ngày hôm nay 1×1** (Android) — trông như icon, tự đổi ngày theo máy lúc nửa đêm.
- Icon mới, màu sơn mài đỏ son – vàng kim, đổ bóng nổi khối; widget thiết kế lại.
- Thêm loại **Sinh nhật** và **Kỷ niệm** bên cạnh Ngày giỗ.
- **Đồng bộ & sao lưu** (Cài đặt): ghi vào Google Calendar / Lịch iPhone, nhập ngày sinh từ danh bạ, sao lưu lên Google Drive / iCloud Drive, tự khôi phục khi cài lại máy mới.
