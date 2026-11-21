// Gửi dữ liệu xuống widget (Android: SharedPreferences, iOS: App Group) rồi yêu cầu vẽ lại.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { buildUserWidgetData } from './lib/widgetData.js';

const WidgetBridge = registerPlugin('WidgetBridge');
let timer = null;

export function pushWidgetData(state, delay = 600) {
  if (!Capacitor.isNativePlatform()) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const data = buildUserWidgetData(new Date(), state);
      await WidgetBridge.setData({ json: JSON.stringify(data) });
    } catch (e) {
      console.warn('Không cập nhật được widget', e);
    }
  }, delay);
}
