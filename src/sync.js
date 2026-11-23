// Đồng bộ không cần máy chủ:
//  1) Ghi giỗ / sinh nhật / rằm / lễ vào lịch của máy (Google Calendar, iCloud) → tự đồng bộ theo tài khoản.
//  2) Nhập ngày sinh người thân từ danh bạ.
//  3) Sao lưu: bản sao trong bộ nhớ hệ thống (được Google / iCloud backup) + xuất file lên Drive / iCloud Drive.
import { Capacitor } from '@capacitor/core';
import { getState, setState, saveGio, uid, exportData, importData } from './store.js';
import { listEvents, jdOfDate } from './lib/events.js';
import { jdToDate } from './lib/lunar.js';

const native = () => Capacitor.isNativePlatform();
const lazy = {};
async function cal() { return (lazy.cal ||= (await import('@ebarooni/capacitor-calendar')).CapacitorCalendar); }
async function contacts() { return (lazy.ct ||= (await import('@capacitor-community/contacts')).Contacts); }
async function prefs() { return (lazy.pf ||= (await import('@capacitor/preferences')).Preferences); }

/* ===================== 1. LỊCH MÁY ===================== */
export const SYNC_DAYS = 730; // 2 năm tới

/** Danh sách sự kiện sẽ ghi vào lịch (tính trên máy, có test) */
export function calendarEventsToWrite(now, state) {
  const o = state.calSync || {};
  const gios = (state.gios || []).filter((g) => g.enabled !== false);
  const evs = listEvents(jdOfDate(now), SYNC_DAYS, gios, { moon: !!o.moon, lunarHolidays: o.holidays !== false, solarHolidays: false });
  return evs
    .filter((e) => e.kind === 'gio' || (e.kind === 'le') || (o.moon && e.kind === 'moon'))
    .map((e) => {
      const s = jdToDate(e.jd);
      return {
        key: e.key,
        title: e.title,
        start: new Date(s.year, s.month - 1, s.day).getTime(),
        description: `Âm lịch ${e.lunar.day}/${e.lunar.month}${e.lunar.leap ? ' nhuận' : ''} · Tạo bởi Lịch Âm & Nhắc Giỗ`
      };
    });
}

export async function calendarPermission(request = false) {
  if (!native()) return 'web';
  const C = await cal();
  try {
    if (request) return (await C.requestFullCalendarAccess()).result;
    const r = await C.checkAllPermissions();
    const v = r.result || {};
    return v.readCalendar === 'granted' && v.writeCalendar === 'granted' ? 'granted' : 'prompt';
  } catch {
    return 'denied';
  }
}

/** Các lịch có thể ghi; lịch Google / iCloud chính lên đầu */
export async function writableCalendars() {
  const C = await cal();
  const { result } = await C.listCalendars();
  const list = (result || []).filter((c) => c.allowsContentModifications !== false && !c.isSubscribed);
  const score = (c) => (c.accountName && c.accountName === c.ownerAccount && /@/.test(c.accountName) ? 0 : /icloud/i.test(c.source?.title || '') ? 1 : 2);
  return list.sort((a, b) => score(a) - score(b)).map((c) => ({ id: c.id, title: c.title || c.accountName || 'Lịch', account: c.accountName || c.source?.title || '' }));
}

let running = false;
/** Xóa các sự kiện app đã ghi lần trước rồi ghi lại theo dữ liệu mới nhất */
export async function syncCalendar({ force = false } = {}) {
  const st = getState();
  const o = st.calSync || {};
  if (!native() || !o.enabled || running) return { skipped: true };
  const items = calendarEventsToWrite(new Date(), st);
  const fp = JSON.stringify([o.calendarId, items.map((i) => i.key + i.title)]);
  if (!force && fp === o.fingerprint) return { skipped: true };
  running = true;
  try {
    const C = await cal();
    if ((await calendarPermission()) !== 'granted') throw new Error('Chưa có quyền truy cập lịch');
    let calendarId = o.calendarId;
    if (!calendarId) {
      const cals = await writableCalendars();
      calendarId = cals[0]?.id;
    }
    if (o.ids?.length) {
      try { await C.deleteEventsById({ ids: o.ids }); } catch { /* sự kiện đã bị xóa tay */ }
    }
    const ids = [];
    for (const it of items) {
      const r = await C.createEvent({ title: it.title, calendarId, isAllDay: true, startDate: it.start, description: it.description, commit: false });
      if (r.id) ids.push(r.id);
    }
    try { await C.commit(); } catch { /* chỉ iOS cần commit */ }
    setState((s) => ({ ...s, calSync: { ...s.calSync, calendarId, ids, fingerprint: fp, lastSync: new Date().toISOString(), count: ids.length, error: '' } }));
    return { count: ids.length };
  } catch (e) {
    setState((s) => ({ ...s, calSync: { ...s.calSync, fingerprint: fp, error: String(e.message || e) } }));
    throw e;
  } finally {
    running = false;
  }
}

/** Tắt đồng bộ: xóa sự kiện app đã ghi khỏi lịch máy */
export async function removeCalendarEvents() {
  const o = getState().calSync || {};
  if (native() && o.ids?.length) {
    try { const C = await cal(); await C.deleteEventsById({ ids: o.ids }); } catch { /* bỏ qua */ }
  }
  setState((s) => ({ ...s, calSync: { ...s.calSync, enabled: false, ids: [], fingerprint: '', count: 0 } }));
}

let autoTimer = null;
export function autoSyncCalendar() {
  clearTimeout(autoTimer);
  autoTimer = setTimeout(() => { syncCalendar().catch(() => {}); }, 4000);
}

/* ===================== 2. DANH BẠ ===================== */
export async function contactsWithBirthdays() {
  if (!native()) throw new Error('Chỉ dùng được trong app trên điện thoại');
  const C = await contacts();
  let p = await C.checkPermissions();
  if (p.contacts !== 'granted' && p.contacts !== 'limited') p = await C.requestPermissions();
  if (p.contacts !== 'granted' && p.contacts !== 'limited') throw new Error('Bạn chưa cho phép truy cập danh bạ');
  const { contacts: list } = await C.getContacts({ projection: { name: true, birthday: true } });
  return birthdaysFrom(list);
}

/** Lọc danh bạ có ngày sinh (tách riêng để test) */
export function birthdaysFrom(list) {
  return (list || [])
    .filter((c) => c.birthday && c.birthday.day && c.birthday.month)
    .map((c) => ({
      contactId: c.contactId,
      name: (c.name?.display || [c.name?.family, c.name?.middle, c.name?.given].filter(Boolean).join(' ') || 'Không tên').trim(),
      day: Number(c.birthday.day), month: Number(c.birthday.month), year: c.birthday.year ? Number(c.birthday.year) : ''
    }))
    .sort((a, b) => a.month - b.month || a.day - b.day);
}

export function importBirthdays(picks) {
  const st = getState();
  let added = 0;
  for (const b of picks) {
    if (st.gios.some((g) => g.contactId && g.contactId === b.contactId)) continue;
    saveGio({
      id: uid(), type: 'sinhnhat', name: b.name, rel: 'Khác', cal: 'duong', day: b.day, month: b.month, year: b.year,
      leap: false, remind: [0, 1], time: st.settings.gioTime || '07:00', repeat: 'yearly', note: '', enabled: true,
      source: 'contacts', contactId: b.contactId
    });
    added++;
  }
  return added;
}

/* ===================== 3. SAO LƯU ===================== */
const PKEY = 'lamng.v1.backup';

/** Ghi bản sao vào bộ nhớ hệ thống (SharedPreferences / UserDefaults) — được Google / iCloud tự sao lưu */
export async function mirrorToSystem(state) {
  if (!native()) return;
  try { const P = await prefs(); await P.set({ key: PKEY, value: JSON.stringify(state) }); } catch { /* bỏ qua */ }
}

/** Khi cài lại app trên máy mới: nếu WebView trống nhưng hệ thống còn bản sao → khôi phục */
export async function restoreFromSystemIfEmpty() {
  if (!native()) return false;
  try {
    if (localStorage.getItem('lamng.v1')) return false;
    const P = await prefs();
    const { value } = await P.get({ key: PKEY });
    if (!value) return false;
    importData(JSON.stringify({ data: JSON.parse(value) }));
    return true;
  } catch {
    return false;
  }
}

/** Xuất file sao lưu và mở bảng chia sẻ → chọn Google Drive / Lưu vào Tệp (iCloud Drive) */
export async function backupToCloud() {
  const name = `LichAm-saoluu-${new Date().toISOString().slice(0, 10)}.json`;
  const { exportFull } = await import('./backup.js');
  const { text, files } = await exportFull();
  if (native()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const f = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: 'Sao lưu Lịch Âm & Nhắc Giỗ', files: [f.uri], dialogTitle: 'Lưu file sao lưu vào…' });
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  setState((s) => ({ ...s, lastBackup: new Date().toISOString() }));
  return { files };
}

export const daysSinceBackup = (st) => (st.lastBackup ? Math.floor((Date.now() - Date.parse(st.lastBackup)) / 864e5) : null);
