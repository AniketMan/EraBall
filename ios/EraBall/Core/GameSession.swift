// GameSession.swift
// Single source of truth for the game flow. All rules run through EngineBridge
// (the real engine); this holds UI-facing state and the spin choreography that
// mirrors the web slot-machine cadence (fast -> slow -> land).

import SwiftUI
import Observation

enum GamePhase: Hashable { case loading, eraSelect, draft, coachDraft, simulation }

let ALL_ERAS = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]

@Observable @MainActor
final class GameSession {
    var phase: GamePhase = .loading
    var loadError: String?

    // Era selection
    var selectedEra: String?
    var displayEra: String?
    var eraSpinning = false

    // Era theme (web: greyscale toggle -> per-era color filter). Persisted.
    var themeOn: Bool = UserDefaults.standard.object(forKey: "eb-theme") == nil
        ? true : UserDefaults.standard.bool(forKey: "eb-theme") {
        didSet { UserDefaults.standard.set(themeOn, forKey: "eb-theme") }
    }
    /// The era whose filter is currently in effect (selected era, else the last shown).
    var themeEra: String? { selectedEra ?? displayEra }

    // Mode
    var salaryCapMode = false
    var sandboxMode = false

    // Draft
    var gameState: GameStateVM?
    var pool: [PlayerVM] = []
    var lockedTeam = ""
    var lockedEra = ""
    var draftSpinning = false
    var spinTeamDisplay = ""
    var spinEraDisplay = ""
    var respinUsed = false
    var awaitingSpin = true
    var noPlayersMessage = false
    var capViolation: String?
    var selectedPoolPlayer: PlayerVM?
    var selectedFits: [String: EngineBridge.FitInfo] = [:]
    var pendingSlotIndex: Int?
    var eraFilter: Set<String> = Set(ALL_ERAS)
    var eraFilterLocked = false

    // Coach draft — spin reveals 3, pick 1 (v1.5.8 flow)
    var eligibleCoaches: [CoachVM] = []
    var coachChoices: [CoachVM] = []
    var coach: CoachVM?
    var coachSpinsUsed = 0
    var coachSpinning = false
    var coachReel: [String] = ["", "", ""]
    var bonusCoachRespin = false

    // Rating + sim
    var teamRating: TeamRatingVM?
    var season: SeasonResultVM?
    var revealedGames = 0
    var seasonDone = false
    var playoffs: PlayoffResultVM?
    var playoffRevealIndex = -1
    var playoffDone = false
    var finish: FinishResultVM?
    var runRecorded = false

    private let engine = EngineBridge.shared

    var draftComplete: Bool { (gameState?.filledCount ?? 0) == 9 }

    /// DEBUG only: fill the roster (parallels the web's localhost fill presets).
    func devFillRoster() {
        if let s = engine.devFill() { gameState = s; pool = []; selectedPoolPlayer = nil; awaitingSpin = true }
    }
    var coachRespinBudget: Int { bonusCoachRespin ? 3 : 2 }

    // MARK: Boot

    func boot() async {
        do { try await engine.loadData(); phase = .eraSelect }
        catch { loadError = "Couldn't load player data. Check your connection and try again." }
    }

    // MARK: Era selection

    private static let schedule = Array(repeating: 65, count: 10) + Array(repeating: 120, count: 5) + Array(repeating: 220, count: 3)

    func spinEra() {
        guard !eraSpinning else { return }
        eraSpinning = true; selectedEra = nil
        Task {
            for d in Self.schedule { displayEra = ALL_ERAS.randomElement(); try? await Task.sleep(for: .milliseconds(d)) }
            let picked = ALL_ERAS.randomElement()!
            displayEra = picked; selectedEra = picked
            AudioManager.shared.play(era: picked)
            try? await Task.sleep(for: .milliseconds(350)); eraSpinning = false
        }
    }
    func selectEra(_ e: String) {
        guard !eraSpinning else { return }
        selectedEra = e; displayEra = e
        AudioManager.shared.play(era: e)
    }

    func beginDraft(salaryCap: Bool, sandbox: Bool = false) {
        guard let era = selectedEra else { return }
        salaryCapMode = salaryCap; sandboxMode = sandbox
        gameState = engine.startGame(era: era, salaryCap: salaryCap)
        pool = []; lockedTeam = ""; lockedEra = ""; respinUsed = false; awaitingSpin = true
        noPlayersMessage = false; eraFilter = Set(ALL_ERAS); eraFilterLocked = false
        coach = nil; coachChoices = []; coachSpinsUsed = 0; teamRating = nil; season = nil
        playoffs = nil; finish = nil; runRecorded = false; revealedGames = 0; seasonDone = false
        playoffRevealIndex = -1; playoffDone = false; spinTeamDisplay = ""; spinEraDisplay = ""
        phase = .draft
    }

    // MARK: Draft

    var canSpin: Bool { !draftSpinning && !(!pool.isEmpty && respinUsed) }

    func spinDraft() {
        guard canSpin else { return }
        if !pool.isEmpty { respinUsed = true }
        eraFilterLocked = true; draftSpinning = true; awaitingSpin = false; noPlayersMessage = false; pool = []; selectedPoolPlayer = nil; selectedFits = [:]; pendingSlotIndex = nil
        let eras = ALL_ERAS.filter { eraFilter.contains($0) }
        let teams = engine.teams.isEmpty ? ["———"] : engine.teams
        Task {
            for d in Self.schedule {
                spinTeamDisplay = teams.randomElement() ?? ""
                spinEraDisplay = eras.randomElement() ?? "20s"
                try? await Task.sleep(for: .milliseconds(d))
            }
            guard let r = engine.spin(eraFilter: Array(eraFilter)) else { draftSpinning = false; return }
            if r.noPlayers {
                spinTeamDisplay = r.team ?? spinTeamDisplay; spinEraDisplay = r.era ?? spinEraDisplay
                noPlayersMessage = true; draftSpinning = false; return
            }
            lockedTeam = r.team ?? ""; lockedEra = r.era ?? ""
            spinTeamDisplay = lockedTeam; spinEraDisplay = lockedEra
            pool = r.pool ?? []; draftSpinning = false
        }
    }

    /// Select a pool player (web: setSelectedPlayer). Empty slots then glow with fit.
    func selectPoolPlayer(_ p: PlayerVM?) {
        selectedPoolPlayer = p; pendingSlotIndex = nil
        selectedFits = p != nil ? engine.fitPreview(personId: p!.personId) : [:]
    }

    /// Tap an empty slot (web: previewSlot -> confirmPick). First tap = pending,
    /// second tap on the same slot = lock.
    func previewSlot(_ idx: Int) {
        guard selectedPoolPlayer != nil else { return }
        if pendingSlotIndex == idx { placeSelected(atSlotIndex: idx) }
        else { pendingSlotIndex = idx }
    }

    /// Place the selected pool player into a slot (web: confirmPick).
    func placeSelected(atSlotIndex idx: Int) {
        guard let p = selectedPoolPlayer else { return }
        assign(slotIndex: idx, player: p)
        if capViolation == nil { selectedPoolPlayer = nil; selectedFits = [:]; pendingSlotIndex = nil }
    }

    func assign(slotIndex: Int, player: PlayerVM) {
        guard let r = engine.assign(slotIndex: slotIndex, personId: player.personId) else { return }
        if r.ok, let s = r.state { gameState = s; pool = []; awaitingSpin = true; capViolation = nil }
        else if let e = r.error {
            capViolation = e
            Task { try? await Task.sleep(for: .seconds(3)); capViolation = nil }
        }
    }
    func remove(slotIndex: Int) { if let s = engine.remove(slotIndex: slotIndex) { gameState = s } }

    func proceedToCoachDraft() {
        eligibleCoaches = engine.eligibleCoaches()
        // Bonus respin carries over when the player never used their draft re-spin (non-sandbox).
        bonusCoachRespin = !respinUsed && !sandboxMode
        coach = nil; coachChoices = []; coachSpinsUsed = 0
        phase = .coachDraft
    }

    // MARK: Coach draft (spin reveals 3, pick 1)

    func spinCoach() {
        guard !coachSpinning, coachSpinsUsed < coachRespinBudget, !eligibleCoaches.isEmpty else { return }
        coachSpinning = true; coachSpinsUsed += 1; coachChoices = []
        Task {
            for d in Self.schedule {
                coachReel = (0..<3).map { _ in eligibleCoaches.randomElement()?.name ?? "" }
                try? await Task.sleep(for: .milliseconds(d))
            }
            let three = Array(eligibleCoaches.shuffled().prefix(3))
            coachReel = three.map(\.name)
            coachChoices = three
            try? await Task.sleep(for: .milliseconds(350)); coachSpinning = false
        }
    }

    func pickCoach(_ c: CoachVM) {
        engine.setCoach(c)
        coach = c
        teamRating = engine.rateTeam()
        phase = .simulation
    }

    // MARK: Simulation

    var seasonGameCount: Int { engine.seasonGames(era: selectedEra ?? "20s") }

    func startSeason() {
        guard season == nil else { return }
        season = engine.runSeason()
        revealedGames = 0; seasonDone = false
        Task {
            guard let total = season?.games.count else { return }
            while revealedGames < total { try? await Task.sleep(for: .milliseconds(45)); revealedGames += 1 }
            seasonDone = true; recordIfDone()
        }
    }
    func skipSeasonReveal() { revealedGames = season?.games.count ?? 0; seasonDone = true; recordIfDone() }

    var winsSoFar: Int { (season?.games.prefix(revealedGames).filter { $0 }.count) ?? 0 }
    var lossesSoFar: Int { revealedGames - winsSoFar }

    // Playoff reveal helpers (web: currentGame / revealedGames / series record)
    var revealedPlayoffGames: [PlayoffGameVM] {
        guard let g = playoffs?.allGames else { return [] }
        return Array(g.prefix(min(playoffRevealIndex, g.count)))
    }
    var currentPlayoffGame: PlayoffGameVM? { revealedPlayoffGames.last }
    /// Series W-L for the current game's round, up to and including the current game.
    var currentSeriesRecord: (w: Int, l: Int) {
        guard let cur = currentPlayoffGame else { return (0, 0) }
        let inRound = revealedPlayoffGames.filter { $0.roundIndex == cur.roundIndex }
        return (inRound.filter { $0.win }.count, inRound.filter { !$0.win }.count)
    }

    func startPlayoffs() {
        guard playoffs == nil else { return }
        playoffs = engine.runPlayoffs(); playoffRevealIndex = 0; playoffDone = false
        advancePlayoffs()
    }
    func advancePlayoffs() {
        guard let r = playoffs, !playoffDone else { return }
        Task {
            while !playoffDone && playoffRevealIndex < r.allGames.count {
                try? await Task.sleep(for: .milliseconds(550))
                playoffRevealIndex += 1
                if playoffRevealIndex >= r.allGames.count { playoffDone = true; recordIfDone() }
            }
        }
    }
    func skipPlayoffs() { if let r = playoffs { playoffRevealIndex = r.allGames.count; playoffDone = true; recordIfDone() } }

    private func recordIfDone() {
        guard !runRecorded, let s = season, seasonDone else { return }
        if s.madePlayoffs && !playoffDone { return }
        guard !sandboxMode else { runRecorded = true; return }
        runRecorded = true
        finish = engine.finishRun(teamName: GameCenterManager.shared.playerAlias ?? "My Team")
        let gc = GameCenterManager.shared
        let capMode = salaryCapMode
        if let score = finish?.score, let era = selectedEra {
            Task { await gc.submitScore(score, era: era, salaryCapMode: capMode) }
        }
        if let unlocked = finish?.newAchievements {
            for a in unlocked { Task { await gc.reportAchievement(id: a.id) } }
        }
    }

    func restart() {
        phase = .eraSelect
        selectedEra = nil; displayEra = nil; pool = []; gameState = nil
        coach = nil; coachChoices = []; season = nil; playoffs = nil; finish = nil
    }
}
