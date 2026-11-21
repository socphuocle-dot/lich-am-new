// Thông báo cục bộ trên điện thoại (Capacitor Local Notifications). Không cần server.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { buildSchedule } from './lib/reminders.js';

export const isNative = () => Capacitor.isNativePlatform();
let lastPreview = [];
export const getLastSchedule = () => lastPreview;

export async function ensurePermission() {
  if (!isNative()) return 'web';
  try {
    let p = await LocalNotifications.checkPermissions();
    if (p.display !== 'granted') p = await LocalNotifications.requestPermissions();
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({ id: 'nhac', name: 'Nhắc giỗ, rằm, lễ', importance: 4, visibility: 1, vibration: true });
    }
    return p.display;
  } catch {
    return 'error';
  }
}

let timer = null;
/** Lập lại toàn bộ lịch thông báo (gọi khi dữ liệu đổi hoặc mở app) */
export function reschedule(state, delay = 400) {
  clearTimeout(timer);
  timer = setTimeout(() => doReschedule(state), delay);
}

async function doReschedule(state) {
  const list = buildSchedule(new Date(), state);
  lastPreview = list;
  if (!isNative()) return list;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return list;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    if (!list.length) return list;
    await LocalNotifications.schedule({
      notifications: list.map((n) => ({
        id: n.id, title: n.title, body: n.body, channelId: 'nhac',
        schedule: { at: n.at, allowWhileIdle: true }, extra: { key: n.key }
      }))
    });
  } catch (e) {
    console.warn('Không lập được thông báo', e);
  }
  return list;
}
