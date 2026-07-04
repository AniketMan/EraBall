import SwiftUI

struct EraSelectView: View {
    @Environment(AppState.self) private var state
    let eras = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]
    
    var body: some View {
        VStack(spacing: 0) {
            // Top Bar
            HStack {
                Text("ERA BALL")
                    .font(Theme.bebasFont.weight(.bold))
                    .foregroundStyle(Theme.gold)
                    .tracking(3)
                Spacer()
                Button("How to Play") { }
                    .font(.caption)
                    .foregroundStyle(Theme.greyDark)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
            .safeAreaPadding(.top)
            .background(Theme.surface.ignoresSafeArea(edges: .top))
            
            GeometryReader { geo in
                ScrollView {
                    VStack(spacing: 30) {
                        Spacer(minLength: 20)
                        
                        // Banner Area
                        ZStack {
                            if let era = state.selectedEra {
                                // AsyncImage from CDN
                                Text(era)
                                    .font(Theme.bebasFont)
                                    .fontSystem(size: 100)
                            } else {
                                Text("SELECT AN ERA")
                                    .font(Theme.bebasFont)
                                    .fontSystem(size: 40)
                                    .foregroundStyle(Theme.greyDark)
                                    .tracking(4)
                            }
                        }
                        .frame(height: 200)
                        
                        // Era Grid
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                            ForEach(eras, id: \\.self) { era in
                                Button(era) {
                                    withAnimation { state.selectedEra = era }
                                }
                                .font(Theme.bebasFont)
                                .fontSystem(size: 22)
                                .frame(height: 64)
                                .frame(maxWidth: .infinity)
                                .background(state.selectedEra == era ? Theme.gold : Theme.surface)
                                .foregroundStyle(state.selectedEra == era ? Theme.black : Theme.grey)
                                .border(state.selectedEra == era ? Theme.gold : Theme.border)
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        // Actions
                        GlassEffectContainer(spacing: 20) {
                            VStack(spacing: 12) {
                                Button("Random") { }
                                    .glassButton()
                                    .frame(width: 200)
                                
                                if state.selectedEra != nil {
                                    Button("Normal Draft") { 
                                        withAnimation { state.phase = .draft }
                                    }
                                    .glassButton(isPrimary: true)
                                    .frame(width: 200)
                                    
                                    Button("Salary Cap Draft") { }
                                        .glassButton(tint: Theme.capPurple)
                                        .frame(width: 200)
                                }
                                
                                Button("Leaderboard") { }
                                    .glassButton()
                                    .frame(width: 200)
                            }
                        }
                        
                        Spacer(minLength: 40)
                    }
                    .frame(minHeight: geo.size.height)
                }
            }
        }
    }
}

extension View {
    func fontSystem(size: CGFloat) -> some View {
        self.font(.custom("Bebas Neue", size: size))
    }
}
