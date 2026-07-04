// CoachDraftView.swift
// Matches CoachDraftScreen.tsx exactly.

import SwiftUI

struct CoachDraftView: View {
    let slots: [CourtSlot]
    let era: String
    let salaryCapMode: Bool

    @Environment(AppState.self) private var appState
    @State private var selectedCoach: Coach? = nil
    @State private var searchText = ""

    private var filteredCoaches: [Coach] {
        let all = Engine.shared.allCoaches
        if searchText.isEmpty { return all }
        return all.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        VStack(spacing: 0) {
            TopBar(onTitleTap: { appState.restart() }) {
                Button("BACK") { appState.startDraft(era: era, salaryCapMode: salaryCapMode) }
                    .buttonStyle(GhostButtonStyle())
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(1.5)
            }

            EraBallDivider()

            // Header
            VStack(spacing: 8) {
                Text("DRAFT A COACH")
                    .font(Fonts.bebas(42))
                    .tracking(8)
                    .foregroundStyle(G.white)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
                Text("Select a head coach for your team")
                    .font(.system(size: 14))
                    .foregroundStyle(G.grey)
            }
            .padding(.vertical, 24)
            .padding(.horizontal, 16)

            EraBallDivider()

            // Search
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(G.grey)
                TextField("Search coaches...", text: $searchText)
                    .font(.system(size: 14))
                    .foregroundStyle(G.white)
                    .tint(G.gold)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(G.surface)

            EraBallDivider()

            // Coach list
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(filteredCoaches) { coach in
                        CoachRow(coach: coach, isSelected: selectedCoach?.id == coach.id) {
                            selectedCoach = coach
                        }
                        EraBallDivider()
                    }
                }
            }

            // Bottom action
            if let coach = selectedCoach {
                EraBallDivider()
                VStack(spacing: 12) {
                    HStack {
                        Text(coach.name)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(G.white)
                        Spacer()
                        Text("\(coach.champ) RINGS")
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(G.gold)
                    }
                    Button("START SIMULATION") {
                        appState.startSimulation(slots: slots, coach: coach, era: era, salaryCapMode: salaryCapMode)
                    }
                    .buttonStyle(GoldButtonStyle(fullWidth: true))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
                .background(G.surface)
            }
        }
        .background(G.black)
        .ignoresSafeArea(edges: .bottom)
    }
}

// MARK: - Coach Row

struct CoachRow: View {
    let coach: Coach
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Grade badge
            VStack(spacing: 2) {
                gradeBox(coach.overallGrade)
            }
            .frame(width: 36)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(coach.name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(G.white)
                        .lineLimit(1)
                    if coach.isHOF == true {
                        Text("HOF")
                            .font(.system(size: 9, weight: .bold))
                            .tracking(1)
                            .foregroundStyle(G.gold)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(G.gold.opacity(0.1))
                            .overlay(Rectangle().stroke(G.gold.opacity(0.3), lineWidth: 1))
                    }
                }
                HStack(spacing: 12) {
                    Text("\(coach.from)–\(coach.to)")
                        .font(.system(size: 11))
                        .foregroundStyle(G.grey)
                    Text(String(format: "%.0f%%", coach.regWLPct * 100))
                        .font(.system(size: 11))
                        .foregroundStyle(G.greyDark)
                    if coach.champ > 0 {
                        Text("\(coach.champ)x CHAMP")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(G.gold)
                    }
                }
            }

            Spacer()

            HStack(spacing: 8) {
                VStack(spacing: 1) {
                    Text("OFF").font(.system(size: 8)).foregroundStyle(G.grey)
                    Text(coach.offGrade).font(.system(size: 12, weight: .bold)).foregroundStyle(gradeColor(coach.offGrade))
                }
                VStack(spacing: 1) {
                    Text("DEF").font(.system(size: 8)).foregroundStyle(G.grey)
                    Text(coach.defGrade).font(.system(size: 12, weight: .bold)).foregroundStyle(gradeColor(coach.defGrade))
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(isSelected ? G.gold.opacity(0.06) : Color.clear)
        .overlay(
            Rectangle()
                .stroke(isSelected ? G.gold.opacity(0.3) : Color.clear, lineWidth: 1)
        )
        .contentShape(Rectangle())
        .onTapGesture { onTap() }
    }

    private func gradeBox(_ grade: String) -> some View {
        Text(grade)
            .font(.system(size: 14, weight: .bold))
            .foregroundStyle(gradeColor(grade))
            .frame(width: 32, height: 32)
            .background(gradeColor(grade).opacity(0.1))
            .overlay(Rectangle().stroke(gradeColor(grade).opacity(0.3), lineWidth: 1))
    }
}
