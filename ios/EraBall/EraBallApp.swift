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
            case .eraSelect:   HomeTabView()   // themes its own tab CONTENT, never the glass tab bar
            case .draft:       DraftView().eraThemed(era: session.themeEra, on: session.themeOn)
            case .coachDraft:  CoachDraftView().eraThemed(era: session.themeEra, on: session.themeOn)
            case .simulation:  SimulationView().eraThemed(era: session.themeEra, on: session.themeOn)
            }
        }
        .animation(.smooth(duration: 0.35), value: session.phase)
        .overlay(alignment: .top) { AchievementToastStack() }
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

/// In-app "ACHIEVEMENT UNLOCKED" toasts (port of the web toast). Shows every newly
/// unlocked achievement regardless of Game Center state; each auto-dismisses after 5s
/// or on tapping the ✕. The Game Center completion banner (showsCompletionBanner) still
/// fires independently when the player is signed in.
struct AchievementToastStack: View {
    @Environment(GameSession.self) private var session

    var body: some View {
        VStack(spacing: 8) {
            ForEach(session.newlyUnlocked) { a in
                AchievementToast(achievement: a) { session.dismissAchievement(a.id) }
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .padding(.horizontal, 16).padding(.top, 8)
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: session.newlyUnlocked)
    }
}

private struct AchievementToast: View {
    let achievement: AchievementVM
    let onDismiss: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "medal.fill").font(.system(size: 22)).foregroundStyle(G.gold)
            VStack(alignment: .leading, spacing: 2) {
                Text("ACHIEVEMENT UNLOCKED").font(.system(size: 9, weight: .semibold)).tracking(2.5).foregroundStyle(G.gold)
                Text(achievement.title).font(Fonts.bebas(20)).tracking(1).foregroundStyle(G.white)
                Text(achievement.description).font(.system(size: 11)).foregroundStyle(G.grey).fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 4)
            Button(action: onDismiss) {
                Image(systemName: "xmark").font(.system(size: 11, weight: .bold)).foregroundStyle(G.greyDark)
            }.buttonStyle(.plain)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(hex: "#0d0d0d"))
        .overlay(Rectangle().stroke(G.gold, lineWidth: 1))
        .shadow(color: G.gold.opacity(0.2), radius: 16, y: 4)
        .task { try? await Task.sleep(for: .seconds(5)); onDismiss() }
    }
}

/// Hosts the system Game Center sign-in view controller.
struct GameCenterAuthView: UIViewControllerRepresentable {
    let viewController: UIViewController
    func makeUIViewController(context: Context) -> UIViewController { viewController }
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
