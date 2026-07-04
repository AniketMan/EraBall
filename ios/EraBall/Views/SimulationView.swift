// SimulationView.swift — port of app/features/simulation/SimulationScreen.tsx
// Team rating table -> season ticker -> StatsTable + awards -> playoffs
// (spotlight + bracket + finals MVP) -> results (score + Game Center).
import SwiftUI

private let ROUND_NAMES = ["First Round", "Semifinals", "Conference Finals", "NBA Finals"]

struct SimulationView: View {
    @Environment(GameSession.self) private var session
    @State private var showLeaderboard = false
    @State private var statsCardPlayer: SeasonStatVM?
    @State private var boxScoreGame: PlayoffGameVM?

    private var season: SeasonResultVM? { session.season }
    private var wins: Int { session.seasonDone ? (season?.wins ?? 0) : session.winsSoFar }
    private var losses: Int { session.seasonDone ? (season?.losses ?? 0) : session.lossesSoFar }
    private var seasonGames: Int { session.seasonGameCount }

    var body: some View {
        VStack(spacing: 0) {
            topBar
            ScrollView {
                VStack(spacing: 16) {
                    ratingTable
                    if session.season == nil { simulateSeasonButton }
                    else {
                        seasonTicker
                        if session.seasonDone {
                            if let s = season, !s.seasonStats.isEmpty {
                                StatsTableView(stats: s.seasonStats, simEra: session.selectedEra ?? "20s",
                                               title: "Regular Season Stats",
                                               subtitle: "Era-adjusted, minutes-scaled averages across \(seasonGames) games",
                                               teamPPG: s.avgTeamScore, oppPPG: s.avgOppScore, opp: s.oppStats,
                                               onTapPlayer: { statsCardPlayer = $0 })
                                awardsPanel(s.awards)
                            }
                            playoffSection
                        }
                    }
                }
                .padding(.horizontal, 16).padding(.vertical, 16)
            }
        }
        .background(G.black)
        .sheet(item: $statsCardPlayer) { s in StatCardSheet(stat: s) }
        .sheet(item: $boxScoreGame) { g in BoxScoreSheet(game: g) }
        .sheet(isPresented: $showLeaderboard) { LeaderboardSheet() }
    }

    private var topBar: some View {
        HStack {
            Button { session.restart() } label: {
                Text("RESTART").font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
                    .padding(.horizontal, 12).padding(.vertical, 8).overlay(Rectangle().stroke(G.border, lineWidth: 1))
            }.buttonStyle(.plain)
            Spacer()
            if let c = session.coach {
                Text("\(eraDisplayLabel(session.selectedEra ?? "").uppercased()) · \(c.name)")
                    .font(.system(size: 11, weight: .semibold)).foregroundStyle(G.white).lineLimit(1)
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 10).overlay(alignment: .bottom) { EraBallDivider() }
    }

    // MARK: Team rating table

    private var ratingTable: some View {
        VStack(spacing: 0) {
            HStack {
                Text("TEAM RATING").font(.system(size: 12, weight: .semibold)).tracking(2).foregroundStyle(G.white)
                Spacer()
                if let r = session.teamRating, let dr = r.displayRating {
                    Text("\(dr)").font(Fonts.bebas(28)).foregroundStyle(G.gold)
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 10).overlay(alignment: .bottom) { EraBallDivider() }
            if let ratings = session.teamRating?.playerRatings {
                gridHeader(["PLAYER", "SLOT", "BASE", "ERA", "FIT", "RATING"], leadingFirst: true)
                ForEach(ratings) { r in
                    HStack(spacing: 0) {
                        Text(r.name).font(.system(size: 11, weight: .medium)).foregroundStyle(G.white).frame(maxWidth: .infinity, alignment: .leading).lineLimit(1)
                        cell(r.slot, G.grey); cell("\(Int(r.base.rounded()))", G.grey)
                        cell("\(Int((r.eraMod * 100).rounded()))%", r.eraMod >= 0.85 ? G.green : r.eraMod >= 0.70 ? Color(hex: "#facc15") : G.red)
                        cell(r.fitPenalty == 0 ? "—" : "-\(Int((r.fitPenalty * 100).rounded()))%", r.fitPenalty == 0 ? G.grey : G.red)
                        cell("\(Int(r.adjusted.rounded()))", G.gold, bold: true)
                    }
                    .padding(.horizontal, 14).padding(.vertical, 7).overlay(alignment: .bottom) { EraBallDivider().opacity(0.4) }
                }
            }
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private var simulateSeasonButton: some View {
        VStack(spacing: 12) {
            Text("\(seasonGames)-GAME SEASON + PLAYOFFS").font(.system(size: 10, weight: .semibold)).tracking(2).foregroundStyle(G.grey)
            Button("SIMULATE SEASON") { session.startSeason() }.buttonStyle(GoldButtonStyle())
        }.padding(.vertical, 24).frame(maxWidth: .infinity)
    }

    // MARK: Season ticker + record

    private var seasonTicker: some View {
        VStack(spacing: 0) {
            VStack(spacing: 8) {
                if !session.seasonDone {
                    Text("GAME \(session.revealedGames) OF \(seasonGames)").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
                } else {
                    Text("REGULAR SEASON").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
                }
                Text("\(wins)–\(losses)").font(Fonts.bebas(session.seasonDone ? 96 : 72))
                    .foregroundStyle(wins == seasonGames ? G.gold : wins == 0 ? G.red : G.white)
                if session.seasonDone {
                    if wins == seasonGames {
                        specialBanner("PERFECT SEASON", "\(seasonGames)–0 · The greatest team ever assembled", G.gold)
                    } else if wins == 0 {
                        specialBanner("WINLESS SEASON", "0–\(seasonGames) · Not a single win all season", G.red)
                    } else {
                        Text(verdict(wins)).font(.system(size: 11, weight: .semibold)).tracking(2).foregroundStyle(verdictColor(wins))
                        Text(String(format: "%.1f%% win rate", Double(wins) / Double(seasonGames) * 100)).font(.system(size: 11)).foregroundStyle(G.grey)
                    }
                }
            }
            .padding(.vertical, 24).frame(maxWidth: .infinity).overlay(alignment: .bottom) { EraBallDivider() }
            // Game dots grid
            FlexibleWrap((season?.games ?? []).indices.map { $0 }, spacing: 3) { i in
                let games = season?.games ?? []
                Rectangle().fill(i < session.revealedGames ? (games[i] ? G.gold : G.greyDark) : G.border).frame(width: 11, height: 11)
            }
            .padding(14)
            if !session.seasonDone { Button("SKIP") { session.skipSeasonReveal() }.buttonStyle(GhostButtonStyle()).padding(.bottom, 12) }
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private func specialBanner(_ title: String, _ sub: String, _ color: Color) -> some View {
        VStack(spacing: 6) {
            Text(title).font(Fonts.bebas(26)).tracking(6).foregroundStyle(color)
            Text(sub.uppercased()).font(.system(size: 9, weight: .semibold)).tracking(2).foregroundStyle(color.opacity(0.6)).multilineTextAlignment(.center)
        }
        .padding(.vertical, 14).padding(.horizontal, 24).frame(maxWidth: .infinity)
        .background(color.opacity(0.08)).overlay(Rectangle().stroke(color, lineWidth: wins == seasonGames ? 2 : 1)).padding(.horizontal, 24).padding(.top, 8)
    }

    private func awardsPanel(_ awards: [AwardVM]) -> some View {
        VStack(spacing: 0) {
            Text("SEASON AWARDS").font(.system(size: 12, weight: .semibold)).tracking(2).foregroundStyle(G.white)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 10).overlay(alignment: .bottom) { EraBallDivider() }
            if awards.isEmpty {
                Text("No major awards this season").font(.system(size: 11)).tracking(1).foregroundStyle(G.greyDark)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(14)
            } else {
                ForEach(awards) { a in
                    HStack {
                        Text(a.award.uppercased()).font(.system(size: 11, weight: .semibold)).tracking(1).foregroundStyle(a.gold ? G.gold : G.grey)
                        Spacer()
                        VStack(alignment: .trailing, spacing: 1) {
                            Text(a.player.name).font(.system(size: 12, weight: .medium)).foregroundStyle(a.gold ? G.gold : G.white)
                            Text(a.justification).font(.system(size: 10)).foregroundStyle(G.greyDark)
                        }
                    }.padding(.horizontal, 14).padding(.vertical, 9).overlay(alignment: .bottom) { EraBallDivider().opacity(0.4) }
                }
            }
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    // MARK: Playoffs

    @ViewBuilder private var playoffSection: some View {
        if season?.madePlayoffs == false {
            VStack(spacing: 6) {
                Text("MISSED PLAYOFFS").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.greyDark)
                Text("\(wins) wins, below the playoff threshold").font(.system(size: 13)).foregroundStyle(G.grey)
            }.padding(.vertical, 24).frame(maxWidth: .infinity).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
            Button("PLAY AGAIN") { session.restart() }.buttonStyle(GoldButtonStyle(fullWidth: true))
        } else if session.playoffs == nil {
            VStack(spacing: 10) {
                Text("FIRST ROUND · \(session.engineFirstRoundLabel.uppercased())   ·   OTHER ROUNDS · BEST OF 7")
                    .font(.system(size: 9, weight: .semibold)).tracking(1).foregroundStyle(G.grey).multilineTextAlignment(.center)
                Button("SIMULATE PLAYOFFS") { session.startPlayoffs() }.buttonStyle(GoldButtonStyle())
            }.padding(.vertical, 16).frame(maxWidth: .infinity)
        } else if let po = session.playoffs {
            if let g = session.currentPlayoffGame { gameSpotlight(g) }
            bracket(po)
            if session.playoffDone { resultsFooter(po) }
            else { Button("SKIP") { session.skipPlayoffs() }.buttonStyle(GhostButtonStyle()) }
        }
    }

    private func gameSpotlight(_ g: PlayoffGameVM) -> some View {
        let rec = session.currentSeriesRecord
        return VStack(spacing: 0) {
            HStack {
                Text(ROUND_NAMES[g.roundIndex].uppercased()).font(.system(size: 10, weight: .semibold)).tracking(2).foregroundStyle(G.grey)
                Spacer()
                Text("GAME \(g.gameInSeries)").font(Fonts.bebas(15)).tracking(1).foregroundStyle(G.goldDim)
            }.padding(.horizontal, 16).padding(.vertical, 10).overlay(alignment: .bottom) { EraBallDivider() }
            HStack(spacing: 30) {
                VStack(spacing: 4) {
                    Text("YOUR TEAM").font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
                    Text("\(Int(g.teamScore))").font(Fonts.bebas(80)).foregroundStyle(g.win ? G.gold : G.white)
                }
                Text("–").font(Fonts.bebas(24)).foregroundStyle(G.greyDark)
                VStack(spacing: 4) {
                    Text("OPPONENT").font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
                    Text("\(Int(g.oppScore))").font(Fonts.bebas(80)).foregroundStyle(g.win ? G.greyDark : G.red)
                }
            }.padding(.vertical, 24)
            if let l = g.leaders {
                HStack(spacing: 24) {
                    leaderPill("PTS", l.pts); leaderPill("REB", l.reb); leaderPill("AST", l.ast)
                }.padding(.bottom, 6).overlay(alignment: .top) { EraBallDivider() }.padding(.top, 8)
            }
            if let sp = g.special {
                Text("★ \(sp.playerName): \(sp.label)").font(.system(size: 11, weight: .medium)).tracking(1).foregroundStyle(G.gold).padding(.bottom, 6)
            }
            if g.playerLines != nil {
                Button("FULL BOX SCORE ↗") { boxScoreGame = g }.buttonStyle(.plain)
                    .font(.system(size: 9, weight: .semibold)).tracking(2).foregroundStyle(G.greyDark).padding(.bottom, 8)
            }
            HStack {
                Text(g.win ? "WIN" : "LOSS").font(Fonts.bebas(22)).tracking(1).foregroundStyle(g.win ? G.gold : G.red)
                Spacer()
                Text("SERIES \(rec.w)–\(rec.l)").font(.system(size: 10, weight: .semibold)).tracking(2)
                    .foregroundStyle(rec.w > rec.l ? G.gold : rec.w < rec.l ? G.red : G.grey)
            }.padding(.horizontal, 16).padding(.bottom, 14)
        }
        .background(G.surface).overlay(Rectangle().stroke(g.win ? G.gold : G.red, lineWidth: 1))
    }

    private func leaderPill(_ label: String, _ l: GameLeaderVM) -> some View {
        VStack(spacing: 2) {
            HStack(spacing: 4) { Text(l.name).font(.system(size: 11, weight: .semibold)).foregroundStyle(G.white); Text("\(Int(l.val))").font(.system(size: 11, weight: .bold)).foregroundStyle(G.gold) }
            Text(label).font(.system(size: 9)).tracking(1.5).foregroundStyle(G.greyDark)
        }
    }

    private func bracket(_ po: PlayoffResultVM) -> some View {
        VStack(spacing: 0) {
            Text("NBA PLAYOFFS").font(Fonts.bebas(18)).tracking(3).foregroundStyle(G.goldDim)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 8).overlay(alignment: .bottom) { EraBallDivider() }
            HStack(spacing: 4) {
                ForEach(po.rounds) { round in BracketCard(round: round) }
            }.padding(10)
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private func resultsFooter(_ po: PlayoffResultVM) -> some View {
        VStack(spacing: 14) {
            if po.champion {
                VStack(spacing: 6) {
                    Text("NBA CHAMPIONS").font(Fonts.bebas(44)).tracking(5).foregroundStyle(G.gold)
                    if let mvp = po.finalsMVP {
                        Text("FINALS MVP · \(mvp.name.uppercased())").font(.system(size: 11, weight: .bold)).tracking(1).foregroundStyle(G.gold)
                        Text("\(fmt(mvp.PTS)) PPG · \(fmt(mvp.REB)) RPG · \(fmt(mvp.AST)) APG").font(.system(size: 11)).foregroundStyle(G.grey)
                    }
                }.padding(.vertical, 20).frame(maxWidth: .infinity).background(G.gold.opacity(0.06)).overlay(Rectangle().stroke(G.gold, lineWidth: 1))
            }
            if !po.playoffStats.isEmpty {
                StatsTableView(stats: po.playoffStats, simEra: session.selectedEra ?? "20s",
                               title: "Playoff Stats", subtitle: "Per-game averages across the playoff run",
                               teamPPG: nil, oppPPG: nil, opp: po.oppStats, onTapPlayer: { statsCardPlayer = $0 })
            }
            if let score = session.finish?.score {
                VStack(spacing: 4) {
                    Text("LEADERBOARD SCORE").font(.system(size: 10, weight: .semibold)).tracking(3).foregroundStyle(G.grey)
                    Text("\(score)").font(Fonts.bebas(48)).foregroundStyle(G.gold)
                    if let alias = GameCenterManager.shared.playerAlias {
                        Label("Submitted to Game Center as \(alias)", systemImage: "checkmark.seal.fill").font(.caption2).foregroundStyle(G.greyDark)
                    } else {
                        Text("Sign in to Game Center to post this score").font(.caption2).foregroundStyle(G.greyDark)
                    }
                }.frame(maxWidth: .infinity).padding(.vertical, 16).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
            }
            Button("VIEW LEADERBOARD") { showLeaderboard = true }.buttonStyle(OutlineButtonStyle(fullWidth: true))
            Button("PLAY AGAIN") { session.restart() }.buttonStyle(GoldButtonStyle(fullWidth: true))
        }
    }

    // MARK: helpers

    private func gridHeader(_ cols: [String], leadingFirst: Bool) -> some View {
        HStack(spacing: 0) {
            ForEach(Array(cols.enumerated()), id: \.offset) { i, c in
                Text(c).font(.system(size: 8, weight: .semibold)).tracking(1).foregroundStyle(G.grey)
                    .frame(maxWidth: .infinity, alignment: leadingFirst && i == 0 ? .leading : .trailing)
            }
        }.padding(.horizontal, 14).padding(.vertical, 6).overlay(alignment: .bottom) { EraBallDivider() }
    }
    private func cell(_ s: String, _ color: Color, bold: Bool = false) -> some View {
        Text(s).font(.system(size: 11, weight: bold ? .bold : .regular)).foregroundStyle(color).frame(maxWidth: .infinity, alignment: .trailing)
    }
    private func verdict(_ w: Int) -> String {
        switch w { case 70...: return "ALL-TIME GREAT"; case 60...: return "DOMINANT"; case 50...: return "PLAYOFF CONTENDER"; case 41...: return "ABOVE .500"; case 30...: return "BELOW .500"; default: return "LOTTERY TEAM" }
    }
    private func verdictColor(_ w: Int) -> Color { switch w { case 60...: return G.gold; case 50...: return G.green; case 41...: return G.greyDark; default: return G.grey } }
    private func bracketLabel(_ n: String) -> String { n == "Conference Finals" ? "CONF FINALS" : n == "NBA Finals" ? "FINALS" : n.uppercased() }
    private func fmt(_ v: Double) -> String { String(format: "%.1f", v) }
}

private extension GameSession {
    var engineFirstRoundLabel: String { EngineBridge.shared.firstRoundLabel(era: selectedEra ?? "20s") }
}

private struct BracketCard: View {
    let round: PlayoffRoundVM
    private var reached: Bool { round.seriesWins + round.seriesLosses > 0 }
    private var complete: Bool { round.seriesWins >= round.winsNeeded || round.seriesLosses >= round.winsNeeded }
    private var accent: Color { round.advanced ? G.gold : complete ? G.red : (reached ? G.grey : G.border) }
    private func label(_ n: String) -> String { n == "Conference Finals" ? "CONF FINALS" : n == "NBA Finals" ? "FINALS" : n.uppercased() }
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label(round.name)).font(.system(size: 7, weight: .bold)).tracking(1).foregroundStyle(reached ? G.grey : G.border).lineLimit(1)
            row("YOU", round.seriesWins, reached ? G.white : G.border, round.advanced ? G.gold : G.white)
            row("OPP", round.seriesLosses, reached ? G.grey : G.border, !round.advanced && complete ? G.red : G.grey)
        }
        .padding(6).frame(maxWidth: .infinity).frame(minHeight: 52).background(G.black)
        .overlay(alignment: .leading) { Rectangle().fill(accent).frame(width: 3) }
        .overlay(Rectangle().stroke(G.border, lineWidth: 0.5))
        .opacity(reached ? 1 : 0.3)
    }
    private func row(_ label: String, _ val: Int, _ labelColor: Color, _ valColor: Color) -> some View {
        HStack { Text(label).font(.system(size: 8, weight: .bold)).foregroundStyle(labelColor); Spacer(); Text("\(val)").font(.system(size: 10, weight: .bold)).foregroundStyle(valColor) }
    }
}

// MARK: - Full stats table (port of StatsTable)

struct StatsTableView: View {
    let stats: [SeasonStatVM]
    let simEra: String
    let title: String
    let subtitle: String
    let teamPPG: Double?
    let oppPPG: Double?
    let opp: OppStatsVM?
    let onTapPlayer: (SeasonStatVM) -> Void

    private let cols = ["PLAYER", "SLOT", "MPG", "PPG", "RPG", "APG", "SPG", "BPG", "TOV", "FG%", "3P%", "FT%"]

    var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title.uppercased()).font(.system(size: 12, weight: .semibold)).tracking(2).foregroundStyle(G.white)
                Text(subtitle).font(.system(size: 10)).foregroundStyle(G.greyDark)
            }.frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 10).overlay(alignment: .bottom) { EraBallDivider() }

            ScrollView(.horizontal, showsIndicators: true) {
                VStack(spacing: 0) {
                    HStack(spacing: 0) {
                        ForEach(Array(cols.enumerated()), id: \.offset) { i, c in
                            Text(c).font(.system(size: 8, weight: .semibold)).tracking(0.8).foregroundStyle(G.grey)
                                .frame(width: colWidth(i), alignment: i == 0 ? .leading : .trailing)
                        }
                    }.padding(.horizontal, 12).padding(.vertical, 6).overlay(alignment: .bottom) { EraBallDivider() }
                    ForEach(stats) { s in
                        row(s)
                    }
                    teamRow
                    if let opp, let oppPPG { oppRow(opp, oppPPG) }
                }
            }
        }
        .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private func colWidth(_ i: Int) -> CGFloat { i == 0 ? 120 : i == 1 ? 40 : 46 }

    private var maxes: (pts: Double, reb: Double, ast: Double, stl: Double, blk: Double, fg: Double, fg3: Double, ft: Double) {
        (stats.map(\.PTS).max() ?? 0, stats.map(\.REB).max() ?? 0, stats.map(\.AST).max() ?? 0,
         stats.map(\.STL).max() ?? 0, stats.map(\.BLK).max() ?? 0, stats.map(\.FG_PCT).max() ?? 0,
         stats.compactMap(\.FG3_PCT).max() ?? 0, stats.map(\.FT_PCT).max() ?? 0)
    }

    private func row(_ s: SeasonStatVM) -> some View {
        let m = maxes
        func gl(_ v: Double, _ mx: Double) -> Color { v == mx ? G.gold : G.grey }
        return HStack(spacing: 0) {
            Button { onTapPlayer(s) } label: {
                Text(s.name).font(.system(size: 11, weight: .medium)).foregroundStyle(s.isBench ? G.grey : G.white).lineLimit(1)
                    .frame(width: colWidth(0), alignment: .leading)
            }.buttonStyle(.plain)
            c(s.slot, G.greyDark, 1); c(String(format: "%.0f", s.MPG), G.greyDark, 2)
            c(String(format: "%.1f", s.PTS), gl(s.PTS, m.pts), 3, bold: true)
            c(String(format: "%.1f", s.REB), gl(s.REB, m.reb), 4); c(String(format: "%.1f", s.AST), gl(s.AST, m.ast), 5)
            c(String(format: "%.1f", s.STL), gl(s.STL, m.stl), 6); c(String(format: "%.1f", s.BLK), gl(s.BLK, m.blk), 7)
            c(String(format: "%.1f", s.TOV), G.grey, 8)
            c(String(format: "%.1f", s.FG_PCT * 100), gl(s.FG_PCT, m.fg), 9)
            c(s.FG3_PCT != nil ? String(format: "%.1f", s.FG3_PCT! * 100) : "—", s.FG3_PCT.map { gl($0, m.fg3) } ?? G.grey, 10)
            c(String(format: "%.1f", s.FT_PCT * 100), gl(s.FT_PCT, m.ft), 11)
        }.padding(.horizontal, 12).padding(.vertical, 7).overlay(alignment: .bottom) { EraBallDivider().opacity(0.4) }
    }

    private var teamRow: some View {
        func sum(_ f: (SeasonStatVM) -> Double) -> Double { stats.reduce(0) { $0 + f($1) } }
        return HStack(spacing: 0) {
            Text("TEAM").font(.system(size: 10, weight: .bold)).tracking(1).foregroundStyle(G.gold).frame(width: colWidth(0), alignment: .leading)
            c("", G.grey, 1); c("", G.grey, 2)
            c(String(format: "%.1f", teamPPG ?? sum { $0.PTS }), G.gold, 3, bold: true)
            c(String(format: "%.1f", sum { $0.REB }), G.white, 4); c(String(format: "%.1f", sum { $0.AST }), G.white, 5)
            c(String(format: "%.1f", sum { $0.STL }), G.grey, 6); c(String(format: "%.1f", sum { $0.BLK }), G.grey, 7)
            c(String(format: "%.1f", sum { $0.TOV }), G.grey, 8); c("", G.grey, 9); c("", G.grey, 10); c("", G.grey, 11)
        }.padding(.horizontal, 12).padding(.vertical, 7).background(Color(hex: "#1a1a1a")).overlay(alignment: .top) { Rectangle().fill(G.gold.opacity(0.35)).frame(height: 1) }
    }

    private func oppRow(_ o: OppStatsVM, _ ppg: Double) -> some View {
        HStack(spacing: 0) {
            Text("OPP").font(.system(size: 10, weight: .bold)).tracking(1).foregroundStyle(G.greyDark).frame(width: colWidth(0), alignment: .leading)
            c("", G.grey, 1); c("", G.grey, 2)
            c(String(format: "%.1f", ppg), G.greyDark, 3)
            c(String(format: "%.1f", o.REB), G.greyDark, 4); c(String(format: "%.1f", o.AST), G.greyDark, 5)
            c(o.STL.map { String(format: "%.1f", $0) } ?? "—", G.greyDark, 6); c(o.BLK.map { String(format: "%.1f", $0) } ?? "—", G.greyDark, 7)
            c(String(format: "%.1f", o.TOV), G.greyDark, 8)
            c(String(format: "%.1f", o.FG_PCT * 100), G.greyDark, 9)
            c(o.FG3_PCT.map { String(format: "%.1f", $0 * 100) } ?? "—", G.greyDark, 10)
            c(String(format: "%.1f", o.FT_PCT * 100), G.greyDark, 11)
        }.padding(.horizontal, 12).padding(.vertical, 7).background(Color(hex: "#0f0f0f"))
    }

    private func c(_ s: String, _ color: Color, _ i: Int, bold: Bool = false) -> some View {
        Text(s).font(.system(size: 11, weight: bold ? .bold : .regular)).foregroundStyle(color).frame(width: colWidth(i), alignment: .trailing)
    }
}

// MARK: - Stat -> player card sheet

struct StatCardSheet: View {
    @Environment(\.dismiss) private var dismiss
    let stat: SeasonStatVM
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    HStack(spacing: 12) {
                        PlayerHeadshotView(personId: stat.personId, initial: stat.name, size: 64)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(stat.name).font(Fonts.bebas(24)).foregroundStyle(G.white)
                            Text(stat.slot).font(.system(size: 11)).foregroundStyle(G.grey)
                        }
                        Spacer()
                    }
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                        statBox("PPG", stat.PTS); statBox("RPG", stat.REB); statBox("APG", stat.AST)
                        statBox("SPG", stat.STL); statBox("BPG", stat.BLK); statBox("TOV", stat.TOV)
                        statBox("FG%", stat.FG_PCT * 100); statBox("3P%", (stat.FG3_PCT ?? 0) * 100); statBox("FT%", stat.FT_PCT * 100)
                    }
                }.padding(16)
            }
            .background(G.black).navigationTitle(stat.name).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }.preferredColorScheme(.dark).presentationDetents([.medium])
    }
    private func statBox(_ l: String, _ v: Double) -> some View {
        VStack(spacing: 3) { Text(String(format: "%.1f", v)).font(Fonts.bebas(24)).foregroundStyle(G.white); Text(l).font(.system(size: 9, weight: .semibold)).foregroundStyle(G.grey) }
            .frame(maxWidth: .infinity).padding(.vertical, 10).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }
}

// MARK: - Playoff box score sheet

struct BoxScoreSheet: View {
    @Environment(\.dismiss) private var dismiss
    let game: PlayoffGameVM
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    HStack { Text("YOUR TEAM \(Int(game.teamScore))").foregroundStyle(game.win ? G.gold : G.white); Spacer(); Text("OPP \(Int(game.oppScore))").foregroundStyle(game.win ? G.grey : G.red) }
                        .font(Fonts.bebas(20)).padding(16).overlay(alignment: .bottom) { EraBallDivider() }
                    ForEach(game.playerLines ?? []) { l in
                        HStack {
                            Text(l.name).font(.system(size: 12, weight: .medium)).foregroundStyle(G.white).frame(maxWidth: .infinity, alignment: .leading).lineLimit(1)
                            Text("\(Int(l.pts))/\(Int(l.reb))/\(Int(l.ast))").font(.system(size: 12, weight: .bold)).foregroundStyle(G.gold)
                        }.padding(.horizontal, 16).padding(.vertical, 8).overlay(alignment: .bottom) { EraBallDivider().opacity(0.4) }
                    }
                }
            }
            .background(G.black).navigationTitle("Box Score").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }.preferredColorScheme(.dark)
    }
}
