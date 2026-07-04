// AchievementsView.swift
// Matches AchievementsModal.tsx exactly.

import SwiftUI

struct AchievementsView: View {
    @Environment(AppState.self) private var appState
    @Environment(GameCenterManager.self) private var gcManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Game Center button
                    if gcManager.isAuthenticated {
                        Button {
                            gcManager.showAchievements()
                        } label: {
                            HStack {
                                Image(systemName: "gamecontroller.fill")
                                    .foregroundStyle(G.gold)
                                Text("VIEW IN GAME CENTER")
                                    .font(.system(size: 12, weight: .semibold))
                                    .tracking(2)
                                    .foregroundStyle(G.gold)
                                Spacer()
                                Image(systemName: "arrow.right")
                                    .foregroundStyle(G.grey)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                        }
                        .buttonStyle(.plain)
                        .background(G.surface)
                        EraBallDivider()
                    }

                    // Progress
                    let unlocked = appState.unlockedAchievements.count
                    let total = Achievement.all.count
                    HStack {
                        Text("\\(unlocked)/\\(total) UNLOCKED")
                            .font(.system(size: 11, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(G.grey)
                        Spacer()
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Rectangle().fill(G.border).frame(height: 4)
                                Rectangle()
                                    .fill(G.gold)
                                    .frame(width: geo.size.width * CGFloat(unlocked) / CGFloat(max(total, 1)), height: 4)
                            }
                        }
                        .frame(width: 120, height: 4)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 16)

                    EraBallDivider()

                    // Achievement list
                    ForEach(Achievement.all) { ach in
                        let isUnlocked = appState.unlockedAchievements.contains(ach.id)
                        HStack(spacing: 12) {
                            ZStack {
                                Rectangle()
                                    .fill(isUnlocked ? Color(hex: ach.rarityColor).opacity(0.1) : G.surface2)
                                    .frame(width: 44, height: 44)
                                Image(systemName: isUnlocked ? "trophy.fill" : "lock.fill")
                                    .foregroundStyle(isUnlocked ? Color(hex: ach.rarityColor) : G.border)
                                    .font(.system(size: 18))
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text(ach.title)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(isUnlocked ? G.white : G.grey)
                                Text(ach.description)
                                    .font(.system(size: 11))
                                    .foregroundStyle(G.grey)
                            }
                            Spacer()
                            Text(ach.rarity.uppercased())
                                .font(.system(size: 9, weight: .semibold))
                                .tracking(1.5)
                                .foregroundStyle(Color(hex: ach.rarityColor))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .opacity(isUnlocked ? 1.0 : 0.5)
                        EraBallDivider()
                    }
                }
            }
            .background(G.black)
            .navigationTitle("ACHIEVEMENTS")
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
