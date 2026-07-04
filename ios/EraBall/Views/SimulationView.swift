// SimulationView.swift
// Matches SimulationScreen.tsx exactly.

import SwiftUI

struct SimulationView: View {
    let slots: [CourtSlot]
    let coach: Coach
    let era: String
    let salaryCapMode: Bool

    @Environment(AppState.self) private var appState
    @Environment(GameCenterManager.self) private var gcManager

    @State private var simPhase: SimPhase = .idle
    @State private var seasonResult: SeasonResult? = nil
    @State private var playoffResult: PlayoffResult? = nil
    @State private var ratings: [PlayerRating] = []
    @State private var showStats = false
    @State private var showLeaderboard = false

    enum SimPhase { case idle, simulating, seasonDone, playoffDone }

    private var wins: Int { seasonResult?.wins ?? 0 }
    private var losses: Int { seasonResult?.losses ?? 0 }

    var body: some View {
        VStack(spacing: 0) {
            TopBar(onTitleTap: { appState.restart() }) {
                Button("RESTART") { appState.restart() }
                    .buttonStyle(GhostButtonStyle())
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.5)
            }

            EraBallDivider()

            ScrollView {
                VStack(spacing: 0) {
                    // Team header
                    teamHeader
                    EraBallDivider()

                    // Simulation controls
                    switch simPhase {
                    case .idle:
                        idleSection
                    case .simulating:
                        simulatingSection
                    case .seasonDone:
                        seasonResultSection
                    case .playoffDone:
                        playoffResultSection
                    }
                }
            }
        }
        .background(G.black)
        .ignoresSafeArea(edges: .bottom)
        .sheet(isPresented: $showStats) {
            if let sr = seasonResult {
                SeasonStatsSheet(stats: sr.seasonStats, wins: wins, losses: losses)
            }
        }
        .sheet(isPresented: $showLeaderboard) {
            LeaderboardSheet()
        }
    }

    // MARK: - Team Header

    private var teamHeader: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(eraDisplayLabel(era) + " ERA")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(3)
                        .foregroundStyle(G.grey)
                    Text("YOUR TEAM")
                        .font(Fonts.bebas(32))
                        .tracking(6)
                        .foregroundStyle(G.white)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("COACH")
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(G.grey)
                    Text(coach.name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(G.white)
                    Text(coach.overallGrade)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(gradeColor(coach.overallGrade))
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)

            // Roster summary (starters only)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(slots.filter { $0.player != nil }.prefix(5)) { slot in
                        if let player = slot.player {
                            VStack(spacing: 4) {
                                PlayerHeadshotView(personId: player.person_id, initial: player.full_name, size: 48)
                                Text(player.full_name.components(separatedBy: " ").last ?? "")
                                    .font(.system(size: 9))
                                    .foregroundStyle(G.grey)
                                    .lineLimit(1)
                                Text(slot.position)
                                    .font(.system(size: 8, weight: .semibold))
                                    .tracking(1)
                                    .foregroundStyle(G.gold)
                            }
                            .frame(width: 60)
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 16)
        }
    }

    // MARK: - Idle

    private var idleSection: some View {
        VStack(spacing: 20) {
            Text("READY TO SIMULATE")
                .font(Fonts.bebas(32))
                .tracking(6)
                .foregroundStyle(G.white)
            Text("82-game season + playoffs")
                .font(.system(size: 14))
                .foregroundStyle(G.grey)
            Button("SIMULATE SEASON") {
                Task { await runSimulation() }
            }
            .buttonStyle(GoldButtonStyle())
        }
        .padding(.vertical, 48)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Simulating

    private var simulatingSection: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(G.gold)
                .scaleEffect(1.5)
            Text("SIMULATING...")
                .font(Fonts.bebas(24))
                .tracking(4)
                .foregroundStyle(G.grey)
        }
        .padding(.vertical, 64)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Season Result

    private var seasonResultSection: some View {
        VStack(spacing: 0) {
            // Record
            VStack(spacing: 8) {
                Text("SEASON RECORD")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(3)
                    .foregroundStyle(G.grey)
                HStack(spacing: 0) {
                    Text("\(wins)")
                        .font(Fonts.bebas(72))
                        .tracking(4)
                        .foregroundStyle(wins >= 50 ? G.gold : G.white)
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                    Text("-")
                        .font(Fonts.bebas(48))
                        .foregroundStyle(G.grey)
                        .padding(.horizontal, 8)
                    Text("\(losses)")
                        .font(Fonts.bebas(72))
                        .tracking(4)
                        .foregroundStyle(G.white)
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                }
                Text(seasonLabel(wins: wins))
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(seasonLabelColor(wins: wins))
            }
            .padding(.vertical, 32)
            .padding(.horizontal, 16)

            EraBallDivider()

            // Game log (mini)
            if let result = seasonResult {
                gameLog(games: result.games)
                EraBallDivider()
            }

            // Actions
            HStack(spacing: 12) {
                Button("VIEW STATS") { showStats = true }
                    .buttonStyle(GhostButtonStyle(fullWidth: true))
                Button("SIMULATE PLAYOFFS") {
                    Task { await runPlayoffs() }
                }
                .buttonStyle(GoldButtonStyle(fullWidth: true))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
        }
    }

    // MARK: - Playoff Result

    private var playoffResultSection: some View {
        VStack(spacing: 0) {
            if let po = playoffResult {
                // Champion banner
                if po.champion {
                    VStack(spacing: 8) {
                        Text("NBA CHAMPIONS")
                            .font(Fonts.bebas(48))
                            .tracking(8)
                            .foregroundStyle(G.gold)
                        Text("Congratulations!")
                            .font(.system(size: 14))
                            .foregroundStyle(G.grey)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 32)
                    .background(G.gold.opacity(0.05))
                    EraBallDivider()
                }

                // Season record
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("SEASON").font(.system(size: 9, weight: .semibold)).tracking(2).foregroundStyle(G.grey)
                        Text("\(wins)-\(losses)").font(Fonts.bebas(28)).tracking(3).foregroundStyle(G.white)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("RESULT").font(.system(size: 9, weight: .semibold)).tracking(2).foregroundStyle(G.grey)
                        Text(po.champion ? "CHAMPION" : "ELIMINATED")
                            .font(Fonts.bebas(28))
                            .tracking(3)
                            .foregroundStyle(po.champion ? G.gold : G.red)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)

                EraBallDivider()

                // Playoff rounds
                ForEach(po.rounds.indices, id: \.self) { i in
                    let round = po.rounds[i]
                    if round.complete {
                        PlayoffRoundRow(round: round)
                        EraBallDivider()
                    }
                }

                // Actions
                VStack(spacing: 12) {
                    Button("VIEW LEADERBOARD") { showLeaderboard = true }
                        .buttonStyle(OutlineButtonStyle(fullWidth: true))
                    Button("PLAY AGAIN") { appState.restart() }
                        .buttonStyle(GoldButtonStyle(fullWidth: true))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 20)
            }
        }
    }

    // MARK: - Game Log

    private func gameLog(games: [Bool]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("GAME LOG")
                .font(.system(size: 9, weight: .semibold))
                .tracking(3)
                .foregroundStyle(G.grey)
                .padding(.horizontal, 16)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 2) {
                    ForEach(Array(games.enumerated()), id: \.offset) { _, win in
                        Rectangle()
                            .fill(win ? G.green : G.red)
                            .frame(width: 6, height: 20)
                    }
                }
                .padding(.horizontal, 16)
            }
        }
        .padding(.vertical, 12)
    }

    // MARK: - Simulation Logic

    private func runSimulation() async {
        simPhase = .simulating
        ratings = Engine.shared.buildRatings(slots: slots, simEra: era, coach: coach)
        let result = Engine.shared.simulateSeason(ratings: ratings, simEra: era, coach: coach)
        seasonResult = result
        simPhase = .seasonDone

        // Achievements
        if result.wins >= 50 { appState.unlockAchievement("50_wins") }
        if result.wins >= 60 { appState.unlockAchievement("60_wins") }
        if result.wins == 82 { appState.unlockAchievement("perfect_season") }
        appState.unlockAchievement("first_sim")
    }

    private func runPlayoffs() async {
        guard let sr = seasonResult else { return }
        simPhase = .simulating
        let result = Engine.shared.simulatePlayoffs(ratings: ratings, wins: sr.wins, simEra: era, coach: coach)
        playoffResult = result
        simPhase = .playoffDone

        // Record result
        appState.recordResult(wins: sr.wins, losses: sr.losses,
                              champion: result.champion, era: era, salaryCapMode: salaryCapMode)

        // Submit to Game Center
        let score = Engine.shared.leaderboardScore(wins: sr.wins, playoffResult: result, ratings: ratings)
        await gcManager.submitScore(score, era: era, salaryCapMode: salaryCapMode)

        // Achievements
        if result.champion {
            appState.unlockAchievement("first_champ")
            if salaryCapMode { appState.unlockAchievement("salary_cap_champ") }
            await gcManager.reportAchievement(id: "first_champ")
        }
        if result.rounds.contains(where: { $0.advanced && $0.rGames.filter { $0.win }.count == 4 && $0.rGames.count == 4 }) {
            appState.unlockAchievement("sweep")
        }
    }

    // MARK: - Helpers

    private func seasonLabel(wins: Int) -> String {
        switch wins {
        case 70...: return "ALL-TIME GREAT"
        case 60...: return "DOMINANT"
        case 50...: return "PLAYOFF CONTENDER"
        case 41...: return "ABOVE .500"
        case 30...: return "BELOW .500"
        default:    return "LOTTERY TEAM"
        }
    }

    private func seasonLabelColor(wins: Int) -> Color {
        switch wins {
        case 60...: return G.gold
        case 50...: return G.green
        case 41...: return G.greyDark
        default:    return G.grey
        }
    }
}

// MARK: - Playoff Round Row

struct PlayoffRoundRow: View {
    let round: PlayoffRound

    private var seriesWins: Int { round.rGames.filter { $0.win }.count }
    private var seriesLosses: Int { round.rGames.filter { !$0.win }.count }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(round.name)
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(G.greyDark)
                Text("\(seriesWins)-\(seriesLosses)")
                    .font(Fonts.bebas(22))
                    .tracking(3)
                    .foregroundStyle(round.advanced ? G.green : G.red)
            }
            Spacer()
            Text(round.advanced ? "ADVANCED" : "ELIMINATED")
                .font(.system(size: 10, weight: .semibold))
                .tracking(2)
                .foregroundStyle(round.advanced ? G.green : G.red)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background((round.advanced ? G.green : G.red).opacity(0.08))
                .overlay(Rectangle().stroke((round.advanced ? G.green : G.red).opacity(0.3), lineWidth: 1))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

// MARK: - Season Stats Sheet

struct SeasonStatsSheet: View {
    let stats: [PlayerSeasonStats]
    let wins: Int
    let losses: Int
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    HStack {
                        Text("SEASON RECORD")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(3)
                            .foregroundStyle(G.grey)
                        Spacer()
                        Text("\(wins)-\(losses)")
                            .font(Fonts.bebas(24))
                            .tracking(3)
                            .foregroundStyle(G.gold)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 16)

                    EraBallDivider()

                    ForEach(stats) { stat in
                        HStack(spacing: 12) {
                            PlayerHeadshotView(personId: stat.player.person_id, initial: stat.player.full_name, size: 40)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(stat.player.full_name)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(G.white)
                                    .lineLimit(1)
                                Text(stat.slot)
                                    .font(.system(size: 10))
                                    .foregroundStyle(G.grey)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text(String(format: "%.1f", stat.PTS))
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(G.white)
                                Text("PTS")
                                    .font(.system(size: 9))
                                    .foregroundStyle(G.grey)
                            }
                            VStack(alignment: .trailing, spacing: 2) {
                                Text(String(format: "%.1f", stat.REB))
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(G.white)
                                Text("REB")
                                    .font(.system(size: 9))
                                    .foregroundStyle(G.grey)
                            }
                            VStack(alignment: .trailing, spacing: 2) {
                                Text(String(format: "%.1f", stat.AST))
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(G.white)
                                Text("AST")
                                    .font(.system(size: 9))
                                    .foregroundStyle(G.grey)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        EraBallDivider()
                    }
                }
            }
            .background(G.black)
            .navigationTitle("Season Stats")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("CLOSE") { dismiss() }.foregroundStyle(G.gold)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}
