import SwiftUI

@main
struct EraBallApp: App {
    @State private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
                .task {
                    await appState.boot()
                }
        }
    }
}

struct RootView: View {
    @Environment(AppState.self) private var state
    
    var body: some View {
        ZStack {
            Theme.black.ignoresSafeArea()
            
            // TODO: Metal Starfield background here
            
            Group {
                switch state.phase {
                case .loading:
                    ProgressView().tint(Theme.gold)
                case .eraSelect:
                    EraSelectView()
                case .draft:
                    DraftView()
                case .coachDraft:
                    CoachDraftView()
                case .simulation, .results:
                    SimulationView()
                }
            }
            .ignoresSafeArea()
        }
        .preferredColorScheme(.dark)
    }
}
