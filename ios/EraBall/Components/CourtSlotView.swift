// CourtSlotView.swift
import SwiftUI

struct CourtSlotCard: View {
    let slot: CourtSlot
    let era: String
    let isActive: Bool

    var body: some View {
        HStack(spacing: 12) {
            Text(slot.position)
                .font(.system(size: 10, weight: .semibold))
                .tracking(1.5)
                .foregroundStyle(G.grey)
                .frame(width: 28, alignment: .leading)
            if let player = slot.player {
                filledSlot(player: player)
            } else {
                emptySlot
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(isActive ? G.surface.opacity(0.6) : Color.clear)
        .overlay(Rectangle().stroke(isActive ? G.gold.opacity(0.25) : Color.clear, lineWidth: 1))
    }

    private func filledSlot(player: Player) -> some View {
        HStack(spacing: 10) {
            PlayerHeadshotView(personId: player.person_id, initial: player.full_name, size: 40)
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
                        Text(String(format: "%.1f", pts))
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(G.greyDark)
                    }
                }
            }
            Spacer()
            eraFitBadge(playerEra: player.era, simEra: era)
        }
    }

    private var emptySlot: some View {
        HStack(spacing: 10) {
            Rectangle()
                .fill(G.surface2)
                .frame(width: 40, height: 40)
                .overlay(Rectangle().stroke(G.border, lineWidth: 1))
            Text("EMPTY")
                .font(.system(size: 12))
                .foregroundStyle(G.border)
            Spacer()
        }
    }

    private func eraFitBadge(playerEra: String, simEra: String) -> some View {
        let mod = eraModValue(playerEra: playerEra, simEra: simEra)
        let color: Color = mod >= 0.95 ? G.green : mod >= 0.82 ? G.gold : G.red
        let label = mod >= 0.95 ? "NATIVE" : mod >= 0.82 ? "FITS" : "OFF-ERA"
        return Text(label)
            .font(.system(size: 8, weight: .semibold))
            .tracking(1.5)
            .foregroundStyle(color)
            .padding(.horizontal, 5)
            .padding(.vertical, 3)
            .background(color.opacity(0.08))
            .overlay(Rectangle().stroke(color.opacity(0.3), lineWidth: 1))
    }

    private func eraModValue(playerEra: String, simEra: String) -> Double {
        let order = ["50s","60s","70s","80s","90s","00s","10s","20s"]
        guard let pi = order.firstIndex(of: playerEra),
              let si = order.firstIndex(of: simEra) else { return 0.75 }
        let d = abs(pi - si)
        let mods = [1.00, 0.95, 0.88, 0.82, 0.76, 0.71, 0.67, 0.63]
        return mods[min(d, mods.count - 1)]
    }
}
