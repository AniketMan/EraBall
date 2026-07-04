// LifetimeStatsView.swift — port of app/LifetimeStatsModal.tsx
import SwiftUI

struct LifetimeStatsView: View {
    var embedded = false
    @Environment(\.dismiss) private var dismiss
    @State private var mode = "normal"
    @State private var stats: LifetimeStatsVM?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    Picker("Mode", selection: $mode) {
                        Text("Normal").tag("normal"); Text("Salary Cap").tag("salary_cap")
                    }.pickerStyle(.segmented).padding(.horizontal, 16).padding(.top, 12)

                    if let s = stats {
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                            statBox("DRAFTS", "\(s.draftsCompleted)")
                            statBox("CHAMPIONSHIPS", "\(s.championshipsTotal)", gold: true)
                            statBox("TOTAL WINS", "\(s.totalWins)")
                            statBox("TOTAL LOSSES", "\(s.totalLosses)")
                            if let b = s.bestRecord { statBox("BEST RECORD", "\(b.wins)-\(b.losses)", sub: eraDisplayLabel(b.era)) }
                            if let h = s.highestTeamRating { statBox("HIGHEST RATING", "\(Int(h.rating))", sub: eraDisplayLabel(h.era)) }
                        }.padding(.horizontal, 16)

                        if !recordRows(s).isEmpty {
                            VStack(alignment: .leading, spacing: 6) {
                                SectionHeader(title: "Record by Era")
                                ForEach(recordRows(s), id: \.0) { era, rec in
                                    HStack {
                                        Text(eraDisplayLabel(era)).font(.system(size: 13, weight: .semibold)).foregroundStyle(G.white).frame(width: 60, alignment: .leading)
                                        Text("\(rec.wins)–\(rec.losses)").font(.system(size: 13)).foregroundStyle(G.grey)
                                        Spacer()
                                        if (s.championshipsByEra[era] ?? 0) > 0 { Text("\(s.championshipsByEra[era]!)× 🏆").font(.system(size: 12)).foregroundStyle(G.gold) }
                                    }.padding(.horizontal, 14).padding(.vertical, 7).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                                }
                            }.padding(.horizontal, 16)
                        }

                        if !topPlayers(s).isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                SectionHeader(title: "Most Drafted")
                                ForEach(topPlayers(s), id: \.name) { p in
                                    HStack { Text(p.name).font(.system(size: 13)).foregroundStyle(G.white); Spacer(); Text("\(p.count)×").font(.system(size: 13, weight: .bold)).foregroundStyle(G.gold) }
                                        .padding(.horizontal, 14).padding(.vertical, 8).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                                }
                            }.padding(.horizontal, 16)
                        }

                        if !topCoaches(s).isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                SectionHeader(title: "Most Drafted Coaches")
                                ForEach(topCoaches(s), id: \.name) { c in
                                    HStack { Text(c.name.replacingOccurrences(of: "*", with: "")).font(.system(size: 13)).foregroundStyle(G.white); Spacer(); Text("\(c.count)×").font(.system(size: 13, weight: .bold)).foregroundStyle(G.gold) }
                                        .padding(.horizontal, 14).padding(.vertical, 8).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                                }
                            }.padding(.horizontal, 16)
                        }
                    } else {
                        Text("No runs recorded yet.").font(.footnote).foregroundStyle(G.grey).padding(.top, 40)
                    }
                }.padding(.bottom, 24)
            }
            .background(G.black).navigationTitle("LIFETIME STATS").navigationBarTitleDisplayMode(.inline)
            .toolbar { if !embedded { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } } }
        }
        .preferredColorScheme(.dark)
        .onChange(of: mode, initial: true) { _, m in stats = EngineBridge.shared.lifetimeStats(mode: m) }
    }

    private func topPlayers(_ s: LifetimeStatsVM) -> [CountEntryVM] {
        s.playerDraftCounts.values.sorted { $0.count > $1.count }.prefix(5).map { $0 }
    }
    private func topCoaches(_ s: LifetimeStatsVM) -> [CountEntryVM] {
        s.coachDraftCounts.values.sorted { $0.count > $1.count }.prefix(5).map { $0 }
    }
    private func recordRows(_ s: LifetimeStatsVM) -> [(String, EraRecordVM)] {
        ALL_ERAS.compactMap { era in s.recordByEra[era].map { (era, $0) } }
    }
    private func statBox(_ label: String, _ value: String, sub: String? = nil, gold: Bool = false) -> some View {
        VStack(spacing: 4) {
            Text(value).font(Fonts.bebas(36)).foregroundStyle(gold ? G.gold : G.white)
            Text(label).font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
            if let sub { Text(sub).font(.system(size: 9)).foregroundStyle(G.greyDark) }
        }.frame(maxWidth: .infinity).padding(.vertical, 16).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }
}
