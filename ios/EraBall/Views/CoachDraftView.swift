import SwiftUI

struct CoachDraftView: View {
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
                Text("Era: \\(state.selectedEra ?? "")")
                    .font(.caption)
                    .foregroundStyle(Theme.greyDark)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
            .safeAreaPadding(.top)
            .background(Theme.surface.ignoresSafeArea(edges: .top))
            
            Text("COACH DRAFT")
                .font(Theme.bebasFont)
                .fontSystem(size: 40)
                .foregroundStyle(Theme.white)
                .padding(.top, 40)
            
            Spacer()
        }
    }
}
