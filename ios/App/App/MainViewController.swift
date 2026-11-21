import UIKit
import Capacitor

/// View controller chính: đăng ký plugin nội bộ của app.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WidgetBridgePlugin())
    }
}
