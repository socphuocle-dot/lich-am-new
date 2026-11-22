import { describe, it, expect } from 'vitest';
import { encodeFamily, encodeList, decodeShare, decodeList } from '../src/lib/share.js';

const gios = [
  { id: 'a', type: 'gio', name: 'Nguyễn Văn Bình', rel: 'Ông nội', cal: 'am', day: 19, month: 10, year: 2015,
    memo: { photo: 'data:image/jpeg;base64,xxx', born: 1932, died: 2015, home: 'Bắc Ninh', grave: 'Nghĩa trang quê', bio: 'Giáo viên làng', words: 'Nhường nhịn nhau' } },
  { id: 'b', type: 'sinhnhat', name: 'bé Na', cal: 'duong', day: 2, month: 12 }
];
const people = [
  { id: 'p1', name: 'Nguyễn Văn Bình', gender: 'nam', born: 1932, died: 2015, gioId: 'a' },
  { id: 'p2', name: 'Trần Thị Lan', gender: 'nu', born: 1936, spouseOf: 'p1' },
  { id: 'p3', name: 'Nguyễn Văn Hùng', gender: 'nam', born: 1958, parentId: 'p1' }
];

describe('chia sẻ cả họ', () => {
  it('không kèm gì thêm thì vẫn dùng mã bản 1 (app cũ đọc được)', () => {
    const c = encodeFamily(gios, {});
    expect(c[0]).toBe('1');
    expect(decodeList(c)).toHaveLength(2);
    expect(c).toBe(encodeList(gios));
  });
  it('kèm gia phả và tưởng nhớ, không kèm ảnh', () => {
    const c = encodeFamily(gios, { people, memo: true });
    expect(c[0]).toBe('2');
    const r = decodeShare(c);
    expect(r.gios[0].memo).toMatchObject({ born: 1932, home: 'Bắc Ninh', bio: 'Giáo viên làng', photo: '' });
    expect(r.gios[1].memo).toBeUndefined();
    expect(r.people).toHaveLength(3);
    expect(r.people[1]).toMatchObject({ name: 'Trần Thị Lan', gender: 'nu', spouse: 0 });
    expect(r.people[2].parent).toBe(0);
    expect(r.people[0].gio).toBe(0);
  });
  it('từ chối mã hỏng, chỉ số lạ bị bỏ qua', () => {
    expect(() => decodeShare('2abc$')).toThrow();
    const bad = '2' + btoa(JSON.stringify({ g: [], p: [['A', 0, 1990, 0, 99, -5, 7]] })).replace(/=+$/, '');
    const r = decodeShare(bad);
    expect(r.people[0]).toMatchObject({ parent: -1, spouse: -1, gio: -1 });
  });
});
