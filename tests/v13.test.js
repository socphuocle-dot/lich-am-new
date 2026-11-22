import { describe, it, expect, vi } from 'vitest';
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false, getPlatform: () => 'web' } }));
const mem = {};
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const { encodeList, decodeList, extractCode, sameEvent } = await import('../src/lib/share.js');
const { cmpVersion } = await import('../src/update.js');
const { speakable } = await import('../src/tts.js');
const { buildUserWidgetData } = await import('../src/lib/widgetData.js');

const gios = [
  { id: 'a', name: 'Nguyễn Văn Bình', rel: 'Ông', cal: 'am', day: 18, month: 10, year: 1990, leap: false, side: 'noi' },
  { id: 'b', type: 'sinhnhat', name: 'Bé Na 🎂', rel: 'Khác', cal: 'duong', day: 2, month: 12, year: '', side: '' }
];

describe('Chia sẻ danh sách giỗ', () => {
  it('mã hóa rồi giải mã giữ nguyên dữ liệu (cả tiếng Việt, emoji)', () => {
    const code = encodeList(gios);
    expect(code).toMatch(/^1[A-Za-z0-9_-]+$/);
    const back = decodeList(code);
    expect(back[0]).toMatchObject({ type: 'gio', name: 'Nguyễn Văn Bình', rel: 'Ông', cal: 'am', day: 18, month: 10, year: 1990, side: 'noi' });
    expect(back[1]).toMatchObject({ type: 'sinhnhat', name: 'Bé Na 🎂', cal: 'duong', day: 2, month: 12, year: '' });
  });
  it('nhận cả link đầy đủ', () => {
    const code = encodeList(gios);
    expect(decodeList(`https://x.github.io/app/#/nhap?d=${code}`).length).toBe(2);
    expect(extractCode('rác')).toBe('');
  });
  it('từ chối mã hỏng / dữ liệu sai', () => {
    expect(() => decodeList('1abc')).toThrow();
    expect(() => decodeList('xyz')).toThrow();
    const bad = '1' + btoa(JSON.stringify([['g', 'A', '', 0, 45, 3, 0, 0, '']])).replace(/=+$/, '');
    expect(() => decodeList(bad)).toThrow(/ngày/);
    const html = '1' + btoa(unescape(encodeURIComponent(JSON.stringify([['g', '<img src=x>', '', 0, 5, 3, 0, 0, '']])))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeList(html)[0].name).toBe('<img src=x>'); // giữ nguyên chữ, giao diện tự escape khi hiển thị
  });
  it('nhận biết trùng', () => {
    expect(sameEvent({ ...gios[0], name: ' nguyễn văn bình ' }, gios[0])).toBe(true);
    expect(sameEvent({ ...gios[0], day: 19 }, gios[0])).toBe(false);
  });
});

describe('Bản mới, đọc to, widget', () => {
  it('so sánh phiên bản', () => {
    expect(cmpVersion('v1.10.0', '1.9.9')).toBe(1);
    expect(cmpVersion('1.3.0', '1.3')).toBe(0);
    expect(cmpVersion('1.2.9', 'v1.3.0')).toBe(-1);
  });
  it('đọc "(3 lần)" thành lặp 3 lần, bỏ chỗ trống', () => {
    expect(speakable('Nam mô A Di Đà Phật! (3 lần)')).toBe('Nam mô A Di Đà Phật. Nam mô A Di Đà Phật. Nam mô A Di Đà Phật.');
    expect(speakable('Tín chủ con là ……, ngụ tại ……')).toBe('Tín chủ con là , ngụ tại');
  });
  it('widget: ngày giỗ mở văn khấn, sinh nhật mở màn sửa', () => {
    const d = buildUserWidgetData(new Date(2026, 10, 21), { gios: gios.map((g) => ({ ...g, remind: [0], enabled: true })), settings: {} });
    expect(d.gios.find((x) => x.t === 'Giỗ Nguyễn Văn Bình').r).toMatch(/^vankhan\/gio\?gid=a&jd=\d+$/);
    expect(d.gios.find((x) => x.t.startsWith('Sinh nhật')).r).toBe('edit/b');
  });
});
