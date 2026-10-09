import SwiftUI

struct EntryRow: View {
    let entry: DictionaryEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(entry.headword)
                    .font(.title3.bold())
                if let pronunciation = entry.pronunciation {
                    Text(pronunciation)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(entry.direction.title)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.indigo)
            }
            Text(entry.definitions.prefix(2).joined(separator: "；"))
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
    }
}

struct EntryDetailView: View {
    @EnvironmentObject private var store: DictionaryStore
    let entry: DictionaryEntry

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text(entry.headword)
                        .font(.largeTitle.bold())
                    if let alternate = entry.alternate, alternate != entry.headword {
                        Text(alternate).font(.title3)
                    }
                    HStack {
                        if let pronunciation = entry.pronunciation {
                            Text(pronunciation).foregroundStyle(.secondary)
                        }
                        if let part = entry.partOfSpeech {
                            Text(part)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(.indigo.opacity(0.12), in: Capsule())
                        }
                    }
                }
                .padding(.vertical, 8)
            }

            Section("释义") {
                ForEach(Array(entry.definitions.enumerated()), id: \.offset) { index, definition in
                    HStack(alignment: .top) {
                        Text("\(index + 1).")
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                        Text(definition)
                    }
                }
            }

            if !entry.examples.isEmpty {
                Section("例句") {
                    ForEach(entry.examples, id: \.self) { example in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(example.source)
                            Text(example.translation)
                                .foregroundStyle(.secondary)
                            if let attribution = example.attribution {
                                Text(attribution)
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                        .padding(.vertical, 3)
                    }
                }
            }

            Section("数据来源") {
                LabeledContent("来源", value: entry.sourceName)
                LabeledContent("许可", value: entry.license)
                if let url = entry.sourceURL {
                    Link("查看来源网站", destination: url)
                }
            }
        }
        .navigationTitle(entry.headword)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Button {
                store.toggleFavorite(entry)
            } label: {
                Label(
                    store.favorites.contains(entry.id) ? "取消收藏" : "收藏",
                    systemImage: store.favorites.contains(entry.id) ? "star.fill" : "star"
                )
            }
        }
    }
}
