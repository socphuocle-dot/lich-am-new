import { describe, it, expect, vi, beforeEach } from 'vitest';

const files = new Map();
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA', Cache: 'CACHE' },
  Filesystem: {
    writeFile: async ({ path, data }) => { files.set(path, data); return { uri: 'file://' + path }; },
    readFile: async ({ path }) => { if (!files.has(path)) throw new Error('nf'); return { data: files.get(path) }; },
    deleteFile: async ({ path }) => { files.delete(path); },
    stat: async ({ path }) => { if (!files.has(path)) throw new Error('nf'); return {}; },
    readdir: async ({ path }) => ({ files: [...files.keys()].filter((k) => k.startsWith(path + '/')).map((k) => ({ name: k.slice(path.length + 1), mtime: 1 })) })
  }
}));

const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => { if (String(v).length > 400000) throw new Error('QuotaExceeded'); mem.set(k, String(v)); }, removeItem: (k) => mem.delete(k) };
const et = new EventTarget();
globalThis.window = globalThis.window || globalThis;
if (!window.addEventListener) { window.addEventListener = et.addEventListener.bind(et); window.dispatchEvent = et.dispatchEvent.bind(et); }
if (!globalThis.CustomEvent) globalThis.CustomEvent = class extends Event { constructor(t, o) { super(t); this.detail = o?.detail; } };

const { mediaPaths, putPhoto, commitPhoto, migratePhotos, SAFE_PATH, gcMedia } = await import('../src/media.js');
const store = await import('../src/store.js');
const { exportFull, restoreFull } = await import('../src/backup.js');

const JPG = 'data:image/jpeg;base64,/9j/AAAA';
beforeEach(() => { files.clear(); store.resetAll(); });

describe('ảnh lưu thành tệp riêng', () => {
  it('chuyển ảnh cũ (data URL trong dữ liệu) ra tệp, dữ liệu chỉ còn tham chiếu', async () => {
    store.setState((s) => ({ ...s, gios: [{ id: 'g1', type: 'gio', name: 'Ông', day: 1, month: 1, cal: 'am', memo: { photo: JPG, gPhoto: JPG, bio: 'x' } }] }));
    expect(await migratePhotos(store.getState, store.setState)).toBe(2);
    const m = store.getState().gios[0].memo;
    expect(m.photo).toMatch(/^m:anh\/[\w.-]+\.jpg$/); expect(m.gPhoto).toMatch(/^m:anh\//); expect(m.bio).toBe('x');
    expect(files.get(m.photo.slice(2))).toBe('/9j/AAAA');
    expect(await migratePhotos(store.getState, store.setState)).toBe(0); // lần 2 không làm gì
  });
  it('đổi ảnh: lưu ảnh mới, xóa tệp ảnh cũ; giữ nguyên thì không đụng', async () => {
    const a = await putPhoto(JPG);
    expect(await commitPhoto(a, a)).toBe(a);
    const b = await commitPhoto(JPG, a);
    expect(b).not.toBe(a); expect(files.has(a.slice(2))).toBe(false); expect(files.has(b.slice(2))).toBe(true);
    expect(await commitPhoto('', b)).toBe(''); expect(files.has(b.slice(2))).toBe(false);
  });
  it('dọn tệp ảnh mồ côi', async () => {
    const keep = await putPhoto(JPG); await putPhoto(JPG);
    const st = { gios: [{ id: 'g', memo: { photo: keep } }], voices: {}, people: [] };
    expect(await gcMedia(st)).toBe(1); expect(files.has(keep.slice(2))).toBe(true);
  });
  it('liệt kê tệp cần sao lưu: ảnh, giọng đọc văn khấn, lời kể', () => {
    const st = { gios: [{ id: 'g', memo: { photo: 'm:anh/a.jpg', gPhoto: 'data:image/jpeg;base64,xx' } }], voices: { ram: {} }, people: [{ id: 'p', recs: [{ id: 'r' }] }] };
    expect(mediaPaths(st).sort()).toEqual(['anh/a.jpg', 'giong-doc/kyuc-p-r.bin', 'giong-doc/ram.bin']);
  });
  it('chặn đường dẫn lạ trong file khôi phục', () => {
    expect(SAFE_PATH.test('anh/x.jpg')).toBe(true);
    expect(SAFE_PATH.test('../x')).toBe(false); expect(SAFE_PATH.test('anh/../../x')).toBe(false); expect(SAFE_PATH.test('khac/x')).toBe(false);
  });
});

describe('sao lưu đầy đủ', () => {
  it('file sao lưu mang theo ảnh + bản ghi âm; khôi phục ghi lại vào máy', async () => {
    const ref = await putPhoto(JPG);
    files.set('giong-doc/kyuc-p-r.bin', 'QUJD');
    files.set('giong-doc/ram.bin', 'REVG');
    store.setState((s) => ({ ...s, gios: [{ id: 'g1', type: 'gio', name: 'Ông', day: 1, month: 1, cal: 'am', memo: { photo: ref } }], voices: { ram: { mime: 'audio/webm' } }, people: [{ id: 'p', name: 'Bà', recs: [{ id: 'r', title: 'Chuyện xưa' }] }] }));
    const { text, files: n } = await exportFull();
    expect(n).toBe(3);
    const obj = JSON.parse(text);
    expect(obj.format).toBe(2); expect(obj.media['giong-doc/kyuc-p-r.bin']).toBe('QUJD');
    // Máy mới: chưa có gì
    files.clear(); store.resetAll();
    obj.media['../hack.js'] = 'eA=='; // tệp lạ bị bỏ qua
    const r = await restoreFull(JSON.stringify(obj));
    expect(r.files).toBe(3);
    expect(files.get('giong-doc/kyuc-p-r.bin')).toBe('QUJD'); expect(files.get(ref.slice(2))).toBe('/9j/AAAA'); expect(files.has('../hack.js')).toBe(false);
    expect(store.getState().people[0].recs[0].title).toBe('Chuyện xưa');
  });
  it('vẫn đọc được file sao lưu kiểu cũ (chỉ có chữ)', async () => {
    const r = await restoreFull(JSON.stringify({ app: 'lich-am-nhac-gio', data: { gios: [{ id: 'x', name: 'Cụ', day: 2, month: 3 }] } }));
    expect(r.files).toBe(0); expect(store.getState().gios).toHaveLength(1);
  });
});

describe('báo khi lưu thất bại vì đầy bộ nhớ', () => {
  it('phát sự kiện và đánh dấu thất bại', () => {
    let fired = 0;
    window.addEventListener('lamng:save-failed', () => { fired++; });
    store.setState((s) => ({ ...s, gios: [{ id: 'big', name: 'x'.repeat(500000), day: 1, month: 1 }] }));
    expect(fired).toBe(1); expect(store.storageInfo().failed).toBe(true);
    store.resetAll(); expect(store.storageInfo().failed).toBe(false);
  });
});

describe('widget đồng hồ', () => {
  it('kiểu widget đồng hồ được gửi xuống widget (mặc định Giấy)', async () => {
    const { buildUserWidgetData } = await import('../src/lib/widgetData.js');
    expect(buildUserWidgetData(new Date(2026, 10, 23), { gios: [], settings: {} }).cs).toBe('giay');
    expect(buildUserWidgetData(new Date(2026, 10, 23), { gios: [], settings: { clockStyle: 'sonmai' } }).cs).toBe('sonmai');
    expect(buildUserWidgetData(new Date(2026, 10, 23), { gios: [], settings: { clockStyle: 'lạ' } }).cs).toBe('giay');
  });
});
