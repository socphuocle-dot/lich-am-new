// Kho tệp của app (ảnh, bản ghi âm) — lưu trong bộ nhớ riêng của app (Filesystem, thư mục Data),
// KHÔNG nằm chung với dữ liệu chữ (localStorage chỉ khoảng 5 MB).
// Trong dữ liệu, ảnh lưu dạng tham chiếu "m:anh/<mã>.jpg"; ảnh cũ dạng data:… vẫn hiển thị được và được tự chuyển ra tệp.
import { Filesystem, Directory } from '@capacitor/filesystem';

export const isRef = (v) => typeof v === 'string' && v.startsWith('m:');
export const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:');
const pathOf = (ref) => ref.slice(2);
/** Chỉ cho phép đường dẫn trong 2 thư mục của app (dùng cả khi khôi phục file sao lưu từ ngoài vào) */
export const SAFE_PATH = /^(anh|giong-doc)\/[A-Za-z0-9._-]{1,80}$/;

const cache = new Map(); // tham chiếu → blob URL ('' = đang nạp)
let notify = () => {};
let pending = 0;
export const onMediaReady = (fn) => { notify = fn; };
export function clearMediaCache() { for (const u of cache.values()) if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); cache.clear(); }

const mimeOf = (path) => (/\.jpe?g$/i.test(path) ? 'image/jpeg' : /\.png$/i.test(path) ? 'image/png' : 'application/octet-stream');

export async function readB64(path) {
  const r = await Filesystem.readFile({ path, directory: Directory.Data });
  if (typeof r.data === 'string') return r.data;
  return await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1] || ''); fr.onerror = rej; fr.readAsDataURL(r.data); });
}
export async function writeB64(path, data) {
  if (!SAFE_PATH.test(path)) throw new Error('Đường dẫn tệp không hợp lệ');
  await Filesystem.writeFile({ path, data, directory: Directory.Data, recursive: true });
}
export async function exists(path) {
  try { await Filesystem.stat({ path, directory: Directory.Data }); return true; } catch { return false; }
}

/** Nguồn ảnh để đặt vào <img src>: data URL giữ nguyên; tham chiếu tệp → blob URL (nạp nền, xong thì vẽ lại) */
export function mediaSrc(v) {
  if (!v) return '';
  if (!isRef(v)) return v;
  if (cache.has(v)) return cache.get(v);
  cache.set(v, '');
  pending++;
  readB64(pathOf(v)).then((b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    cache.set(v, URL.createObjectURL(new Blob([bytes], { type: mimeOf(v) })));
  }).catch(() => cache.set(v, '')).finally(() => { if (--pending === 0) notify(); });
  return '';
}

const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Lưu ảnh (data URL) ra tệp; trả tham chiếu "m:anh/…" */
export async function putPhoto(dataUrl) {
  const m = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || '');
  if (!m) throw new Error('Ảnh không hợp lệ');
  const path = `anh/${rid()}.${m[1] === 'image/png' ? 'png' : 'jpg'}`;
  await writeB64(path, m[2]);
  const ref = 'm:' + path;
  cache.set(ref, dataUrl);
  return ref;
}

export async function deleteMedia(ref) {
  if (!isRef(ref)) return;
  cache.delete(ref);
  try { await Filesystem.deleteFile({ path: pathOf(ref), directory: Directory.Data }); } catch { /* chưa có */ }
}

/** Ảnh trong form: giữ nguyên nếu không đổi; ảnh mới (data URL) → lưu tệp; ảnh cũ bị thay/bỏ → xóa tệp */
export async function commitPhoto(next, prev) {
  if (next === prev) return next || '';
  const ref = isDataUrl(next) ? await putPhoto(next) : next || '';
  if (prev && prev !== ref) await deleteMedia(prev);
  return ref;
}

/** Mọi tệp mà dữ liệu đang dùng (để đưa vào file sao lưu) */
export function mediaPaths(state) {
  const out = new Set();
  for (const g of state.gios || []) for (const k of ['photo', 'gPhoto']) { const v = g.memo?.[k]; if (isRef(v)) out.add(pathOf(v)); }
  for (const id of Object.keys(state.voices || {})) out.add(`giong-doc/${id}.bin`);
  for (const p of state.people || []) for (const r of p.recs || []) out.add(`giong-doc/kyuc-${p.id}-${r.id}.bin`);
  return [...out].filter((p) => SAFE_PATH.test(p));
}

/** Chuyển ảnh cũ (data URL nằm trong dữ liệu) ra tệp riêng. Trả số ảnh đã chuyển */
export async function migratePhotos(getState, setState) {
  const st = getState();
  const todo = [];
  for (const g of st.gios) for (const k of ['photo', 'gPhoto']) if (isDataUrl(g.memo?.[k])) todo.push([g.id, k, g.memo[k]]);
  if (!todo.length) return 0;
  const done = [];
  for (const [id, k, url] of todo) {
    try { done.push([id, k, url, await putPhoto(url)]); } catch { /* để lần sau */ }
  }
  if (!done.length) return 0;
  setState((s) => ({ ...s, gios: s.gios.map((g) => {
    const mine = done.filter((d) => d[0] === g.id && g.memo?.[d[1]] === d[2]);
    if (!mine.length) return g;
    const memo = { ...g.memo };
    for (const [, k, , ref] of mine) memo[k] = ref;
    return { ...g, memo };
  }) }));
  return done.length;
}

/** Dọn tệp ảnh không còn được dùng (chỉ tệp cũ hơn 1 ngày, để không xóa nhầm ảnh vừa chọn mà chưa bấm Lưu) */
export async function gcMedia(state) {
  const used = new Set(mediaPaths(state));
  let files = [];
  try { files = (await Filesystem.readdir({ path: 'anh', directory: Directory.Data })).files || []; } catch { return 0; }
  let n = 0;
  for (const f of files) {
    const name = typeof f === 'string' ? f : f.name;
    const path = 'anh/' + name;
    const mtime = typeof f === 'object' ? Number(f.mtime) || 0 : 0;
    if (used.has(path) || !mtime || Date.now() - mtime < 864e5) continue;
    try { await Filesystem.deleteFile({ path, directory: Directory.Data }); n++; } catch { /* */ }
  }
  return n;
}
