// SimulationView.swift — port of app/features/simulation/SimulationScreen.tsx
import SwiftUI

struct SimulationView: View {
    @Environment(GameSession.self) private var session
    @State private var showStats = false
    @State private var showLeaderboard = false

    private var season: SeasonResultVM? { session.season }
    private var wins: Int { session.seasonDone ? (season?.wins ?? 0) : session.winsSoFar }
    private var losses: Int { session.seasonDone ? (season?.losses ?? 0) : session.lossesSoFar }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button { session.restart() } label: {
                    Text("RESTART").font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
                        .padding(.horizontal, 12).padding(.vertical, 8).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                }.buttonStyle(.plain)
                Spacer()
                if let c = session.coach {
                    HStack(spacing: 6) {
                        Text(c.name).font(.system(size: 12, weight: .semibold)).foregroundStyle(G.white)
                        Text(c.overallGrade).font(.system(size: 12, weight: .black)).foregroundStyle(coachGradeColor(c.overallGrade))
                    }
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 10)
            EraBallDivider()

            ScrollView {
                VStack(spacing: 0) {
                    teamHeader
                    EraBallDivider()
                    if session.season == nil { idleSection }
                    else if !session.seasonDone { simulatingSection }
                    else if session.playoffs == nil { seasonResultSection }
                    else { playoffSection }
                }
            }
        }
        .background(G.black)
        .sheet(isPresented: $showStats) { if let s = season { SeasonStatsSheet(stats: s.seasonStats, wins: wins, losses: losses) } }
        .sheet(isPresented: $showLeaderboard) { LeaderboardSheet() }
    }

    private var teamHeader: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(eraDisplayLabel(session.selectedEra ?? "").uppercased()) ERA").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
                    Text("YOUR TEAM").font(Fonts.bebas(32)).tracking(6).foregroundStyle(G.white)
                }
                Spacer()
            }
            .padding(.horizontal, 16).padding(.top, 16)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach((session.gameState?.slots ?? []).filter { $0.player != nil && !$0.isBench }) { slot in
                        if let p = slot.player {
                            VStack(spacing: 4) {
                                PlayerHeadshotView(personId: p.personId, initial: p.fullName, size: 48)
                                Text(p.fullName.split(separator: " ").last.map(String.init) ?? "").font(.system(size: 9)).foregroundStyle(G.grey).lineLimit(1)
                                Text(slot.position).font(.system(size: 8, weight: .semibold)).tracking(1).foregroundStyle(G.gold)
                            }.frame(width: 60)
                        }
                    }
                }.padding(.horizontal, 16)
            }.padding(.bottom, 16)
        }
    }

    private var idleSection: some View {
        VStack(spacing: 20) {
            Text("READY TO SIMULATE").font(Fonts.bebas(32)).tracking(6).foregroundStyle(G.white)
            Text("\(session.seasonGameCount)-game season + playoffs").font(.system(size: 14)).foregroundStyle(G.grey)
            if let r = session.teamRating, let dr = r.displayRating {
                Text("TEAM RATING \(dr)").font(.system(size: 12, weight: .bold)).tracking(2).foregroundStyle(G.gold)
            }
            Button("SIMULATE SEASON") { session.startSeason() }.buttonStyle(GoldButtonStyle())
        }.padding(.vertical, 48).frame(maxWidth: .infinity)
    }

    private var simulatingSection: some View {
        VStack(spacing: 16) {
            HStack(spacing: 0) {
                Text("\(wins)").font(Fonts.bebas(64)).foregroundStyle(wins >= 41 ? G.gold : G.white)
                Text("-").font(Fonts.bebas(44)).foregroundStyle(G.grey).padding(.horizontal, 8)
                Text("\(losses)").font(Fonts.bebas(64)).foregroundStyle(G.white)
            }
            gameLog(games: Array((season?.games ?? []).prefix(session.revealedGames)))
            Button("SKIP") { session.skipSeasonReveal() }.buttonStyle(GhostButtonStyle())
        }.padding(.vertical, 32).frame(maxWidth: .infinity)
    }

    private var seasonResultSection: some View {
        VStack(spacing: 0) {
            VStack(spacing: 8) {
                Text("SEASON RECORD").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
                HStack(spacing: 0) {
                    Text("\(wins)").font(Fonts.bebas(72)).foregroundStyle(wins >= 50 ? G.gold : G.white)
                    Text("-").font(Fonts.bebas(48)).foregroundStyle(G.grey).padding(.horizontal, 8)
                    Text("\(losses)").font(Fonts.bebas(72)).foregroundStyle(G.white)
                }
                Text(seasonLabel(wins)).font(.system(size: 12, weight: .semibold)).tracking(2).foregroundStyle(seasonLabelColor(wins))
            }.padding(.vertical, 32).padding(.horizontal, 16)
            EraBallDivider()
            if let games = season?.games { gameLog(games: games); EraBallDivider() }
            if let awards = season?.awards, !awards.isEmpty { awardsPanel(awards); EraBallDivider() }
            HStack(spacing: 12) {
                Button("VIEW STATS") { showStats = true }.buttonStyle(GhostButtonStyle(fullWidth: true))
                if season?.madePlayoffs == true {
                    Button("SIMULATE PLAYOFFS") { session.startPlayoffs() }.buttonStyle(GoldButtonStyle(fullWidth: true))
                } else {
                    Button("PLAY AGAIN") { session.restart() }.buttonStyle(GoldButtonStyle(fullWidth: true))
                }
            }.padding(.horizontal, 16).padding(.vertical, 20)
        }
    }

    private var playoffSection: some View {
        VStack(spacing: 0) {
            if let po = session.playoffs {
                if session.playoffDone && po.champion {
                    VStack(spacing: 8) {
                        Text("NBA CHAMPIONS").font(Fonts.bebas(46)).tracking(6).foregroundStyle(G.gold)
                        if let mvp = po.finalsMVP {
                            Text("FINALS MVP · \(mvp.name.uppercased())").font(.system(size: 11, weight: .bold)).tracking(1.5).foregroundStyle(G.gold)
                            Text("\(fmt(mvp.PTS)) PPG · \(fmt(mvp.REB)) RPG · \(fmt(mvp.AST)) APG").font(.system(size: 11)).foregroundStyle(G.grey)
                        }
                    }.frame(maxWidth: .infinity).padding(.vertical, 32).background(G.gold.opacity(0.05))
                    EraBallDivider()
                }
                ForEach(revealedRounds(po)) { round in
                    PlayoffRoundRow(round: round); EraBallDivider()
                }
                if session.playoffDone {
                    if let score = session.finish?.score {
                        VStack(spacing: 4) {
                            Text("LEADERBOARD SCORE").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
                            Text("\(score)").font(Fonts.bebas(48)).foregroundStyle(G.gold)
                        }.frame(maxWidth: .infinity).padding(.vertical, 20)
                        EraBallDivider()
                    }
                    VStack(spacing: 12) {
                        Button("VIEW LEADERBOARD") { showLeaderboard = true }.buttonStyle(OutlineButtonStyle(fullWidth: true))
                        Button("PLAY AGAIN") { session.restart() }.buttonStyle(GoldButtonStyle(fullWidth: true))
                    }.padding(.horizontal, 16).padding(.vertical, 20)
                } else {
                    Button("SKIP") { session.skipPlayoffs() }.buttonStyle(GhostButtonStyle()).padding(.vertical, 16)
                }
            }
        }
    }

    private func revealedRounds(_ po: PlayoffResultVM) -> [PlayoffRoundVM] {
        if session.playoffDone { return po.rounds }
        // Reveal rounds progressively as games tick in.
        let revealedGames = po.allGames.prefix(session.playoffRevealIndex)
        let maxRound = revealedGames.map(\.roundIndex).max() ?? 0
        return po.rounds.enumerated().filter { $0.offset <= maxRound }.map(\.element)
    }

    private func gameLog(games: [Bool]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("GAME LOG").font(.system(size: 9, weight: .semibold)).tracking(3).foregroundStyle(G.grey).padding(.horizontal, 16)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 2) { ForEach(Array(games.enumerated()), id: \.offset) { _, win in Rectangle().fill(win ? G.green : G.red).frame(width: 6, height: 20) } }
                    .padding(.horizontal, 16)
            }
        }.padding(.vertical, 12)
    }

    private func awardsPanel(_ awards: [AwardVM]) -> some View {
        VStack(spacing: 0) {
            Text("SEASON AWARDS").font(.system(size: 13, weight: .semibold)).tracking(2).foregroundStyle(G.white)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 16).padding(.vertical, 12).overlay(alignment: .bottom) { EraBallDivider() }
            ForEach(awards) { a in
                HStack {
                    Text(a.award.uppercased()).font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(a.gold ? G.gold : G.grey)
                    Spacer()
                    VStack(alignment: .trailing, spacing: 1) {
                        Text(a.player.name).font(.system(size: 12, weight: .medium)).foregroundStyle(a.gold ? G.gold : G.white)
                        Text(a.justification).font(.system(size: 10)).foregroundStyle(G.greyDark)
                    }
                }.padding(.horizontal, 16).padding(.vertical, 10).overlay(alignment: .bottom) { EraBallDivider().opacity(0.4) }
            }
        }.background(G.surface)
    }

    private func seasonLabel(_ w: Int) -> String {
        switch w { case 70...: return "ALL-TIME GREAT"; case 60...: return "DOMINANT"; case 50...: return "PLAYOFF CONTENDER"; case 41...: return "ABOVE .500"; case 30...: return "BELOW .500"; default: return "LOTTERY TEAM" }
    }
    private func seasonLabelColor(_ w: Int) -> Color {
        switch w { case 60...: return G.gold; case 50...: return G.green; case 41...: return G.greyDark; default: return G.grey }
    }
    private func fmt(_ v: Double) -> String { String(format: "%.1f", v) }
}

struct PlayoffRoundRow: View {
    let round: PlayoffRoundVM
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(round.name).font(.system(size: 11, weight: .semibold)).tracking(2).foregroundStyle(G.greyDark)
                Text("\(round.seriesWins)-\(round.seriesLosses)").font(Fonts.bebas(22)).foregroundStyle(round.advanced ? G.green : G.red)
            }
            Spacer()
            Text(round.advanced ? "ADVANCED" : "ELIMINATED").font(.system(size: 10, weight: .semibold)).tracking(2)
                .foregroundStyle(round.advanced ? G.green : G.red)
                .padding(.horizontal, 8).padding(.vertical, 4).overlay(Rectangle().stroke((round.advanced ? G.green : G.red).opacity(0.3), lineWidth: 1))
        }.padding(.horizontal, 16).padding(.vertical, 12)
    }
}

struct SeasonStatsSheet: View {
    let stats: [SeasonStatVM]
    let wins: Int
    let losses: Int
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    ForEach(stats) { s in
                        HStack(spacing: 12) {
                            PlayerHeadshotView(personId: s.personId, initial: s.name, size: 40)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(s.name).font(.system(size: 13, weight: .semibold)).foregroundStyle(G.white).lineLimit(1)
                                Text(s.slot).font(.system(size: 10)).foregroundStyle(G.grey)
                            }
                            Spacer()
                            stat("PTS", s.PTS); stat("REB", s.REB); stat("AST", s.AST)
                        }.padding(.horizontal, 16).padding(.vertical, 10)
                        EraBallDivider()
                    }
                }
            }
            .background(G.black)
            .navigationTitle("Season Stats · \(wins)-\(losses)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }
        .preferredColorScheme(.dark)
    }
    private func stat(_ label: String, _ v: Double) -> some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text(String(format: "%.1f", v)).font(.system(size: 14, weight: .bold)).foregroundStyle(G.white)
            Text(label).font(.system(size: 9)).foregroundStyle(G.grey)
        }
    }
}
