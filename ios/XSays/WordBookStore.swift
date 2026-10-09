import Foundation

actor WordBookStore {
    static let shared = WordBookStore()
    private var cache: [String: [Word]] = [:]

    func words(for book: WordBook) throws -> [Word] {
        if let cached = cache[book.id] { return cached }
        guard let url = Bundle.main.url(forResource: book.id, withExtension: "json", subdirectory: "AppData/Data") else {
            throw CocoaError(.fileNoSuchFile)
        }
        let words = try JSONDecoder().decode([Word].self, from: Data(contentsOf: url))
        cache[book.id] = words
        return words
    }

    func reviewWords(matching targets: Set<String>) throws -> [Word] {
        guard !targets.isEmpty else { return [] }
        var found: [String: Word] = [:]
        for book in WordBook.all {
            for word in try words(for: book) where targets.contains(word.word) && found[word.word] == nil {
                found[word.word] = word
            }
        }
        return targets.sorted().compactMap { found[$0] }
    }
}
