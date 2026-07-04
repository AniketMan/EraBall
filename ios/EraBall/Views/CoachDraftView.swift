// CoachDraftView.swift — port of app/features/coach-draft/CoachDraftScreen.tsx
// v1.5.8 flow: one spin reveals THREE coaches; the player picks one.
import SwiftUI

struct CoachDraftView: View {
    @Environment(GameSession.self) private var session
    @State private var sandboxSearch = ""

    private var searchResults: [CoachVM] {
        guard !sandboxSearch.isEmpty else { return [] }
        return session.eligibleCoaches.filter { $0.name.localizedCaseInsensitiveContains(sandboxSearch) }.prefix(12).map { $0 }
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button { session.phase = .draft } label: {
                    Text("BACK").font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey)
                        .padding(.horizontal, 12).padding(.vertical, 8).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                }.buttonStyle(.plain)
                Spacer()
            }
            .padding(.horizontal, 16).padding(.vertical, 10)
            EraBallDivider()

            ScrollView {
                VStack(spacing: 0) {
                    VStack(spacing: 8) {
                        Text("Draft a Coach").font(Fonts.bebas(56)).tracking(2).foregroundStyle(G.white).lineLimit(1).minimumScaleFactor(0.6)
                        Text("SPIN TO REVEAL 3 COACHES. PICK THE BEST FIT FOR YOUR ROSTER.")
                            .font(.system(size: 11, weight: .semibold)).tracking(1.5).foregroundStyle(G.grey).multilineTextAlignment(.center)
                    }
                    .padding(.vertical, 28).padding(.horizontal, 16)

                    if session.coachChoices.isEmpty && !session.coachSpinning {
                        Button("SPIN COACH") { session.spinCoach() }
                            .buttonStyle(GoldButtonStyle(fullWidth: true)).padding(.horizontal, 16).padding(.bottom, 16)
                    }

                    if session.sandboxMode && !session.coachSpinning {
                        VStack(spacing: 6) {
                            Text("OR SEARCH A COACH").font(.system(size: 10, weight: .semibold)).tracking(2).foregroundStyle(G.greyDark).frame(maxWidth: .infinity, alignment: .leading)
                            TextField("Coach name…", text: $sandboxSearch)
                                .font(.system(size: 14)).foregroundStyle(G.white).tint(G.gold)
                                .padding(.horizontal, 12).padding(.vertical, 8).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                            ForEach(searchResults) { c in
                                Button { session.pickCoach(c) } label: {
                                    HStack {
                                        Text(c.name).font(.system(size: 13)).foregroundStyle(G.white)
                                        if c.hof { Text("★").foregroundStyle(G.gold) }
                                        Spacer()
                                        Text("Off:\(c.offGrade) Def:\(c.defGrade) Ovr:\(c.overallGrade)").font(.system(size: 11)).foregroundStyle(G.greyDark)
                                    }
                                    .padding(.horizontal, 12).padding(.vertical, 8).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                                }.buttonStyle(.plain)
                            }
                        }.padding(.horizontal, 16).padding(.bottom, 12)
                    }

                    if session.coachSpinning {
                        VStack(spacing: 8) {
                            ForEach(0..<3, id: \.self) { i in
                                Text(session.coachReel.indices.contains(i) ? session.coachReel[i] : "")
                                    .font(Fonts.bebas(28)).tracking(1).foregroundStyle(G.greyDark)
                                    .frame(maxWidth: .infinity).frame(minHeight: 72)
                                    .background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
                                    .lineLimit(1).minimumScaleFactor(0.5)
                            }
                        }.padding(.horizontal, 16)
                    }

                    if !session.coachSpinning && !session.coachChoices.isEmpty {
                        if session.coachSpinsUsed < session.coachRespinBudget {
                            Button("RESPIN (\(session.coachRespinBudget - session.coachSpinsUsed) LEFT)") { session.spinCoach() }
                                .buttonStyle(GhostButtonStyle(fullWidth: true)).padding(.horizontal, 16).padding(.bottom, 12)
                        }
                        VStack(spacing: 8) {
                            ForEach(session.coachChoices) { c in
                                Button { session.pickCoach(c) } label: { CoachChoiceCard(coach: c) }.buttonStyle(.plain)
                            }
                        }.padding(.horizontal, 16)
                    }

                    Text("★ Hall of Fame inductee").font(.system(size: 11)).foregroundStyle(G.greyDark).padding(.vertical, 16)
                }
            }
        }
        .background(G.black)
    }
}

struct CoachChoiceCard: View {
    let coach: CoachVM
    var body: some View {
        HStack(spacing: 12) {
            CoachHeadshotView(name: coach.rawName, size: 52)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(coach.name).font(Fonts.bebas(20)).foregroundStyle(G.white).lineLimit(1)
                    if coach.hof { Image(systemName: "star.fill").font(.system(size: 9)).foregroundStyle(G.gold) }
                    if coach.offGuru && coach.defGuru { badge("COMPLETE", G.gold, second: G.blue) }
                    else if coach.offGuru { badge("OFF GURU", G.gold) }
                    else if coach.defGuru { badge("DEF GURU", G.blue) }
                    if coach.franchisePair { badge("FRANCHISE PAIR", Color(hex: "#a78bfa")) }
                }
                Text("\(coach.from)–\(coach.to) · \(coach.regW)W–\(coach.regL)L" + (coach.champ > 0 ? "   \(coach.champ)× Champ" : (coach.conf > 0 ? "   \(coach.conf) conf" : "")))
                    .font(.system(size: 11)).foregroundStyle(G.grey).lineLimit(1)
                HStack(spacing: 10) {
                    gradePair("OFF", coach.effOffGrade)
                    gradePair("DEF", coach.effDefGrade)
                    Text(coach.playoffG > 0 ? "\(Int(coach.playoffWLPct * 100))% Playoffs" : "No Playoffs")
                        .font(.system(size: 10)).foregroundStyle(G.greyDark)
                }
            }
            Spacer(minLength: 4)
            Text(coach.overallGrade).font(Fonts.bebas(44)).foregroundStyle(coachGradeColor(coach.overallGrade))
        }
        .padding(12).background(G.surface).overlay(Rectangle().stroke(G.border, lineWidth: 1))
    }

    private func gradePair(_ label: String, _ grade: String) -> some View {
        HStack(spacing: 3) {
            Text("\(label):").font(.system(size: 10)).foregroundStyle(G.greyDark)
            Text(grade).font(.system(size: 10, weight: .semibold)).foregroundStyle(coachGradeColor(grade))
        }
    }
    private func badge(_ text: String, _ color: Color, second: Color? = nil) -> some View {
        Text(text).font(.system(size: 8.5, weight: .bold)).tracking(0.6).foregroundStyle(G.black)
            .padding(.horizontal, 6).padding(.vertical, 1.5)
            .background(second != nil ? AnyShapeStyle(LinearGradient(colors: [color, second!], startPoint: .leading, endPoint: .trailing)) : AnyShapeStyle(color))
    }
}
