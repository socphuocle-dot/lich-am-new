package vn.lichamnhacgio.app.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import java.util.Calendar;

/** Cập nhật tất cả widget và hẹn giờ vẽ lại lúc nửa đêm (không cần quyền báo thức chính xác). */
public final class WidgetUpdater {
    private WidgetUpdater() {}

    public static final String ACTION_MIDNIGHT = "vn.lichamnhacgio.app.widget.MIDNIGHT";

    public static void updateAll(Context ctx) {
        AppWidgetManager m = AppWidgetManager.getInstance(ctx);
        update(ctx, m, IconWidget.class, m.getAppWidgetIds(new ComponentName(ctx, IconWidget.class)));
        update(ctx, m, SheetWidget.class, m.getAppWidgetIds(new ComponentName(ctx, SheetWidget.class)));
        update(ctx, m, AgendaWidget.class, m.getAppWidgetIds(new ComponentName(ctx, AgendaWidget.class)));
        update(ctx, m, MonthWidget.class, m.getAppWidgetIds(new ComponentName(ctx, MonthWidget.class)));
        update(ctx, m, CountdownWidget.class, m.getAppWidgetIds(new ComponentName(ctx, CountdownWidget.class)));
        update(ctx, m, TipWidget.class, m.getAppWidgetIds(new ComponentName(ctx, TipWidget.class)));
        scheduleMidnight(ctx);
    }

    static void update(Context ctx, AppWidgetManager m, Class<?> type, int[] ids) {
        if (ids == null || ids.length == 0) return;
        for (int id : ids) {
            RemoteViews v;
            try {
                if (type == IconWidget.class) v = WidgetRender.icon(ctx);
                else if (type == SheetWidget.class) v = WidgetRender.sheet(ctx);
                else if (type == AgendaWidget.class) v = WidgetRender.agenda(ctx);
                else if (type == MonthWidget.class) v = WidgetRender.month(ctx);
                else if (type == TipWidget.class) v = WidgetRender.tip(ctx);
                else v = WidgetRender.countdown(ctx);
                m.updateAppWidget(id, v);
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
}
