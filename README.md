# X-says 英语词典与背词 App

项目的主要交付物是位于 `ios/` 的原生 iOS App。它使用 SwiftUI 开发，可通过 Xcode 安装到 iPhone，不是网页容器或 WebView。

## iOS App

- 原生 SwiftUI 界面，最低支持 iOS 17
- 七套离线词书，共 15,006 条学习词汇
- ECDICT 离线英汉词典，共 770,611 条有效记录
- 英文前缀查询与中文释义查询
- 系统英语发音
- 滑动背词、复习列表、连续学习和本机进度
- 学习数据保存在 iPhone 的 `UserDefaults` 中

使用 Xcode 打开 `ios/XSays.xcodeproj`。详细的签名和真机运行步骤见 `ios/README.md`。

## 更新词典

完整词典源文件是 `work/ECDICT/ecdict.csv`。更新源数据后运行：

```bash
python3 ios/scripts/build_dictionary.py
```

生成的 `ios/XSays/AppData/Dictionary.sqlite` 会直接随 App 安装，查询不需要联网。

## 旧 Web 原型

根目录的 `app/`、`public/`、`worker/` 和 `docs/` 是早期 Web 原型及发布产物，暂时保留用于对照。iOS App 不加载这些网页文件，也不依赖 Node.js 或 Cloudflare 才能运行。
