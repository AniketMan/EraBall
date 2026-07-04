// HomeTabView.swift — Liquid Glass tab bar hub for the non-gameplay screens.
// iOS 26 renders TabView (with the `Tab` builder) as a Liquid Glass bar automatically;
// `.tabBarMinimizeBehavior(.onScrollDown)` collapses it into a floating glass pill on scroll.
import SwiftUI

enum HomeTab: Hashable { case home, leaderboard, lifetime, achievements, settings }

struct HomeTabView: View {
    @Environment(GameSession.self) private var session
    @State private var tab: HomeTab = .home

    private func themed(_ v: some View) -> some View {
        v.eraThemed(era: session.themeEra, on: session.themeOn)
    }

    var body: some View {
        TabView(selection: $tab) {
            Tab("Home", systemImage: "house.fill", value: .home) {
                themed(EraSelectView())
            }
            Tab("Ranks", systemImage: "trophy.fill", value: .leaderboard) {
                themed(LeaderboardSheet(embedded: true))
            }
            Tab("Lifetime", systemImage: "chart.bar.fill", value: .lifetime) {
                themed(LifetimeStatsView(embedded: true))
            }
            Tab("Awards", systemImage: "medal.fill", value: .achievements) {
                themed(AchievementsView(embedded: true))
            }
            Tab("Settings", systemImage: "gearshape.fill", value: .settings) {
                SettingsView()   // settings stays un-graded so its own glass reads clearly
            }
        }
        .tint(G.gold)
        .tabBarMinimizeBehavior(.onScrollDown)
    }
}

// MARK: - Settings tab

struct SettingsView: View {
    @Environment(GameSession.self) private var session
    @Environment(AudioManager.self) private var audio
    @Environment(GameCenterManager.self) private var gc
    @State private var showSupporters = false
    @State private var showHelp = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    // Appearance
                    section("APPEARANCE") {
                        Toggle(isOn: Binding(get: { session.themeOn }, set: { session.themeOn = $0 })) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Era Theme").font(.system(size: 14, weight: .semibold)).foregroundStyle(G.white)
                                Text("Color-grade the app to match each decade (CRT, grain, tints).")
                                    .font(.system(size: 11)).foregroundStyle(G.greyDark)
                            }
                        }.tint(G.gold)
                    }

                    // Audio
                    section("AUDIO") {
                        HStack(spacing: 10) {
                            Image(systemName: "speaker.fill").font(.system(size: 12)).foregroundStyle(G.greyDark)
                            Slider(value: Binding(get: { audio.volume }, set: { audio.volume = $0 }), in: 0...1).tint(G.gold)
                            Image(systemName: "speaker.wave.3.fill").font(.system(size: 12)).foregroundStyle(G.greyDark)
                        }
                        Toggle(isOn: Binding(get: { audio.isMuted }, set: { audio.isMuted = $0 })) {
                            Text("Mute").font(.system(size: 14, weight: .semibold)).foregroundStyle(G.white)
                        }.tint(G.gold)
                    }

                    // Game Center
                    section("GAME CENTER") {
                        if gc.isAuthenticated {
                            HStack(spacing: 8) {
                                Image(systemName: "person.crop.circle.badge.checkmark").foregroundStyle(G.green)
                                Text(gc.playerAlias ?? "Signed in").font(.system(size: 14, weight: .semibold)).foregroundStyle(G.white)
                            }
                            Button { gc.showAchievements() } label: { settingsRow("Achievements Dashboard", icon: "medal.fill") }.buttonStyle(.plain)
                        } else {
                            Text("Sign in to Game Center to submit scores and compete with friends. Your runs are saved and submitted automatically once you sign in.")
                                .font(.system(size: 12)).foregroundStyle(G.grey).fixedSize(horizontal: false, vertical: true)
                        }
                    }

                    // Help + support
                    section("SUPPORT & INFO") {
                        Button { showHelp = true } label: { settingsRow("How to Play", icon: "questionmark.circle.fill") }.buttonStyle(.plain)
                        FooterLinkButton(url: "https://ko-fi.com/eshanb", label: "SUPPORT THE GAME", tint: G.gold, width: .infinity)
                        Button { showSupporters = true } label: {
                            Text("★ SUPPORTER HALL OF FAME").font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(G.gold)
                                .frame(maxWidth: .infinity).frame(height: 40).overlay(Rectangle().stroke(G.gold, lineWidth: 1))
                        }.buttonStyle(.plain)
                        HStack(spacing: 12) {
                            FooterLinkButton(url: "https://discord.gg/gFAp5adX", label: "DISCORD", tint: G.greyDark, width: .infinity)
                            FooterLinkButton(url: "https://x.com/Eshan_Design", label: "TWITTER", tint: G.greyDark, width: .infinity)
                        }
                        FooterLinkButton(url: "https://eshanbhattdesign.com", label: "ESHANBHATTDESIGN.COM", tint: G.greyDark, width: .infinity)
                    }

                    Text("EraBall v2.0 · Unofficial fan project. Not affiliated with, endorsed by, or licensed by the NBA.")
                        .font(.system(size: 10)).foregroundStyle(G.greyDark.opacity(0.6))
                        .multilineTextAlignment(.center).frame(maxWidth: .infinity).padding(.top, 8)
                }
                .padding(20).padding(.bottom, 80)
            }
            .background(G.black)
            .navigationTitle("SETTINGS").navigationBarTitleDisplayMode(.inline)
        }
        .sheet(isPresented: $showSupporters) { SupportersSheet() }
        .sheet(isPresented: $showHelp) { HowToPlaySheet() }
        .preferredColorScheme(.dark)
    }

    @ViewBuilder private func section(_ title: String, @ViewBuilder _ content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).font(.system(size: 10, weight: .bold)).tracking(2.5).foregroundStyle(G.gold)
            content()
        }
        .padding(16)
        .glassEffect(.regular, in: .rect(cornerRadius: 14))
    }

    private func settingsRow(_ label: String, icon: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon).foregroundStyle(G.gold).frame(width: 22)
            Text(label).font(.system(size: 14, weight: .semibold)).foregroundStyle(G.white)
            Spacer()
            Image(systemName: "chevron.right").font(.system(size: 11, weight: .semibold)).foregroundStyle(G.greyDark)
        }
    }
}
