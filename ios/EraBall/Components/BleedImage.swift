// BleedImage.swift
// Frame Negotiation Model §12.4 — "wrap, don't fork".
//
// A full-bleed remote image is a CUSTOM PARTICIPANT: left to itself,
// `.scaledToFill()` reports an intrinsic size wider than the proposal and
// breaks out of the parent's bounds (which, in a VStack, silently widens the
// whole tree and clips sibling chrome).
//
// This wrapper makes the image a well-behaved GREEDY child that is genuinely
// compressible: a clear spacer establishes the concrete proposed size, the
// image fills it via overlay (so the image's intrinsic size never propagates
// to the parent), and `.clipped()` bounds the drawing. The wrapper returns
// exactly the size it was proposed — overflow is impossible.

import SwiftUI

struct BleedImage: View {
    let url: URL?
    var height: CGFloat = Elevation.bannerHeight

    var body: some View {
        // Spacer owns the layout size (greedy width, stubborn height).
        Color.clear
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .overlay(
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .transition(.opacity)
                    default:
                        Color.clear
                    }
                }
            )
            .clipped() // bound the fill to the proposed frame
    }
}
