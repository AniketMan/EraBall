// DraftView.swift
// Matches DraftScreen.tsx exactly.
// Layout: TopBar | spin section | player pool | court

import SwiftUI

private let POSITIONS = ["PG","SG","SF","PF","C","B1","B2","B3","B4"]
private let POSITION_LABELS: [String: String] = [
    "PG":"Point Guard","SG":"Shooting Guard","SF":"Small Forward",
    "PF":"Power Forward","C":"Center",
    "B1":"Bench 1","B2":"Bench 2","B3":"Bench 3","B4":"Bench 4"
]

struct DraftView: View {
    let era: String
    let salaryCapMode: Bool

    @Environment(AppState.self) private var appState
    @Environment(AudioManager.self) private var audio

    @State private var slots: [CourtSlot] = POSITIONS.map { CourtSlot(position: $0) }
    @State private var currentSlotIndex = 0
    @State private var pool: [Player] = []
    @State private var currentTeam: String = ""
    @State private var currentEraForSpin: String = ""
    @State private var isSpinning = false
    @State private var spinPhase: SpinPhase = .idle
    @State private var showPlayerCard: Player? = nil
    @State private var draftComplete = false

    enum SpinPhase { case idle, spinning, revealed }

    private var currentSlot: CourtSlot? {
        guard currentSlotIndex < slots.count else { return nil }
        return slots[currentSlotIndex]
    }

    private var draftedIds: Set<Int> {
        Set(slots.compactMap { $0.player?.person_id })
    }

    var body: some View {
        VStack(spacing: 0) {
            // Top Bar
            TopBar(onTitleTap: { appState.restart() }) {
                HStack(spacing: 12) {
                    Button {
                        audio.toggleMute()
                    } label: {
                        Image(systemName: audio.isMuted ? "speaker.slash" : "speaker.wave.2")
                            .foregroundStyle(G.grey)
                            .font(.system(size: 16))
                    }
                    .buttonStyle(.plain)

                    Text(eraDisplayLabel(era))
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(G.grey)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(G.surface2)
                        .overlay(Rectangle().stroke(G.border, lineWidth: 1))
                }
            }

            ScrollView {
                VStack(spacing: 0) {
                    EraBallDivider()

                    // Draft progress
                    draftProgress

                    EraBallDivider()

                    // Spin section
                    if !draftComplete {
                        spinSection
                        EraBallDivider()
                        if !pool.isEmpty {
                            playerPoolSection
                            EraBallDivider()
                        }
                    }

                    // Court
                    courtSection

                    if draftComplete {
                        EraBallDivider()
                        continueButton
                            .padding(.horizontal, 16)
                            .padding(.vertical, 24)
                    }
                }
            }
        }
        .background(G.black)
        .ignoresSafeArea(edges: .bottom)
        .sheet(item: $showPlayerCard) { player in
            PlayerCardSheet(player: player, era: era, onDraft: { draftPlayer(player) })
        }
        .onAppear {
            audio.play(era: era)
            spinNext()
        }
    }

    // MARK: - Draft Progress

    private var draftProgress: some View {
        HStack(spacing: 0) {
            ForEach(Array(slots.enumerated()), id: \.offset) { idx, slot in
                Rectangle()
                    .fill(slot.player != nil ? G.gold : (idx == currentSlotIndex ? G.surface2 : G.black))
                    .frame(height: 4)
                    .overlay(
                        Rectangle()
                            .stroke(idx == currentSlotIndex ? G.gold.opacity(0.5) : Color.clear, lineWidth: 1)
                    )
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 16)
    }

    // MARK: - Spin Section

    private var spinSection: some View {
        VStack(spacing: 16) {
            if let slot = currentSlot {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("DRAFTING")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(3)
                            .foregroundStyle(G.grey)
                        Text(POSITION_LABELS[slot.position] ?? slot.position)
                            .font(Fonts.bebas(28))
                            .tracking(4)
                            .foregroundStyle(G.white)
                    }
                    Spacer()
                    Text("SLOT \(currentSlotIndex + 1)/9")
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(G.grey)
                }
                .padding(.horizontal, 16)
            }

            // Spin reel
            HStack(spacing: 16) {
                spinReel(value: currentTeam, label: "TEAM")
                Text("·")
                    .font(Fonts.bebas(32))
                    .foregroundStyle(G.border)
                spinReel(value: eraDisplayLabel(currentEraForSpin), label: "ERA")
            }
            .padding(.horizontal, 16)

            // Spin button
            Button {
                spinNext()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.clockwise")
                    Text(spinPhase == .idle ? "SPIN" : "SPIN AGAIN")
                }
            }
            .buttonStyle(GoldButtonStyle())
            .disabled(isSpinning)
        }
        .padding(.vertical, 20)
    }

    private func spinReel(value: String, label: String) -> some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .tracking(3)
                .foregroundStyle(G.grey)
            Text(value.isEmpty ? "---" : value)
                .font(Fonts.bebas(36))
                .tracking(4)
                .foregroundStyle(G.gold)
                .minimumScaleFactor(0.5)
                .lineLimit(1)
                .frame(minWidth: 80)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(G.surface)
                .overlay(Rectangle().stroke(G.border, lineWidth: 1))
        }
    }

    // MARK: - Player Pool

    private var playerPoolSection: some View {
        VStack(spacing: 0) {
            HStack {
                Text("AVAILABLE PLAYERS")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(3)
                    .foregroundStyle(G.grey)
                Spacer()
                Text(currentTeam)
                    .font(.system(size: 11, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(G.gold)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            EraBallDivider()

            ForEach(pool.prefix(8)) { player in
                PlayerPoolRow(player: player, era: era, onTap: {
                    showPlayerCard = player
                }, onDraft: {
                    draftPlayer(player)
                })
                EraBallDivider()
            }
        }
    }

    // MARK: - Court

    private var courtSection: some View {
        VStack(spacing: 0) {
            HStack {
                Text("YOUR ROSTER")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(3)
                    .foregroundStyle(G.grey)
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            EraBallDivider()

            // Starters
            VStack(spacing: 0) {
                Text("STARTERS")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(3)
                    .foregroundStyle(G.grey)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                ForEach(slots.filter { ["PG","SG","SF","PF","C"].contains($0.position) }) { slot in
                    CourtSlotRow(slot: slot, isActive: slot.position == currentSlot?.position)
                    EraBallDivider()
                }
            }

            // Bench
            VStack(spacing: 0) {
                Text("BENCH")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(3)
                    .foregroundStyle(G.grey)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                ForEach(slots.filter { ["B1","B2","B3","B4"].contains($0.position) }) { slot in
                    CourtSlotRow(slot: slot, isActive: slot.position == currentSlot?.position)
                    EraBallDivider()
                }
            }
        }
    }

    // MARK: - Continue Button

    private var continueButton: some View {
        Button("DRAFT COACH") {
            appState.startCoachDraft(slots: slots, era: era, salaryCapMode: salaryCapMode)
        }
        .buttonStyle(GoldButtonStyle(fullWidth: true))
    }

    // MARK: - Logic

    private func spinNext() {
        isSpinning = true
        spinPhase = .spinning
        let combos = Engine.shared.getValidCombos()
        guard !combos.isEmpty else { isSpinning = false; return }
        let combo = combos.randomElement()!
        currentTeam = combo.team
        currentEraForSpin = combo.era
        pool = Engine.shared.getPool(team: combo.team, era: combo.era, excludeIds: draftedIds)
        withAnimation(.easeOut(duration: 0.3)) {
            spinPhase = .revealed
        }
        isSpinning = false
    }

    private func draftPlayer(_ player: Player) {
        guard currentSlotIndex < slots.count else { return }
        slots[currentSlotIndex].player = player
        showPlayerCard = nil
        if currentSlotIndex + 1 < slots.count {
            currentSlotIndex += 1
            spinNext()
        } else {
            draftComplete = true
        }
    }
}

// MARK: - Player Pool Row

struct PlayerPoolRow: View {
    let player: Player
    let era: String
    let onTap: () -> Void
    let onDraft: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            PlayerHeadshotView(personId: player.person_id, initial: player.full_name, size: 44)

            VStack(alignment: .leading, spacing: 2) {
                Text(player.full_name)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(G.white)
                    .lineLimit(1)
                HStack(spacing: 8) {
                    Text(player.team_abbreviation)
                        .font(.system(size: 11))
                        .foregroundStyle(G.grey)
                    Text(eraDisplayLabel(player.era))
                        .font(.system(size: 11))
                        .foregroundStyle(G.grey)
                    if let pts = player.PTS {
                        Text(String(format: "%.1f PPG", pts))
                            .font(.system(size: 11))
                            .foregroundStyle(G.greyDark)
                    }
                }
            }

            Spacer()

            Button("DRAFT") { onDraft() }
                .buttonStyle(GoldButtonStyle())
                .font(.system(size: 11, weight: .semibold))
                .padding(.vertical, -4)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
        .onTapGesture { onTap() }
    }
}

// MARK: - Court Slot Row

struct CourtSlotRow: View {
    let slot: CourtSlot
    let isActive: Bool

    var body: some View {
        HStack(spacing: 12) {
            Text(slot.position)
                .font(.system(size: 10, weight: .semibold))
                .tracking(1)
                .foregroundStyle(G.grey)
                .frame(width: 28, alignment: .leading)

            if let player = slot.player {
                PlayerHeadshotView(personId: player.person_id, initial: player.full_name, size: 36)
                VStack(alignment: .leading, spacing: 1) {
                    Text(player.full_name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(G.white)
                        .lineLimit(1)
                    Text(player.team_abbreviation)
                        .font(.system(size: 11))
                        .foregroundStyle(G.grey)
                }
            } else {
                Rectangle()
                    .fill(Color.clear)
                    .frame(width: 36, height: 28)
                Text("EMPTY")
                    .font(.system(size: 12))
                    .foregroundStyle(G.border)
            }

            Spacer()

            if isActive {
                Text("DRAFTING")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(G.gold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(G.gold.opacity(0.1))
                    .overlay(Rectangle().stroke(G.gold.opacity(0.3), lineWidth: 1))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(isActive ? G.surface.opacity(0.5) : Color.clear)
    }
}

// MARK: - Player Card Sheet

struct PlayerCardSheet: View {
    let player: Player
    let era: String
    let onDraft: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    HStack(spacing: 16) {
                        PlayerHeadshotView(personId: player.person_id, initial: player.full_name, size: 72)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(player.full_name)
                                .font(Fonts.bebas(28))
                                .tracking(3)
                                .foregroundStyle(G.white)
                            HStack(spacing: 8) {
                                Text(player.team_abbreviation)
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundStyle(G.gold)
                                Text(eraDisplayLabel(player.era))
                                    .font(.system(size: 12))
                                    .foregroundStyle(G.grey)
                            }
                        }
                        Spacer()
                    }
                    .padding(20)
                    .background(G.surface)

                    EraBallDivider()

                    // Stats grid
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 1) {
                        statCell("PTS", value: player.PTS)
                        statCell("REB", value: player.REB)
                        statCell("AST", value: player.AST)
                        statCell("STL", value: player.STL)
                        statCell("BLK", value: player.BLK)
                        statCell("TOV", value: player.TOV)
                    }
                    .background(G.border)
                    .padding(.vertical, 1)

                    EraBallDivider()

                    // Tags
                    if let tags = player.tags, !tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(tags, id: \.self) { tag in
                                    Text(tag)
                                        .font(.system(size: 10, weight: .semibold))
                                        .tracking(1.5)
                                        .foregroundStyle(G.gold)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(G.gold.opacity(0.08))
                                        .overlay(Rectangle().stroke(G.gold.opacity(0.3), lineWidth: 1))
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                        .padding(.vertical, 16)
                        EraBallDivider()
                    }

                    // Draft button
                    Button("DRAFT PLAYER") { onDraft(); dismiss() }
                        .buttonStyle(GoldButtonStyle(fullWidth: true))
                        .padding(20)
                }
            }
            .background(G.black)
            .navigationTitle(player.full_name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("CLOSE") { dismiss() }
                        .foregroundStyle(G.gold)
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    private func statCell(_ label: String, value: Double?) -> some View {
        VStack(spacing: 4) {
            Text(value != nil ? String(format: "%.1f", value!) : "--")
                .font(Fonts.bebas(28))
                .tracking(2)
                .foregroundStyle(G.white)
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .tracking(2)
                .foregroundStyle(G.grey)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(G.surface)
    }
}
