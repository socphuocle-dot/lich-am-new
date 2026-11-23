// Thông báo cục bộ trên điện thoại (Capacitor Local Notifications). Không cần server.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { buildSchedule } from './lib/reminders.js';
import { jdOfDate } from './lib/events.js';
import { getState } from './store.js';

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

const SNOOZE_BASE = 2000000001; // id ≥ mốc này là "nhắc lại sau" — không bị xóa khi lập lại lịch
let actionsReady = false;
async function ensureActions() {
  if (actionsReady || !isNative()) return;
  actionsReady = true;
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        { id: 'VK', actions: [{ id: 'doc', title: 'Đọc văn khấn', foreground: true }, { id: 'vankhan', title: 'Xem bài', foreground: true }, { id: 'snooze', title: 'Nhắc sau 1 giờ' }] },
        { id: 'BASIC', actions: [{ id: 'snooze', title: 'Nhắc lại sau 1 giờ' }] }
      ]
    });
  } catch { /* web / bản cũ */ }
}

/** Gắn xử lý khi bấm thông báo hoặc nút trên thông báo */
export function listenNotificationActions(open) {
  if (!isNative()) return;
  LocalNotifications.addListener('localNotificationActionPerformed', async ({ actionId, notification: n }) => {
    const x = n.extra || {};
    if (actionId === 'snooze') {
      try {
        await LocalNotifications.schedule({ notifications: [{
          id: SNOOZE_BASE + (Date.now() % 100000000), title: n.title, body: n.body, channelId: 'nhac',
          schedule: { at: new Date(Date.now() + 3600e3), allowWhileIdle: true }, extra: x, actionTypeId: n.actionTypeId
        }] });
      } catch { /* bỏ qua */ }
      return;
    }
    // Bấm "Đọc văn khấn", hoặc bấm vào thông báo đúng ngày cúng → mở bài và tự đọc to
    const today = jdOfDate(new Date());
    const read = actionId === 'doc' || (actionId === 'tap' && Number(x.evJd) === today && getState().settings.readOnTap !== false);
    if (x.vk) open(`#/vankhan/${x.vk}?jd=${x.evJd || ''}${x.gid ? '&gid=' + x.gid : ''}${read ? '&doc=1' : ''}`);
    else if (x.gid) open(`#/edit/${x.gid}`);
    else open('#/reminders');
  }).catch(() => {});
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
    await ensureActions();
    const pending = await LocalNotifications.getPending();
    const old = pending.notifications.filter((n) => n.id < SNOOZE_BASE);
    if (old.length) await LocalNotifications.cancel({ notifications: old.map((n) => ({ id: n.id })) });
    if (!list.length) return list;
    await LocalNotifications.schedule({
      notifications: list.map((n) => ({
        id: n.id, title: n.title, body: n.body, channelId: 'nhac',
        schedule: { at: n.at, allowWhileIdle: true }, actionTypeId: n.vk ? 'VK' : 'BASIC',
        extra: { key: n.key, vk: n.vk, gid: n.gid, evJd: n.evJd }
      }))
    });
  } catch (e) {
    console.warn('Không lập được thông báo', e);
    import('./errlog.js').then((m) => m.logEvent('warn', 'Không lập được thông báo: ' + (e?.message || e))).catch(() => {});
  }
  return list;
}
