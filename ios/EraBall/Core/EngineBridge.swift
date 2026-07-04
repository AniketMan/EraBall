// EngineBridge.swift
// Drives the REAL @eraball/engine (bundled to engine.js) inside JavaScriptCore.
// All game rules/sim run through the exact site engine — verified byte-for-byte
// against engine-snapshot/baseline.json. Swift only decodes view models.

import Foundation
import JavaScriptCore

// MARK: - View Models (mirror engine-entry.ts JSON output)

struct PlayerVM: Codable, Identifiable, Hashable, Sendable {
    var personId: String
    var fullName: String
    var position: String
    var height: String
    var weight: String
    var fromYear: Int
    var toYear: Int?
    var era: String
    var team: String
    var GP: Double
    var PTS: Double
    var REB: Double
    var AST: Double
    var STL: Double?
    var BLK: Double?
    var TOV: Double?
    var FG_PCT: Double?
    var FG3_PCT: Double?
    var FT_PCT: Double?
    var TS_PCT: Double?
    var base: Double
    var tier: String
    var greatest75: Bool
    var timeless: Bool
    var offAnchor: Bool
    var defAnchor: Bool
    var anchorTier: Int
    var shootingStar: Bool
    var shootingStarTier: Int
    var glassClean: Bool
    var floorGeneral: Bool
    var flexPositions: [String]?
    var rings: Int
    var finalsMVP: Int
    var sixthMan: Bool
    var duoPartners: [String]?
    var eraModifier: Double

    var id: String { personId }
    var headshotURL: URL? { URL(string: "https://cdn.nba.com/headshots/nba/latest/260x190/\(personId).png") }

    var tags: [PlayerTag] {
        var t: [PlayerTag] = []
        if timeless { t.append(.timeless) }
        if offAnchor { t.append(.offAnchor) }
        if defAnchor { t.append(.defAnchor) }
        if shootingStar { t.append(.shootingStar) }
        if glassClean { t.append(.glassCleaner) }
        if floorGeneral { t.append(.floorGeneral) }
        if flexPositions != nil { t.append(.flex) }
        if rings > 0 { t.append(.champion) }
        if duoPartners != nil { t.append(.dynamicDuo) }
        return t
    }
}

enum PlayerTag: String, Identifiable, Hashable {
    case timeless = "Timeless", offAnchor = "Off Anchor", defAnchor = "Def Anchor"
    case shootingStar = "Shooting Star", glassCleaner = "Glass Cleaner", floorGeneral = "Floor General"
    case flex = "Flex", champion = "Champion", dynamicDuo = "Dynamic Duo"
    var id: String { rawValue }
}

struct SlotVM: Codable, Identifiable, Sendable {
    var index: Int
    var position: String
    var player: PlayerVM?
    var fitPenalty: Double
    var fitLabel: String?
    var id: Int { index }
    var isBench: Bool { position.hasPrefix("B") }
}

struct GameStateVM: Codable, Sendable {
    var era: String
    var salaryCapMode: Bool
    var slots: [SlotVM]
    var filledCount: Int
    var tierCounts: [String: Int]
    var neededTiers: [String]
    var capQuotas: [String: Int]
}

struct SpinResultVM: Codable, Sendable {
    var noPlayers: Bool
    var team: String?
    var era: String?
    var pool: [PlayerVM]?
}

struct AssignResultVM: Codable, Sendable {
    var ok: Bool
    var error: String?
    var state: GameStateVM?
}

struct CoachVM: Codable, Identifiable, Hashable, Sendable {
    var name: String
    var rawName: String
    var hof: Bool
    var from: Int
    var to: Int
    var years: Int
    var regW: Int
    var regL: Int
    var regWLPct: Double
    var playoffW: Int
    var playoffL: Int
    var playoffWLPct: Double
    var playoffG: Int
    var conf: Int
    var champ: Int
    var offGrade: String
    var defGrade: String
    var overallGrade: String
    var offGuru: Bool
    var defGuru: Bool
    var franchisePair: Bool
    var effOffGrade: String
    var effDefGrade: String
    var id: String { "\(rawName)-\(from)" }
}

struct RatingVM: Codable, Identifiable, Sendable {
    var personId: String
    var name: String
    var slot: String
    var base: Double
    var adjusted: Double
    var fitPenalty: Double
    var eraMod: Double
    var fitLabel: String?
    var id: String { personId }
}

struct TeamRatingVM: Codable, Sendable {
    var ok: Bool
    var teamRating: Double?
    var displayRating: Int?
    var rawRating: Double?
    var playerRatings: [RatingVM]?
}

struct SeasonStatVM: Codable, Identifiable, Sendable {
    var personId: String
    var name: String
    var slot: String
    var GP: Double
    var MPG: Double
    var PTS: Double
    var REB: Double
    var AST: Double
    var STL: Double
    var BLK: Double
    var TOV: Double
    var FG_PCT: Double
    var FG3_PCT: Double?
    var FT_PCT: Double
    var id: String { "\(personId)-\(slot)" }
    var isBench: Bool { slot.hasPrefix("B") }
}

struct TeamAnalysisVM: Codable, Sendable {
    var spacingWinFactor: Double
    var shooterCount: Double
    var spacingBaseline: Double
    var isPreThreePt: Bool
    var highVolumeShooterCount: Double
    var rebFactor: Double
    var blkScore: Double
    var astFactor: Double
}

struct OppStatsVM: Codable, Sendable {
    var REB: Double
    var AST: Double
    var STL: Double?
    var BLK: Double?
    var TOV: Double
    var FG_PCT: Double
    var FG3_PCT: Double?
    var FT_PCT: Double
    var TS_PCT: Double
}

struct AwardVM: Codable, Identifiable, Sendable {
    var award: String
    var gold: Bool
    var justification: String
    var player: SeasonStatVM
    var id: String { "\(award)-\(player.personId)" }
}

struct SeasonResultVM: Codable, Sendable {
    var ok: Bool
    var wins: Int
    var losses: Int
    var games: [Bool]
    var seasonStats: [SeasonStatVM]
    var avgTeamScore: Double
    var avgOppScore: Double
    var teamAnalysis: TeamAnalysisVM
    var oppStats: OppStatsVM
    var madePlayoffs: Bool
    var playoffThreshold: Int
    var awards: [AwardVM]
}

struct PlayoffRoundVM: Codable, Identifiable, Sendable {
    var name: String
    var seriesWins: Int
    var seriesLosses: Int
    var advanced: Bool
    var winsNeeded: Int
    var id: String { name }
}

struct GameLeaderVM: Codable, Sendable { var name: String; var val: Double }
struct GameLeadersVM: Codable, Sendable { var pts: GameLeaderVM; var reb: GameLeaderVM; var ast: GameLeaderVM }
struct SpecialPerfVM: Codable, Sendable { var playerName: String; var pts: Double; var reb: Double; var ast: Double; var label: String }

struct PlayerLineVM: Codable, Identifiable, Sendable {
    var personId: String
    var name: String
    var slot: String
    var mpg: Double
    var pts: Double
    var reb: Double
    var ast: Double
    var stl: Double
    var blk: Double
    var tov: Double
    var fg: Double
    var fg3: Double?
    var ft: Double
    var id: String { personId }
}

struct PlayoffGameVM: Codable, Identifiable, Sendable {
    var win: Bool
    var roundIndex: Int
    var teamScore: Double
    var oppScore: Double
    var gameInSeries: Int
    var leaders: GameLeadersVM?
    var special: SpecialPerfVM?
    var playerLines: [PlayerLineVM]?
    var id: String { "\(roundIndex)-\(gameInSeries)-\(teamScore)-\(oppScore)" }
}

struct PlayoffResultVM: Codable, Sendable {
    var ok: Bool
    var rounds: [PlayoffRoundVM]
    var champion: Bool
    var allGames: [PlayoffGameVM]
    var playoffStats: [SeasonStatVM]
    var finalsStats: [SeasonStatVM]
    var oppStats: OppStatsVM
    var finalsMVP: SeasonStatVM?
}

struct AchievementVM: Codable, Identifiable, Hashable, Sendable {
    var id: String
    var title: String
    var description: String
    var rarity: String
}

struct AchievementStateVM: Codable, Identifiable, Sendable {
    var achievement: AchievementVM
    var unlocked: Bool
    var id: String { achievement.id }
}

struct FinishResultVM: Codable, Sendable {
    var ok: Bool
    var score: Int?
    var playoffResultKey: String?
    var newAchievements: [AchievementVM]?
}

struct EraRecordVM: Codable, Sendable { var wins: Int; var losses: Int }
struct BestRecordVM: Codable, Sendable { var wins: Int; var losses: Int; var era: String }
struct CountEntryVM: Codable, Sendable { var name: String; var count: Int }
struct HighestRatingVM: Codable, Sendable { var rating: Double; var era: String }

struct LifetimeStatsVM: Codable, Sendable {
    var draftsCompleted: Int
    var totalWins: Int
    var totalLosses: Int
    var championshipsTotal: Int
    var recordByEra: [String: EraRecordVM]
    var championshipsByEra: [String: Int]
    var bestRecord: BestRecordVM?
    var worstRecord: BestRecordVM?
    var playerDraftCounts: [String: CountEntryVM]
    var playerChampionshipCounts: [String: CountEntryVM]
    var coachDraftCounts: [String: CountEntryVM]
    var highestTeamRating: HighestRatingVM?
}

// MARK: - Bridge

@MainActor
final class EngineBridge {
    static let shared = EngineBridge()

    private let context: JSContext
    private let api: JSValue
    private let decoder = JSONDecoder()

    private(set) var coaches: [CoachVM] = []
    private(set) var teams: [String] = []
    private(set) var playerCount = 0

    struct FitInfo: Codable { var penalty: Double; var label: String? }
    enum BridgeError: Error { case initFailed, dataMissing, decode(String) }

    private init() {
        guard let ctx = JSContext() else { fatalError("JSContext init failed") }
        context = ctx
        ctx.exceptionHandler = { _, exc in print("[Engine JS] \(exc?.toString() ?? "?")") }

        // localStorage backed by UserDefaults so lifetimeStats/achievements persist.
        let defaults = UserDefaults.standard
        let prefix = "eraball_js_"
        let get: @convention(block) (String) -> Any = { defaults.string(forKey: prefix + $0) ?? NSNull() }
        let set: @convention(block) (String, String) -> Void = { defaults.set($1, forKey: prefix + $0) }
        let remove: @convention(block) (String) -> Void = { defaults.removeObject(forKey: prefix + $0) }
        let storage = JSValue(newObjectIn: ctx)!
        storage.setObject(get, forKeyedSubscript: "getItem" as NSString)
        storage.setObject(set, forKeyedSubscript: "setItem" as NSString)
        storage.setObject(remove, forKeyedSubscript: "removeItem" as NSString)
        ctx.setObject(storage, forKeyedSubscript: "__nativeStorage" as NSString)
        let nativeLog: @convention(block) (String) -> Void = { _ in }
        ctx.setObject(nativeLog, forKeyedSubscript: "__nativeLog" as NSString)

        guard let url = Bundle.main.url(forResource: "engine", withExtension: "js"),
              let src = try? String(contentsOf: url, encoding: .utf8) else {
            fatalError("engine.js missing from bundle")
        }
        ctx.evaluateScript(src, withSourceURL: url)
        guard let a = ctx.objectForKeyedSubscript("EraBall"), !a.isUndefined else {
            fatalError("EraBall bridge not found in engine.js")
        }
        api = a
    }

    // MARK: Data

    func loadData() async throws {
        let playersJSON = try await Self.loadPlayersJSON()
        let coachesCSV = try Self.loadCoachesCSV()
        playerCount = Int(api.invokeMethod("loadPlayers", withArguments: [playersJSON])?.toInt32() ?? 0)
        coaches = try decodeArray([CoachVM].self, api.invokeMethod("loadCoaches", withArguments: [coachesCSV]))
        teams = (try? decodeArray([String].self, api.invokeMethod("allTeams", withArguments: []))) ?? []
    }

    private static func loadPlayersJSON() async throws -> String {
        let cache = URL.cachesDirectory.appending(path: "players_with_stats.json")
        if let remote = URL(string: "https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev/players_with_stats.json") {
            var req = URLRequest(url: remote, timeoutInterval: 8)
            req.cachePolicy = .reloadIgnoringLocalCacheData
            if let (data, resp) = try? await URLSession.shared.data(for: req),
               (resp as? HTTPURLResponse)?.statusCode == 200, data.count > 100_000 {
                try? data.write(to: cache)
                return String(decoding: data, as: UTF8.self)
            }
        }
        if let cached = try? Data(contentsOf: cache), cached.count > 100_000 {
            return String(decoding: cached, as: UTF8.self)
        }
        guard let bundled = Bundle.main.url(forResource: "players_with_stats", withExtension: "json") else { throw BridgeError.dataMissing }
        return try String(contentsOf: bundled, encoding: .utf8)
    }

    private static func loadCoachesCSV() throws -> String {
        guard let url = Bundle.main.url(forResource: "coaches", withExtension: "csv") else { throw BridgeError.dataMissing }
        return try String(contentsOf: url, encoding: .utf8)
    }

    // MARK: Commands

    @discardableResult
    func startGame(era: String, salaryCap: Bool) -> GameStateVM? {
        try? decode(GameStateVM.self, api.invokeMethod("startGame", withArguments: [era, salaryCap]))
    }
    func seasonGames(era: String) -> Int { Int(api.invokeMethod("seasonGames", withArguments: [era])?.toInt32() ?? 82) }
    func firstRoundLabel(era: String) -> String { api.invokeMethod("firstRoundLabel", withArguments: [era])?.toString() ?? "Best of 7" }

    func spin(eraFilter: [String]) -> SpinResultVM? {
        let filter = jsonString(eraFilter)
        return try? decode(SpinResultVM.self, api.invokeMethod("spin", withArguments: [filter]))
    }
    func fitPreview(personId: String) -> [String: FitInfo] {
        (try? decode([String: FitInfo].self, api.invokeMethod("fitPreview", withArguments: [personId]))) ?? [:]
    }
    func assign(slotIndex: Int, personId: String) -> AssignResultVM? {
        try? decode(AssignResultVM.self, api.invokeMethod("assign", withArguments: [slotIndex, personId]))
    }
    func remove(slotIndex: Int) -> GameStateVM? {
        (try? decode(AssignResultVM.self, api.invokeMethod("remove", withArguments: [slotIndex])))?.state
    }
    func swap(from: Int, to: Int) -> GameStateVM? {
        (try? decode(AssignResultVM.self, api.invokeMethod("swap", withArguments: [from, to])))?.state
    }
    func state() -> GameStateVM? { try? decode(GameStateVM.self, api.invokeMethod("state", withArguments: [])) }
    func devFill() -> GameStateVM? { try? decode(GameStateVM.self, api.invokeMethod("devFill", withArguments: [])) }

    func eligibleCoaches() -> [CoachVM] {
        (try? decodeArray([CoachVM].self, api.invokeMethod("eligibleCoaches", withArguments: []))) ?? []
    }
    @discardableResult
    func setCoach(_ coach: CoachVM) -> Bool {
        struct R: Codable { var ok: Bool }
        return (try? decode(R.self, api.invokeMethod("setCoach", withArguments: [coach.rawName, coach.from])))?.ok ?? false
    }
    func rateTeam() -> TeamRatingVM? { try? decode(TeamRatingVM.self, api.invokeMethod("rateTeam", withArguments: [])) }
    func runSeason() -> SeasonResultVM? { try? decode(SeasonResultVM.self, api.invokeMethod("runSeason", withArguments: [])) }
    func runPlayoffs() -> PlayoffResultVM? { try? decode(PlayoffResultVM.self, api.invokeMethod("runPlayoffs", withArguments: [])) }
    func finishRun(teamName: String) -> FinishResultVM? { try? decode(FinishResultVM.self, api.invokeMethod("finishRun", withArguments: [teamName])) }
    func lifetimeStats(mode: String) -> LifetimeStatsVM? { try? decode(LifetimeStatsVM.self, api.invokeMethod("lifetimeStats", withArguments: [mode])) }
    func allAchievements() -> [AchievementStateVM] { (try? decodeArray([AchievementStateVM].self, api.invokeMethod("allAchievements", withArguments: []))) ?? [] }

    // MARK: Decode helpers

    private func decode<T: Decodable>(_ type: T.Type, _ value: JSValue?) throws -> T {
        guard let json = value?.toString(), let data = json.data(using: .utf8) else { throw BridgeError.decode("no JSON") }
        do { return try decoder.decode(type, from: data) }
        catch { print("[Engine] decode \(T.self) failed: \(error)\n\(json.prefix(200))"); throw BridgeError.decode(String(describing: error)) }
    }
    private func decodeArray<T: Decodable>(_ type: T.Type, _ value: JSValue?) throws -> T { try decode(type, value) }
    private func jsonString(_ v: [String]) -> String { String(decoding: (try? JSONEncoder().encode(v)) ?? Data("[]".utf8), as: UTF8.self) }
}
