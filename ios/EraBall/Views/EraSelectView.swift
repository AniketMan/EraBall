// EraSelectView.swift
// Pixel-faithful port of the web era-select screen (app/page.tsx EraSelection):
// starfield bg | TopBar (? + mute) | SIMULATION ERA banner | years/desc/note
// | 4-col era grid | RANDOM / NORMAL DRAFT / SALARY CAP DRAFT | menu links.

import SwiftUI

private let ERA_IDS = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]

private let ERA_YEARS: [String: String] = [
    "50s": "1950–1959", "60s": "1960–1969", "70s": "1970–1979", "80s": "1980–1989",
    "90s": "1990–1999", "00s": "2000–2009", "10s": "2010–2019", "20s": "2020–present",
]

private let ERA_DESC: [String: (style: String, note: String)] = [
    "50s": ("Slow, physical, half-court basketball. No 3-point line, and very low scoring. Big men ruled the paint.", "Pre-3pt - Modern shooters lose value here"),
    "60s": ("Dominant big men, intense defense. Bill Russell era. Athleticism beginning to shape the game.", "Pre-3pt - Modern shooters lose value here"),
    "70s": ("ABA Merger. Brutal physical defense. Kareem's sky hook.", "Pre-3pt - Modern shooters lose value here"),
    "80s": ("3-point line introduced in the league. Magic vs Bird.", "3pt era begins - Pre-3pt bigs take a cut"),
    "90s": ("All time Defenses, Lower scoring. Hand-checking allowed. The Jordan era.", "Defense Era - Most eras cross over cleanly"),
    "00s": ("Post-Jordan transition. the Shaq and Kobe Era. Rising international talent. Introduction of the 4 round, best of 7 Playoffs.", "Bridge era - Minimal penalties most directions"),
    "10s": ("3-point volume surges. Steph vs Lebron. Rise of Positionless basketball.", "Near-modern - Very low era penalties"),
    "20s": ("Peak spacing, pace, and 3-point volume. Versatility is everything. Old-school bigs and pre-3pt era (50s/60s/70s) players struggle most here.", "Current era - 2020s players at full strength"),
]

struct EraSelectView: View {
    @Environment(AppState.self) private var appState
    @Environment(GameCenterManager.self) private var gcManager
    @Environment(AudioManager.self) private var audio

    @State private var era: String? = nil          // confirmed selection
    @State private var displayEra: String? = nil   // what the banner shows (spins)
    @State private var spinning = false
    @State private var showHowToPlay = false
    @State private var showLeaderboard = false
    @State private var showLifetimeStats = false
    @State private var showAchievements = false

    var body: some View {
        ZStack {
            G.black.ignoresSafeArea()
            Starfield()

            VStack(spacing: 0) {
                TopBar(onTitleTap: nil) {
                    HStack(spacing: 10) {
                        Button {
                            showHowToPlay = true
                        } label: {
                            Text("?")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(G.grey)
                                .frame(width: 34, height: 34)
                                .overlay(Rectangle().stroke(G.border, lineWidth: 1))
                                .contentShape(.rect)
                        }
                        .buttonStyle(.plain)

                        Button {
                            audio.toggleMute()
                        } label: {
                            Image(systemName: audio.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(G.gold)
                                .frame(width: 34, height: 34)
                                .overlay(Rectangle().stroke(G.gold.opacity(0.6), lineWidth: 1))
                                .contentShape(.rect)
                        }
                        .buttonStyle(.plain)
                    }
                }

                ScrollView {
                    VStack(spacing: 40) {
                        bannerSection
                        eraGrid
                        actionsSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 28)
                    .padding(.bottom, 48)
                }
            }
        }
    }

    // MARK: - Banner (SIMULATION ERA + artwork + label)

    @ViewBuilder
    private var bannerSection: some View {
        if let shown = displayEra {
            VStack(spacing: 0) {
                Text("SIMULATION ERA")
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(5)
                    .foregroundStyle(G.grey)
                    .padding(.bottom, 8)

                EraBannerView(era: shown, dimmed: spinning)

                if !spinning, let era {
                    VStack(spacing: 14) {
                        Text(ERA_YEARS[era] ?? "")
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(4)
                            .foregroundStyle(G.goldDim)

                        Text(ERA_DESC[era]?.style ?? "")
                            .font(.system(size: 13))
                            .foregroundStyle(G.grey)
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                            .frame(maxWidth: 320)

                        Text((ERA_DESC[era]?.note ?? "").uppercased())
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(G.goldDim)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .overlay(Rectangle().stroke(G.goldDim, lineWidth: 1))

                        Text("Players perform best in their home era - drafting across decades applies a rating penalty")
                            .font(.system(size: 11))
                            .foregroundStyle(G.greyDark.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: 340)
                    }
                    .padding(.top, 14)
                    .transition(.opacity)
                }
            }
        } else {
            Text("SELECT AN ERA")
                .font(Fonts.bebas(24))
                .tracking(6)
                .foregroundStyle(G.greyDark)
                .padding(.vertical, 24)
        }
    }

    // MARK: - Era Grid (4 columns, matches web tiles)

    private var eraGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 4)
        return LazyVGrid(columns: columns, spacing: 8) {
            ForEach(ERA_IDS, id: \.self) { id in
                Button {
                    selectEra(id)
                } label: {
                    Text(eraDisplayLabel(id).uppercased())
                        .font(Fonts.bebas(22))
                        .tracking(1.5)
                        .foregroundStyle(era == id ? G.black : G.grey)
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity)
                        .frame(height: 58)
                        .background(era == id ? G.gold : G.surface)
                        .overlay(Rectangle().stroke(era == id ? G.gold : G.border, lineWidth: 1))
                }
                .buttonStyle(.plain)
                .disabled(spinning)
                .opacity(spinning ? 0.4 : 1)
                .animation(.easeOut(duration: 0.15), value: era)
            }
        }
        .frame(maxWidth: 400)
    }

    // MARK: - Actions (RANDOM / NORMAL DRAFT / SALARY CAP DRAFT / menu)

    private var actionsSection: some View {
        VStack(spacing: 12) {
            Button(spinning ? "SPINNING..." : "RANDOM") { spinRandom() }
                .buttonStyle(GhostButtonStyle())
                .frame(width: 200)
                .disabled(spinning)

            if era != nil && !spinning {
                Button("NORMAL DRAFT") {
                    guard let era else { return }
                    appState.startDraft(era: era, salaryCapMode: false)
                }
                .buttonStyle(GoldButtonStyle(fullWidth: true))
                .frame(width: 200)

                Button("SALARY CAP DRAFT") {
                    guard let era else { return }
                    appState.startDraft(era: era, salaryCapMode: true)
                }
                .buttonStyle(PurpleButtonStyle(fullWidth: true))
                .frame(width: 200)
            }

            Button("HOW TO PLAY") { showHowToPlay = true }
                .buttonStyle(.plain)
                .font(.system(size: 11, weight: .semibold))
                .tracking(3)
                .foregroundStyle(G.greyDark)
                .padding(.top, 2)

            Button("LEADERBOARD") { showLeaderboard = true }
                .buttonStyle(GhostButtonStyle())
                .frame(width: 200)

            Button("LIFETIME STATS") { showLifetimeStats = true }
                .buttonStyle(GhostButtonStyle())
                .frame(width: 200)

            Button("ACHIEVEMENTS") { showAchievements = true }
                .buttonStyle(GhostButtonStyle())
                .frame(width: 200)

            Text("v2.0")
                .font(.system(size: 10))
                .tracking(2)
                .foregroundStyle(G.greyDark.opacity(0.6))
                .padding(.top, 6)

            if gcManager.isAuthenticated {
                Label("Game Center · \(gcManager.localPlayer.alias)", systemImage: "person.crop.circle.badge.checkmark")
                    .font(.system(size: 10))
                    .foregroundStyle(G.greyDark.opacity(0.6))
            }
        }
        .sheet(isPresented: $showHowToPlay) { HowToPlaySheet() }
        .sheet(isPresented: $showLeaderboard) { LeaderboardSheet() }
        .sheet(isPresented: $showLifetimeStats) { LifetimeStatsView() }
        .sheet(isPresented: $showAchievements) { AchievementsView() }
    }

    // MARK: - Behavior

    private func selectEra(_ id: String) {
        guard !spinning else { return }
        withAnimation(.smooth(duration: 0.25)) {
            era = id
            displayEra = id
        }
        audio.play(era: id)
    }

    /// Slot-machine random spin: fast ×10 (65ms) → slow ×5 (120ms) → crawl ×3 (220ms).
    private func spinRandom() {
        guard !spinning else { return }
        spinning = true
        era = nil
        Task { @MainActor in
            let schedule = Array(repeating: 65, count: 10)
                + Array(repeating: 120, count: 5)
                + Array(repeating: 220, count: 3)
            for delay in schedule {
                displayEra = ERA_IDS.randomElement()
                try? await Task.sleep(for: .milliseconds(delay))
            }
            let picked = ERA_IDS.randomElement()!
            withAnimation(.smooth(duration: 0.3)) {
                displayEra = picked
                era = picked
            }
            audio.play(era: picked)
            try? await Task.sleep(for: .milliseconds(350))
            spinning = false
        }
    }
}

// MARK: - Era Banner (R2 artwork with edge fades + big era label)

struct EraBannerView: View {
    let era: String
    var dimmed = false

    var body: some View {
        ZStack {
            // §12.4 — the banner art is a bounded custom participant, so it can
            // never widen the parent tree and clip the top bar.
            BleedImage(
                url: URL(string: "https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev/\(era).webp"),
                height: Elevation.bannerHeight
            )
            .overlay(
                LinearGradient(
                    stops: [
                        .init(color: G.black, location: 0),
                        .init(color: .clear, location: 0.18),
                        .init(color: .clear, location: 0.82),
                        .init(color: G.black, location: 1),
                    ],
                    startPoint: .leading, endPoint: .trailing
                )
            )
            .overlay(
                LinearGradient(
                    stops: [
                        .init(color: G.black.opacity(0.9), location: 0),
                        .init(color: .clear, location: 0.25),
                        .init(color: .clear, location: 0.75),
                        .init(color: G.black.opacity(0.9), location: 1),
                    ],
                    startPoint: .top, endPoint: .bottom
                )
            )

            Text(eraDisplayLabel(era).uppercased())
                .font(Fonts.bebas(92))
                .foregroundStyle(dimmed ? G.greyDark : G.white)
                .shadow(color: .black.opacity(0.9), radius: 4, y: 2)
                .shadow(color: .black.opacity(0.8), radius: 24)
                .contentTransition(.numericText())
                .animation(.snappy(duration: 0.15), value: era)
        }
        .frame(height: Elevation.bannerHeight)
    }
}

// MARK: - How To Play Sheet

struct HowToPlaySheet: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    howToSection(num: "1", title: "PICK YOUR SIMULATION ERA", body: "Choose a decade: 50s through the 2020s. This is the era of basketball your season will be simulated in. Following the Era rules and trends.")
                    howToSection(num: "2", title: "SPIN TO DRAFT", body: "Each spin lands on a franchise and an ERA of that franchise. Choose one player from all the players who played for that team during that era to fill an open slot. You get only ONE respin for the entire draft.")
                    howToSection(num: "3", title: "FILL 9 SPOTS", body: "5 starters (PG - SG - SF - PF - C) and 4 bench players. Starters play 35 minutes per game, and carry more weight in the simulation. Bench players contribute at a reduced rate.")
                    howToSection(num: "4", title: "POSITIONAL FIT", body: "Playing a player at their natural position = no penalty. One position off = −10% rating. Way out of position = −25%. FLEX players like LeBron, Jokić, and Giannis can fill multiple slots penalty-free.")
                    howToSection(num: "5", title: "DRAFT A COACH", body: "You get 3 spins. Grades come from real NBA coaching records — a great coach elevates your roster, a bad one holds it back.")
                    howToSection(num: "6", title: "SIMULATE", body: "A full season is simulated with era-adjusted stats. Win at least half your games to make the playoffs and chase a championship.")
                }
                .padding(24)
            }
            .background(G.black)
            .navigationTitle("HOW TO PLAY")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("CLOSE") { dismiss() }
                        .foregroundStyle(G.gold)
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    private func howToSection(num: String, title: String, body: String) -> some View {
        HStack(alignment: .top, spacing: 16) {
            Text(num)
                .font(Fonts.bebas(24))
                .foregroundStyle(G.gold)
            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2.5)
                    .foregroundStyle(G.white)
                Text(body)
                    .font(.system(size: 14))
                    .lineSpacing(4)
                    .foregroundStyle(G.grey)
            }
        }
    }
}
