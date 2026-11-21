package vn.lichamnhacgio.app.widget;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Dữ liệu động do app ghi: ngày giỗ sắp tới + mốc đếm ngược. */
public final class UserStore {
    private UserStore() {}

    public static final String PREFS = "lich_am_widget";
    public static final String KEY = "json";

    public static final class Item implements Comparable<Item> {
        public long epoch;
        public String title;
        public int kind; // 1 rằm/mùng 1, 2 lễ, 3 giỗ

        Item(long epoch, String title, int kind) {
            this.epoch = epoch;
            this.title = title;
            this.kind = kind;
        }

        @Override
        public int compareTo(Item o) {
            if (epoch != o.epoch) return epoch < o.epoch ? -1 : 1;
            return o.kind - kind; // giỗ lên trước
        }
    }

    private static JSONObject cache;

    public static synchronized void invalidate() {
        cache = null;
    }

    private static synchronized JSONObject data(Context ctx) {
        if (cache != null) return cache;
        try {
            String s = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null);
            cache = s != null ? new JSONObject(s) : new JSONObject();
        } catch (Exception e) {
            cache = new JSONObject();
        }
        return cache;
    }

    /** Ngày giỗ trong khoảng [from, from+days) */
    public static List<Item> gios(Context ctx, long from, int days) {
        List<Item> out = new ArrayList<>();
        JSONArray a = data(ctx).optJSONArray("gios");
        if (a == null) return out;
        for (int i = 0; i < a.length(); i++) {
            JSONObject g = a.optJSONObject(i);
            if (g == null) continue;
            long e = CalendarStore.epochFromYmd(g.optString("d"));
            if (e >= from && e < from + days) out.add(new Item(e, g.optString("t"), 3));
        }
        return out;
    }

    /** Sự kiện sắp tới (giỗ + lễ + rằm/mùng 1) đã sắp xếp. */
    public static List<Item> upcoming(Context ctx, long from, int days, int max) {
        List<Item> out = gios(ctx, from, days);
        for (long e = from; e < from + days; e++) {
            CalendarStore.Day d = CalendarStore.day(ctx, e);
            if (d.kind > 0 && !d.event.isEmpty()) out.add(new Item(e, d.event, d.kind));
        }
        Collections.sort(out);
        return out.size() > max ? new ArrayList<>(out.subList(0, max)) : out;
    }

    public static boolean hasGio(Context ctx, long epoch) {
        return !gios(ctx, epoch, 1).isEmpty();
    }

    /** Mốc đếm ngược: do app chọn, nếu chưa có thì lấy Tết sắp tới từ bảng tĩnh. */
    public static Item countdown(Context ctx, long today) {
        JSONObject cd = data(ctx).optJSONObject("cd");
        if (cd != null) {
            long e = CalendarStore.epochFromYmd(cd.optString("d"));
            if (e >= today) return new Item(e, cd.optString("t"), 3);
        }
        for (long e = today; e < today + 400; e++) {
            CalendarStore.Day d = CalendarStore.day(ctx, e);
            if (d.ld == 1 && d.lm == 1 && !d.leap) return new Item(e, "Tết Nguyên Đán", 2);
        }
        return null;
    }
}
