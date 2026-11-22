// Cấu hình theo kênh phát hành.
//  - 'direct': APK tự phát hành / IPA cài tay → hiện mã QR MoMo, Vietcombank.
//  - 'store' : App Store / Google Play → ẩn mã QR (chính sách cửa hàng).
export const CHANNEL = import.meta.env.VITE_CHANNEL === 'store' ? 'store' : 'direct';
// Ẩn tab Văn hóa mặc định khi build cho App Store (VITE_CULTURE=off)
export const CULTURE_DEFAULT = import.meta.env.VITE_CULTURE !== 'off';

export const DONATE_ACCOUNTS = [
  { id: 'momo', tab: 'MoMo', bank: 'Ví MoMo', number: '*******166', copy: '', qr: './qr/momo.png' },
  { id: 'vcb', tab: 'Vietcombank', bank: 'Vietcombank', number: '0371000405296', copy: '0371000405296', qr: './qr/vcb.png' }
];
export const DONATE_NAME = 'LE HUU PHUOC';
export const APP_VERSION = '1.9.0';

// Link tải APK mới nhất (GitHub Releases) — workflow tự điền khi build bản web
export const APK_URL = import.meta.env.VITE_APK_URL || 'https://github.com/socphuocle-dot/lich-am-new/releases/latest/download/LichAm-NhacGio.apk';

// Kho GitHub (chủ/tên) — dùng để kiểm tra bản mới và tạo link chia sẻ. Workflow tự điền.
export const REPO = import.meta.env.VITE_REPO || 'socphuocle-dot/lich-am-new';
// Trang web của app (GitHub Pages) — dùng cho link chia sẻ danh sách giỗ
export const WEB_URL = import.meta.env.VITE_WEB_URL || `https://${REPO.split('/')[0]}.github.io/${REPO.split('/')[1]}/`;

// Liên hệ tác giả
export const CONTACT_PHONE = '0903545334';
export const ZALO_URL = 'https://zalo.me/0903545334';
