import SwiftUI

@main
struct QingDictApp: App {
    @StateObject private var store = DictionaryStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .task { await store.load() }
        }
    }
}

