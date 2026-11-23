// Sổ quỹ họ: tính tổng thu, chi, còn lại và lập bản tổng kết gửi cả họ.

export const QUY_CATS = [
  ['giotho', 'Giỗ tổ, giỗ họ'], ['khuyenhoc', 'Khuyến học'], ['nhatho', 'Nhà thờ họ, mộ tổ'],
  ['hieuhi', 'Hiếu hỉ trong họ'], ['khac', 'Khác']
];
export const catName = (k) => (QUY_CATS.find((x) => x[0] === k) || QUY_CATS[4])[1];
export const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';

const amt = (x) => Number(x) || 0;

/** Số đã thu của một đợt góp (mỗi hộ đóng mức chung, hoặc số riêng nếu có) */
export function dotStat(d) {
  const members = d.members || [];
  const paid = members.filter((m) => m.paid);
  const each = (m) => (m.amount ? amt(m.amount) : amt(d.per));
  return { total: members.length, paid: paid.length, collected: paid.reduce((a, m) => a + each(m), 0), expected: members.reduce((a, m) => a + each(m), 0) };
}

export function quySummary(quy) {
  const entries = quy?.entries || []; const dots = quy?.dots || [];
  const thuSo = entries.filter((x) => x.dir === 'thu').reduce((a, x) => a + amt(x.amount), 0);
  const chi = entries.filter((x) => x.dir === 'chi').reduce((a, x) => a + amt(x.amount), 0);
  const thuDot = dots.reduce((a, d) => a + dotStat(d).collected, 0);
  const thu = thuSo + thuDot;
  return { thu, chi, con: thu - chi, thuSo, thuDot };
}

/** Bản tổng kết dạng chữ (gửi Zalo) */
export function quyReport(quy, name, date = new Date()) {
  const s = quySummary(quy);
  const L = [`${name.toUpperCase()} — tổng kết ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
    `Đã thu: ${money(s.thu)} · Đã chi: ${money(s.chi)} · Còn lại: ${money(s.con)}`];
  for (const d of quy.dots || []) {
    const st = dotStat(d);
    L.push('', `■ ${d.name}${d.per ? ` (${money(d.per)}/hộ)` : ''}: đã đóng ${st.paid}/${st.total} hộ, thu ${money(st.collected)}`);
    const done = (d.members || []).filter((m) => m.paid).map((m) => m.name);
    const not = (d.members || []).filter((m) => !m.paid).map((m) => m.name);
    if (done.length) L.push('  ✓ Đã đóng: ' + done.join(', '));
    if (not.length) L.push('  ○ Chưa đóng: ' + not.join(', '));
  }
  const list = [...(quy.entries || [])].sort((a, b) => (a.date < b.date ? 1 : -1));
  const chiList = list.filter((x) => x.dir === 'chi').slice(0, 10);
  const thuList = list.filter((x) => x.dir === 'thu').slice(0, 10);
  const line = (x) => `  • ${x.date.split('-').reverse().join('/')} ${x.who ? x.who + ' — ' : ''}${catName(x.cat).toLowerCase()}${x.note ? ' (' + x.note + ')' : ''}: ${money(x.amount)}`;
  if (thuList.length) L.push('', 'Khoản thu khác:', ...thuList.map(line));
  if (chiList.length) L.push('', 'Khoản chi:', ...chiList.map(line));
  L.push('', 'Gửi từ app Lịch Âm & Nhắc Giỗ');
  return L.join('\n');
}
