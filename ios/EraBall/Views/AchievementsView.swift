// AchievementsView.swift — port of app/AchievementsModal.tsx
import SwiftUI

struct AchievementsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var achievements: [AchievementStateVM] = []

    private func rarityColor(_ r: String) -> Color {
        switch r { case "legendary": return Color(hex: "#C084FC"); case "epic": return G.gold; case "rare": return G.blue; default: return G.grey }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                let unlocked = achievements.filter(\.unlocked).count
                VStack(spacing: 10) {
                    Text("\(unlocked) / \(achievements.count) UNLOCKED")
                        .font(.system(size: 11, weight: .semibold)).tracking(2).foregroundStyle(G.gold)
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                    ForEach(achievements) { a in
                        HStack(spacing: 14) {
                            Image(systemName: a.unlocked ? "medal.fill" : "lock.fill")
                                .font(.system(size: 20)).foregroundStyle(a.unlocked ? rarityColor(a.achievement.rarity) : G.border).frame(width: 32)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(a.achievement.title).font(.system(size: 14, weight: .bold)).foregroundStyle(a.unlocked ? G.white : G.grey)
                                Text(a.achievement.description).font(.system(size: 12)).foregroundStyle(G.greyDark)
                            }
                            Spacer()
                            Text(a.achievement.rarity.uppercased()).font(.system(size: 8, weight: .bold)).tracking(1)
                                .foregroundStyle(rarityColor(a.achievement.rarity))
                        }
                        .padding(14).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1)).opacity(a.unlocked ? 1 : 0.55)
                    }
                }.padding(16)
            }
            .background(G.black).navigationTitle("ACHIEVEMENTS").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("CLOSE") { dismiss() }.foregroundStyle(G.gold) } }
        }
        .preferredColorScheme(.dark)
        .task { achievements = EngineBridge.shared.allAchievements() }
    }
}
