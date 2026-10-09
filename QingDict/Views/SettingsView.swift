import SwiftUI
import UniformTypeIdentifiers

struct SettingsView: View {
    @EnvironmentObject private var store: DictionaryStore
    @State private var isImporting = false

    var body: some View {
        NavigationStack {
            Form {
                Section("词库") {
                    LabeledContent("当前词条", value: "\(store.entries.count)")
                    Button {
                        isImporting = true
                    } label: {
                        Label("导入 JSON 词库", systemImage: "square.and.arrow.down")
                    }
                } footer: {
                    Text("导入会替换上一次导入的词库，并与内置演示词条合并。相同 id 以导入内容为准。")
                }

                Section("隐私") {
                    Label("查询完全在设备上进行", systemImage: "lock.shield")
                    Label("不含广告与跟踪 SDK", systemImage: "eye.slash")
                }

                Section("关于") {
                    NavigationLink("数据来源与许可证") {
                        LicenseView()
                    }
                    LabeledContent("最低系统", value: "iOS 18")
                }
            }
            .navigationTitle("设置")
            .fileImporter(
                isPresented: $isImporting,
                allowedContentTypes: [.json],
                allowsMultipleSelection: false
            ) { result in
                guard case let .success(urls) = result, let url = urls.first else {
                    if case let .failure(error) = result {
                        store.errorMessage = "无法选择文件：\(error.localizedDescription)"
                    }
                    return
                }
                Task { await store.importDictionary(from: url) }
            }
            .alert("提示", isPresented: Binding(
                get: { store.errorMessage != nil },
                set: { if !$0 { store.errorMessage = nil } }
            )) {
                Button("好", role: .cancel) { store.errorMessage = nil }
            } message: {
                Text(store.errorMessage ?? "")
            }
        }
    }
}

private struct LicenseView: View {
    var body: some View {
        List {
            Section("内置演示数据") {
                Text("由本项目原创，仅用于演示功能，不包含商业字典的释义、例句或音频。")
            }
            Section("外部数据") {
                Text("内置英汉词库含 15,006 个不重复英文词头：释义与音标来自 ECDICT（MIT），其中部分双语例句来自 Tatoeba（CC BY 2.0 France），例句详情保留原始署名。")
                Link("ECDICT 项目与许可证", destination: URL(string: "https://github.com/skywind3000/ECDICT")!)
                Link("Tatoeba 使用条款", destination: URL(string: "https://tatoeba.org/terms_of_use")!)
                Text("另外导入的数据也会在每个词条显示来源名称与许可证；导入者有责任确认使用权限。")
                Link("CC-CEDICT", destination: URL(string: "https://cc-cedict.org/")!)
                Link("Princeton WordNet", destination: URL(string: "https://wordnet.princeton.edu/license-and-commercial-use")!)
                Link("Wiktionary 版权说明", destination: URL(string: "https://en.wiktionary.org/wiki/Wiktionary:Copyrights")!)
            }
            Section("特别提醒") {
                Text("不要从牛津、朗文、有道等商业字典抓取或复制释义、例句、图片和发音，除非已取得明确授权。")
            }
        }
        .navigationTitle("来源与许可证")
    }
}
