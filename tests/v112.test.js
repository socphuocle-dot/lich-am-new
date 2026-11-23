import { describe, it, expect } from 'vitest';
import { layoutTree, familyName, jpegToPdf, BOX } from '../src/lib/print.js';
import { parseLatLng, isShortMapLink, dirUrl } from '../src/lib/geo.js';
import { quySummary, quyReport, dotStat } from '../src/lib/quy.js';
import { vnMoment, vnParts } from '../src/lib/tz.js';
import { listEvents, nextThanhMinh, isThanhMinh } from '../src/lib/events.js';
import { jdFromDate, jdToDate } from '../src/lib/lunar.js';
import { buildSchedule } from '../src/lib/reminders.js';

const P = (id, name, extra = {}) => ({ id, name, gender: 'nam', born: '', died: '', parentId: '', spouseOf: '', ...extra });
const fam = [P('a', 'Lê Văn Tổ'), P('b', 'Trần Thị Hiền', { spouseOf: 'a', gender: 'nu' }), P('c', 'Lê Văn An', { parentId: 'a', born: 1950 }), P('d', 'Lê Thị Bình', { parentId: 'b', born: 1952 }), P('e', 'Lê Minh', { parentId: 'c' })];

describe('in gia phả', () => {
  it('bố cục: cặp vợ chồng chung một ô, con ở dưới, cha nằm giữa các con', () => {
    const L = layoutTree(fam);
    expect(L.gens).toBe(3);
    const root = L.nodes.find((n) => n.people[0].id === 'a');
    expect(root.people.map((p) => p.id)).toEqual(['a', 'b']);
    const kids = L.nodes.filter((n) => n.gen === 2);
    expect(kids).toHaveLength(2); // con của vợ cũng là con chung
    const cx = root.x + root.w / 2;
    const mid = (kids[0].x + kids[0].w / 2 + kids[1].x + kids[1].w / 2) / 2;
    expect(Math.abs(cx - mid)).toBeLessThan(1);
    expect(L.links).toHaveLength(3);
    expect(L.height).toBe(3 * BOX.h + 2 * BOX.level);
    for (const n of kids) expect(n.y).toBe(BOX.h + BOX.level);
  });
  it('các ô cùng đời không chồng lên nhau', () => {
    const many = [P('r', 'Gốc'), ...Array.from({ length: 6 }, (_, i) => P('k' + i, 'Con ' + i, { parentId: 'r' })), P('s', 'Dâu', { spouseOf: 'k2', gender: 'nu' })];
    const g2 = layoutTree(many).nodes.filter((n) => n.gen === 2).sort((a, b) => a.x - b.x);
    for (let i = 1; i < g2.length; i++) expect(g2[i].x).toBeGreaterThanOrEqual(g2[i - 1].x + g2[i - 1].w);
  });
  it('họ của dòng họ', () => expect(familyName(fam)).toBe('Lê'));
  it('PDF hợp lệ: đầu %PDF, bảng xref trỏ đúng vị trí đối tượng', () => {
    const jpg = new Uint8Array([0xff, 0xd8, 1, 2, 3, 0xff, 0xd9]);
    const pdf = jpegToPdf(jpg, 2000, 1000, 'A3');
    const txt = new TextDecoder('latin1').decode(pdf);
    expect(txt.startsWith('%PDF-1.4')).toBe(true);
    expect(txt).toContain('/MediaBox [0 0 1190.55 841.89]'); // ảnh ngang → A3 xoay ngang
    const xref = Number(/startxref\n(\d+)/.exec(txt)[1]);
    expect(txt.slice(xref, xref + 4)).toBe('xref');
    const offs = [...txt.slice(xref).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
    offs.forEach((o, i) => expect(txt.slice(o, o + 7)).toBe(`${i + 1} 0 obj`));
  });
});

describe('vị trí mộ', () => {
  it('đọc tọa độ từ nhiều kiểu link', () => {
    expect(parseLatLng('21.028511, 105.804817')).toEqual({ lat: 21.028511, lng: 105.804817 });
    expect(parseLatLng('https://www.google.com/maps/place/X/@10.7769,106.7009,17z/data=!3m1!4b1!4m6!3m5!8m2!3d10.77701!4d106.70112')).toEqual({ lat: 10.77701, lng: 106.70112 });
    expect(parseLatLng('https://maps.google.com/?q=16.0544,108.2022')).toEqual({ lat: 16.0544, lng: 108.2022 });
    expect(parseLatLng('geo:20.95,105.75?z=15')).toEqual({ lat: 20.95, lng: 105.75 });
    expect(parseLatLng('nghĩa trang quê')).toBeNull();
    expect(parseLatLng('200.1234, 105.1234')).toBeNull();
  });
  it('link rút gọn và link chỉ đường', () => {
    expect(isShortMapLink('https://maps.app.goo.gl/abc')).toBe(true);
    expect(dirUrl(1.5, 2.5)).toBe('https://www.google.com/maps/dir/?api=1&destination=1.5,2.5');
  });
});

describe('quỹ họ', () => {
  const quy = { entries: [{ id: '1', dir: 'thu', cat: 'giotho', who: 'Chú Ba', amount: 1000000, date: '2026-11-01', note: '' }, { id: '2', dir: 'chi', cat: 'giotho', who: 'Mua lễ', amount: 400000, date: '2026-11-10', note: '' }],
    dots: [{ id: 'd', name: 'Giỗ tổ 2027', per: 200000, members: [{ id: 'm1', name: 'Nhà An', paid: true }, { id: 'm2', name: 'Nhà Bình', paid: false }, { id: 'm3', name: 'Nhà Cường', paid: true, amount: 500000 }] }] };
  it('tính tổng, đợt góp có mức riêng từng hộ', () => {
    expect(dotStat(quy.dots[0])).toEqual({ total: 3, paid: 2, collected: 700000, expected: 900000 });
    expect(quySummary(quy)).toMatchObject({ thu: 1700000, chi: 400000, con: 1300000 });
  });
  it('bản tổng kết liệt kê hộ đã/chưa đóng', () => {
    const t = quyReport(quy, 'Quỹ họ Lê', new Date(2026, 10, 23));
    expect(t).toContain('QUỸ HỌ LÊ — tổng kết ngày 23/11/2026');
    expect(t).toContain('Còn lại: 1.300.000đ');
    expect(t).toContain('Chưa đóng: Nhà Bình');
  });
});

describe('Thanh Minh và tảo mộ', () => {
  it('Thanh Minh rơi vào 4–6/4 và có trong danh sách lễ', () => {
    const j = nextThanhMinh(jdFromDate(1, 1, 2027));
    const d = jdToDate(j);
    expect(d.month).toBe(4); expect(d.day).toBeGreaterThanOrEqual(4); expect(d.day).toBeLessThanOrEqual(6);
    expect(isThanhMinh(j)).toBe(true); expect(isThanhMinh(j + 1)).toBe(false);
    const ev = listEvents(j - 2, 5, []);
    expect(ev.find((e) => e.key === `thanhminh-${j}`)?.vk).toBe('thanhminh');
  });
  it('nhắc tảo mộ cuối năm chỉ khi bật', () => {
    const from = jdFromDate(1, 12, 2026);
    expect(listEvents(from, 120, []).some((e) => e.key.startsWith('taomo-'))).toBe(false);
    expect(listEvents(from, 120, [], { taoMo: true }).some((e) => e.key.startsWith('taomo-'))).toBe(true);
  });
});

describe('người ở nước ngoài', () => {
  it('giờ Việt Nam', () => {
    expect(vnMoment(2026, 11, 23, 7, 0).toISOString()).toBe('2026-11-23T00:00:00.000Z');
    expect(vnParts(new Date('2026-11-22T20:30:00Z'))).toMatchObject({ day: 23, month: 11, hour: 3, minute: 30 });
  });
  it('bật "nhắc theo giờ Việt Nam": thông báo kêu đúng lúc hh:mm ở Việt Nam', () => {
    const base = { gios: [{ id: 'g', type: 'gio', name: 'Ông', cal: 'duong', day: 1, month: 12, repeat: 'yearly', time: '07:00', remind: [0] }], disabled: {},
      settings: { autoMoon: false, holidayOn: false, chay: 'off' } };
    const now = new Date('2026-11-23T00:00:00Z');
    const vn = buildSchedule(now, { ...base, settings: { ...base.settings, vnTime: true } }).find((n) => n.gid === 'g');
    expect(vn.at.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(vn.body).toContain('7:00 giờ Việt Nam'.replace('7:00', '07:00'));
  });
});

import { encodeFamily, decodeShare } from '../src/lib/share.js';
describe('gửi cả họ kèm vị trí mộ', () => {
  it('vị trí mộ đi theo mã chia sẻ, ảnh mộ thì không', () => {
    const g = { id: 'x', type: 'gio', name: 'Ông', rel: '', cal: 'am', day: 3, month: 2, year: 2001, memo: { grave: 'Quê', gLat: 21.028511, gLng: 105.804817, gPhoto: 'data:image/jpeg;base64,xx' } };
    const r = decodeShare(encodeFamily([g], { memo: true }));
    expect(r.gios[0].memo).toMatchObject({ grave: 'Quê', gLat: 21.028511, gLng: 105.804817 });
    expect(r.gios[0].memo.gPhoto).toBeUndefined();
  });
});
