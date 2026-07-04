import SwiftUI

struct DraftView: View {
    @Environment(AppState.self) private var state
    
    var body: some View {
        VStack(spacing: 0) {
            // Top Bar
            HStack {
                Text("ERA BALL")
                    .font(Theme.bebasFont.weight(.bold))
                    .foregroundStyle(Theme.gold)
                    .tracking(3)
                Spacer()
                Text("Era: \\(state.selectedEra ?? "") · Picks: 0/9")
                    .font(.caption)
                    .foregroundStyle(Theme.greyDark)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
            .safeAreaPadding(.top)
            .background(Theme.surface.ignoresSafeArea(edges: .top))
            
            GeometryReader { geo in
                HStack(spacing: 0) {
                    // Left Panel (Spin/Pool)
                    VStack {
                        Spacer()
                        Text("SPIN PANEL")
                            .foregroundStyle(Theme.white)
                        Spacer()
                    }
                    .frame(width: geo.size.width * 0.4)
                    .background(Theme.surface2)
                    
                    // Right Panel (Court)
                    VStack {
                        Spacer()
                        Text("COURT SLOTS")
                            .foregroundStyle(Theme.white)
                        Spacer()
                    }
                    .frame(width: geo.size.width * 0.6)
                }
            }
        }
    }
}
