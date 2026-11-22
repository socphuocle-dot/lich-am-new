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

function speakOne(text, rate, pitch = 1) {
  if (native()) return plugin().then((T) => T.speak({ text, lang: 'vi-VN', rate, pitch, volume: 1, category: 'playback' }));
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN'; u.rate = rate; u.pitch = pitch;
    const v = speechSynthesis.getVoices().find((x) => /^vi/i.test(x.lang)); if (v) u.voice = v;
    u.onend = resolve; u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Tách đoạn thành từng vế (theo dấu câu, xuống dòng) để đọc chậm, ngắt nghỉ như tụng */
export function phrases(p) {
  const m = p.match(/^(.*?)\s*\((\d) lần\)\s*$/);
  if (m) return Array(Number(m[2])).fill(m[1].replace(/[!.]$/, '').trim());
  return p.replace(/…+/g, ' ').replace(/([,.;:!?])\s+/g, '$1\u0000').replace(/\n+/g, '\u0000').split('\u0000').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

/**
 * Kiểu đọc: 'thuong' (đọc liền), 'tram' (trầm, chậm, ngắt theo vế), 'tung' (như 'tram' + chuông mở/kết, mõ gõ nhịp).
 * Đọc lần lượt từng đoạn; onPara(i) báo đoạn đang đọc, onPara(-1) khi xong/dừng.
 */
export async function speakParagraphs(paras, rate = 1, onPara = () => {}, style = 'thuong') {
  const my = ++token;
  const sounds = style === 'tung' ? await import('./sounds.js') : null;
  if (sounds) { await sounds.bell(0.5); await sleep(600); }
  for (let i = 0; i < paras.length; i++) {
    if (my !== token) return;
    if (style === 'thuong') {
      const t = speakable(paras[i]);
      if (!t) continue;
      onPara(i);
      try { await speakOne(t, rate); } catch { break; }
      continue;
    }
    const ps = phrases(paras[i]);
    if (!ps.length) continue;
    onPara(i);
    const namMo = /\((\d) lần\)\s*$/.test(paras[i]);
    for (const ph of ps) {
      if (my !== token) return;
      try { await speakOne(ph, rate * 0.82, 0.82); } catch { if (my === token) onPara(-1); return; }
      if (my !== token) return;
      if (sounds) { if (namMo) { await sounds.bell(0.35, 3); await sleep(500); } else await sounds.mo(0.5); }
      await sleep(namMo ? 250 : 380);
    }
    await sleep(500);
  }
  if (sounds && my === token) { await sleep(300); await sounds.bell(0.5); await sleep(1800); }
  if (my === token) onPara(-1);
}

export async function stopSpeaking() {
  token++;
  try { if (native()) await (await plugin()).stop(); else speechSynthesis.cancel(); } catch { /* */ }
}
