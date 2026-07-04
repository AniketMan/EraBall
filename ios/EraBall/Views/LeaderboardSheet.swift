// LeaderboardSheet.swift
// Leaderboard with Game Center friends + global tabs.

import SwiftUI
import GameKit

struct LeaderboardSheet: View {
    @Environment(AppState.self) private var appState
    @Environment(GameCenterManager.self) private var gcManager
    @Environment(\.dismiss) private var dismiss

    @State private var selectedEra = "90s"
    @State private var salaryCapMode = false
    @State private var scope: LeaderboardScope = .global
    @State private var entries: [GKLeaderboard.Entry] = []
    @State private var isLoading = false

    enum LeaderboardScope: String, CaseIterable {
        case global = "Global"
        case friends = "Friends"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Era picker
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(["50s","60s","70s","80s","90s","00s","10s","20s"], id: \.self) { era in
                            Button(eraDisplayLabel(era)) {
                                selectedEra = era
                                Task { await loadEntries() }
                            }
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(1.5)
                            .foregroundStyle(selectedEra == era ? G.black : G.gold)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(selectedEra == era ? G.gold : Color.clear)
                            .overlay(Rectangle().stroke(G.gold.opacity(0.4), lineWidth: 1))
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.vertical, 12)

                EraBallDivider()

                // Scope + mode
                HStack(spacing: 12) {
                    Picker("Scope", selection: $scope) {
                        ForEach(LeaderboardScope.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)

                    Toggle("Cap", isOn: $salaryCapMode)
                        .toggleStyle(.button)
                        .tint(G.purple)
                        .font(.system(size: 11, weight: .semibold))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)

                EraBallDivider()

                if !gcManager.isAuthenticated {
                    VStack(spacing: 12) {
                        Text("Sign in to Game Center to view leaderboards")
                            .font(.system(size: 14))
                            .foregroundStyle(G.grey)
                            .multilineTextAlignment(.center)
                        Button("OPEN GAME CENTER") {
                            gcManager.showLeaderboard(era: selectedEra, salaryCapMode: salaryCapMode)
                        }
                        .buttonStyle(GoldButtonStyle())
                    }
                    .padding(32)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if isLoading {
                    ProgressView().tint(G.gold).padding(64).frame(maxWidth: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(Array(entries.enumerated()), id: \.offset) { idx, entry in
                                LeaderboardRow(rank: idx + 1, entry: entry)
                                EraBallDivider()
                            }
                            if entries.isEmpty {
                                Text("No entries yet. Be the first!")
                                    .font(.system(size: 14))
                                    .foregroundStyle(G.grey)
                                    .padding(32)
                            }
                        }
                    }
                }
            }
            .background(G.black)
            .navigationTitle("LEADERBOARD")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        gcManager.showLeaderboard(era: selectedEra, salaryCapMode: salaryCapMode)
                    } label: {
                        Image(systemName: "gamecontroller.fill")
                            .foregroundStyle(G.gold)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("CLOSE") { dismiss() }.foregroundStyle(G.gold)
                }
            }
            .task { await loadEntries() }
            .onChange(of: scope) { _, _ in Task { await loadEntries() } }
            .onChange(of: salaryCapMode) { _, _ in Task { await loadEntries() } }
        }
        .preferredColorScheme(.dark)
    }

    private func loadEntries() async {
        isLoading = true
        entries = scope == .global
            ? await gcManager.loadLeaderboard(era: selectedEra, salaryCapMode: salaryCapMode)
            : await gcManager.loadFriendsLeaderboard(era: selectedEra, salaryCapMode: salaryCapMode)
        isLoading = false
    }
}

struct LeaderboardRow: View {
    let rank: Int
    let entry: GKLeaderboard.Entry

    var body: some View {
        HStack(spacing: 12) {
            Text("#\\(rank)")
                .font(Fonts.bebas(20))
                .tracking(2)
                .foregroundStyle(rank <= 3 ? G.gold : G.grey)
                .frame(width: 36, alignment: .leading)

            Text(entry.player.displayName)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(G.white)
                .lineLimit(1)

            Spacer()

            Text("\\(entry.score)")
                .font(Fonts.bebas(22))
                .tracking(2)
                .foregroundStyle(G.gold)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
