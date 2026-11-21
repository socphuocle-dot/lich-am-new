# Lịch Âm & Nhắc Giỗ

App lịch âm, nhắc giỗ / rằm / mùng 1 / lễ Tết, kèm góc Văn hóa (Tử Vi, Thần số học, Kinh Dịch).
**Chạy 100% trên điện thoại, không cần mạng, không server, không thu thập dữ liệu.**

- Web app: Vite + JavaScript thuần · đóng gói bằng **Capacitor 8** cho Android và iOS
- Âm lịch: thuật toán Hồ Ngọc Đức (múi giờ +7) · Tử Vi: thư viện `iztro` (MIT)
- Thông báo: `@capacitor/local-notifications` (lập sẵn 60 thông báo gần nhất, tự lập lại mỗi lần mở app)

---

## 1. Lấy file .apk và .ipa bằng GitHub (không cần máy Mac)

👉 Hướng dẫn đầy đủ từng bước, kèm đưa bản web lên mạng và link tải cố định: **HUONG-DAN-PHAT-HANH.md**


1. Tạo tài khoản https://github.com → **New repository** → đặt tên, chọn **Private** (quan trọng: kho có chứa khóa ký app).
2. Tải project lên: trên trang kho, chọn **uploading an existing file**, kéo cả thư mục project vào (trừ `node_modules` nếu có), bấm **Commit changes**.
   Hoặc dùng Git: `git init && git add . && git commit -m "v1" && git branch -M main && git remote add origin <link kho> && git push -u origin main`
3. Vào tab **Actions** → workflow **Build APK & IPA** tự chạy (≈ 10–20 phút).
4. Chạy xong, kéo xuống mục **Artifacts** để tải:
   - `android-apk-aab` → file **.apk** (cài thẳng lên Android) và **.aab** (để nộp Google Play)
   - `ios-ipa-unsigned` → file **.ipa chưa ký**

## 2. Cài lên điện thoại

**Android:** chép file `.apk` vào máy → mở → cho phép "Cài ứng dụng không rõ nguồn" → Cài đặt.
Lần đầu mở app, bấm **Cho phép** thông báo. Trên Xiaomi/Oppo/Vivo nên bật thêm "Tự khởi chạy" và tắt tối ưu pin cho app để thông báo đến đúng giờ.

**iPhone:** Apple không cho cài .ipa chưa ký trực tiếp. Cách miễn phí:
1. Cài **Sideloadly** (https://sideloadly.io) trên Windows, cắm iPhone bằng cáp.
2. Kéo file `.ipa` vào Sideloadly, đăng nhập Apple ID → Start.
3. Trên iPhone: Cài đặt → Cài đặt chung → Quản lý VPN & thiết bị → tin cậy Apple ID của bạn. Bật **Chế độ nhà phát triển** nếu được hỏi.
4. Apple ID miễn phí: app hết hạn sau **7 ngày**, cần cài lại. Tài khoản Apple Developer (99 USD/năm) dùng được 1 năm và nộp được App Store.

## 3. Tự build APK trên Windows (không cần GitHub)

1. Cài **Node.js 22** và **Android Studio** (bản mới nhất, có sẵn JDK 21).
2. Mở PowerShell trong thư mục project:
   ```
   npm install
   npm run build
   npx cap sync android
   npx cap open android
   ```
3. Trong Android Studio: **Build → Generate App Bundles or APKs → Generate APKs**. File nằm ở `android/app/build/outputs/apk/`.

## 4. Đưa lên Google Play / App Store

Hai cửa hàng **cấm** đặt mã QR chuyển khoản trong app. Build bản cửa hàng bằng:
```
# Windows PowerShell
$env:VITE_CHANNEL="store"; $env:VITE_CULTURE="off"; npm run build; npx cap sync
```
- `VITE_CHANNEL=store` → ẩn mã QR MoMo / Vietcombank.
- `VITE_CULTURE=off` → mặc định ẩn tab Văn hóa (nên dùng cho lần nộp App Store đầu tiên — Apple hay từ chối app bói toán theo mục 4.3(b)). Người dùng vẫn bật lại được trong Cài đặt.
- Muốn nhận ủng hộ trong bản cửa hàng phải làm thêm In-App Purchase (chưa có trong bản này).

## 5. Khóa ký Android — GIỮ KỸ

`release.jks` và `keystore.properties` (gói **KHOA-KY-GIU-KIN.zip**, không nằm trong code) là chữ ký của app. Build trên máy mình: chép `release.jks` vào `android/app/` và `keystore.properties` vào `android/`. Build trên GitHub: dùng Secrets (xem HUONG-DAN-PHAT-HANH.md). **Mất file này thì không cập nhật được app** cho người đã cài (phải gỡ ra cài lại, mất dữ liệu). Hãy sao lưu riêng 2 file này và để kho GitHub ở chế độ Private.

## 6. Widget

| Widget | Android | iPhone |
|---|---|---|
| Tờ lịch (nhỏ 2×2) | ✓ | ✓ (cả StandBy) |
| Lịch & sắp tới (vừa 4×2) | ✓ | ✓ |
| Lịch tháng (lớn 4×4) | ✓ | ✓ |
| Đếm ngược (nhỏ 2×2) — chọn mốc trong app: Cài đặt → Widget | ✓ | ✓ |
| Màn hình khóa: một dòng · tròn · chữ nhật | — (Android chưa hỗ trợ) | ✓ iOS 16+ |

- Chạy offline: âm lịch, can chi, lễ, rằm 2025–2036 đóng gói sẵn trong widget (`npm run widgets:data` sinh lại, tự chạy khi `npm run build`). Ngày giỗ và mốc đếm ngược do app gửi xuống mỗi khi bạn thay đổi.
- Tự đổi ngày lúc nửa đêm (Android: báo thức nửa đêm + cập nhật 30 phút/lần; iPhone: dòng thời gian 7 ngày).
- Sáng/tối theo máy.
- **iPhone cài bằng Sideloadly (Apple ID miễn phí):** chia sẻ dữ liệu app ↔ widget (App Group) có thể không hoạt động → widget vẫn hiện lịch âm, rằm, lễ Tết nhưng **thiếu ngày giỗ**. Với tài khoản Apple Developer: bật App Group `group.vn.lichamnhacgio.app` cho cả 2 bundle id `vn.lichamnhacgio.app` và `vn.lichamnhacgio.app.LichAmWidget`.
- Code: Android `android/app/src/main/java/vn/lichamnhacgio/app/widget/`, iOS `ios/App/LichAmWidget/`. Target widget iOS được thêm bằng `scripts/ios-add-widget.cjs` (đã chạy sẵn).

## 7. Kiểm thử

```
npm test                         # 25 test logic (kể cả dữ liệu widget): Tết 1985–2030, tháng nhuận, đổi lịch 2 chiều 1990–2050 (22.000+ ngày), giỗ, thông báo, Tử Vi, Thần số, Kinh Dịch
npm run build && python3 tests/e2e.py dist shots   # 30 test giao diện (Playwright), chặn toàn bộ mạng ngoài
python3 tests/a11y.py dist                          # kiểm định trợ năng axe-core (WCAG 2.1 AA) + chữ ≥ 12px, 13 màn × sáng/tối
```

## 8. Sửa thông tin

| Muốn đổi | Sửa file |
|---|---|
| Tài khoản / mã QR ủng hộ | `src/config.js`, ảnh trong `public/qr/` |
| Tên app | `capacitor.config.json`, `android/app/src/main/res/values/strings.xml`, `ios/App/App/Info.plist` |
| Phiên bản | `package.json`, `src/config.js`, `android/app/build.gradle` (versionCode +1 mỗi lần cập nhật), Xcode MARKETING_VERSION |
| Ngày lễ | `src/lib/events.js` |
| Lời bình Tử Vi / Kinh Dịch / Thần số | `src/lib/tuvi.js`, `src/lib/iching.js`, `src/lib/numerology.js` |
