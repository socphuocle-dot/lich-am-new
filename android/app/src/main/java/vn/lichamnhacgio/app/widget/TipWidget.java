package vn.lichamnhacgio.app.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget Bé Thỏ nhắc — vẽ bằng WidgetRender, chạy offline. */
public class TipWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager manager, int[] ids) {
        WidgetUpdater.update(ctx, manager, TipWidget.class, ids);
        WidgetUpdater.scheduleMidnight(ctx);
    }

    @Override
    public void onEnabled(Context ctx) {
        WidgetUpdater.scheduleMidnight(ctx);
    }
}
