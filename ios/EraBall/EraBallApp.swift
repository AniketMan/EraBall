// EraBallApp.swift
import SwiftUI
import GameKit

@main
struct EraBallApp: App {
    @State private var appState = AppState()
    @State private var gcManager = GameCenterManager.shared
    @State private var audio = AudioManager.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
                .environment(gcManager)
                .environment(audio)
                .preferredColorScheme(.dark)
                .onAppear { gcManager.authenticate() }
        }
    }
}

struct RootView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            phaseView
                .transition(.opacity.combined(with: .scale(scale: 0.98)))
                .animation(.smooth(duration: 0.4), value: appState.phase)
            if let ach = appState.pendingAchievementToast {
                AchievementToast(achievement: ach)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5) {
                            withAnimation { appState.pendingAchievementToast = nil }
                        }
                    }
            }
        }
        .task { await appState.boot() }
    }

    @ViewBuilder
    private var phaseView: some View {
        switch appState.phase {
        case .loading:
            LoadingView()
        case .eraSelect:
            EraSelectView()
        case .draft(let era, let salaryCapMode):
            DraftView(era: era, salaryCapMode: salaryCapMode)
        case .coachDraft(let slots, let era, let salaryCapMode):
            CoachDraftView(slots: slots, era: era, salaryCapMode: salaryCapMode)
        case .simulation(let slots, let coach, let era, let salaryCapMode):
            SimulationView(slots: slots, coach: coach, era: era, salaryCapMode: salaryCapMode)
        }
    }
}

struct LoadingView: View {
    @Environment(AppState.self) private var appState
    var body: some View {
        VStack(spacing: 24) {
            Text("ERA BALL")
                .font(Fonts.bebas(56))
                .tracking(12)
                .foregroundStyle(G.gold)
            ProgressView().tint(G.gold).scaleEffect(1.2)
            if let err = appState.loadError {
                Text(err)
                    .font(.system(size: 12))
                    .foregroundStyle(G.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(G.black)
    }
}

struct AchievementToast: View {
    let achievement: Achievement
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Achievement Unlocked")
                .font(.system(size: 10, weight: .semibold))
                .tracking(2)
                .textCase(.uppercase)
                .foregroundStyle(Color(hex: achievement.rarityColor))
            Text(achievement.title)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(G.white)
            Text(achievement.description)
                .font(.system(size: 12))
                .foregroundStyle(G.grey)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(G.surface2)
        .overlay(Rectangle().stroke(Color(hex: achievement.rarityColor).opacity(0.4), lineWidth: 1))
        .padding(.horizontal, 16)
        .padding(.top, 60)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
