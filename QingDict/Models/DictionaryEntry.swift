import Foundation

struct DictionaryEntry: Codable, Identifiable, Hashable, Sendable {
    enum Direction: String, Codable, CaseIterable, Sendable {
        case zhToEn
        case enToZh

        var title: String {
            switch self {
            case .zhToEn: "中 → 英"
            case .enToZh: "英 → 中"
            }
        }
    }

    struct Example: Codable, Hashable, Sendable {
        let source: String
        let translation: String
        let attribution: String?

        init(source: String, translation: String, attribution: String? = nil) {
            self.source = source
            self.translation = translation
            self.attribution = attribution
        }
    }

    let id: String
    let headword: String
    let alternate: String?
    let pronunciation: String?
    let partOfSpeech: String?
    let direction: Direction
    let definitions: [String]
    let examples: [Example]
    let sourceName: String
    let sourceURL: URL?
    let license: String

    var searchableText: String {
        ([headword, alternate, pronunciation].compactMap { $0 } + definitions)
            .joined(separator: " ")
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)
    }
}

enum SearchDirection: String, CaseIterable, Identifiable {
    case all
    case zhToEn
    case enToZh

    var id: Self { self }

    var title: String {
        switch self {
        case .all: "全部"
        case .zhToEn: "中英"
        case .enToZh: "英汉"
        }
    }

    func includes(_ entry: DictionaryEntry) -> Bool {
        switch self {
        case .all: true
        case .zhToEn: entry.direction == .zhToEn
        case .enToZh: entry.direction == .enToZh
        }
    }
}
