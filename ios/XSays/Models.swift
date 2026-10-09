import Foundation
import SwiftUI

struct Word: Codable, Identifiable, Hashable {
    var id: String { word }
    let word: String
    let phonetic: String
    let part: String
    let meaning: String
    let definition: String
    let example: String
    let translation: String

    enum CodingKeys: String, CodingKey {
        case word = "w", phonetic = "p", part = "t", meaning = "m"
        case definition = "d", example = "e", translation = "z"
    }
}

struct WordBook: Identifiable, Hashable {
    let id: String
    let title: String
    let subtitle: String
    let count: Int
    let level: String
    let color: Color

    static let all: [WordBook] = [
        .init(id: "primary", title: "小学核心词汇", subtitle: "趣味启蒙 · 课本同步", count: 600, level: "PRIMARY", color: .cyan),
        .init(id: "junior", title: "初中必备词汇", subtitle: "中考基础 · 核心词组", count: 1_600, level: "JUNIOR", color: .purple),
        .init(id: "senior", title: "高中高频词汇", subtitle: "高考必备 · 阅读高频", count: 3_500, level: "SENIOR", color: .orange),
        .init(id: "daily", title: "日常口语词汇", subtitle: "生活场景 · 开口就说", count: 1_200, level: "DAILY", color: .yellow),
        .init(id: "cet4", title: "大学英语四级", subtitle: "打牢基础 · 高频必备", count: 2_607, level: "CET-4", color: .green),
        .init(id: "cet6", title: "大学英语六级", subtitle: "进阶提升 · 真题高频", count: 2_078, level: "CET-6", color: .blue),
        .init(id: "ielts", title: "雅思核心词汇", subtitle: "留学备考 · 场景分类", count: 3_421, level: "IELTS", color: .pink),
    ]
}

enum StudyOrder: String, CaseIterable, Identifiable {
    case random
    case sequential

    var id: String { rawValue }
    var title: String { self == .random ? "随机学习" : "按词书顺序" }
}

enum SpeechSpeed: String, CaseIterable, Identifiable {
    case slow
    case standard
    case fast

    var id: String { rawValue }
    var title: String {
        switch self {
        case .slow: "慢速"
        case .standard: "标准"
        case .fast: "快速"
        }
    }

    var rate: Float {
        switch self {
        case .slow: 0.36
        case .standard: 0.45
        case .fast: 0.54
        }
    }
}

extension Color {
    static let xsMint = Color(red: 46 / 255, green: 189 / 255, blue: 133 / 255)
    static let xsInk = Color(red: 23 / 255, green: 37 / 255, blue: 31 / 255)
    static let xsBackground = Color(red: 251 / 255, green: 252 / 255, blue: 249 / 255)
}
