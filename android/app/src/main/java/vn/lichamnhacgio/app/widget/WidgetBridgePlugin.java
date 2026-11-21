package vn.lichamnhacgio.app.widget;

import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Cầu nối JS → widget: app gửi JSON (ngày giỗ, mốc đếm ngược) rồi vẽ lại widget. */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void setData(PluginCall call) {
        String json = call.getString("json");
        if (json == null) {
            call.reject("Thiếu dữ liệu");
            return;
        }
        Context ctx = getContext();
        ctx.getSharedPreferences(UserStore.PREFS, Context.MODE_PRIVATE).edit().putString(UserStore.KEY, json).apply();
        UserStore.invalidate();
        WidgetUpdater.updateAll(ctx);
        call.resolve();
    }
}
