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
Muốn khách Android nhận bản mới: tạo release mới với tag lớn hơn (`v1.0.1`, `v1.5.1`…). Link tải APK cũ tự trỏ sang bản mới.

## Lưu ý quan trọng

- **"Vĩnh viễn"**: trang web và link tải còn mãi chừng nào tài khoản GitHub còn hoạt động và kho còn để Public. Đừng xóa kho, đừng đổi tên tài khoản/kho (link sẽ đổi theo).
- **iPhone**: bản web là cách miễn phí lâu dài. File `.ipa` cài bằng Sideloadly chỉ chạy 7 ngày với Apple ID miễn phí. Muốn có app thật trên App Store cần tài khoản Apple Developer (99 USD/năm).
- **Bản web không tự gửi thông báo nhắc** khi đóng (giới hạn của trình duyệt). App Android thì nhắc đầy đủ.
- **Google Play** (25 USD, trả một lần): giúp khách tìm thấy app dễ hơn. Phải build bản cửa hàng (ẩn mã QR) theo README mục 4, nộp file `.aab`.
- Tên miền riêng (vd. `licham.vn`): mua tên miền rồi khai ở **Settings → Pages → Custom domain**.

---

## Cập nhật lên phiên bản mới (ví dụ 1.15.1)

1. Giải nén bản mã nguồn mới, **chép đè** vào thư mục repo `lich-am-new` trên máy (giữ nguyên thư mục `.git`).
2. Mở **GitHub Desktop** → thấy danh sách file thay đổi → ô Summary gõ `Bản 1.15.1` → **Commit to main** → **Push origin**.
3. Vào repo trên GitHub → **Releases** → **Draft a new release** → **Choose a tag** gõ `v1.15.1` → **Create new tag** → Title `Lịch Âm & Nhắc Giỗ 1.15.1` → **Publish release**.
4. Đợi tab **Actions** chạy xanh (~10 phút). Link tải APK cố định không đổi, khách tải lại là có bản mới (cài đè, giữ nguyên dữ liệu vì cùng khóa ký).

## Có gì mới ở 1.15.1 — chuẩn bị bản iPhone
- Xem **HUONG-DAN-IOS.md**: tài khoản Apple, đăng ký mã app + App Group, khóa API, Secrets trên GitHub, TestFlight.
- Bước **ios** trên GitHub: build theo kênh cửa hàng (`VITE_CHANNEL=store`, `VITE_CULTURE=off`), kiểm tra Xcode ≥ 26, số phiên bản lấy từ package.json, số build = số lần chạy. Có đủ 4 Secret Apple (`APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`) thì tự ký và gửi lên TestFlight; chưa có thì build `.ipa` chưa ký. Lỗi biên dịch được lọc ra trang tóm tắt và artifact `ios-build-log`.
- Bước ios chỉ chạy khi gắn tag, bấm chạy tay hoặc Pull Request (máy Mac của GitHub hay thiếu chỗ); lỗi/hủy ở iOS không làm hỏng bản phát hành Android.
- Thêm `PrivacyInfo.xcprivacy` (app + widget), `ITSAppUsesNonExemptEncryption = NO`.
- Bản cửa hàng (Google Play, App Store): màn ủng hộ bỏ chọn mức tiền, thay bằng nút **Đánh giá 5 sao** (Play / App Store theo máy; App Store cần Variable `APPSTORE_ID`) và **Giới thiệu app**.

## Có gì mới ở 1.15.0 — kiểm tra tự động, Google Play, widget chọn riêng, đọc văn khấn đúng giờ
- **Kiểm tra tự động mỗi lần đẩy mã** (`.github/workflows/build.yml`): ngoài kiểm thử mã, nay chạy cả 40 kịch bản bấm thử giao diện và kiểm tra trợ năng trên GitHub; build Android + iOS; chạy **Android Lint** (bắt lỗi widget, quyền…) và ghi số lỗi ra trang tóm tắt của lần chạy, báo cáo trong artifact `lint-report`. Pull Request cũng được kiểm tra (build bản thử không cần khóa ký). Chạy tại máy: `npm run check`.
- **Google Play**: hướng dẫn từng bước trong `HUONG-DAN-GOOGLE-PLAY.md` (tài khoản, chạy thử kín 12 người × 14 ngày, phát hành). Tùy chọn: cài Secret `PLAY_SERVICE_ACCOUNT_JSON` để mỗi lần gắn tag GitHub tự đẩy AAB lên Play dạng bản nháp; ghi chú "Có gì mới" trong `store/whatsnew/whatsnew-vi-VN`.
- **Mỗi widget chọn nội dung riêng (Android)**: thêm widget Đếm ngược / Đồng hồ là mở màn chọn (mốc Tết, Ông Táo, từng ngày giỗ; kiểu Giấy / Sơn mài). Android 12+: nhấn giữ widget → Cấu hình lại. Lựa chọn lưu theo từng widget, xóa widget thì xóa theo. (iPhone vẫn theo cài đặt trong app.)
- **Đọc văn khấn đúng giờ cúng**: thông báo ngày giỗ, lễ có nút "Đọc văn khấn"; bấm vào thông báo đúng ngày cúng cũng tự đọc (tắt được trong Cài đặt → Thông báo). Ưu tiên giọng người nhà đã ghi âm.

## Có gì mới ở 1.14.0 — widget tự vừa kích thước, widget đồng hồ
- **Widget đổi bố cục theo cỡ thật** (Android 12+ hệ thống tự chọn; Android 8–11 app tính lại mỗi lần kéo):
  - Tờ lịch: 2×1 nằm ngang · 2×2 · 2×3+ thêm việc sắp tới gần nhất và giờ hoàng đạo.
  - Lịch & sắp tới: 4×1 một việc · 4×2 ba việc · 4×3+ sáu việc; các dòng xếp sát, viên "còn mấy ngày" bên phải, "Hôm nay" nền đỏ.
  - Đếm ngược: 1×1 · 2×2 · 4×1 nằm ngang · 4×2+ linh vật lớn.
  - Lịch tháng: 4×3 gọn (chỉ ghi âm mùng 1, rằm, hôm nay) · 4×4+ đủ.
  - Góc bo theo đúng launcher (Android 12+), giới hạn kéo nhỏ được nới ra.
- **Widget mới "Đồng hồ & lịch âm"** (Android 4×1 · 4×2 · 4×3; iPhone cỡ vừa, lớn):
  - Kiểu **Giấy** (ô ngày đỏ + đồng hồ) hoặc **Sơn mài** (dải đỏ ngang) — chọn ở Cài đặt → Widget màn hình chính.
  - Android dùng đồng hồ hệ thống (TextClock): tự chạy, đúng giờ, không tốn pin; bấm vào giờ mở báo thức. Giờ hoàng đạo tự đổi đầu mỗi giờ âm (báo thức nhẹ, không đánh thức máy).
  - iPhone: mỗi phút một mục trong 3 giờ tới (cách các app đồng hồ trên App Store vẫn làm) — có thể trễ vài giây khi máy tiết kiệm pin.
- iPhone thêm cỡ lớn cho "Lịch & sắp tới" (7 việc) và cỡ vừa cho "Đếm ngược".
- Mã: `BaseWidget.java` (lớp chung), `WidgetUpdater.variants()` (bảng cỡ → bố cục), layout mới `widget_*_wide/_tall/_line/_mini/_big`, `widget_clock_b*` (Giấy), `widget_clock_c*` (Sơn mài).

## Có gì mới ở 1.13.1
- Lề hai bên trên điện thoại hẹp lại từ 20px còn 12px (biến `--gutter` trong styles.css; máy tính bảng ≥600px giữ 20px). Thanh tiêu đề, thanh nút Lưu, nút + nổi cũng theo lề mới.

## Có gì mới ở 1.13.0 — an toàn dữ liệu, chế độ đơn giản, nhật ký lỗi
- **Sao lưu đầy đủ**: "Sao lưu ra file" và "Sao lưu lên Google Drive / iCloud" nay đóng gói cả ảnh tưởng nhớ, ảnh mộ, giọng đọc văn khấn, lời kể của ông bà (file định dạng 2). "Khôi phục từ file" ghi lại các tệp vào máy rồi mới nạp dữ liệu; vẫn đọc được file sao lưu cũ. Đường dẫn tệp trong file sao lưu được kiểm tra chặt (chỉ thư mục ảnh, giọng đọc của app).
- **Ảnh lưu riêng**: ảnh không còn nằm trong dữ liệu chữ (giới hạn ~5 MB). Lần đầu mở bản mới, app tự chuyển ảnh cũ ra bộ nhớ riêng (chạy nền) và dọn ảnh không còn dùng.
- **Báo khi đầy bộ nhớ**: lưu thất bại thì hiện thông báo kèm nút "Xem cách xử lý" (không còn âm thầm mất thay đổi). Cài đặt → Dữ liệu có thanh dung lượng, số ảnh, số bản ghi.
- **Chế độ đơn giản**: màn chào lần đầu thêm bước "Bạn hay dùng app để làm gì?" (5 nhóm việc). App ghim sẵn tiện ích phù hợp; bật chế độ đơn giản thì chữ to, tab Tiện ích chỉ hiện nhóm đã chọn (có nút "Xem tất cả tiện ích"), Hôm nay bớt mục ít dùng. Đổi lại ở Cài đặt → Hiển thị.
- **Nhật ký lỗi**: app ghi lại lỗi trên máy (tối đa 80 dòng, không có dữ liệu cá nhân). Góp ý & báo lỗi → "Kèm nhật ký lỗi", xem, gửi riêng, xóa. Cá nhân hiện số lỗi nếu có.
- **KIEM-THU-TREN-MAY.md**: danh sách tự thử trên điện thoại thật trước khi phát hành.

## Có gì mới ở 1.12.0 — 6 tiện ích mới
- **In gia phả** (nút máy in trên màn Gia phả, hoặc Tiện ích → In gia phả): vẽ cả cây thành ảnh lớn nền giấy, viền vàng, tiêu đề "Gia phả họ …" (sửa được); "Gửi ảnh" (PNG) hoặc "File PDF" khổ A4/A3, tự xoay ngang/dọc.
- **Tảo mộ** (Tiện ích → Dòng họ): danh sách mộ phần, nút Chỉ đường mở Google Maps; ngày Thanh Minh (có văn khấn); bật nhắc tảo mộ 20 tháng Chạp; danh sách đồ mang theo.
  - Trong trang tưởng nhớ: "Lấy vị trí đang đứng" (GPS) hoặc dán link Google Maps / tọa độ; thêm ảnh mộ. Vị trí mộ gửi kèm khi chia sẻ cả họ (ảnh thì không).
  - Tiết Thanh Minh nay có trong lịch và được nhắc như ngày lễ.
  - App xin thêm quyền **Vị trí** (chỉ khi bấm nút) — đã khai trong AndroidManifest, Info.plist, chính sách riêng tư và hồ sơ Google Play.
- **Sổ quỹ họ**: số dư, sổ thu chi theo việc (giỗ tổ, khuyến học, nhà thờ họ…), đợt đóng góp theo hộ (thêm nhanh từ gia phả, đánh dấu đã đóng), gửi bản tổng kết qua Zalo.
- **Lời kể, lời dặn**: trong màn sửa một người ở gia phả, ghi âm theo chủ đề (tối đa 30 phút/bản), nghe lại, gửi file, xóa. Trang tưởng nhớ của người đó có phần nghe lại.
- **Người ở nước ngoài**: máy khác múi giờ Việt Nam thì trang Hôm nay hiện "Ở quê: giờ, ngày, ngày âm". Cài đặt → "Nhắc theo giờ Việt Nam" để thông báo kêu đúng lúc ở quê đang 7:00.
- **Đọc to lịch hôm nay**: nút "Đọc to" trên tờ lịch.

## Có gì mới ở 1.11.0 — gia phả sơ đồ cây, ghim tiện ích, ủng hộ tác giả
- Gia phả có 3 cách xem: **Sơ đồ** (cây từ trên xuống, mỗi ô là một cặp vợ chồng, đường nối rẽ nhánh xuống các con; nút − / Vừa màn hình / +), **Danh sách** (thụt lề như cũ) và **Theo đời** (Đời 1, Đời 2… kèm "con của ai", mấy con). App nhớ cách xem đã chọn.
- Màn sửa một người có thêm nút "Thêm con", "Thêm vợ/chồng" (dùng khi xem dạng sơ đồ).
- Trang Hôm nay có mục "Tiện ích nhanh" do người dùng tự chọn: bấm "Tùy chỉnh" (hoặc thẻ "Ghim tiện ích ra trang chính" ở tab Tiện ích) để ghim tối đa 8 trong 29 tiện ích, sắp lên/xuống, về mặc định.
- Lời mời "Miễn phí, không quảng cáo · Mời tác giả ly cà phê" thành thẻ nổi bật (ly cà phê bốc khói, nút vàng) ở cuối mọi màn, cùng nút "Mời cà phê" trên đầu các tab Nhắc việc, Tiện ích, Cá nhân. Bản phát hành qua cửa hàng tự đổi thành lời mời đánh giá 5 sao.

## Có gì mới ở 1.10.1 — tối ưu tốc độ và độ mượt
- Mở app nhanh hơn: gói chính nhẹ đi 1/3 (383 KB → 257 KB); các màn ít dùng (Dòng họ, Tết, Sao hạn, Chia sẻ, Văn hóa…) tách gói riêng, tự nạp sẵn lúc máy rảnh.
- Hình minh họa (linh vật, 12 con giáp, biểu tượng màu) vẽ thành ảnh nhúng: mỗi màn ít hơn hàng trăm nút giao diện (Cài đặt 1025 → 323, Tiện ích 664 → 282, Hôm nay 514 → 245).
- Lịch âm tính một lần rồi nhớ (bộ nhớ đệm): lịch tháng, danh sách nhắc việc dựng nhanh hơn.
- Mã QR chia sẻ tạo sau khi màn đã hiện, không làm khựng.
- Bỏ hiệu ứng làm mờ nền thanh tab và bóng lọc trên từng biểu tượng nhỏ (nặng khi cuộn trên Android tầm trung); hiệu ứng vào màn gọn một khối.
- Phần nằm ngoài màn hình chưa vẽ cho tới khi cuộn tới; xử lý cuộn gộp theo khung hình.

## Có gì mới ở 1.10.0 — điều hướng làm lại theo chuẩn
- 5 tab ngang hàng: Hôm nay · Lịch · Nhắc việc · Tiện ích · **Cá nhân** (thay tab "Ủng hộ"; Ủng hộ, Cài đặt, Góp ý, Có gì mới nằm trong Cá nhân).
- Thanh tab hiện trên mọi màn (trừ biểu mẫu đang nhập), luôn sáng đúng tab đang ở.
- Mỗi tab nhớ chỗ đang xem: sang tab khác rồi quay lại vẫn đúng màn cũ. Bấm lại tab đang mở để về đầu tab.
- Nút Quay lại (trên màn và nút cứng Android) lùi đúng một bước, giữ vị trí cuộn; màn gốc của tab không có nút Quay lại.
- Lưu xong biểu mẫu thì đóng biểu mẫu, quay về đúng màn đã mở nó (không chồng màn mới, bấm Quay lại không mở lại biểu mẫu).
- Mở từ thông báo, widget, link: Quay lại về màn gốc của tab tương ứng.
- Android: ở màn Hôm nay bấm Quay lại 2 lần để thoát; hộp thoại đang mở thì Quay lại sẽ đóng hộp thoại trước.
- Hiệu ứng chuyển màn theo hướng đi (tới: trượt từ phải, lùi: trượt từ trái, đổi tab: hiện dần).
- Sửa lỗi: gõ tên ở Sổ hiếu hỉ rồi bấm Lưu ngay đôi khi không ăn.

## Có gì mới ở 1.9.4
- Chọn linh vật theo ý thích trong Cài đặt: đủ 12 con giáp (Chuột, Trâu, Hổ, Mèo, Rồng, Rắn, Ngựa, Dê, Khỉ, Gà, Chó, Heo) và Bé Thỏ Ngọc, Lân Con; con giáp đúng tuổi được đánh dấu "tuổi bạn" (đủ 9 dáng: vẫy tay, cầm đèn lồng, chắp tay, ngôi sao, bánh sinh nhật, phong thư, điện thoại, sách, ngồi trăng).
- Widget đổi theo linh vật đã chọn; widget "Bé Thỏ nhắc" đổi tên thành "Lời nhắc hôm nay".

## Có gì mới ở 1.9.2
- Đọc văn khấn 3 kiểu: Thường · Trầm, chậm · Chuông mõ (giọng trầm, ngắt theo vế, chuông mở đầu và kết thúc, mõ gõ nhịp — âm thanh tạo ngay trên máy).
- Ghi âm giọng người thật cho từng bài (ông bà, cha mẹ, thầy ở chùa) hoặc chọn file ghi âm có sẵn; nút lớn đổi thành "Nghe giọng …".
- Xin quyền micro chỉ khi bấm ghi âm (Android RECORD_AUDIO, iPhone NSMicrophoneUsageDescription).

## Có gì mới ở 1.9.1
- Tìm nhanh tiện ích ở đầu trang Tiện ích (gõ không dấu cũng được).
- Chia sẻ cho cả họ gửi kèm gia phả và trang tưởng nhớ (không kèm ảnh); người nhận nhập một chạm, không thêm trùng.
- Thẻ "Có gì mới" hiện một lần trên màn Hôm nay sau khi cập nhật, và màn "Có gì mới" đầy đủ.
- Ngày chay: chấm xanh trên lịch tháng và widget, chọn giờ nhắc (17–21 giờ).
- Widget "Bé Thỏ nhắc" đếm ngược Tết trong tháng cuối năm (Android và iPhone).
- Thư mục store/: hồ sơ Google Play soạn sẵn, 8 ảnh chụp màn hình, ảnh nổi bật, biểu tượng 512.

## Có gì mới ở 1.9.0 — bản Tết Đinh Mùi
- Nhóm "Tết Đinh Mùi" tự lên đầu Tiện ích khi còn dưới 90 ngày đến Tết; màn Hôm nay nhắc khi còn dưới 30 ngày.
- Chuẩn bị Tết: việc cần làm từ 23 tháng Chạp đến hóa vàng, đúng ngày dương, có phân công, nối văn khấn và mâm cúng.
- Tuổi xông đất: gợi ý 8 tuổi hợp nhất với gia chủ và năm mới, có giải thích từng điểm; xem cho người trong gia phả.
- Xuất hành mùng 1–3: giờ tốt, hướng Hỷ thần, Tài thần, tuổi xung ngày.
- Lịch ăn chay 2/4/6/8/10 ngày mỗi tháng: hiện trên màn Hôm nay, nhắc tối hôm trước, tự dời ngày ở tháng thiếu.
- Văn khấn đi lễ chùa, đền, phủ: Đức Ông, Tam Bảo, Thánh Mẫu, Thành Hoàng.
- Mệnh & màu hợp tuổi: mệnh nạp âm, màu hợp, màu nên hạn chế, số hợp, tuổi hợp và xung.

## Có gì mới ở 1.8.0
- Sao hạn & giải hạn (Tiện ích → Xem ngày → Sao hạn):
  - Sao chiếu mệnh (Cửu Diệu) và hạn trong năm theo năm sinh, giới tính; xem năm nay và năm sau.
  - Cách cúng dâng sao: ngày âm hằng tháng, giờ, hướng, số đèn (có hình bày đèn), chữ trên bài vị, 3 ngày cúng sắp tới.
  - Văn khấn dâng sao giải hạn tự điền tên sao, tuổi, hạn; đọc to được; danh sách lễ vật.
  - Xem cho cả nhà: lấy từ Gia phả những người còn sống có năm sinh.
  - Nút nhắc cúng sao đầu năm (tháng Giêng).

## Có gì mới ở 1.7.0
- Nhóm mới "Dòng họ" trong Tiện ích:
  - Gia phả: cây gia đình nhiều đời, thêm con, vợ/chồng; nối với ngày giỗ; gửi gia phả cho người thân.
  - Tưởng nhớ: ảnh, năm sinh – mất, quê quán, nơi an táng, tiểu sử, lời dặn của người đã khuất.
  - Sổ hiếu hỉ: ghi mừng cưới, phúng viếng, tân gia…; tự nhắc lịch sử qua lại khi đáp lễ.
  - Chuẩn bị đám giỗ: việc cần làm theo mốc (trước 1 tuần, 3 ngày, hôm trước, ngày giỗ), phân công, khách mời, ước tính số mâm.
- Xem tuổi làm nhà, cưới hỏi: Kim Lâu, Hoang Ốc, Tam Tai cho 6 năm tới.
- Mâm cúng theo vùng miền Bắc, Trung, Nam cho Tết, giỗ, rằm, ông Táo, Vu Lan, Đoan Ngọ.

## Có gì mới ở 1.6.1
- Số ngày còn lại thành nhãn nhỏ dưới tên sự kiện; tên dài không còn bị bẻ dòng lệch.
- Trăng ngày mùng 1 vẽ viền trăng non thay vì cục tròn xám (app và widget).
- Lời nhắn của Bé Thỏ ngắn gọn hơn; chú thích lịch tháng gọn một dòng.
- Nhãn tiện ích một dòng (Tang lễ, Thiệp mời, Giờ tốt, Chia sẻ, Danh bạ, Sao lưu…).
- Nút Thêm tự ẩn khi cuộn xuống, hiện lại khi cuộn lên.
- Widget lịch tháng Android có chấm màu theo loại; giao diện theo mùa chỉnh màu cho bản tối.

## Có gì mới ở 1.6.0
- Màn Hôm nay sắp lại: "Sắp tới" nằm ngay dưới tờ lịch, đầu màn thoáng hơn, can chi ngày/tháng gọn một cụm.
- Thông báo nhỏ (Đã lưu, Hoàn tác…) không còn đè lên nút Thêm; nút Thêm không che mục cuối.
- Tiêu đề không còn rớt một chữ xuống dòng; chữ phụ to hơn (tối thiểu 13–14px) cho người lớn tuổi.
- Bộ quy chuẩn chung về cỡ chữ, khoảng cách, bo góc, bóng đổ cho mọi màn.
- Lịch tháng: chấm màu theo loại (đỏ giỗ, hồng sinh nhật/kỷ niệm, vàng lễ); mùng 1 và Rằm nổi bật hơn.
- Hiệu ứng mượt: thẻ hiện dần, số ngày "nảy" nhẹ, bấm có độ lún và rung nhẹ.
- Giao diện theo mùa: Tết có cành mai, Trung thu có đèn lồng, Vu Lan có hoa sen; Bé Thỏ đổi dáng theo dịp.
- Widget iPhone đồng bộ với Android: trăng đúng pha, con giáp, Bé Thỏ, icon theo loại; thêm "Ngày hôm nay" kiểu biểu tượng Lịch và "Bé Thỏ nhắc".

## Có gì mới ở 1.5.2
- Widget làm lại toàn bộ: trăng đúng pha theo ngày âm, con giáp của ngày/năm, linh vật Bé Thỏ, biểu tượng màu cho giỗ/sinh nhật/rằm.
- Widget "Ngày hôm nay" 1×1 kiểu biểu tượng lịch iOS (thứ đỏ, số ngày to, ngày âm).
- Widget mới "Bé Thỏ nhắc" (4×1): chào theo giờ, nhắc giỗ/rằm/sinh nhật sắp tới.
- Có ảnh xem trước cho mọi widget khi chọn trong danh sách widget.

## Có gì mới ở 1.5.1
- Sửa: một số máy mở app chỉ thấy màn hình vàng trống. App nay hiện giao diện ngay, không chờ các thành phần của máy (khôi phục sao lưu, link từ widget) — các việc đó chạy nền.
- Nếu vẫn có lỗi khi mở, app hiện thông báo lỗi cụ thể để chụp gửi tác giả thay vì màn hình trống.
- Build Android tự thử lại khi kho thư viện báo quá tải.

## Có gì mới ở 1.5.0
- **Linh vật Bé Thỏ Ngọc** (thỏ trên cung trăng) với 9 dáng: vẫy chào, cầm đèn lồng, chắp tay, cầm sao, bưng bánh, cầm thư, cầm điện thoại, ôm sách, ngồi trên trăng — có lời nhắn theo ngày ở màn Hôm nay.
- **12 con giáp kiểu Việt** (Mão = Mèo, Sửu = Trâu): ở năm/ngày/tháng can chi, giờ hoàng đạo, tuổi xung, tam hợp, giờ tốt, hồ sơ; **con giáp của năm** đứng cạnh Bé Thỏ, tự đổi theo năm âm.
- **Trăng đúng pha** theo ngày âm trên tờ lịch; mây cát tường, đèn lồng, sao lấp lánh.
- **23 biểu tượng màu** (bát hương, bánh sinh nhật, nhẫn cưới, hoa sen, mâm ngũ quả, cá chép ông Táo…) trong ô pastel nổi khối; mỗi bài văn khấn có biểu tượng riêng; băng-rôn minh họa đầu các màn.

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
