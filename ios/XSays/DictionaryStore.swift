import Foundation
import SQLite3

struct DictionaryEntry: Identifiable, Hashable {
    let id: Int64
    let word: String
    let phonetic: String
    let definition: String
    let translation: String
    let exchange: String
}

actor DictionaryStore {
    static let shared = DictionaryStore()
    private var database: OpaquePointer?

    deinit { sqlite3_close(database) }

    func search(_ rawQuery: String, limit: Int = 60) throws -> [DictionaryEntry] {
        let query = rawQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return [] }
        try openIfNeeded()

        let containsChinese = query.unicodeScalars.contains { $0.value >= 0x3400 && $0.value <= 0x9FFF }
        let sql = containsChinese
            ? "SELECT id, word, phonetic, definition, translation, exchange FROM words WHERE translation LIKE ? LIMIT ?"
            : "SELECT id, word, phonetic, definition, translation, exchange FROM words WHERE word >= ? AND word < ? ORDER BY CASE WHEN word = ? THEN 0 ELSE 1 END, frequency, word LIMIT ?"
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(database, sql, -1, &statement, nil) == SQLITE_OK else { throw databaseError() }
        defer { sqlite3_finalize(statement) }

        if containsChinese {
            bind("%\(query)%", to: 1, in: statement)
            sqlite3_bind_int(statement, 2, Int32(limit))
        } else {
            let normalized = query.lowercased()
            bind(normalized, to: 1, in: statement)
            bind(normalized + "\u{10FFFF}", to: 2, in: statement)
            bind(normalized, to: 3, in: statement)
            sqlite3_bind_int(statement, 4, Int32(limit))
        }

        var results: [DictionaryEntry] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            results.append(.init(
                id: sqlite3_column_int64(statement, 0),
                word: text(statement, 1), phonetic: text(statement, 2),
                definition: text(statement, 3), translation: text(statement, 4), exchange: text(statement, 5)
            ))
        }
        return results
    }

    private func openIfNeeded() throws {
        guard database == nil else { return }
        guard let url = Bundle.main.url(forResource: "Dictionary", withExtension: "sqlite", subdirectory: "AppData") else { throw CocoaError(.fileNoSuchFile) }
        guard sqlite3_open_v2(url.path, &database, SQLITE_OPEN_READONLY, nil) == SQLITE_OK else { throw databaseError() }
    }

    private func bind(_ value: String, to index: Int32, in statement: OpaquePointer?) {
        sqlite3_bind_text(statement, index, value, -1, unsafeBitCast(-1, to: sqlite3_destructor_type.self))
    }

    private func text(_ statement: OpaquePointer?, _ column: Int32) -> String {
        guard let value = sqlite3_column_text(statement, column) else { return "" }
        return String(cString: value)
    }

    private func databaseError() -> NSError {
        NSError(domain: "XSays.Dictionary", code: Int(sqlite3_errcode(database)), userInfo: [NSLocalizedDescriptionKey: String(cString: sqlite3_errmsg(database))])
    }
}
