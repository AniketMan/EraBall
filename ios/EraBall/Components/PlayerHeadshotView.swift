// PlayerHeadshotView.swift
// Matches web PlayerHeadshot: loads from NBA CDN, fallback to initial letter.
// URL: https://cdn.nba.com/headshots/nba/latest/260x190/{person_id}.png

import SwiftUI

struct PlayerHeadshotView: View {
    let personId: Int
    let initial: String
    var size: CGFloat = 52

    private var url: URL? {
        URL(string: "https://cdn.nba.com/headshots/nba/latest/260x190/\(personId).png")
    }

    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
                    .frame(width: size, height: size * 0.8)
                    .clipped()
            case .failure, .empty:
                ZStack {
                    Rectangle()
                        .fill(G.surface2)
                        .frame(width: size, height: size * 0.8)
                    Text(String(initial.prefix(1)).uppercased())
                        .font(Fonts.bebas(size * 0.45))
                        .foregroundStyle(G.gold)
                }
            @unknown default:
                Rectangle()
                    .fill(G.surface2)
                    .frame(width: size, height: size * 0.8)
            }
        }
    }
}
