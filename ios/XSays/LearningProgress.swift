import Foundation

@MainActor
final class LearningProgress: ObservableObject {
    @Published private(set) var learned: Int
    @Published private(set) var known: Int
    @Published private(set) var review: Set<String>
    @Published private(set) var streak: Int
    @Published private(set) var learnedWords: Set<String>
    @Published var dailyGoal: Int { didSet { dailyGoal = min(max(dailyGoal, 1), 300); saveSettings() } }
    @Published var studyOrder: StudyOrder { didSet { saveSettings() } }
    @Published var autoPlayWord: Bool { didSet { saveSettings() } }
    @Published var autoPlayExample: Bool { didSet { saveSettings() } }
    @Published var speechSpeed: SpeechSpeed { didSet { saveSettings() } }

    private let defaults = UserDefaults.standard
    private var plans: [String: DailyPlan]

    private struct DailyPlan: Codable {
        var date: String
        var bookID: String
        var words: [String]
        var completed: Int
        var target: Int
    }

    init() {
        learned = defaults.integer(forKey: "learned")
        known = defaults.integer(forKey: "known")
        review = Set(defaults.stringArray(forKey: "review") ?? [])
        streak = defaults.integer(forKey: "streak")
        learnedWords = Set(defaults.stringArray(forKey: "learnedWords") ?? [])
        dailyGoal = defaults.object(forKey: "dailyGoal") == nil ? 20 : defaults.integer(forKey: "dailyGoal")
        studyOrder = StudyOrder(rawValue: defaults.string(forKey: "studyOrder") ?? "random") ?? .random
        autoPlayWord = defaults.object(forKey: "autoPlayWord") == nil ? true : defaults.bool(forKey: "autoPlayWord")
        autoPlayExample = defaults.bool(forKey: "autoPlayExample")
        speechSpeed = SpeechSpeed(rawValue: defaults.string(forKey: "speechSpeed") ?? "standard") ?? .standard
        plans = (defaults.data(forKey: "dailyPlans").flatMap { try? JSONDecoder().decode([String: DailyPlan].self, from: $0) }) ?? [:]
    }

    func session(for book: WordBook, from words: [Word]) -> [Word] {
        let key = planKey(book.id)
        let today = Self.dayString(Date())
        if let plan = plans[key], plan.date == today {
            let lookup = Dictionary(uniqueKeysWithValues: words.map { ($0.word, $0) })
            return plan.words.compactMap { lookup[$0] }
        }

        let candidates = words.filter { !learnedWords.contains(wordKey(book.id, $0.word)) }
        let selected = Array((studyOrder == .random ? candidates.shuffled() : candidates).prefix(dailyGoal))
        plans[key] = DailyPlan(date: today, bookID: book.id, words: selected.map(\.word), completed: 0, target: dailyGoal)
        savePlans()
        return selected
    }

    func completedCount(for book: WordBook) -> Int {
        guard let plan = plans[planKey(book.id)], plan.date == Self.dayString(Date()) else { return 0 }
        return min(plan.completed, plan.words.count)
    }

    func mark(_ word: Word, in book: WordBook, known isKnown: Bool) {
        let uniqueKey = wordKey(book.id, word.word)
        if !learnedWords.contains(uniqueKey) {
            learned += 1
            learnedWords.insert(uniqueKey)
        }
        if isKnown {
            known += 1
            review.remove(word.word)
        } else {
            review.insert(word.word)
        }
        let key = planKey(book.id)
        if var plan = plans[key], plan.date == Self.dayString(Date()) {
            plan.completed = min(plan.completed + 1, plan.words.count)
            plans[key] = plan
            savePlans()
        }
        updateStreak()
        save()
    }

    func addTenWords(for book: WordBook, from words: [Word]) -> [Word] {
        let key = planKey(book.id)
        guard var plan = plans[key], plan.date == Self.dayString(Date()) else { return session(for: book, from: words) }
        let existing = Set(plan.words)
        let candidates = words.filter { !existing.contains($0.word) && !learnedWords.contains(wordKey(book.id, $0.word)) }
        let extra = Array((studyOrder == .random ? candidates.shuffled() : candidates).prefix(10))
        plan.words.append(contentsOf: extra.map(\.word))
        plan.target += extra.count
        plans[key] = plan
        savePlans()
        let lookup = Dictionary(uniqueKeysWithValues: words.map { ($0.word, $0) })
        return plan.words.compactMap { lookup[$0] }
    }

    func completeReview(_ word: Word, mastered: Bool) {
        if mastered {
            review.remove(word.word)
            known += 1
        } else {
            review.insert(word.word)
        }
        updateStreak()
        save()
    }

    func reset() {
        learned = 0; known = 0; review = []; streak = 0; learnedWords = []; plans = [:]
        ["learned", "known", "review", "streak", "learnedWords", "dailyPlans", "lastStudyDate"].forEach(defaults.removeObject)
    }

    private func updateStreak() {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let today = formatter.string(from: Date())
        guard defaults.string(forKey: "lastStudyDate") != today else { return }
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        streak = defaults.string(forKey: "lastStudyDate") == yesterday ? streak + 1 : 1
        defaults.set(today, forKey: "lastStudyDate")
    }

    private func save() {
        defaults.set(learned, forKey: "learned")
        defaults.set(known, forKey: "known")
        defaults.set(Array(review), forKey: "review")
        defaults.set(streak, forKey: "streak")
        defaults.set(Array(learnedWords), forKey: "learnedWords")
    }

    private func saveSettings() {
        defaults.set(dailyGoal, forKey: "dailyGoal")
        defaults.set(studyOrder.rawValue, forKey: "studyOrder")
        defaults.set(autoPlayWord, forKey: "autoPlayWord")
        defaults.set(autoPlayExample, forKey: "autoPlayExample")
        defaults.set(speechSpeed.rawValue, forKey: "speechSpeed")
    }

    private func savePlans() {
        if let data = try? JSONEncoder().encode(plans) { defaults.set(data, forKey: "dailyPlans") }
    }

    private func planKey(_ bookID: String) -> String { "plan.\(bookID)" }
    private func wordKey(_ bookID: String, _ word: String) -> String { "\(bookID)::\(word.lowercased())" }

    private static func dayString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}
