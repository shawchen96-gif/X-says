import Foundation
import Combine

@MainActor
final class DictionaryStore: ObservableObject {
    @Published private(set) var entries: [DictionaryEntry] = []
    @Published private(set) var favorites: Set<String> = []
    @Published private(set) var history: [String] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?

    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()
    private let favoritesKey = "favoriteEntryIDs"
    private let historyKey = "searchHistory"
    private let importedFileName = "imported_dictionary.json"

    init() {
        favorites = Set(UserDefaults.standard.stringArray(forKey: favoritesKey) ?? [])
        history = UserDefaults.standard.stringArray(forKey: historyKey) ?? []
    }

    func load() async {
        guard entries.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            let starter = try Self.decodeEntries(
                from: Bundle.main.url(forResource: "starter_dictionary", withExtension: "json"),
                decoder: decoder
            )
            let bundled = try Self.decodeEntries(
                from: Bundle.main.url(forResource: "ecdict_dictionary", withExtension: "json"),
                decoder: decoder
            )
            let imported = try Self.decodeEntries(from: importedDictionaryURL, decoder: decoder)
            entries = Self.merged(starter + bundled + imported)
        } catch {
            errorMessage = "词库载入失败：\(error.localizedDescription)"
        }
    }

    func search(_ query: String, direction: SearchDirection) -> [DictionaryEntry] {
        let normalized = query
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)

        let candidates = entries.filter(direction.includes)
        guard !normalized.isEmpty else { return Array(candidates.prefix(30)) }

        return candidates
            .filter { $0.searchableText.localizedStandardContains(normalized) }
            .sorted { lhs, rhs in
                let leftExact = lhs.headword.compare(normalized, options: [.caseInsensitive, .diacriticInsensitive]) == .orderedSame
                let rightExact = rhs.headword.compare(normalized, options: [.caseInsensitive, .diacriticInsensitive]) == .orderedSame
                if leftExact != rightExact { return leftExact }
                let leftPrefix = lhs.headword.lowercased().hasPrefix(normalized.lowercased())
                let rightPrefix = rhs.headword.lowercased().hasPrefix(normalized.lowercased())
                if leftPrefix != rightPrefix { return leftPrefix }
                return lhs.headword.localizedStandardCompare(rhs.headword) == .orderedAscending
            }
    }

    func entry(id: String) -> DictionaryEntry? {
        entries.first { $0.id == id }
    }

    func toggleFavorite(_ entry: DictionaryEntry) {
        if favorites.contains(entry.id) {
            favorites.remove(entry.id)
        } else {
            favorites.insert(entry.id)
        }
        UserDefaults.standard.set(Array(favorites), forKey: favoritesKey)
    }

    func addToHistory(_ query: String) {
        let value = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        history.removeAll { $0.caseInsensitiveCompare(value) == .orderedSame }
        history.insert(value, at: 0)
        history = Array(history.prefix(20))
        UserDefaults.standard.set(history, forKey: historyKey)
    }

    func clearHistory() {
        history = []
        UserDefaults.standard.removeObject(forKey: historyKey)
    }

    func importDictionary(from selectedURL: URL) async {
        let hasAccess = selectedURL.startAccessingSecurityScopedResource()
        defer { if hasAccess { selectedURL.stopAccessingSecurityScopedResource() } }

        do {
            let data = try Data(contentsOf: selectedURL)
            let imported = try decoder.decode([DictionaryEntry].self, from: data)
            guard !imported.isEmpty else { throw ImportError.emptyDictionary }
            try validate(imported)

            let destination = try importedDictionaryURLCreatingDirectory()
            let normalizedData = try encoder.encode(imported)
            try normalizedData.write(to: destination, options: .atomic)

            let starter = try Self.decodeEntries(
                from: Bundle.main.url(forResource: "starter_dictionary", withExtension: "json"),
                decoder: decoder
            )
            let bundled = try Self.decodeEntries(
                from: Bundle.main.url(forResource: "ecdict_dictionary", withExtension: "json"),
                decoder: decoder
            )
            entries = Self.merged(starter + bundled + imported)
        } catch {
            errorMessage = "导入失败：\(error.localizedDescription)"
        }
    }

    private var importedDictionaryURL: URL? {
        guard let directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            return nil
        }
        return directory.appendingPathComponent(importedFileName)
    }

    private func importedDictionaryURLCreatingDirectory() throws -> URL {
        guard let url = importedDictionaryURL else { throw ImportError.storageUnavailable }
        try FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        return url
    }

    private func validate(_ imported: [DictionaryEntry]) throws {
        guard imported.allSatisfy({ !$0.id.isEmpty && !$0.headword.isEmpty && !$0.definitions.isEmpty }) else {
            throw ImportError.invalidEntry
        }
    }

    private static func decodeEntries(from url: URL?, decoder: JSONDecoder) throws -> [DictionaryEntry] {
        guard let url, FileManager.default.fileExists(atPath: url.path) else { return [] }
        return try decoder.decode([DictionaryEntry].self, from: Data(contentsOf: url))
    }

    private static func merged(_ entries: [DictionaryEntry]) -> [DictionaryEntry] {
        Array(Dictionary(uniqueKeysWithValues: entries.map { ($0.id, $0) }).values)
            .sorted { $0.headword.localizedStandardCompare($1.headword) == .orderedAscending }
    }
}

private enum ImportError: LocalizedError {
    case emptyDictionary
    case invalidEntry
    case storageUnavailable

    var errorDescription: String? {
        switch self {
        case .emptyDictionary: "文件中没有词条"
        case .invalidEntry: "至少一个词条缺少 id、headword 或 definitions"
        case .storageUnavailable: "无法访问 App 存储目录"
        }
    }
}
