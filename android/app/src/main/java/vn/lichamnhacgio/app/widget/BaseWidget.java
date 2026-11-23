package vn.lichamnhacgio.app.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;

/** Lớp chung cho mọi widget: vẽ lại khi cập nhật và khi người dùng kéo đổi kích thước. */
public abstract class BaseWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager manager, int[] ids) {
        WidgetUpdater.update(ctx, manager, getClass(), ids);
        WidgetUpdater.scheduleMidnight(ctx);
        WidgetUpdater.scheduleHour(ctx);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager manager, int id, Bundle newOptions) {
        // Android 8–11: đổi bố cục theo kích thước mới (Android 12+ tự chọn trong bộ bố cục đã gửi)
        WidgetUpdater.update(ctx, manager, getClass(), new int[]{id});
    }

    @Override
    public void onDeleted(Context ctx, int[] ids) {
        for (int id : ids) UserStore.forget(ctx, id);
    }

    @Override
    public void onEnabled(Context ctx) {
        WidgetUpdater.scheduleMidnight(ctx);
        WidgetUpdater.scheduleHour(ctx);
    }
}
