// File sao lưu đầy đủ (bản 2): dữ liệu chữ + ảnh + bản ghi âm (giọng đọc văn khấn, lời kể của ông bà).
import { getState, importData } from './store.js';
import { mediaPaths, readB64, writeB64, SAFE_PATH, clearMediaCache } from './media.js';
import { APP_VERSION } from './config.js';

/** Trả { text, files, missing } — files: số tệp đưa vào được, missing: số tệp không đọc được */
export async function exportFull(state = getState()) {
  const media = {};
  let missing = 0;
  for (const p of mediaPaths(state)) {
    try { media[p] = await readB64(p); } catch { missing++; }
  }
  const text = JSON.stringify({ app: 'lich-am-nhac-gio', format: 2, appVersion: APP_VERSION, exportedAt: new Date().toISOString(), data: state, media });
  return { text, files: Object.keys(media).length, missing };
}

/** Khôi phục từ file (bản 1 chỉ có chữ, bản 2 có kèm tệp). Ghi tệp trước rồi mới nạp dữ liệu. Trả { files } */
export async function restoreFull(text) {
  const obj = JSON.parse(text);
  const data = obj && obj.data ? obj.data : obj;
  if (!data || !Array.isArray(data.gios)) throw new Error('File không đúng định dạng sao lưu');
  let files = 0;
  const media = obj && typeof obj.media === 'object' && obj.media ? obj.media : {};
  for (const [p, b64] of Object.entries(media)) {
    if (!SAFE_PATH.test(p) || typeof b64 !== 'string' || !/^[A-Za-z0-9+/=]*$/.test(b64)) continue;
    await writeB64(p, b64);
    files++;
  }
  clearMediaCache();
  importData(JSON.stringify({ data }));
  return { files };
}

export const sizeText = (chars) => (chars > 1048576 ? (chars / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(chars / 1024)) + ' KB');
