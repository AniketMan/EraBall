// TopBar.swift
// Matches the web app TopBar exactly:
// Left: "ERA BALL" Bebas 22px gold (tappable - restarts)
// Right: slot for custom content (HOW TO PLAY button, etc.)
// bg: #111111, border-bottom: 1px solid #222

import SwiftUI

struct TopBar<RightContent: View>: View {
    let onTitleTap: (() -> Void)?
    @ViewBuilder let rightContent: () -> RightContent

    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Button {
                    onTitleTap?()
                } label: {
                    Text("ERA BALL")
                        .font(Fonts.bebas(22))
                        .tracking(6.0)
                        .foregroundStyle(G.gold)
                }
                .buttonStyle(.plain)
                .disabled(onTitleTap == nil)

                Spacer()

                rightContent()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)

            Rectangle()
                .fill(G.border)
                .frame(height: 1)
        }
        .background(G.surface)
    }
}

extension TopBar where RightContent == EmptyView {
    init(onTitleTap: (() -> Void)? = nil) {
        self.onTitleTap = onTitleTap
        self.rightContent = { EmptyView() }
    }
}
