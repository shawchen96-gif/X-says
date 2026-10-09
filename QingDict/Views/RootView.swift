import SwiftUI

struct RootView: View {
    var body: some View {
        TabView {
            SearchView()
                .tabItem { Label("查询", systemImage: "magnifyingglass") }

            FavoritesView()
                .tabItem { Label("收藏", systemImage: "star") }

            SettingsView()
                .tabItem { Label("设置", systemImage: "gearshape") }
        }
        .tint(.indigo)
    }
}

