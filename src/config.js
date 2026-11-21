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
export const APP_VERSION = '1.0.0';

// Link tải APK mới nhất (GitHub Releases) — workflow tự điền khi build bản web
export const APK_URL = import.meta.env.VITE_APK_URL || '';
