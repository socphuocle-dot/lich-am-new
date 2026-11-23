// Ghi âm giọng người thật đọc văn khấn (ông bà, cha mẹ, thầy ở chùa…) — lưu ngay trên máy.
import { Filesystem, Directory } from '@capacitor/filesystem';

const path = (id) => `giong-doc/${id}.bin`;

const toBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] || '');
  r.onerror = reject;
  r.readAsDataURL(blob);
});

export async function saveVoice(id, blob) {
  const data = await toBase64(blob);
  await Filesystem.writeFile({ path: path(id), data, directory: Directory.Data, recursive: true });
}

/** Trả về link phát (blob URL) hoặc '' nếu chưa có */
export async function voiceUrl(id, mime = 'audio/webm') {
  try {
    const r = await Filesystem.readFile({ path: path(id), directory: Directory.Data });
    const d = r.data;
    const blob = d instanceof Blob ? d : new Blob([Uint8Array.from(atob(d), (c) => c.charCodeAt(0))], { type: mime });
    return URL.createObjectURL(blob);
  } catch { return ''; }
}

/** Nội dung base64 của bản ghi (để gửi qua Zalo…) hoặc '' */
export async function voiceBase64(id) {
  try {
    const r = await Filesystem.readFile({ path: path(id), directory: Directory.Data });
    if (typeof r.data === 'string') return r.data;
    return await toBase64(r.data);
  } catch { return ''; }
}

export async function deleteVoice(id) {
  try { await Filesystem.deleteFile({ path: path(id), directory: Directory.Data }); } catch { /* chưa có */ }
}

/* ---------- Ghi âm ---------- */
let rec = null;
export const canRecord = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/aac', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
  const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 48000 } : undefined);
  const chunks = [];
  mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  mr.start(1000);
  rec = { mr, stream, chunks, t0: Date.now() };
}

/** Dừng ghi; trả { blob, mime, sec } */
export function stopRecording() {
  return new Promise((resolve) => {
    if (!rec) { resolve(null); return; }
    const { mr, stream, chunks, t0 } = rec;
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const mime = mr.mimeType || 'audio/webm';
      resolve({ blob: new Blob(chunks, { type: mime }), mime, sec: Math.round((Date.now() - t0) / 1000) });
    };
    rec = null;
    try { mr.stop(); } catch { resolve(null); }
  });
}
export function cancelRecording() {
  if (!rec) return;
  try { rec.mr.stop(); } catch { /* */ }
  rec.stream.getTracks().forEach((t) => t.stop());
  rec = null;
}
export const recordingSince = () => (rec ? rec.t0 : 0);
