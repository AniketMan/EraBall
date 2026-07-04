// GameCenterManager.swift
// Full Game Center integration: leaderboards, achievements, friends.

import GameKit
import SwiftUI
import Observation

@Observable
@MainActor
final class GameCenterManager {
    static let shared = GameCenterManager()

    var isAuthenticated = false
    var localPlayer: GKLocalPlayer { GKLocalPlayer.local }
    var playerAlias: String? { isAuthenticated ? GKLocalPlayer.local.alias : nil }
    var showAuthVC = false
    var authVC: UIViewController?

    // Leaderboard IDs - must match App Store Connect configuration
    enum LeaderboardID {
        static func normal(era: String) -> String { "com.eraball.leaderboard.normal.\(era.lowercased())" }
        static func salaryCap(era: String) -> String { "com.eraball.leaderboard.salarycap.\(era.lowercased())" }
        static let allTime = "com.eraball.leaderboard.alltime"
    }

    // Achievement IDs - must match App Store Connect configuration
    enum AchievementID {
        static let firstSim      = "com.eraball.achievement.first_sim"
        static let firstChamp    = "com.eraball.achievement.first_champ"
        static let fiftyWins     = "com.eraball.achievement.50_wins"
        static let sixtyWins     = "com.eraball.achievement.60_wins"
        static let sweep         = "com.eraball.achievement.sweep"
        static let backToBack    = "com.eraball.achievement.back_to_back"
        static let threePeat     = "com.eraball.achievement.three_peat"
        static let allEras       = "com.eraball.achievement.all_eras"
        static let salaryCapChamp = "com.eraball.achievement.salary_cap_champ"
        static let perfectSeason = "com.eraball.achievement.perfect_season"

        static func forAchievementID(_ id: String) -> String {
            switch id {
            case "first_sim":       return firstSim
            case "first_champ":     return firstChamp
            case "50_wins":         return fiftyWins
            case "60_wins":         return sixtyWins
            case "sweep":           return sweep
            case "back_to_back":    return backToBack
            case "three_peat":      return threePeat
            case "all_eras":        return allEras
            case "salary_cap_champ": return salaryCapChamp
            case "perfect_season":  return perfectSeason
            default:                return "com.eraball.achievement.\(id)"
            }
        }
    }

    private init() {}

    // MARK: - Authentication

    func authenticate() {
        GKLocalPlayer.local.authenticateHandler = { [weak self] vc, error in
            Task { @MainActor in
                if let vc = vc {
                    self?.authVC = vc
                    self?.showAuthVC = true
                } else if GKLocalPlayer.local.isAuthenticated {
                    self?.isAuthenticated = true
                    self?.showAuthVC = false
                } else {
                    self?.isAuthenticated = false
                }
            }
        }
    }

    // MARK: - Submit Score

    func submitScore(_ score: Int, era: String, salaryCapMode: Bool) async {
        guard isAuthenticated else { return }
        let leaderboardID = salaryCapMode
            ? LeaderboardID.salaryCap(era: era)
            : LeaderboardID.normal(era: era)
        do {
            try await GKLeaderboard.submitScore(score,
                                                context: 0,
                                                player: GKLocalPlayer.local,
                                                leaderboardIDs: [leaderboardID, LeaderboardID.allTime])
        } catch {
            print("[GameCenter] Score submit error: \(error)")
        }
    }

    // MARK: - Load Leaderboard Entries

    func loadLeaderboard(era: String, salaryCapMode: Bool,
                         scope: GKLeaderboard.PlayerScope = .global) async -> [GKLeaderboard.Entry] {
        guard isAuthenticated else { return [] }
        let id = salaryCapMode ? LeaderboardID.salaryCap(era: era) : LeaderboardID.normal(era: era)
        do {
            let leaderboards = try await GKLeaderboard.loadLeaderboards(IDs: [id])
            guard let lb = leaderboards.first else { return [] }
            let (local, entries, _) = try await lb.loadEntries(for: scope, timeScope: .allTime, range: NSRange(location: 1, length: 100))
            var all = entries
            if let local = local, !all.contains(where: { $0.player.gamePlayerID == local.player.gamePlayerID }) {
                all.append(local)
            }
            return all.sorted { $0.score > $1.score }
        } catch {
            print("[GameCenter] Leaderboard load error: \(error)")
            return []
        }
    }

    // MARK: - Friends Leaderboard

    func loadFriendsLeaderboard(era: String, salaryCapMode: Bool) async -> [GKLeaderboard.Entry] {
        await loadLeaderboard(era: era, salaryCapMode: salaryCapMode, scope: .friendsOnly)
    }

    // MARK: - Achievements

    func reportAchievement(id: String, percentComplete: Double = 100.0) async {
        guard isAuthenticated else { return }
        let gcID = AchievementID.forAchievementID(id)
        let achievement = GKAchievement(identifier: gcID)
        achievement.percentComplete = percentComplete
        achievement.showsCompletionBanner = true
        do {
            try await GKAchievement.report([achievement])
        } catch {
            print("[GameCenter] Achievement report error: \(error)")
        }
    }

    func loadAchievements() async -> [GKAchievement] {
        guard isAuthenticated else { return [] }
        do {
            return try await GKAchievement.loadAchievements()
        } catch {
            print("[GameCenter] Achievement load error: \(error)")
            return []
        }
    }

    // MARK: - Show Game Center (iOS 26 Game Overlay via GKAccessPoint)

    /// iOS 26 deprecated the modal GKGameCenterViewController in favor of the system
    /// Game Overlay, presented through GKAccessPoint. `trigger(state:)` deep-links into
    /// the requested section (HIG: "Game Center → Accessing Game Center").

    func showLeaderboard(era: String, salaryCapMode: Bool) {
        GKAccessPoint.shared.trigger(state: .leaderboards) {}
    }

    func showAchievements() {
        GKAccessPoint.shared.trigger(state: .achievements) {}
    }
}
