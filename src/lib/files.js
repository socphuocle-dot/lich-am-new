// Gửi / lưu một file do app tạo (ảnh, PDF): trên điện thoại mở bảng Chia sẻ, trên web tải về.
import { Capacitor } from '@capacitor/core';

export const bytesToBase64 = (u8) => {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
};
export const base64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** Trả 'shared' | 'saved' | 'cancel' */
export async function shareFile({ base64, name, mime, title = '', text = '' }) {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const w = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
      await Share.share({ title, text, files: [w.uri], dialogTitle: 'Gửi hoặc lưu qua…' });
      return 'shared';
    }
    const blob = new Blob([base64ToBytes(base64)], { type: mime });
    const file = typeof File === 'function' ? new File([blob], name, { type: mime }) : null;
    if (file && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title }); return 'shared'; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return 'saved';
  } catch (err) {
    if (/cancel|abort/i.test(String(err?.message || err?.name))) return 'cancel';
    throw err;
  }
}
