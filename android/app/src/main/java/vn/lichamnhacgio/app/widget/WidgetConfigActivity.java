package vn.lichamnhacgio.app.widget;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

/**
 * Màn chọn nội dung riêng cho từng widget (mở khi thêm widget, hoặc giữ widget → Cấu hình lại trên Android 12+):
 *  - Đếm ngược: theo cài đặt app / Tết / Ông Công Ông Táo / một ngày giỗ cụ thể.
 *  - Đồng hồ & lịch âm: kiểu theo app / Giấy / Sơn mài.
 * Giao diện dựng bằng mã (không cần thư viện), chữ to, dễ bấm.
 */
public class WidgetConfigActivity extends Activity {
    private int widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private String key = "cd";
    private final List<String> values = new ArrayList<>();

    private int dp(float v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        Bundle extras = getIntent().getExtras();
        if (extras != null) widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        // Người dùng bấm Quay lại = hủy thêm widget (Android 8–11)
        setResult(RESULT_CANCELED, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId));
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }

        AppWidgetProviderInfo info = AppWidgetManager.getInstance(this).getAppWidgetInfo(widgetId);
        boolean clock = info != null && info.provider != null && info.provider.getClassName().endsWith("ClockWidget");
        key = clock ? "cs" : "cd";

        List<String> labels = new ArrayList<>();
        if (clock) {
            add(labels, "app", "Theo cài đặt trong app");
            add(labels, "giay", "Giấy — ô ngày đỏ, nền giấy");
            add(labels, "sonmai", "Sơn mài — dải đỏ ngang");
        } else {
            add(labels, "app", "Theo cài đặt trong app (giỗ gần nhất hoặc Tết)");
            add(labels, "tet", "Tết Nguyên Đán");
            add(labels, "ongtao", "Ông Công Ông Táo (23 tháng Chạp)");
            for (String[] g : UserStore.gioChoices(this, CalendarStore.todayEpoch())) add(labels, "g:" + g[0], g[1] + "  ·  " + g[2]);
        }
        String current = UserStore.choice(this, key, widgetId);

        int ink = 0xFF17110E, muted = 0xFF6B5F55, accent = 0xFF9B1A12, paper = 0xFFFFFCF6;
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(paper);
        root.setPadding(dp(20), dp(28), dp(20), dp(16));

        TextView title = new TextView(this);
        title.setText(clock ? "Kiểu widget đồng hồ" : "Widget này đếm ngược tới");
        title.setTextColor(ink);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        root.addView(title);
        TextView sub = new TextView(this);
        sub.setText(clock ? "Mỗi widget có thể chọn kiểu riêng." : "Mỗi widget đếm ngược có thể chọn một mốc riêng — ví dụ một cái đếm tới Tết, một cái đếm tới giỗ ông.");
        sub.setTextColor(muted);
        sub.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        sub.setPadding(0, dp(4), 0, dp(12));
        root.addView(sub);

        RadioGroup group = new RadioGroup(this);
        group.setOrientation(RadioGroup.VERTICAL);
        int checked = -1;
        for (int i = 0; i < labels.size(); i++) {
            RadioButton rb = new RadioButton(this);
            rb.setId(View.generateViewId());
            rb.setText(labels.get(i));
            rb.setTextColor(ink);
            rb.setTextSize(TypedValue.COMPLEX_UNIT_SP, 17);
            rb.setMinHeight(dp(52));
            rb.setPadding(dp(8), 0, 0, 0);
            rb.setTag(values.get(i));
            group.addView(rb, new RadioGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            if (values.get(i).equals(current)) checked = rb.getId();
        }
        if (checked == -1 && group.getChildCount() > 0) checked = group.getChildAt(0).getId();
        group.check(checked);
        if (!clock && values.size() <= 3) {
            TextView hint = new TextView(this);
            hint.setText("Thêm ngày giỗ trong app để chọn đếm ngược tới từng người.");
            hint.setTextColor(muted);
            hint.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
            hint.setPadding(0, dp(8), 0, 0);
            group.addView(hint);
        }
        ScrollView scroll = new ScrollView(this);
        scroll.addView(group);
        root.addView(scroll, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        Button done = new Button(this);
        done.setText("Xong");
        done.setAllCaps(false);
        done.setTextColor(Color.WHITE);
        done.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        done.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(accent);
        bg.setCornerRadius(dp(16));
        done.setBackground(bg);
        done.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(56));
        lp.topMargin = dp(12);
        root.addView(done, lp);
        done.setOnClickListener(v -> {
            View sel = group.findViewById(group.getCheckedRadioButtonId());
            String value = sel != null && sel.getTag() != null ? String.valueOf(sel.getTag()) : "app";
            UserStore.setChoice(this, key, widgetId, value);
            AppWidgetManager m = AppWidgetManager.getInstance(this);
            WidgetUpdater.update(this, m, clock ? ClockWidget.class : CountdownWidget.class, new int[]{widgetId});
            setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId));
            finish();
        });
        setContentView(root);
    }

    private void add(List<String> labels, String value, String label) {
        values.add(value);
        labels.add(label);
    }
}
