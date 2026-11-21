import { describe, it, expect, vi, beforeEach } from 'vitest';

const calls = { schedule: [], cancel: [], channel: [] };
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' } }));
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: async () => ({ display: 'granted' }),
    requestPermissions: async () => ({ display: 'granted' }),
    createChannel: async (c) => calls.channel.push(c),
    getPending: async () => ({ notifications: [{ id: 1 }, { id: 2 }] }),
    cancel: async (x) => calls.cancel.push(x),
    schedule: async (x) => calls.schedule.push(x)
  }
}));

const { reschedule, ensurePermission } = await import('../src/notify.js');

describe('Thông báo trên máy (giả lập Android)', () => {
  beforeEach(() => { calls.schedule.length = 0; calls.cancel.length = 0; });
  it('tạo kênh thông báo và xin quyền', async () => {
    expect(await ensurePermission()).toBe('granted');
    expect(calls.channel[0].id).toBe('nhac');
  });
  it('hủy lịch cũ rồi lập lịch mới, đúng định dạng plugin', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 21, 20, 0), toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    reschedule({
      settings: { autoMoon: true, moonEveOn: true, moonEve: '19:00', moonMornOn: true, moonMorning: '06:00', holidayOn: true },
      gios: [{ id: 'g', name: 'Ông nội', cal: 'am', day: 18, month: 10, remind: [3], time: '07:00', repeat: 'yearly' }],
      disabled: {}
    }, 0);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    await new Promise((r) => setTimeout(r, 10));
    expect(calls.cancel[0].notifications).toEqual([{ id: 1 }, { id: 2 }]);
    const list = calls.schedule[0].notifications;
    expect(list.length).toBe(60);
    const n = list[0];
    expect(n.channelId).toBe('nhac');
    expect(n.schedule.allowWhileIdle).toBe(true);
    expect(n.schedule.at instanceof Date).toBe(true);
    expect(Number.isInteger(n.id) && n.id > 0 && n.id < 2 ** 31).toBe(true);
    expect(list.some((x) => x.title === 'Còn 3 ngày nữa: Giỗ Ông nội')).toBe(true);
  });
});
