import SwiftUI

struct SearchView: View {
    @EnvironmentObject private var store: DictionaryStore
    @State private var query = ""
    @State private var direction: SearchDirection = .all

    private var results: [DictionaryEntry] {
        store.search(query, direction: direction)
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.isLoading {
                    ProgressView("正在载入词库…")
                } else if query.isEmpty {
                    landing
                } else if results.isEmpty {
                    ContentUnavailableView.search(text: query)
                } else {
                    resultList
                }
            }
            .navigationTitle("清词")
            .searchable(text: $query, prompt: "输入中文、英文或拼音")
            .onSubmit(of: .search) { store.addToHistory(query) }
            .safeAreaInset(edge: .top) {
                Picker("查询方向", selection: $direction) {
                    ForEach(SearchDirection.allCases) { item in
                        Text(item.title).tag(item)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.bottom, 8)
                .background(.bar)
            }
        }
    }

    private var landing: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "character.book.closed.fill")
                        .font(.system(size: 46))
                        .foregroundStyle(.indigo)
                    Text("安静地查一个词")
                        .font(.title2.bold())
                    Text("离线、无广告。输入中文、英文或拼音即可开始。")
                        .foregroundStyle(.secondary)
                }

                if !store.history.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text("最近查询").font(.headline)
                            Spacer()
                            Button("清除") { store.clearHistory() }
                                .font(.subheadline)
                        }
                        FlowLayout(spacing: 8) {
                            ForEach(store.history, id: \.self) { item in
                                Button(item) {
                                    query = item
                                }
                                .buttonStyle(.bordered)
                                .buttonBorderShape(.capsule)
                            }
                        }
                    }
                }

                Text("内置的是少量演示词条，可在“设置”中导入合法取得的完整 JSON 词库。")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
    }

    private var resultList: some View {
        List(results) { entry in
            NavigationLink(value: entry) {
                EntryRow(entry: entry)
            }
            .simultaneousGesture(TapGesture().onEnded { store.addToHistory(query) })
        }
        .listStyle(.plain)
        .navigationDestination(for: DictionaryEntry.self) { entry in
            EntryDetailView(entry: entry)
        }
    }
}

private struct FlowLayout: Layout {
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        layout(proposal: proposal, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, point) in result.points.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + point.x, y: bounds.minY + point.y), proposal: .unspecified)
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, points: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var points: [CGPoint] = []

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > 0 && x + size.width > maxWidth {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            points.append(CGPoint(x: x, y: y))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return (CGSize(width: maxWidth.isFinite ? maxWidth : x, height: y + rowHeight), points)
    }
}

