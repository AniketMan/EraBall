// LifetimeStatsView.swift
// Matches LifetimeStatsModal.tsx exactly.

import SwiftUI

struct LifetimeStatsView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var mode: StatMode = .normal

    enum StatMode: String, CaseIterable {
        case normal = "Normal"
        case salaryCap = "Salary Cap"
    }

    private var stats: StatsData {
        mode == .normal ? appState.lifetimeStats.normal : appState.lifetimeStats.salaryCap
    }

    private var winPct: Double {
        let total = stats.totalWins + stats.totalLosses
        return total > 0 ? Double(stats.totalWins) / Double(total) : 0
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Mode picker
                    Picker("Mode", selection: $mode) {
                        ForEach(StatMode.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 16)

                    EraBallDivider()

                    // Summary stats
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 1) {
                        statBox("GAMES PLAYED", value: "\(stats.totalGames)")
                        statBox("WIN %", value: String(format: "%.1f%%", winPct * 100))
                        statBox("TOTAL WINS", value: "\(stats.totalWins)")
                        statBox("CHAMPIONSHIPS", value: "\(stats.totalChampionships)")
                    }
                    .background(G.border)
                    .padding(.vertical, 1)

                    EraBallDivider()

                    // Wins by era
                    if !stats.winsByEra.isEmpty {
                        VStack(spacing: 0) {
                            Text("WINS BY ERA")
                                .font(.system(size: 10, weight: .semibold))
                                .tracking(3)
                                .foregroundStyle(G.grey)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)

                            EraBallDivider()

                            ForEach(["50s","60s","70s","80s","90s","00s","10s","20s"], id: \.self) { era in
                                let w = stats.winsByEra[era] ?? 0
                                let l = stats.lossesByEra[era] ?? 0
                                if w + l > 0 {
                                    HStack {
                                        Text(eraDisplayLabel(era))
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundStyle(G.white)
                                        Spacer()
                                        Text("\(w)-\(l)")
                                            .font(Fonts.bebas(20))
                                            .tracking(2)
                                            .foregroundStyle(G.gold)
                                    }
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    EraBallDivider()
                                }
                            }
                        }
                    }
                }
            }
            .background(G.black)
            .navigationTitle("MY STATS")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("CLOSE") { dismiss() }.foregroundStyle(G.gold)
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    private func statBox(_ label: String, value: String) -> some View {
        VStack(spacing: 6) {
            Text(value)
                .font(Fonts.bebas(36))
                .tracking(3)
                .foregroundStyle(G.gold)
            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .tracking(2)
                .foregroundStyle(G.grey)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(G.surface)
    }
}
