import SwiftUI

struct FavoritesView: View {
    @EnvironmentObject private var store: DictionaryStore

    private var entries: [DictionaryEntry] {
        store.favorites.compactMap(store.entry(id:)).sorted {
            $0.headword.localizedStandardCompare($1.headword) == .orderedAscending
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if entries.isEmpty {
                    ContentUnavailableView(
                        "还没有收藏",
                        systemImage: "star",
                        description: Text("打开词条详情，轻点右上角星标即可收藏。")
                    )
                } else {
                    List(entries) { entry in
                        NavigationLink(value: entry) { EntryRow(entry: entry) }
                    }
                    .navigationDestination(for: DictionaryEntry.self) { entry in
                        EntryDetailView(entry: entry)
                    }
                }
            }
            .navigationTitle("收藏")
        }
    }
}

