import SwiftUI

@main
struct XSaysApp: App {
    @StateObject private var progress = LearningProgress()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(progress)
                .tint(.xsMint)
        }
    }
}
