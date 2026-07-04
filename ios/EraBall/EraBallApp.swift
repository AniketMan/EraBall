// EraBallApp.swift
import SwiftUI
import GameKit

@main
struct EraBallApp: App {
    @State private var session = GameSession()
    @State private var gameCenter = GameCenterManager.shared
    @State private var audio = AudioManager.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .environment(gameCenter)
                .environment(audio)
                .preferredColorScheme(.dark)
                .tint(G.gold)
                .task {
                    gameCenter.authenticate()
                    await session.boot()
                }
        }
    }
}

struct RootView: View {
    @Environment(GameSession.self) private var session
    @Environment(GameCenterManager.self) private var gameCenter

    var body: some View {
        ZStack {
            G.black.ignoresSafeArea()
            switch session.phase {
            case .loading:     LoadingView()
            case .eraSelect:   EraSelectView()
            case .draft:       DraftView()
            case .coachDraft:  CoachDraftView()
            case .simulation:  SimulationView()
            }
        }
        .animation(.smooth(duration: 0.35), value: session.phase)
        // Present the Game Center sign-in sheet when the system provides it.
        .sheet(isPresented: Binding(get: { gameCenter.showAuthVC && gameCenter.authVC != nil },
                                    set: { if !$0 { gameCenter.showAuthVC = false } })) {
            if let vc = gameCenter.authVC { GameCenterAuthView(viewController: vc) }
        }
    }
}

struct LoadingView: View {
    @Environment(GameSession.self) private var session

    var body: some View {
        ZStack {
            CourtBackground(showStars: true)
            VStack(spacing: 20) {
                Text("ERA BALL")
                    .font(Fonts.bebas(56)).tracking(8).foregroundStyle(G.gold)
                if let err = session.loadError {
                    Text(err).font(.footnote).foregroundStyle(G.grey)
                        .multilineTextAlignment(.center).frame(maxWidth: 300)
                    Button("RETRY") { Task { await session.boot() } }
                        .buttonStyle(GoldButtonStyle())
                } else {
                    ProgressView().controlSize(.large).tint(G.gold)
                    Text("LOADING SEVEN DECADES OF BASKETBALL")
                        .font(.system(size: 10, weight: .semibold)).tracking(2.5).foregroundStyle(G.grey)
                }
            }
            .padding(32)
        }
    }
}

/// Court backdrop with optional warp starfield (era-select + loading).
struct CourtBackground: View {
    var showStars = false
    var body: some View {
        ZStack {
            G.black.ignoresSafeArea()
            if showStars { Starfield() }
        }
    }
}

/// Hosts the system Game Center sign-in view controller.
struct GameCenterAuthView: UIViewControllerRepresentable {
    let viewController: UIViewController
    func makeUIViewController(context: Context) -> UIViewController { viewController }
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
