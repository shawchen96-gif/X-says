import AVFoundation
import SwiftUI

@MainActor
final class Speaker: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    static let shared = Speaker()
    private let synthesizer = AVSpeechSynthesizer()
    @Published private(set) var speakingText: String?

    override private init() {
        super.init()
        synthesizer.delegate = self
    }

    func speak(_ text: String, speed: SpeechSpeed = .standard) {
        synthesizer.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = speed.rate
        speakingText = text
        synthesizer.speak(utterance)
    }

    func toggle(_ text: String, speed: SpeechSpeed = .standard) {
        if speakingText == text { stop() } else { speak(text, speed: speed) }
    }

    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        speakingText = nil
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor in self.speakingText = nil }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        Task { @MainActor in self.speakingText = nil }
    }
}

struct DictionaryView: View {
    @State private var query = ""
    @State private var results: [DictionaryEntry] = []
    @State private var isSearching = false
    @State private var error: String?

    var body: some View {
        Group {
            if query.isEmpty {
                ContentUnavailableView("离线英汉词典", systemImage: "text.book.closed.fill", description: Text("输入英文单词或中文释义，词典数据无需联网"))
            } else if isSearching {
                ProgressView("正在查询…")
            } else if let error {
                ContentUnavailableView("查询失败", systemImage: "exclamationmark.triangle", description: Text(error))
            } else if results.isEmpty {
                ContentUnavailableView.search(text: query)
            } else {
                List(results) { entry in
                    VStack(alignment: .leading, spacing: 7) {
                        HStack {
                            Text(entry.word).font(.title3.bold())
                            Text(entry.phonetic).font(.caption).foregroundStyle(.secondary)
                            Spacer()
                            Button { Speaker.shared.speak(entry.word) } label: { Image(systemName: "speaker.wave.2.fill") }.buttonStyle(.plain)
                        }
                        if !entry.translation.isEmpty { Text(entry.translation).font(.subheadline) }
                        if !entry.definition.isEmpty { Text(entry.definition).font(.caption).foregroundStyle(.secondary) }
                    }.padding(.vertical, 4)
                }.listStyle(.plain)
            }
        }
        .navigationTitle("词典")
        .searchable(text: $query, prompt: "输入单词或中文释义")
        .textInputAutocapitalization(.never).autocorrectionDisabled()
        .task(id: query) {
            guard !query.isEmpty else { results = []; return }
            do {
                try await Task.sleep(for: .milliseconds(250))
                isSearching = true; error = nil
                results = try await DictionaryStore.shared.search(query)
                isSearching = false
            } catch is CancellationError {
            } catch {
                isSearching = false; self.error = error.localizedDescription
            }
        }
    }
}
