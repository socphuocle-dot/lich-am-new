import { describe, it, expect } from 'vitest';
import { jdFromDate, trucIndex, TRUC } from '../src/lib/lunar.js';
import { rateDay, findGoodDays, birthChi, yearWarnings } from '../src/lib/goodday.js';
import { OCCASIONS, vanKhanFor, fillText, plainText, ngayAmText } from '../src/lib/vankhan.js';
import { buildSchedule } from '../src/lib/reminders.js';

describe('12 trực (đối chiếu lịch vạn niên)', () => {
  it.each([[22, 11, 2026, 'Trừ'], [20, 11, 2026, 'Bế'], [22, 12, 2026, 'Phá']])('%i/%i/%i là trực %s', (d, m, y, t) => {
    expect(TRUC[trucIndex(jdFromDate(d, m, y))]).toBe(t);
  });
});

describe('Xem ngày tốt', () => {
  it('loại ngày xung tuổi và ngày Tam nương', () => {
    const chi = birthChi('1996-08-18'); // Bính Tý
    expect(chi).toBe(0);
    const list = findGoodDays(jdFromDate(21, 11, 2026), 180, 'cuoi', { chi });
    expect(list.length).toBeGreaterThan(5);
    for (const r of list) {
      expect(r.canChi.endsWith('Ngọ')).toBe(false);
      expect([3, 7, 13, 18, 22, 27]).not.toContain(r.lunar.day);
      expect(r.reasons[0].ok).toBe(true); // luôn là ngày hoàng đạo
    }
  });
  it('ngày Phá bị chấm xấu', () => {
    expect(rateDay(jdFromDate(22, 12, 2026), 'khaitruong').level).toBe('xau');
  });
  it('cảnh báo Tam tai / Kim lâu / Hoang ốc', () => {
    expect(yearWarnings(1996, 2026, 'cuoi')).toEqual([]);
    expect(yearWarnings(1999, 2026, 'cuoi').join()).toMatch(/Kim lâu/); // tuổi mụ 28
    expect(yearWarnings(1994, 2026, 'dongtho').join()).toMatch(/Hoang Ốc/); // tuổi mụ 33
    expect(yearWarnings(1995, 2026, 'xuathanh').join()).toMatch(/Tam tai/); // tuổi Hợi, năm Ngọ
  });
});

describe('Văn khấn', () => {
  it('mọi bài có lời, mâm cúng và chỗ điền hợp lệ', () => {
    for (const o of OCCASIONS) {
      expect(o.text.length).toBeGreaterThan(4);
      expect(o.mam.length).toBeGreaterThan(3);
      for (const p of o.text) for (const k of p.matchAll(/\{(\w+)\}/g)) expect(['ngayAm', 'nam', 'tinChu', 'diaChi', 'hoTen', 'nguoiMat', 'tenBe']).toContain(k[1]);
    }
  });
  it('chọn đúng bài theo ngày', () => {
    expect(vanKhanFor({ kind: 'moon', lunar: { day: 15, month: 10 } })).toBe('ram');
    expect(vanKhanFor({ kind: 'moon', lunar: { day: 1, month: 3 } })).toBe('mung1');
    expect(vanKhanFor({ kind: 'le', lunar: { day: 23, month: 12 } })).toBe('ongtao');
    expect(vanKhanFor({ kind: 'moon', lunar: { day: 15, month: 7 } })).toBe('vulan');
    expect(vanKhanFor({ kind: 'gio', lunar: { day: 3, month: 2 }, gio: { type: 'sinhnhat' } })).toBe(null);
    expect(vanKhanFor({ kind: 'gio', lunar: { day: 3, month: 2 }, gio: {} })).toBe('gio');
  });
  it('điền tự động, chỗ thiếu được đánh dấu', () => {
    const f = fillText(['Hôm nay là {ngayAm} năm {nam}.', 'Tín chủ {tinChu}.'], { ngayAm: ngayAmText(15, 10), nam: 'Bính Ngọ' });
    expect(plainText(f)).toBe('Hôm nay là ngày Rằm tháng Mười năm Bính Ngọ.\n\nTín chủ …….');
    expect(f[1].some((x) => x.missing && x.key === 'tinChu')).toBe(true);
    expect(ngayAmText(5, 12)).toBe('ngày mùng 5 tháng Chạp');
  });
  it('thông báo giỗ gắn bài khấn: đúng ngày → giỗ, trước 1 ngày → tiên thường', () => {
    const list = buildSchedule(new Date(2026, 10, 21, 8), {
      settings: { autoMoon: true, moonEveOn: true, moonEve: '19:00', moonMornOn: true, moonMorning: '06:00', holidayOn: true },
      gios: [{ id: 'g', name: 'Ông', cal: 'am', day: 18, month: 10, remind: [0, 1, 3], time: '07:00', repeat: 'yearly' }], disabled: {}
    });
    const g = list.filter((n) => n.gid === 'g' && n.at < new Date(2026, 11, 1));
    expect(g.map((n) => n.vk)).toEqual(['', 'tienthuong', 'gio']);
    expect(list.find((n) => n.title.includes('Rằm tháng Mười')).vk).toBe('ram');
  });
});

import { dayExtras } from '../src/lib/goodday.js';
describe('Nhị thập bát tú & hướng xuất hành (đối chiếu lịch vạn niên)', () => {
  it.each([[22, 11, 2026, 'Hư'], [22, 12, 2026, 'Thất'], [26, 12, 2026, 'Vị']])('%i/%i/%i sao %s', (d, m, y, sao) => {
    expect(dayExtras(jdFromDate(d, m, y)).sao).toBe(sao);
  });
  it('ngày Canh: Hỷ thần Tây Bắc, Tài thần Tây Nam', () => {
    expect(dayExtras(jdFromDate(22, 12, 2026))).toMatchObject({ hyThan: 'Tây Bắc', taiThan: 'Tây Nam' });
  });
  it('Thiên Đức tháng Tý (11) là ngày Tỵ', () => {
    let jd = jdFromDate(10, 12, 2026); // tháng Tý theo tiết
    while (!dayExtras(jd).thienDuc) jd++;
    expect((jd + 1) % 12).toBe(5); // chi Tỵ
  });
});
