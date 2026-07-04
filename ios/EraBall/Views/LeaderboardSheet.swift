// LeaderboardSheet.swift — Game Center leaderboards (global + friends) by era/mode.
import SwiftUI
import GameKit

struct LeaderboardSheet: View {
    var embedded = false
    @Environment(\.dismiss) private var dismiss
    @Environment(GameCenterManager.self) private var gc
    @State private var era = "20s"
    @State private var salaryCap = false
    @State private var scope: GKLeaderboard.PlayerScope = .global

    @State private var entries: [GKLeaderboard.Entry] = []
    @State private var loading = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Picker("Era", selection: $era) { ForEach(ALL_ERAS, id: \.self) { Text(eraDisplayLabel($0)).tag($0) } }
                    .pickerStyle(.menu).tint(G.gold)
                Picker("Mode", selection: $salaryCap) { Text("Normal").tag(false); Text("Salary Cap").tag(true) }
                    .pickerStyle(.segmented).padding(.horizontal, 16)
                Picker("Scope", selection: $scope) { Text("Global").tag(GKLeaderboard.PlayerScope.global); Text("Friends").tag(GKLeaderboard.PlayerScope.friendsOnly) }
                    .pickerStyle(.segmented).padding(.horizontal, 16)

                if gc.isAuthenticated {
                    leaderboardList
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "person.crop.circle.badge.exclamationmark").font(.system(size: 40)).foregroundStyle(G.grey)
                        Text("Sign in to Game Center to view leaderboards and compete with friends.")
                            .font(.system(size: 14)).foregroundStyle(G.grey).multilineTextAlignment(.center).frame(maxWidth: 280)
                        Text("Your scores are saved and submitted automatically once you sign in.")
                            .font(.system(size: 11)).foregroundStyle(G.greyDark).multilineTextAlignment(.center).frame(maxWidth: 280)
                    }
                    .frame(maxHeight: .infinity)
                }
            }
            .padding(.top, 12)
            .background(G.black)
            .navigationTitle("LEADERBOARD").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if let alias = gc.playerAlias { Label(alias, systemImage: "person.crop.circle.badge.checkmark").font(.caption2).foregroundStyle(G.greyDark) }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { gc.showLeaderboard(era: era, salaryCapMode: salaryCap) } label: { Image(systemName: "arrow.up.forward.app") }
                        .foregroundStyle(G.gold)
                }
                if !embedded { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
            }
            // Custom UI over GameKit data (HIG: present Game Center data in your own UI).
            .task(id: "\(era)-\(salaryCap)-\(scope == .global ? "g" : "f")") { await reload() }
        }
        .preferredColorScheme(.dark)
    }

    private var leaderboardList: some View {
        Group {
            if loading {
                ProgressView().tint(G.gold).frame(maxHeight: .infinity)
            } else if entries.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "trophy").font(.system(size: 34)).foregroundStyle(G.greyDark)
                    Text(scope == .friendsOnly ? "No friend scores yet." : "No scores yet — be the first!")
                        .font(.system(size: 13)).foregroundStyle(G.grey)
                }.frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 6) {
                        ForEach(entries, id: \.player.gamePlayerID) { e in
                            let isMe = e.player.gamePlayerID == GKLocalPlayer.local.gamePlayerID
                            HStack(spacing: 12) {
                                Text("\(e.rank)").font(.system(size: 13, weight: .bold, design: .monospaced))
                                    .foregroundStyle(e.rank <= 3 ? G.gold : G.grey).frame(width: 34, alignment: .trailing)
                                Text(e.player.displayName).font(.system(size: 14, weight: isMe ? .bold : .regular))
                                    .foregroundStyle(isMe ? G.gold : G.white).lineLimit(1)
                                Spacer()
                                Text(e.formattedScore).font(.system(size: 14, weight: .semibold, design: .monospaced)).foregroundStyle(G.white)
                            }
                            .padding(.horizontal, 14).padding(.vertical, 10)
                            .background(isMe ? G.gold.opacity(0.08) : G.surface)
                            .overlay(Rectangle().stroke(isMe ? G.gold.opacity(0.5) : G.border, lineWidth: 1))
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
    }

    private func reload() async {
        guard gc.isAuthenticated else { return }
        loading = true
        entries = await gc.loadLeaderboard(era: era, salaryCapMode: salaryCap, scope: scope)
        loading = false
    }
}

