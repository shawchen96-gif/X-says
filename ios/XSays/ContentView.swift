import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack { LibraryView() }
                .tabItem { Label("学习", systemImage: "books.vertical.fill") }
            NavigationStack { DictionaryView() }
                .tabItem { Label("词典", systemImage: "text.book.closed.fill") }
            NavigationStack { ReviewView() }
                .tabItem { Label("复习", systemImage: "clock.arrow.circlepath") }
            NavigationStack { ProfileView() }
                .tabItem { Label("我的", systemImage: "person.crop.circle.fill") }
        }
    }
}

private struct LibraryView: View {
    @EnvironmentObject private var progress: LearningProgress

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("X-SAYS · SPEAK IT").font(.caption2.bold()).foregroundStyle(.secondary)
                        Text("今天想背哪本？").font(.largeTitle.bold())
                    }
                    Spacer()
                    Label("\(progress.streak)", systemImage: "flame.fill").foregroundStyle(.orange)
                }
                Text("选择适合当前目标的词书，所有内容都保存在本机。")
                    .font(.subheadline).foregroundStyle(.secondary)

                HStack {
                    Label("每日新词", systemImage: "target")
                    Spacer()
                    Text("\(progress.dailyGoal) 个 · \(progress.studyOrder.title)").foregroundStyle(.secondary)
                }
                .font(.subheadline.bold()).padding(14)
                .background(.white, in: RoundedRectangle(cornerRadius: 18))

                ForEach(WordBook.all) { book in
                    NavigationLink(value: book) { BookCard(book: book) }.buttonStyle(.plain)
                }
            }.padding()
        }
        .background(Color.xsBackground)
        .navigationDestination(for: WordBook.self) { WordListView(book: $0) }
        .toolbar(.hidden, for: .navigationBar)
    }
}

private struct BookCard: View {
    let book: WordBook
    var body: some View {
        HStack(spacing: 16) {
            RoundedRectangle(cornerRadius: 14).fill(book.color.gradient)
                .frame(width: 72, height: 92)
                .overlay(VStack { Text(book.level).font(.caption2.bold()); Spacer(); Image(systemName: "text.book.closed.fill") }.foregroundStyle(.white).padding(10))
            VStack(alignment: .leading, spacing: 7) {
                Text(book.title).font(.headline).foregroundStyle(Color.xsInk)
                Text(book.subtitle).font(.caption).foregroundStyle(.secondary)
                Text("\(book.count.formatted()) 词").font(.caption.bold()).foregroundStyle(Color.xsMint)
            }
            Spacer(); Image(systemName: "chevron.right").foregroundStyle(.tertiary)
        }
        .padding(14).background(.white, in: RoundedRectangle(cornerRadius: 22))
        .overlay(RoundedRectangle(cornerRadius: 22).stroke(.gray.opacity(0.12)))
    }
}

private struct WordListView: View {
    let book: WordBook
    @State private var words: [Word] = []
    @State private var query = ""
    @State private var error: String?

    private var filtered: [Word] {
        query.isEmpty ? words : words.filter { $0.word.localizedCaseInsensitiveContains(query) || $0.meaning.contains(query) }
    }

    var body: some View {
        List {
            Section {
                NavigationLink { StudyView(book: book, words: words) } label: {
                    Label("开始今日学习", systemImage: "play.fill").font(.headline).foregroundStyle(Color.xsMint)
                }.disabled(words.isEmpty)
            }
            if let error { ContentUnavailableView("词书读取失败", systemImage: "exclamationmark.triangle", description: Text(error)) }
            ForEach(filtered) { word in
                VStack(alignment: .leading, spacing: 5) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(word.word).font(.headline)
                        Text(word.phonetic).font(.caption).foregroundStyle(.secondary)
                    }
                    Text(word.meaning).font(.subheadline).lineLimit(2)
                }.padding(.vertical, 4)
            }
        }
        .navigationTitle(book.title)
        .searchable(text: $query, prompt: "搜索单词或释义")
        .task {
            do { words = try await WordBookStore.shared.words(for: book) }
            catch { self.error = error.localizedDescription }
        }
    }
}

private struct StudyView: View {
    let book: WordBook
    let words: [Word]
    @EnvironmentObject private var progress: LearningProgress
    @Environment(\.dismiss) private var dismiss
    @State private var index = 0
    @State private var revealed = false
    @State private var session: [Word] = []
    @State private var offset: CGSize = .zero
    @State private var didLoad = false
    @ObservedObject private var speaker = Speaker.shared

    var body: some View {
        VStack(spacing: 18) {
            if index < session.count {
                ProgressView(value: Double(index), total: Double(max(session.count, 1)))
                Text("\(index + 1) / \(session.count)").font(.caption.bold()).foregroundStyle(.secondary)
                wordCard(session[index])
                    .offset(x: offset.width)
                    .rotationEffect(.degrees(Double(offset.width / 20)))
                    .gesture(DragGesture().onChanged { offset = $0.translation }.onEnded { value in
                        if abs(value.translation.width) > 100 { answer(known: value.translation.width > 0) }
                        else { withAnimation(.spring) { offset = .zero } }
                    })
                HStack {
                    Button { answer(known: false) } label: { Label("需要复习", systemImage: "arrow.counterclockwise") }
                        .buttonStyle(.bordered).tint(.red)
                    Button { answer(known: true) } label: { Label("我认识", systemImage: "checkmark") }
                        .buttonStyle(.borderedProminent).tint(.xsMint)
                }
            } else {
                ContentUnavailableView("今日完成", systemImage: "checkmark.seal.fill", description: Text("已学习 \(session.count) 个单词"))
                HStack {
                    Button("返回词书") { dismiss() }.buttonStyle(.bordered)
                    Button("再学 10 个") {
                        session = progress.addTenWords(for: book, from: words)
                        speakCurrentWord()
                    }.buttonStyle(.borderedProminent).tint(.xsMint)
                }
            }
        }
        .padding().navigationTitle(book.level).navigationBarTitleDisplayMode(.inline)
        .onAppear {
            guard !didLoad else { return }
            session = progress.session(for: book, from: words)
            index = progress.completedCount(for: book)
            didLoad = true
            speakCurrentWord()
        }
        .onDisappear { speaker.stop() }
    }

    private func wordCard(_ word: Word) -> some View {
        VStack(spacing: 18) {
            Spacer(); Text(word.word).font(.system(size: 42, weight: .bold, design: .serif))
            Text(word.phonetic).foregroundStyle(.secondary)
            Button { speaker.toggle(word.word, speed: progress.speechSpeed) } label: {
                Image(systemName: speaker.speakingText == word.word ? "speaker.wave.3.fill" : "speaker.wave.2.fill").font(.title2)
            }
            Text("\(word.part) \(word.meaning)")
                .font(.title3).multilineTextAlignment(.center)
            if revealed {
                Divider()
                if !word.example.isEmpty {
                    HStack(alignment: .top, spacing: 10) {
                        Text(word.example).font(.body.italic()).multilineTextAlignment(.center)
                        Button { speaker.toggle(word.example, speed: progress.speechSpeed) } label: {
                            Image(systemName: speaker.speakingText == word.example ? "stop.circle.fill" : "speaker.wave.2")
                        }.buttonStyle(.plain).accessibilityLabel("朗读例句")
                    }
                    .foregroundStyle(speaker.speakingText == word.example ? Color.xsMint : .primary)
                    Text(word.translation).font(.caption).foregroundStyle(.secondary)
                }
            } else {
                Button("查看例句") {
                    withAnimation { revealed = true }
                    if progress.autoPlayExample, !word.example.isEmpty { speaker.speak(word.example, speed: progress.speechSpeed) }
                }.foregroundStyle(.secondary)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, minHeight: 440)
        .padding().background(.white, in: RoundedRectangle(cornerRadius: 30))
        .shadow(color: .black.opacity(0.08), radius: 24, y: 12)
    }

    private func answer(known: Bool) {
        guard index < session.count else { return }
        speaker.stop()
        progress.mark(session[index], in: book, known: known)
        withAnimation(.easeInOut(duration: 0.18)) { offset.width = known ? 500 : -500 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            index += 1; revealed = false; offset = .zero
            speakCurrentWord()
        }
    }

    private func speakCurrentWord() {
        guard progress.autoPlayWord, index < session.count else { return }
        speaker.speak(session[index].word, speed: progress.speechSpeed)
    }
}

private struct ReviewView: View {
    @EnvironmentObject private var progress: LearningProgress
    @State private var words: [Word] = []
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        Group {
            if progress.review.isEmpty {
                ContentUnavailableView("暂无复习单词", systemImage: "checkmark.circle", description: Text("学习时选择“需要复习”的单词会出现在这里"))
            } else if isLoading {
                ProgressView("正在准备复习…")
            } else if let error {
                ContentUnavailableView("复习内容读取失败", systemImage: "exclamationmark.triangle", description: Text(error))
            } else {
                List {
                    Section {
                        NavigationLink { ReviewStudyView(words: words) } label: {
                            Label("开始复习 \(words.count) 个单词", systemImage: "play.fill")
                                .font(.headline).foregroundStyle(Color.xsMint)
                        }.disabled(words.isEmpty)
                    }
                    Section("待复习") {
                        ForEach(words) { word in
                            VStack(alignment: .leading, spacing: 5) {
                                HStack {
                                    Text(word.word).font(.headline)
                                    Text(word.phonetic).font(.caption).foregroundStyle(.secondary)
                                }
                                Text(word.meaning).font(.subheadline).foregroundStyle(.secondary).lineLimit(2)
                            }.padding(.vertical, 3)
                        }
                    }
                }
            }
        }
        .navigationTitle("复习")
        .task { await loadReviewWords() }
    }

    private func loadReviewWords() async {
        guard !progress.review.isEmpty else { words = []; return }
        isLoading = true; error = nil
        do { words = try await WordBookStore.shared.reviewWords(matching: progress.review) }
        catch { self.error = error.localizedDescription }
        isLoading = false
    }
}

private struct ReviewStudyView: View {
    let words: [Word]
    @EnvironmentObject private var progress: LearningProgress
    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var speaker = Speaker.shared
    @State private var index = 0
    @State private var revealed = false
    @State private var offset: CGSize = .zero

    var body: some View {
        VStack(spacing: 18) {
            if index < words.count {
                ProgressView(value: Double(index), total: Double(max(words.count, 1)))
                Text("\(index + 1) / \(words.count)").font(.caption.bold()).foregroundStyle(.secondary)
                reviewCard(words[index])
                    .offset(x: offset.width)
                    .rotationEffect(.degrees(Double(offset.width / 20)))
                    .gesture(DragGesture().onChanged { offset = $0.translation }.onEnded { value in
                        if abs(value.translation.width) > 100 { answer(mastered: value.translation.width > 0) }
                        else { withAnimation(.spring) { offset = .zero } }
                    })
                HStack {
                    Button { answer(mastered: false) } label: { Label("再复习", systemImage: "arrow.counterclockwise") }
                        .buttonStyle(.bordered).tint(.orange)
                    Button { answer(mastered: true) } label: { Label("已掌握", systemImage: "checkmark") }
                        .buttonStyle(.borderedProminent).tint(.xsMint)
                }
            } else {
                ContentUnavailableView("本轮复习完成", systemImage: "checkmark.seal.fill", description: Text("仍需复习 \(progress.review.count) 个单词"))
                Button("完成") { dismiss() }.buttonStyle(.borderedProminent).tint(.xsMint)
            }
        }
        .padding().navigationTitle("单词复习").navigationBarTitleDisplayMode(.inline)
        .onAppear { speakCurrentWord() }
        .onDisappear { speaker.stop() }
    }

    private func reviewCard(_ word: Word) -> some View {
        VStack(spacing: 18) {
            Spacer()
            Text(word.word).font(.system(size: 42, weight: .bold, design: .serif))
            Text(word.phonetic).foregroundStyle(.secondary)
            Button { speaker.toggle(word.word, speed: progress.speechSpeed) } label: {
                Image(systemName: speaker.speakingText == word.word ? "speaker.wave.3.fill" : "speaker.wave.2.fill").font(.title2)
            }
            Text("\(word.part) \(word.meaning)")
                .font(.title3).multilineTextAlignment(.center)
            if revealed {
                Divider()
                if !word.example.isEmpty {
                    HStack(alignment: .top, spacing: 10) {
                        Text(word.example).font(.body.italic()).multilineTextAlignment(.center)
                        Button { speaker.toggle(word.example, speed: progress.speechSpeed) } label: {
                            Image(systemName: speaker.speakingText == word.example ? "stop.circle.fill" : "speaker.wave.2")
                        }.buttonStyle(.plain).accessibilityLabel("朗读例句")
                    }
                    Text(word.translation).font(.caption).foregroundStyle(.secondary)
                }
            } else {
                Button("查看例句") {
                    withAnimation { revealed = true }
                    if progress.autoPlayExample, !word.example.isEmpty { speaker.speak(word.example, speed: progress.speechSpeed) }
                }.foregroundStyle(.secondary)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, minHeight: 440)
        .padding().background(.white, in: RoundedRectangle(cornerRadius: 30))
        .shadow(color: .black.opacity(0.08), radius: 24, y: 12)
    }

    private func answer(mastered: Bool) {
        guard index < words.count else { return }
        speaker.stop()
        progress.completeReview(words[index], mastered: mastered)
        withAnimation(.easeInOut(duration: 0.18)) { offset.width = mastered ? 500 : -500 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            index += 1; revealed = false; offset = .zero
            speakCurrentWord()
        }
    }

    private func speakCurrentWord() {
        guard progress.autoPlayWord, index < words.count else { return }
        speaker.speak(words[index].word, speed: progress.speechSpeed)
    }
}

private struct ProfileView: View {
    @EnvironmentObject private var progress: LearningProgress
    @State private var customGoal = ""
    var body: some View {
        Form {
            Section("学习统计") {
                LabeledContent("已学习", value: "\(progress.learned)")
                LabeledContent("已掌握", value: "\(progress.known)")
                LabeledContent("待复习", value: "\(progress.review.count)")
                LabeledContent("连续学习", value: "\(progress.streak) 天")
            }
            Section("每日学习计划") {
                Picker("每日新词", selection: $progress.dailyGoal) {
                    ForEach([10, 20, 30, 50, 100], id: \.self) { Text("\($0) 个").tag($0) }
                    if ![10, 20, 30, 50, 100].contains(progress.dailyGoal) {
                        Text("\(progress.dailyGoal) 个").tag(progress.dailyGoal)
                    }
                }
                Picker("学习顺序", selection: $progress.studyOrder) {
                    ForEach(StudyOrder.allCases) { Text($0.title).tag($0) }
                }
                HStack {
                    TextField("自定义 1–300", text: $customGoal).keyboardType(.numberPad)
                    Button("应用") {
                        if let value = Int(customGoal), (1...300).contains(value) { progress.dailyGoal = value; customGoal = "" }
                    }
                }
                Text("修改后的数量将在下一份新计划中生效。").font(.caption).foregroundStyle(.secondary)
            }
            Section("发音设置") {
                Toggle("自动播放单词", isOn: $progress.autoPlayWord)
                Toggle("释义展开后播放例句", isOn: $progress.autoPlayExample)
                Picker("发音速度", selection: $progress.speechSpeed) {
                    ForEach(SpeechSpeed.allCases) { Text($0.title).tag($0) }
                }
            }
            Section { Button("清除本机学习记录", role: .destructive) { progress.reset() } }
        }.navigationTitle("我的")
    }
}
