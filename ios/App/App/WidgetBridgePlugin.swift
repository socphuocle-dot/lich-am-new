import Foundation
import Capacitor
import WidgetKit

/// Cầu nối JS → widget: app gửi JSON (ngày giỗ, mốc đếm ngược) vào App Group rồi yêu cầu widget vẽ lại.
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setData", returnType: CAPPluginReturnPromise)
    ]

    static let appGroup = "group.vn.lichamnhacgio.app"
    static let key = "widget_json"

    @objc func setData(_ call: CAPPluginCall) {
        guard let json = call.getString("json") else {
            call.reject("Thiếu dữ liệu")
            return
        }
        UserDefaults(suiteName: WidgetBridgePlugin.appGroup)?.set(json, forKey: WidgetBridgePlugin.key)
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}
