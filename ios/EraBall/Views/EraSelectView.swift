// EraSelectView.swift
// Matches EraSelectionScreen.tsx exactly.
// Layout: TopBar | era grid (4-col) | action buttons | footer

import SwiftUI

private let ERAS: [(id: String, label: String, years: String)] = [
    ("50s", "1950s", "1946-1959"),
    ("60s", "1960s", "1960-1969"),
    ("70s", "1970s", "1970-1979"),
    ("80s", "1980s", "1980-1989"),
    ("90s", "1990s", "1990-1999"),
    ("00s", "2000s", "2000-2009"),
    ("10s", "2010s", "2010-2019"),
    ("20s", "2020s", "2020-present"),
]

struct EraSelectView: View {
    @Environment(AppState.self) private var appState
    @Environment(GameCenterManager.self) private var gcManager

    @State private var selectedEra: String? = nil
    @State private var salaryCapMode = false
    @State private var showHowToPlay = false
    @State private var showLeaderboard = false
    @State private var showLifetimeStats = false
    @State private var showAchievements = false

    var body: some View {
        VStack(spacing: 0) {
            // Top Bar
            TopBar(onTitleTap: nil) {
                Button("HOW TO PLAY") { showHowToPlay = true }
                    .buttonStyle(GhostButtonStyle())
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.5)
            }

            ScrollView {
                VStack(spacing: 0) {
                    // Hero
                    heroSection

                    EraBallDivider()

                    // Era Grid
                    eraGrid
                        .padding(.horizontal, 16)
                        .padding(.vertical, 24)

                    EraBallDivider()

                    // Action Buttons
                    actionButtons
                        .padding(.horizontal, 16)
                        .padding(.vertical, 24)

                    EraBallDivider()

                    // Footer links
                    footerLinks
                        .padding(.vertical, 16)
                }
            }
        }
        .background(G.black)
        .ignoresSafeArea(edges: .bottom)
        .sheet(isPresented: $showHowToPlay) { HowToPlaySheet() }
        .sheet(isPresented: $showLeaderboard) { LeaderboardSheet() }
        .sheet(isPresented: $showLifetimeStats) { LifetimeStatsView() }
        .sheet(isPresented: $showAchievements) { AchievementsView() }
    }

    // MARK: - Hero

    private var heroSection: some View {
        VStack(spacing: 8) {
            Text("BASKETBALL DRAFT SIMULATOR")
                .font(.system(size: 11, weight: .semibold))
                .tracking(3)
                .textCase(.uppercase)
                .foregroundStyle(G.grey)
            Text("SELECT AN ERA")
                .font(Fonts.bebas(42))
                .tracking(8)
                .foregroundStyle(G.white)
            Text("Choose a decade to build your all-time team")
                .font(.system(size: 14))
                .foregroundStyle(G.grey)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 32)
    }

    // MARK: - Era Grid (4 columns, square buttons)

    private var eraGrid: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 4)
        return LazyVGrid(columns: columns, spacing: 8) {
            ForEach(ERAS, id: \.id) { era in
                EraButton(
                    era: era,
                    isSelected: selectedEra == era.id,
                    onTap: { selectedEra = era.id }
                )
            }
        }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: 12) {
            // Salary Cap toggle
            Button {
                salaryCapMode.toggle()
            } label: {
                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(salaryCapMode ? G.purple : Color.clear)
                        .frame(width: 14, height: 14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 2)
                                .stroke(salaryCapMode ? G.purple : G.grey, lineWidth: 1)
                        )
                    Text("SALARY CAP MODE")
                        .font(.system(size: 12, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(salaryCapMode ? G.purple : G.grey)
                }
            }
            .buttonStyle(.plain)
            .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 8) {
                // Random Draft
                Button("RANDOM DRAFT") {
                    guard let era = selectedEra else { return }
                    appState.startDraft(era: era, salaryCapMode: salaryCapMode)
                }
                .buttonStyle(GhostButtonStyle(fullWidth: true))
                .disabled(selectedEra == nil)
                .opacity(selectedEra == nil ? 0.4 : 1)

                // Start Draft
                Button("START DRAFT") {
                    guard let era = selectedEra else { return }
                    appState.startDraft(era: era, salaryCapMode: salaryCapMode)
                }
                .buttonStyle(salaryCapMode ? PurpleButtonStyle(fullWidth: true) : GoldButtonStyle(fullWidth: true))
                .disabled(selectedEra == nil)
                .opacity(selectedEra == nil ? 0.4 : 1)
            }
        }
    }

    // MARK: - Footer Links

    private var footerLinks: some View {
        HStack(spacing: 24) {
            Button("LEADERBOARD") { showLeaderboard = true }
                .buttonStyle(.plain)
                .font(.system(size: 11, weight: .semibold))
                .tracking(2)
                .foregroundStyle(G.grey)

            Text("|").foregroundStyle(G.border)

            Button("MY STATS") { showLifetimeStats = true }
                .buttonStyle(.plain)
                .font(.system(size: 11, weight: .semibold))
                .tracking(2)
                .foregroundStyle(G.grey)

            Text("|").foregroundStyle(G.border)

            Button("ACHIEVEMENTS") { showAchievements = true }
                .buttonStyle(.plain)
                .font(.system(size: 11, weight: .semibold))
                .tracking(2)
                .foregroundStyle(G.grey)
        }
    }
}

// MARK: - Era Button (square, matches web exactly)

private struct EraButton: View {
    let era: (id: String, label: String, years: String)
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                Text(eraDisplayLabel(era.id))
                    .font(Fonts.bebas(22))
                    .tracking(2)
                    .foregroundStyle(isSelected ? G.black : G.white)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
                Text(era.years)
                    .font(.system(size: 9))
                    .foregroundStyle(isSelected ? G.black.opacity(0.7) : G.grey)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(1, contentMode: .fit)
            .background(isSelected ? G.gold : G.surface)
            .overlay(
                Rectangle()
                    .stroke(isSelected ? G.gold : G.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .animation(.easeOut(duration: 0.15), value: isSelected)
    }
}

// MARK: - How To Play Sheet

struct HowToPlaySheet: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Group {
                        howToSection(title: "HOW TO PLAY", body: "Select an era, draft 9 players (5 starters + 4 bench), pick a coach, then simulate an 82-game season and playoffs.")
                        howToSection(title: "SPIN SYSTEM", body: "Each spin reveals a random team from your chosen era. Draft the best available player for each slot.")
                        howToSection(title: "SALARY CAP MODE", body: "Each player has a salary value. Stay under the cap to build a balanced roster.")
                        howToSection(title: "RATINGS", body: "Player ratings are adjusted by era compatibility, position fit, and coach bonuses.")
                    }
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

    private func howToSection(title: String, body: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .tracking(3)
                .foregroundStyle(G.gold)
            Text(body)
                .font(.system(size: 14))
                .foregroundStyle(G.greyDark)
        }
    }
}
