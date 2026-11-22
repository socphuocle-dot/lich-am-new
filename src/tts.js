// Đọc to bằng giọng tiếng Việt có sẵn trên máy (không cần mạng).
import { Capacitor } from '@capacitor/core';

let token = 0;
const native = () => Capacitor.isNativePlatform();
async function plugin() { return (await import('@capacitor-community/text-to-speech')).TextToSpeech; }

/** Chuẩn hóa câu để đọc: "(3 lần)" → đọc lặp 3 lần, bỏ chỗ trống "……" */
export function speakable(p) {
  const m = p.match(/^(.*?)\s*\((\d) lần\)\s*$/);
  if (m) return Array(Number(m[2])).fill(m[1].replace(/!$/, '')).join('. ') + '.';
  return p.replace(/…+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** 'ok' | 'missing' (máy chưa có giọng tiếng Việt) | 'none' (không hỗ trợ) */
export async function ttsStatus() {
  if (native()) {
    try { const T = await plugin(); const r = await T.isLanguageSupported({ lang: 'vi-VN' }); return r.supported ? 'ok' : 'missing'; } catch { return 'none'; }
  }
  if (!('speechSynthesis' in window)) return 'none';
  let v = speechSynthesis.getVoices();
  if (!v.length) { await new Promise((r) => { speechSynthesis.onvoiceschanged = r; setTimeout(r, 800); }); v = speechSynthesis.getVoices(); }
  return v.some((x) => /^vi/i.test(x.lang)) ? 'ok' : 'missing';
}

export async function openVoiceInstall() { try { (await plugin()).openInstall(); } catch { /* */ } }

function speakOne(text, rate) {
  if (native()) return plugin().then((T) => T.speak({ text, lang: 'vi-VN', rate, pitch: 1, volume: 1, category: 'playback' }));
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN'; u.rate = rate;
    const v = speechSynthesis.getVoices().find((x) => /^vi/i.test(x.lang)); if (v) u.voice = v;
    u.onend = resolve; u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

/** Đọc lần lượt từng đoạn; onPara(i) báo đoạn đang đọc, onPara(-1) khi xong/dừng */
export async function speakParagraphs(paras, rate = 1, onPara = () => {}) {
  const my = ++token;
  for (let i = 0; i < paras.length; i++) {
    if (my !== token) return;
    const t = speakable(paras[i]);
    if (!t) continue;
    onPara(i);
    try { await speakOne(t, rate); } catch { break; }
  }
  if (my === token) onPara(-1);
}

export async function stopSpeaking() {
  token++;
  try { if (native()) await (await plugin()).stop(); else speechSynthesis.cancel(); } catch { /* */ }
}
