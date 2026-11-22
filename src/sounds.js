// Tiếng chuông, tiếng mõ tổng hợp ngay trên máy (Web Audio) — không cần file âm thanh, không cần mạng.
let ctx = null;
function ac() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Chuông đồng: các họa âm không điều hòa, ngân dài */
export function bell(volume = 0.5, seconds = 4.5) {
  const a = ac(); if (!a) return wait(0);
  const t = a.currentTime + 0.02;
  const out = a.createGain(); out.gain.value = volume; out.connect(a.destination);
  const f0 = 196; // Sol trầm
  [[1, 1, 1], [2.32, 0.55, 0.75], [3.01, 0.35, 0.55], [4.16, 0.22, 0.4], [5.43, 0.14, 0.3], [0.5, 0.35, 1.2]].forEach(([k, amp, dec]) => {
    const o = a.createOscillator(); const g = a.createGain();
    o.type = 'sine'; o.frequency.value = f0 * k;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + seconds * dec);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + seconds * dec + 0.05);
  });
  return wait(900);
}

/** Mõ gỗ: tiếng "cốc" ngắn, ấm */
export function mo(volume = 0.55) {
  const a = ac(); if (!a) return wait(0);
  const t = a.currentTime + 0.01;
  const g = a.createGain(); g.connect(a.destination);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  const o = a.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(820, t); o.frequency.exponentialRampToValueAtTime(560, t + 0.12);
  const o2 = a.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 1340;
  const g2 = a.createGain(); g2.gain.setValueAtTime(volume * 0.35, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g); o2.connect(g2); g2.connect(a.destination);
  o.start(t); o.stop(t + 0.2); o2.start(t); o2.stop(t + 0.08);
  return wait(220);
}

/** Gọi trong lúc người dùng bấm nút để trình duyệt cho phép phát âm thanh */
export function unlockAudio() { ac(); }
