package vn.lichamnhacgio.app.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/** Widget Countdown — vẽ bằng WidgetRender, chạy offline. */
public class CountdownWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager manager, int[] ids) {
        WidgetUpdater.update(ctx, manager, CountdownWidget.class, ids);
        WidgetUpdater.scheduleMidnight(ctx);
    }

    @Override
    public void onEnabled(Context ctx) {
        WidgetUpdater.scheduleMidnight(ctx);
    }
}
