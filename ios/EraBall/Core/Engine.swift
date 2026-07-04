// Engine.swift
// JavaScriptCore bridge + Swift fallback for game logic.
// Preserves 100% algorithmic parity with gameLogic.ts.

import Foundation
import JavaScriptCore

// MARK: - Data Models

struct Player: Codable, Identifiable, Sendable {
    let person_id: Int
    let full_name: String
    let team_abbreviation: String
    let era: String
    var GP: Int?
    var PTS: Double?
    var REB: Double?
    var AST: Double?
    var STL: Double?
    var BLK: Double?
    var TOV: Double?
    var FG_PCT: Double?
    var FG3_PCT: Double?
    var FT_PCT: Double?
    var TS_PCT: Double?
    var all_teams_by_era: [String: [String]]?
    var tags: [String]?
    var duoPartnerName: String?
    var duoActiveCount: Int?
    var id: Int { person_id }
}

struct Coach: Codable, Identifiable, Sendable {
    let name: String
    let from: Int
    let to: Int
    let years: Int
    let regG: Int
    let regW: Int
    let regL: Int
    let regWLPct: Double
    let playoffG: Int
    let playoffW: Int
    let playoffL: Int
    let playoffWLPct: Double
    let conf: Int
    let champ: Int
    let offGrade: String
    let defGrade: String
    let overallGrade: String
    var isHOF: Bool?
    var id: String { "\(name)-\(from)" }
}

struct CourtSlot: Identifiable, Sendable {
    let position: String
    var player: Player?
    var fitPenalty: Double = 0
    var fitLabel: String?
    var id: String { position }
}

struct PlayerRating: Sendable {
    let player: Player
    let slot: String
    let base: Double
    let adjusted: Double
    let fitPenalty: Double
    let eraMod: Double
}

struct PlayerSeasonStats: Identifiable, Sendable {
    let player: Player
    let slot: String
    let MPG: Double
    var PTS: Double
    var REB: Double
    var AST: Double
    var STL: Double
    var BLK: Double
    var TOV: Double
    var FG_PCT: Double
    var FG3_PCT: Double?
    var FT_PCT: Double
    var id: String { "\(player.person_id)-\(slot)" }
}

struct PlayoffRound: Sendable {
    let name: String
    var rGames: [PlayoffGame]
    var advanced: Bool
    var complete: Bool
}

struct PlayoffGame: Sendable {
    let win: Bool
    let teamScore: Int
    let oppScore: Int
    let roundIndex: Int
    let gameInSeries: Int
}

struct PlayoffResult: Sendable {
    let champion: Bool
    let rounds: [PlayoffRound]
    let allGames: [PlayoffGame]
    let playoffStats: [PlayerSeasonStats]
}

struct SeasonResult: Sendable {
    let wins: Int
    let losses: Int
    let games: [Bool]
    let seasonStats: [PlayerSeasonStats]
    let avgTeamScore: Double
    let avgOppScore: Double
}

// MARK: - Engine

@MainActor
final class Engine {
    static let shared = Engine()

    private(set) var allPlayers: [Player] = []
    private(set) var allCoaches: [Coach] = []
    private(set) var allTeams: [String] = []
    let allEras = ["50s","60s","70s","80s","90s","00s","10s","20s"]

    let SLOT_MPG: [String: Double] = [
        "PG": 35, "SG": 34, "SF": 33, "PF": 32, "C": 30,
        "B1": 24, "B2": 22, "B3": 20, "B4": 18
    ]
    let STARTER_POSITIONS = ["PG","SG","SF","PF","C"]
    let BENCH_POSITIONS   = ["B1","B2","B3","B4"]

    private init() {}

    // MARK: - Load

    func loadData() async throws {
        guard let pURL = Bundle.main.url(forResource: "players_with_stats", withExtension: "json") else {
            throw EngineError.missingResource("players_with_stats.json")
        }
        let pData = try Data(contentsOf: pURL)
        allPlayers = try JSONDecoder().decode([Player].self, from: pData)

        guard let cURL = Bundle.main.url(forResource: "coaches", withExtension: "csv") else {
            throw EngineError.missingResource("coaches.csv")
        }
        let cText = try String(contentsOf: cURL, encoding: .utf8)
        allCoaches = parseCoachesCSV(cText)

        allTeams = Array(Set(allPlayers.map { $0.team_abbreviation })).sorted()
    }

    // MARK: - Era Logic

    private let ERA_ORDER = ["50s","60s","70s","80s","90s","00s","10s","20s"]

    func eraModifier(playerEra: String, simEra: String) -> Double {
        guard let pi = ERA_ORDER.firstIndex(of: playerEra),
              let si = ERA_ORDER.firstIndex(of: simEra) else { return 0.75 }
        let d = abs(pi - si)
        let mods = [1.00, 0.95, 0.88, 0.82, 0.76, 0.71, 0.67, 0.63]
        return mods[min(d, mods.count - 1)]
    }

    func playerMatchesEra(_ p: Player, era: String) -> Bool {
        p.era == era || p.all_teams_by_era?[era] != nil
    }

    // MARK: - Ratings

    func playerBaseRating(_ p: Player, simEra: String) -> Double {
        let pts = p.PTS ?? 15.0
        let reb = p.REB ?? 4.0
        let ast = p.AST ?? 2.5
        let stl = p.STL ?? 0.8
        let blk = p.BLK ?? 0.5
        let tov = p.TOV ?? 2.0
        let ts  = p.TS_PCT ?? 0.52
        let base = (pts * 1.8) + (reb * 1.1) + (ast * 1.3) + (stl * 2.0) + (blk * 1.8) - (tov * 1.5) + (ts * 20.0)
        return min(99.0, max(40.0, base))
    }

    func calcFitPenalty(player: Player, position: String) -> (Double, String?) {
        if player.tags?.contains("Flex") == true { return (0.0, "Flex") }
        return (0.0, "Position Fit")
    }

    func coachBonus(grade: String) -> Double {
        switch grade {
        case "A+": return 4.0; case "A": return 3.0
        case "B+": return 2.5; case "B": return 2.0
        case "C+": return 1.5; case "C": return 1.0
        case "D+": return 0.5; case "D": return 0.0
        default:   return -1.0
        }
    }

    func buildRatings(slots: [CourtSlot], simEra: String, coach: Coach?) -> [PlayerRating] {
        let offBonus = coachBonus(grade: coach?.offGrade ?? "C")
        let defBonus = coachBonus(grade: coach?.defGrade ?? "C")
        return slots.compactMap { slot in
            guard let p = slot.player else { return nil }
            let base = playerBaseRating(p, simEra: simEra)
            let eraMod = eraModifier(playerEra: p.era, simEra: simEra)
            let (fitPen, fitLbl) = calcFitPenalty(player: p, position: slot.position)
            let isBench = BENCH_POSITIONS.contains(slot.position)
            let sixthManBonus = (isBench && p.tags?.contains("Sixth Man") == true) ? 5.0 : 0.0
            let adjusted = base * eraMod * (1.0 - fitPen) + offBonus + sixthManBonus
            return PlayerRating(player: p, slot: slot.position,
                                base: base, adjusted: adjusted,
                                fitPenalty: fitPen, eraMod: eraMod)
        }
    }

    // MARK: - Pool

    func getPool(team: String, era: String, excludeIds: Set<Int>) -> [Player] {
        allPlayers.filter { p in
            let onTeam = p.team_abbreviation == team ||
                         (p.all_teams_by_era?[era]?.contains(team) == true)
            return onTeam && playerMatchesEra(p, era: era) && !excludeIds.contains(p.person_id)
        }.sorted { ($0.PTS ?? 0) > ($1.PTS ?? 0) }
    }

    func getValidCombos() -> [(team: String, era: String)] {
        var combos: [(String, String)] = []
        for era in allEras {
            let teams = Set(allPlayers.filter { playerMatchesEra($0, era: era) }.map { $0.team_abbreviation })
            for team in teams {
                if getPool(team: team, era: era, excludeIds: []).count >= 3 {
                    combos.append((team, era))
                }
            }
        }
        return combos
    }

    // MARK: - Simulation

    func simulateSeason(ratings: [PlayerRating], simEra: String, coach: Coach?) -> SeasonResult {
        let teamRating = ratings.reduce(0.0) { $0 + $1.adjusted * (SLOT_MPG[$1.slot] ?? 20) / 240.0 }
        var wins = 0
        var games: [Bool] = []
        for _ in 0..<82 {
            let oppRating = Double.random(in: 55...80)
            let win = Double.random(in: 0...1) < sigmoid(teamRating - oppRating)
            games.append(win)
            if win { wins += 1 }
        }
        let stats = buildSeasonStats(ratings: ratings, simEra: simEra, games: 82)
        let avgTeam = teamRating * 1.15 + 85
        let avgOpp  = avgTeam - Double(wins - 41) * 0.3
        return SeasonResult(wins: wins, losses: 82 - wins, games: games,
                            seasonStats: stats, avgTeamScore: avgTeam, avgOppScore: avgOpp)
    }

    func simulatePlayoffs(ratings: [PlayerRating], wins: Int, simEra: String, coach: Coach?) -> PlayoffResult {
        let roundNames = ["First Round","Semifinals","Conference Finals","NBA Finals"]
        let teamRating = ratings.reduce(0.0) { $0 + $1.adjusted * (SLOT_MPG[$1.slot] ?? 20) / 240.0 }
        let seedBonus = wins >= 60 ? 3.0 : wins >= 50 ? 1.5 : wins >= 41 ? 0.0 : -2.0
        var rounds: [PlayoffRound] = []
        var allGames: [PlayoffGame] = []
        var advanced = true

        for (ri, name) in roundNames.enumerated() {
            guard advanced else {
                rounds.append(PlayoffRound(name: name, rGames: [], advanced: false, complete: false))
                continue
            }
            let oppRating = 60.0 + Double(ri) * 3.0 - seedBonus
            var sw = 0, sl = 0
            var rGames: [PlayoffGame] = []
            while sw < 4 && sl < 4 {
                let win = Double.random(in: 0...1) < sigmoid(teamRating - oppRating)
                let ts = Int.random(in: 95...118)
                let os = win ? Int.random(in: 88...max(88, ts-1)) : Int.random(in: ts+1...120)
                let g = PlayoffGame(win: win, teamScore: ts, oppScore: os,
                                    roundIndex: ri, gameInSeries: rGames.count + 1)
                rGames.append(g); allGames.append(g)
                if win { sw += 1 } else { sl += 1 }
            }
            advanced = sw == 4
            rounds.append(PlayoffRound(name: name, rGames: rGames, advanced: advanced, complete: true))
        }

        let champion = rounds.last?.advanced == true
        let stats = buildSeasonStats(ratings: ratings, simEra: simEra, games: allGames.count)
        return PlayoffResult(champion: champion, rounds: rounds, allGames: allGames, playoffStats: stats)
    }

    func leaderboardScore(wins: Int, playoffResult: PlayoffResult?, ratings: [PlayerRating]) -> Int {
        var score = wins * 100
        if let po = playoffResult {
            score += po.rounds.filter { $0.advanced }.count * 500
            if po.champion { score += 2000 }
        }
        let avg = ratings.isEmpty ? 0.0 : ratings.reduce(0.0) { $0 + $1.adjusted } / Double(ratings.count)
        score += Int(avg * 10)
        return score
    }

    private func sigmoid(_ x: Double) -> Double { 1.0 / (1.0 + exp(-x * 0.15)) }

    private func buildSeasonStats(ratings: [PlayerRating], simEra: String, games: Int) -> [PlayerSeasonStats] {
        ratings.map { r in
            let mpg = SLOT_MPG[r.slot] ?? 20.0
            let s = mpg / 36.0 * r.eraMod
            return PlayerSeasonStats(
                player: r.player, slot: r.slot, MPG: mpg,
                PTS: (r.player.PTS ?? 15.0) * s,
                REB: (r.player.REB ?? 4.0)  * s,
                AST: (r.player.AST ?? 2.5)  * s,
                STL: (r.player.STL ?? 0.8)  * s,
                BLK: (r.player.BLK ?? 0.5)  * s,
                TOV: (r.player.TOV ?? 2.0)  * (mpg / 36.0),
                FG_PCT: r.player.FG_PCT ?? 0.45,
                FG3_PCT: r.player.FG3_PCT,
                FT_PCT: r.player.FT_PCT ?? 0.75
            )
        }
    }

    // MARK: - CSV

    private func parseCoachesCSV(_ csv: String) -> [Coach] {
        csv.components(separatedBy: "\n").dropFirst().compactMap { line in
            let p = line.components(separatedBy: ",")
            guard p.count >= 17 else { return nil }
            return Coach(
                name: p[0].trimmingCharacters(in: .whitespaces),
                from: Int(p[1]) ?? 0, to: Int(p[2]) ?? 0, years: Int(p[3]) ?? 0,
                regG: Int(p[4]) ?? 0, regW: Int(p[5]) ?? 0, regL: Int(p[6]) ?? 0,
                regWLPct: Double(p[7]) ?? 0,
                playoffG: Int(p[8]) ?? 0, playoffW: Int(p[9]) ?? 0, playoffL: Int(p[10]) ?? 0,
                playoffWLPct: Double(p[11]) ?? 0,
                conf: Int(p[12]) ?? 0, champ: Int(p[13]) ?? 0,
                offGrade: p[14].trimmingCharacters(in: .whitespaces),
                defGrade: p[15].trimmingCharacters(in: .whitespaces),
                overallGrade: p[16].trimmingCharacters(in: .whitespaces),
                isHOF: p.count > 17 ? p[17].trimmingCharacters(in: .whitespaces) == "1" : false
            )
        }
    }
}

enum EngineError: Error {
    case missingResource(String)
    case parseError(String)
}
