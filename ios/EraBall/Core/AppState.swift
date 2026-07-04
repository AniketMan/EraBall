// AppState.swift
// Central observable state for the app.

import SwiftUI
import Observation

enum GamePhase: Equatable {
    case loading
    case eraSelect
    case draft(era: String, salaryCapMode: Bool)
    case coachDraft(slots: [CourtSlot], era: String, salaryCapMode: Bool)
    case simulation(slots: [CourtSlot], coach: Coach, era: String, salaryCapMode: Bool)

    static func == (lhs: GamePhase, rhs: GamePhase) -> Bool {
        switch (lhs, rhs) {
        case (.loading, .loading): return true
        case (.eraSelect, .eraSelect): return true
        default: return false
        }
    }
}

@Observable
@MainActor
final class AppState {
    var phase: GamePhase = .loading
    var loadError: String?

    // Lifetime stats (UserDefaults)
    var lifetimeStats: LifetimeStats = LifetimeStats()

    // Achievements
    var unlockedAchievements: Set<String> = []
    var pendingAchievementToast: Achievement?

    // Audio
    var isMuted: Bool = false

    func boot() async {
        do {
            try await Engine.shared.loadData()
            loadLifetimeStats()
            loadAchievements()
            isMuted = UserDefaults.standard.bool(forKey: "eraball_muted")
            withAnimation(.smooth(duration: 0.4)) {
                phase = .eraSelect
            }
        } catch {
            loadError = error.localizedDescription
        }
    }

    func restart() {
        withAnimation(.smooth(duration: 0.4)) {
            phase = .eraSelect
        }
    }

    func startDraft(era: String, salaryCapMode: Bool) {
        withAnimation(.smooth(duration: 0.4)) {
            phase = .draft(era: era, salaryCapMode: salaryCapMode)
        }
    }

    func startCoachDraft(slots: [CourtSlot], era: String, salaryCapMode: Bool) {
        withAnimation(.smooth(duration: 0.4)) {
            phase = .coachDraft(slots: slots, era: era, salaryCapMode: salaryCapMode)
        }
    }

    func startSimulation(slots: [CourtSlot], coach: Coach, era: String, salaryCapMode: Bool) {
        withAnimation(.smooth(duration: 0.4)) {
            phase = .simulation(slots: slots, coach: coach, era: era, salaryCapMode: salaryCapMode)
        }
    }

    // MARK: - Lifetime Stats

    func recordResult(wins: Int, losses: Int, champion: Bool, era: String, salaryCapMode: Bool) {
        let key = salaryCapMode ? "eraball_stats_salary_cap" : "eraball_stats_normal"
        var stats = loadStats(key: key)
        stats.totalGames += 1
        stats.totalWins += wins
        stats.totalLosses += losses
        if champion { stats.totalChampionships += 1 }
        stats.winsByEra[era, default: 0] += wins
        stats.lossesByEra[era, default: 0] += losses
        saveStats(stats, key: key)
        loadLifetimeStats()
    }

    private func loadLifetimeStats() {
        let normal = loadStats(key: "eraball_stats_normal")
        let cap    = loadStats(key: "eraball_stats_salary_cap")
        lifetimeStats = LifetimeStats(normal: normal, salaryCap: cap)
    }

    private func loadStats(key: String) -> StatsData {
        guard let data = UserDefaults.standard.data(forKey: key),
              let stats = try? JSONDecoder().decode(StatsData.self, from: data) else {
            return StatsData()
        }
        return stats
    }

    private func saveStats(_ stats: StatsData, key: String) {
        if let data = try? JSONEncoder().encode(stats) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    // MARK: - Achievements

    func loadAchievements() {
        if let data = UserDefaults.standard.data(forKey: "eraball_achievements"),
           let ids = try? JSONDecoder().decode(Set<String>.self, from: data) {
            unlockedAchievements = ids
        }
    }

    func unlockAchievement(_ id: String) {
        guard !unlockedAchievements.contains(id) else { return }
        unlockedAchievements.insert(id)
        if let data = try? JSONEncoder().encode(unlockedAchievements) {
            UserDefaults.standard.set(data, forKey: "eraball_achievements")
        }
        if let achievement = Achievement.all.first(where: { $0.id == id }) {
            pendingAchievementToast = achievement
        }
    }
}

// MARK: - Stats Models

struct StatsData: Codable {
    var totalGames: Int = 0
    var totalWins: Int = 0
    var totalLosses: Int = 0
    var totalChampionships: Int = 0
    var winsByEra: [String: Int] = [:]
    var lossesByEra: [String: Int] = [:]
}

struct LifetimeStats {
    var normal: StatsData = StatsData()
    var salaryCap: StatsData = StatsData()
}

// MARK: - Achievement Model

struct Achievement: Identifiable {
    let id: String
    let title: String
    let description: String
    let rarity: String // common, rare, epic, legendary

    static let all: [Achievement] = [
        Achievement(id: "first_sim", title: "First Sim", description: "Run your first simulation.", rarity: "common"),
        Achievement(id: "first_champ", title: "Champion", description: "Win your first championship.", rarity: "rare"),
        Achievement(id: "50_wins", title: "50-Win Season", description: "Win 50+ games in a season.", rarity: "rare"),
        Achievement(id: "60_wins", title: "Dynasty", description: "Win 60+ games in a season.", rarity: "epic"),
        Achievement(id: "sweep", title: "Sweep", description: "Win a playoff series 4-0.", rarity: "rare"),
        Achievement(id: "back_to_back", title: "Back to Back", description: "Win 2 championships.", rarity: "epic"),
        Achievement(id: "three_peat", title: "Three-Peat", description: "Win 3 championships.", rarity: "legendary"),
        Achievement(id: "all_eras", title: "Time Traveler", description: "Simulate in all 8 eras.", rarity: "epic"),
        Achievement(id: "salary_cap_champ", title: "Cap Genius", description: "Win a championship in Salary Cap mode.", rarity: "epic"),
        Achievement(id: "perfect_season", title: "Perfect Season", description: "Win all 82 games.", rarity: "legendary"),
    ]

    var rarityColor: String {
        switch rarity {
        case "common":    return "#AAAAAA"
        case "rare":      return "#5B8FD4"
        case "epic":      return "#9B6DFF"
        case "legendary": return "#C9A84C"
        default:          return "#AAAAAA"
        }
    }
}
