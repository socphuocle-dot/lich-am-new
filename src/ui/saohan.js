// Sao hạn & giải hạn: sao chiếu mệnh (Cửu Diệu), hạn trong năm, ngày giờ cúng sao, văn khấn — cho cả nhà.
import { getState } from '../store.js';
import { jdFromDate, solarToLunar, lunarToSolar, canChiYear } from '../lib/lunar.js';
import { saoOf, hanOf, tuoiMu, nextStarDays } from '../lib/saohan.js';
import { chiOfYear } from '../lib/xemtuoi.js';
import { esc, ICON, backHeader } from './common.js';
import { ILL } from './art.js';
import { giap, giapName } from './zodiac.js';

const THU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const KIND = { tot: ['Sao tốt', 'good'], trung: ['Sao trung bình', 'mid'], xau: ['Sao xấu', 'bad'] };
const NANG = ['', 'Hạn nhẹ', 'Hạn nặng'];
const sh = { born: 0, gender: '', yOff: 0 };
const STAR_PASTEL = { tot: 'mint', trung: 'butter', xau: 'rose' };

/** Hình sao: vòng tròn đèn theo số ngọn của sao (minh họa cách bày đèn) */
function lamps(n) {
  const r = 30;
  const dots = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `<circle cx="${(40 + r * Math.cos(a)).toFixed(1)}" cy="${(40 + r * Math.sin(a)).toFixed(1)}" r="${n > 15 ? 3 : 4}" fill="url(#lampg)"/>`;
  }).join('');
  return `<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><defs><radialGradient id="lampg"><stop offset="0" stop-color="#FFF4C2"/><stop offset=".6" stop-color="#F6B53C"/><stop offset="1" stop-color="#C8392C"/></radialGradient></defs>
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--gold-line)" stroke-dasharray="2 3"/>${dots}<text x="40" y="46" text-anchor="middle" font-size="18" font-weight="700" fill="var(--accent)">${n}</text></svg>`;
}

export function renderSaohan() {
  const st = getState();
  const n = new Date();
  const tj = jdFromDate(n.getDate(), n.getMonth() + 1, n.getFullYear());
  const lyNow = solarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear()).year;
  const year = lyNow + sh.yOff;
  if (!sh.born) sh.born = Number(String(st.profile.dob || '').slice(0, 4)) || 1990;
  if (!sh.gender) sh.gender = st.profile.gender === 'Nữ' ? 'nu' : 'nam';
  const age = tuoiMu(sh.born, year);
  const star = saoOf(age, sh.gender);
  const han = hanOf(age, sh.gender);
  // Ngày cúng: năm nay thì từ hôm nay; năm sau thì từ tháng Giêng năm đó
  const tetJd = (() => { const s = lunarToSolar(1, 1, year, false); return jdFromDate(s.day, s.month, s.year); })();
  const fromJd = sh.yOff ? tetJd : tj;
  const gieng = star ? (() => { const s = lunarToSolar(star.day, 1, year, false); return jdFromDate(s.day, s.month, s.year); })() : 0;
  const days = star ? nextStarDays(star, Math.max(fromJd, tj), 3) : [];
  const jdLink = days[0]?.jd || '';
  const tuoi = `${canChiYear(sh.born)}`;
  const vkLink = `#/vankhan/giaihan?sao=${star?.id || ''}${han ? '&han=' + han.id : ''}&tuoi=${encodeURIComponent(tuoi)}&jd=${jdLink}`;
  const opts = [];
  for (let y = lyNow; y >= 1930; y--) opts.push(`<option value="${y}" ${y === sh.born ? 'selected' : ''}>${y} · ${canChiYear(y)}</option>`);
  // Cả nhà: người còn sống trong gia phả có năm sinh + hồ sơ của bạn
  const fam = st.people.filter((p) => p.born && !p.died).map((p) => ({ name: p.name, born: Number(p.born), gender: p.gender === 'nu' ? 'nu' : 'nam' }));
  const famRows = fam.map((p) => {
    const a = tuoiMu(p.born, year); const s = saoOf(a, p.gender); const h = hanOf(a, p.gender);
    return `<button type="button" class="item" data-pick="${p.born}:${p.gender}">
      <span class="gp-av">${giap(chiOfYear(p.born), 30)}</span>
      <span class="col grow"><span class="t">${esc(p.name)}</span><span class="s">${canChiYear(p.born)} · ${a} tuổi mụ</span></span>
      <span class="col" style="align-items:flex-end;gap:3px"><span class="xt-lv ${KIND[s.kind][1]}">${s.name}</span>${h ? `<span class="small ${h.nang === 2 ? 'err' : 'muted'}">${h.name}</span>` : ''}</span></button>`;
  }).join('');
  const addRemind = star ? `#/add?type=kyniem&cal=am&once=1&ld=${star.day}&lm=1&name=${encodeURIComponent('Cúng dâng sao ' + star.name)}` : '#/add';
  return `<div class="screen no-nav" data-screen="saohan">
  ${backHeader('Sao hạn & giải hạn', '#/tienich', 'Cửu Diệu · bát hạn · cúng dâng sao')}
  <main class="body">
    <div class="grid2"><div class="field"><label class="lb" for="sh-born">Năm sinh (âm lịch)</label><select id="sh-born" class="input">${opts.join('')}</select></div>
      <div class="field"><span class="lb">Giới tính</span><div class="seg" role="group" aria-label="Giới tính">${[['nam', 'Nam'], ['nu', 'Nữ']].map(([k, l]) => `<button type="button" data-g="${k}" aria-pressed="${sh.gender === k}">${l}</button>`).join('')}</div></div></div>
    <div class="seg" role="group" aria-label="Năm xem">${[0, 1].map((o) => `<button type="button" data-y="${o}" aria-pressed="${sh.yOff === o}">${o ? 'Năm sau' : 'Năm nay'} · ${canChiYear(lyNow + o)}</button>`).join('')}</div>

    ${star ? `<section class="card sh-hero ${KIND[star.kind][1]}" aria-label="Sao chiếu mệnh">
      <div class="row" style="gap:12px"><span class="sh-me">${giap(chiOfYear(sh.born), 44)}</span>
        <span class="col grow"><span class="small muted">${sh.gender === 'nu' ? 'Nữ' : 'Nam'} mạng ${canChiYear(sh.born)} (con ${giapName(chiOfYear(sh.born))}) · năm ${canChiYear(year)} · ${age} tuổi mụ</span></span></div>
      <div class="sh-pair">
        <div class="sh-box"><span class="small muted">Sao chiếu mệnh</span><b class="serif">${star.name}</b><span class="xt-lv ${KIND[star.kind][1]}">${KIND[star.kind][0]}</span></div>
        <div class="sh-box"><span class="small muted">Hạn trong năm</span><b class="serif">${han ? han.name : '—'}</b>${han ? `<span class="xt-lv ${han.nang === 2 ? 'bad' : 'mid'}">${NANG[han.nang]}</span>` : '<span class="small muted">Xét từ 10 tuổi</span>'}</div>
      </div>
      <p class="sh-text">${esc(star.tom)}</p>${han ? `<p class="sh-text"><b>${han.name}:</b> ${esc(han.tom.replace(/^Hạn (nặng|nhẹ)[^:]*: ?/, ''))}</p>` : ''}
    </section>

    <section class="card pad col" style="gap:12px" aria-label="Cách cúng dâng sao">
      <div class="row" style="gap:12px;align-items:center">${lamps(star.den)}
        <div class="col grow" style="gap:4px"><b>Cúng dâng sao ${star.name}</b>
          <span class="small">Ngày <b>${star.day} âm lịch</b> hằng tháng · ${star.gio}</span>
          <span class="small">Hướng <b>${star.huong}</b> · thắp <b>${star.den} ngọn</b> đèn/nến</span></div></div>
      <div class="note col" style="align-items:stretch;gap:2px"><span class="small muted">Bài vị ghi</span><b class="serif">${esc(star.baiVi)}</b></div>
      ${days.length ? `<div class="col" style="gap:6px"><span class="lb">Ngày cúng sắp tới</span>${days.map((d) => { const diff = d.jd - tj; return `<div class="sh-day"><b>${THU[(d.jd + 1) % 7]}, ${d.solar.day}/${d.solar.month}/${d.solar.year}</b><span class="small muted">${d.lunar.day}/${d.lunar.month} âm</span><span class="when${diff <= 3 ? ' soon' : ''}">${diff === 0 ? 'Hôm nay' : diff === 1 ? 'Ngày mai' : 'còn ' + diff + ' ngày'}</span></div>`; }).join('')}</div>` : ''}
      <div class="quick-acts"><a class="chip" href="${vkLink}">${ICON.book(16)} Văn khấn dâng sao</a>
        <a class="chip" href="${vkLink}&tab=mam">${ICON.tray(16)} Lễ vật</a>
        ${gieng > tj ? `<a class="chip" href="${addRemind}">${ICON.bell(16)} Nhắc cúng ${star.day}/1 âm</a>` : ''}</div>
      <span class="small muted">Nhiều nhà cúng một lần vào dịp đầu năm (mùng 8 đến rằm tháng Giêng); có nhà cúng hằng tháng nếu gặp sao xấu.</span>
    </section>` : ''}

    <section class="col" style="gap:6px" aria-label="Cả nhà">
      <div class="h2row"><h2 class="h">Cả nhà năm ${canChiYear(year)}</h2><a class="link" href="#/giapha">Gia phả</a></div>
      ${fam.length ? `<div class="card list">${famRows}</div><span class="small muted">Bấm một người để xem chi tiết và cách cúng.</span>`
        : `<a class="note occ" href="#/giapha" style="text-decoration:none;color:var(--ink)"><span class="pastel sm peach">${ILL.tree()}</span><span class="grow"><b>Xem cho cả nhà một lần</b><br><span class="small muted">Thêm mọi người vào Gia phả kèm năm sinh, giới tính</span></span>${ICON.next(18)}</a>`}
    </section>
    <p class="small muted center" style="margin:4px 8px">Sao hạn là tín ngưỡng dân gian để tham khảo. Sống lành, giữ sức khỏe, cẩn trọng việc lớn mới là cách "giải hạn" tốt nhất.</p>
  </main>
</div>`;
}

export function mountSaohan(root, rerender) {
  root.querySelector('#sh-born')?.addEventListener('change', (e) => { sh.born = Number(e.target.value); rerender(); });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-g],[data-y],[data-pick]');
    if (!t) return;
    if (t.dataset.g) sh.gender = t.dataset.g;
    if (t.dataset.y) sh.yOff = Number(t.dataset.y);
    if (t.dataset.pick) { const [b, g] = t.dataset.pick.split(':'); sh.born = Number(b); sh.gender = g; window.scrollTo({ top: 0, behavior: 'smooth' }); }
    rerender();
  });
}
