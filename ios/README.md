# X-says iOS

这是 X-says 的原生 SwiftUI 版本，最低支持 iOS 17。它不加载网页，也不依赖网络服务。

## 数据

- 七套学习词书位于 `XSays/AppData/Data/`，共 15,006 条。
- 完整离线英汉词典位于 `XSays/AppData/Dictionary.sqlite`，由 ECDICT 的 770,611 条有效记录生成。
- 更新 `work/ECDICT/ecdict.csv` 后，运行 `python3 ios/scripts/build_dictionary.py` 可重新生成数据库。

## 真机运行

1. 用 Xcode 打开 `XSays.xcodeproj`。
2. 选择 X-says Target → Signing & Capabilities，选择自己的 Apple Developer Team。
3. 用数据线或无线调试连接 iPhone，在顶部设备列表中选择该 iPhone。
4. 点击 Run。首次使用免费个人签名时，iPhone 可能要求在“设置 → 通用 → VPN 与设备管理”中信任开发者。

Bundle Identifier 默认为 `com.xsays.dictionary`，如与现有 App 冲突，请在 Signing 页面改成自己的唯一标识。
