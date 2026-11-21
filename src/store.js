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
    holidayOn: true, gioTime: '07:00', size: 1, theme: 'light', culture: CULTURE_DEFAULT, monday: true, widgetCountdown: 'auto'
  },
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
      disabled: s.disabled || {}
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

export const getState = () => state;

export function setState(patch) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* bộ nhớ đầy */ }
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
    profile: { ...DEFAULT_STATE.profile, ...(data.profile || {}) }
  });
}

export function resetAll() {
  setState(clone(DEFAULT_STATE));
}
