// LeaderboardSheet.swift — Game Center leaderboards (global + friends) by era/mode.
import SwiftUI
import GameKit

struct LeaderboardSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(GameCenterManager.self) private var gc
    @State private var era = "20s"
    @State private var salaryCap = false
    @State private var scope: GKLeaderboard.PlayerScope = .global

    private var leaderboardID: String {
        salaryCap ? GameCenterManager.LeaderboardID.salaryCap(era: era) : GameCenterManager.LeaderboardID.normal(era: era)
    }

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
                    GameCenterLeaderboardView(leaderboardID: leaderboardID, scope: scope)
                        .id("\(leaderboardID)-\(scope == .global ? "g" : "f")")
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
                ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) }
            }
        }
        .preferredColorScheme(.dark)
    }
}

/// Embeds the native Game Center leaderboard UI for one leaderboard + scope.
struct GameCenterLeaderboardView: UIViewControllerRepresentable {
    let leaderboardID: String
    let scope: GKLeaderboard.PlayerScope

    func makeUIViewController(context: Context) -> GKGameCenterViewController {
        let vc = GKGameCenterViewController(leaderboardID: leaderboardID, playerScope: scope, timeScope: .allTime)
        vc.gameCenterDelegate = context.coordinator
        return vc
    }
    func updateUIViewController(_ vc: GKGameCenterViewController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator() }
    final class Coordinator: NSObject, GKGameCenterControllerDelegate {
        func gameCenterViewControllerDidFinish(_ vc: GKGameCenterViewController) {}
    }
}
