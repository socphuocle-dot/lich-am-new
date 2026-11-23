package vn.lichamnhacgio.app.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Nhận báo thức nửa đêm, đầu giờ âm, đổi giờ / múi giờ, khởi động máy → vẽ lại widget. */
public class MidnightReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        UserStore.invalidate();
        WidgetUpdater.updateAll(ctx);
    }
}
