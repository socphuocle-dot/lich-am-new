package vn.lichamnhacgio.app.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.SizeF;
import android.widget.RemoteViews;

import java.util.Calendar;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Cập nhật tất cả widget, chọn bố cục theo kích thước thật của widget, hẹn giờ vẽ lại
 * lúc nửa đêm và đầu mỗi giờ âm (cho widget đồng hồ: giờ hoàng đạo đổi mỗi 2 tiếng).
 */
public final class WidgetUpdater {
    private WidgetUpdater() {}

    public static final String ACTION_MIDNIGHT = "vn.lichamnhacgio.app.widget.MIDNIGHT";
    public static final String ACTION_HOUR = "vn.lichamnhacgio.app.widget.HOUR";

    static final Class<?>[] ALL = {IconWidget.class, SheetWidget.class, AgendaWidget.class, MonthWidget.class, CountdownWidget.class, TipWidget.class, ClockWidget.class};

    public static void updateAll(Context ctx) {
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        for (Class<?> c : ALL) update(ctx, m, c, m.getAppWidgetIds(new ComponentName(ctx, c)));
        scheduleMidnight(ctx);
        scheduleHour(ctx);
    }

    /** Một bố cục: tên + kích thước tối thiểu (dp) để dùng bố cục đó */
    static final class Variant {
        final String key; final float w, h;
        Variant(String key, float w, float h) { this.key = key; this.w = w; this.h = h; }
    }

    /** Các bố cục của từng loại widget, xếp từ nhỏ đến lớn */
    static Variant[] variants(Class<?> type) {
        if (type == SheetWidget.class) return new Variant[]{new Variant("wide", 100, 40), new Variant("normal", 100, 100), new Variant("tall", 100, 230)};
        if (type == AgendaWidget.class) return new Variant[]{new Variant("line", 200, 40), new Variant("normal", 200, 100), new Variant("tall", 200, 230)};
        if (type == CountdownWidget.class) return new Variant[]{new Variant("mini", 40, 40), new Variant("normal", 100, 100), new Variant("wide", 200, 40), new Variant("big", 220, 100)};
        if (type == MonthWidget.class) return new Variant[]{new Variant("compact", 200, 150), new Variant("full", 200, 300)};
        if (type == ClockWidget.class) return new Variant[]{new Variant("line", 200, 40), new Variant("normal", 200, 100), new Variant("tall", 200, 230)};
        return new Variant[]{new Variant("normal", 0, 0)};
    }

    /** Android 8–11: chọn bố cục lớn nhất vừa với khung (chiều ngang dọc màn hình) */
    static String pick(Class<?> type, int w, int h) {
        Variant[] vs = variants(type);
        if (w <= 0 || h <= 0) return vs.length > 1 ? vs[1].key : vs[0].key; // chưa biết cỡ: dùng cỡ mặc định
        String best = vs[0].key; float area = -1;
        for (Variant v : vs) if (w >= v.w && h >= v.h && v.w * v.h > area) { best = v.key; area = v.w * v.h; }
        return best;
    }

    static RemoteViews render(Context ctx, Class<?> type, String key, int id) {
        if (type == IconWidget.class) return WidgetRender.icon(ctx);
        if (type == SheetWidget.class) return WidgetRender.sheet(ctx, key);
        if (type == AgendaWidget.class) return WidgetRender.agenda(ctx, key);
        if (type == MonthWidget.class) return WidgetRender.month(ctx, "compact".equals(key));
        if (type == TipWidget.class) return WidgetRender.tip(ctx);
        if (type == ClockWidget.class) return WidgetRender.clock(ctx, key, id);
        return WidgetRender.countdown(ctx, key, id);
    }

    static RemoteViews build(Context ctx, AppWidgetManager m, Class<?> type, int id) {
        Variant[] vs = variants(type);
        if (vs.length == 1) return render(ctx, type, vs[0].key, id);
        if (Build.VERSION.SDK_INT >= 31) {
            Map<SizeF, RemoteViews> map = new LinkedHashMap<>();
            for (Variant v : vs) map.put(new SizeF(v.w, v.h), render(ctx, type, v.key, id));
            return new RemoteViews(map);
        }
        Bundle o = m.getAppWidgetOptions(id);
        boolean land = ctx.getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE;
        int w = o == null ? 0 : o.getInt(land ? AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH : AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int h = o == null ? 0 : o.getInt(land ? AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT : AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT);
        return render(ctx, type, pick(type, w, h), id);
    }

    static void update(Context ctx, AppWidgetManager m, Class<?> type, int[] ids) {
        if (ids == null || ids.length == 0) return;
        for (int id : ids) {
            try {
                m.updateAppWidget(id, build(ctx, m, type, id));
            } catch (Exception e) {
                android.util.Log.w("LichAmWidget", "render failed", e);
            }
        }
    }

    public static void scheduleMidnight(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_MONTH, 1);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 30);
        c.set(Calendar.MILLISECOND, 0);
        Intent i = new Intent(ctx, MidnightReceiver.class).setAction(ACTION_MIDNIGHT);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, 7001, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.setAndAllowWhileIdle(AlarmManager.RTC, c.getTimeInMillis(), pi);
    }

    /** Đầu giờ âm kế tiếp (giờ lẻ: 1, 3, 5… 23 giờ) — chỉ khi có widget đồng hồ; không đánh thức máy */
    public static void scheduleHour(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent i = new Intent(ctx, MidnightReceiver.class).setAction(ACTION_HOUR);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, 7002, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        int[] ids = AppWidgetManager.getInstance(ctx).getAppWidgetIds(new ComponentName(ctx, ClockWidget.class));
        if (ids == null || ids.length == 0) { am.cancel(pi); return; }
        Calendar c = Calendar.getInstance();
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 5);
        c.set(Calendar.MILLISECOND, 0);
        c.add(Calendar.HOUR_OF_DAY, c.get(Calendar.HOUR_OF_DAY) % 2 == 0 ? 1 : 2);
        am.set(AlarmManager.RTC, c.getTimeInMillis(), pi);
    }
}
