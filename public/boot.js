// Lưới an toàn khi khởi động: nếu giao diện không hiện được sau vài giây,
// hiện lỗi cụ thể để người dùng chụp gửi tác giả (thay vì màn hình trống).
(function () {
  var errs = [];
  window.__bootErrors = errs;
  window.addEventListener('error', function (e) {
    errs.push((e.message || 'Lỗi') + (e.filename ? ' @ ' + e.filename.split('/').pop() + ':' + e.lineno + ':' + e.colno : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    errs.push('Promise: ' + (r && (r.stack || r.message) || String(r)));
  });
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  window.__showBootError = function (msg) {
    var el = document.getElementById('app');
    if (!el) return;
    el.innerHTML = '<div style="padding:40px 20px;font-family:system-ui,sans-serif;color:#2B1B17;line-height:1.5">' +
      '<h2 style="color:#9B1A12;margin:0 0 8px">Chưa mở được giao diện</h2>' +
      '<p style="margin:0 0 12px">Bạn chụp màn hình này gửi tác giả qua Zalo <b>0903 545 334</b> để sửa nhanh. Dữ liệu của bạn vẫn còn nguyên.</p>' +
      '<pre style="white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #E6DACB;padding:12px;border-radius:12px;font-size:12px;max-height:50vh;overflow:auto">' + esc(msg) + '</pre>' +
      '<button id="boot-retry" style="margin-top:12px;width:100%;height:48px;border:0;border-radius:14px;background:#9B1A12;color:#fff;font-size:16px;font-weight:600">Thử mở lại</button></div>';
    var b = document.getElementById('boot-retry');
    if (b) b.addEventListener('click', function () { location.reload(); });
  };
  setTimeout(function () {
    var el = document.getElementById('app');
    if (el && !el.firstElementChild) {
      window.__showBootError((errs.join('\n') || 'Không có lỗi JavaScript — có thể một thành phần của máy không phản hồi.') + '\n\n' + navigator.userAgent);
    }
  }, 6000);
})();
