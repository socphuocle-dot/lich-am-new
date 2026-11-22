package vn.lichamnhacgio.app.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget biểu tượng ngày 1×1 — vẽ bằng WidgetRender, chạy offline. */
public class IconWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager manager, int[] ids) {
        WidgetUpdater.update(ctx, manager, IconWidget.class, ids);
        WidgetUpdater.scheduleMidnight(ctx);
    }

    @Override
    public void onEnabled(Context ctx) {
        WidgetUpdater.scheduleMidnight(ctx);
    }
}
