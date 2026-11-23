// Lưu dữ liệu trên máy (localStorage của WebView). Không gửi đi đâu.
import { CULTURE_DEFAULT } from './config.js';

const clone = (o) => JSON.parse(JSON.stringify(o));

const KEY = 'lamng.v1';

export const DEFAULT_STATE = {
  version: 1,
  profile: { name: '', dob: '', hourChi: 6, gender: 'Nam' },
  gios: [],
  disabled: {},
  settings: {
    autoMoon: true, moonEveOn: true, moonEve: '19:00', moonMornOn: true, moonMorning: '06:00',
    holidayOn: true, gioTime: '07:00', size: 1, theme: 'light', culture: CULTURE_DEFAULT, monday: true, widgetCountdown: 'auto',
    hostName: '', address: '', vkSize: 1, autoUpdateCheck: true, ttsRate: 1, babyName: '', region: 'chung', chay: 'off', chayRemind: true, chayTime: '19:00', ttsStyle: 'tung', preferVoice: true, mascot: 'tho', clockStyle: 'giay'
  },
  calSync: { enabled: false, moon: false, holidays: true, calendarId: '', ids: [] },
  lastBackup: '',
  checklists: {},
  update: {},
  hieuhi: [],   // sổ hiếu hỉ: { id, dir: 'nhan'|'di', kind, person, note, date, amount, gift }
  prep: {},     // chuẩn bị đám giỗ theo id ngày giỗ: { tasks: [...], guests: [...] }
  voices: {},   // giọng người thật đọc văn khấn: { [id bài]: { by, sec, mime, at } } — âm thanh lưu riêng trong bộ nhớ app
  quy: { entries: [], dots: [] }, // quỹ họ: entries { id, dir: 'thu'|'chi', cat, who, amount, date, note }; dots { id, name, per, members: [{ id, name, paid, at }] }
  people: [],   // gia phả: { id, name, gender, born, died, parentId, spouseOf, gioId, note }
  onboarded: false
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const s = JSON.parse(raw);
    return {
      ...clone(DEFAULT_STATE), ...s,
      profile: { ...DEFAULT_STATE.profile, ...(s.profile || {}) },
      settings: { ...DEFAULT_STATE.settings, ...(s.settings || {}) },
      gios: Array.isArray(s.gios) ? s.gios : [],
      disabled: s.disabled || {},
      calSync: { ...DEFAULT_STATE.calSync, ...(s.calSync || {}) },
      checklists: s.checklists || {},
      update: s.update || {},
      hieuhi: Array.isArray(s.hieuhi) ? s.hieuhi : [],
      prep: s.prep && typeof s.prep === 'object' ? s.prep : {},
      people: Array.isArray(s.people) ? s.people : [],
      quy: { entries: Array.isArray(s.quy?.entries) ? s.quy.entries : [], dots: Array.isArray(s.quy?.dots) ? s.quy.dots : [] },
      voices: s.voices && typeof s.voices === 'object' ? s.voices : {}
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

export const getState = () => state;
let saveFailed = false; let lastSize = 0;
/** Dung lượng dữ liệu chữ (ký tự) so với giới hạn ~5 triệu ký tự của bộ nhớ WebView */
export const STORAGE_LIMIT = 5 * 1024 * 1024;
export function storageInfo() {
  const used = lastSize || (localStorage.getItem(KEY) || '').length;
  return { used, limit: STORAGE_LIMIT, ratio: used / STORAGE_LIMIT, failed: saveFailed };
}

export function setState(patch) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
  const json = JSON.stringify(state);
  lastSize = json.length;
  try { localStorage.setItem(KEY, json); saveFailed = false; } catch {
    // Bộ nhớ đầy: dữ liệu vừa sửa CHƯA được ghi xuống máy → báo ngay cho người dùng
    saveFailed = true;
    try { window.dispatchEvent(new CustomEvent('lamng:save-failed', { detail: { size: json.length } })); } catch { /* */ }
  }
  listeners.forEach((fn) => fn(state));
}

export const updateSettings = (p) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } }));
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function saveGio(g) {
  setState((s) => {
    const exists = s.gios.some((x) => x.id === g.id);
    return { ...s, gios: exists ? s.gios.map((x) => (x.id === g.id ? g : x)) : [...s.gios, g] };
  });
}

export function deleteGio(id) {
  setState((s) => ({ ...s, gios: s.gios.filter((x) => x.id !== id) }));
}

export function exportData() {
  return JSON.stringify({ app: 'lich-am-nhac-gio', exportedAt: new Date().toISOString(), data: state }, null, 2);
}

export function importData(text) {
  const obj = JSON.parse(text);
  const data = obj && obj.data ? obj.data : obj;
  if (!data || !Array.isArray(data.gios)) throw new Error('File không đúng định dạng sao lưu');
  setState({
    ...clone(DEFAULT_STATE), ...data,
    settings: { ...DEFAULT_STATE.settings, ...(data.settings || {}) },
    profile: { ...DEFAULT_STATE.profile, ...(data.profile || {}) },
    // Mã sự kiện lịch thuộc về máy cũ → tắt đồng bộ, người dùng bật lại trên máy này
    calSync: { ...DEFAULT_STATE.calSync, moon: !!data.calSync?.moon, holidays: data.calSync?.holidays !== false }
  });
}

export function resetAll() {
  setState(clone(DEFAULT_STATE));
}
