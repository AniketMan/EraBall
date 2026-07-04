// PlayerHeadshotView.swift
// Player headshot from the NBA CDN with an initial-monogram fallback, and a
// coach monogram (no public coach-photo CDN in the native app).

import SwiftUI

struct PlayerHeadshotView: View {
    let personId: String
    let initial: String
    var size: CGFloat = 52

    private var url: URL? { URL(string: "https://cdn.nba.com/headshots/nba/latest/260x190/\(personId).png") }

    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
                // Anchor the fill to the top so every head sits consistently regardless of
                // each headshot's framing (center-crop left players like Kemba sitting low).
                image.resizable().scaledToFill()
                    .frame(width: size, height: size * 0.8, alignment: .top).clipped()
            default:
                ZStack {
                    Rectangle().fill(G.surface2)
                    Text(String(initial.prefix(1)).uppercased())
                        .font(Fonts.bebas(size * 0.45)).foregroundStyle(G.gold)
                }
                .frame(width: size, height: size * 0.8)
            }
        }
    }
}

struct CoachHeadshotView: View {
    let name: String
    var size: CGFloat = 52

    private var initials: String {
        let parts = name.replacingOccurrences(of: "*", with: "").split(separator: " ")
        let first = parts.first?.first.map(String.init) ?? ""
        let last = parts.count > 1 ? (parts.last?.first.map(String.init) ?? "") : ""
        return (first + last).uppercased()
    }

    var body: some View {
        ZStack {
            Circle().fill(G.surface2)
            Circle().strokeBorder(G.border, lineWidth: 1)
            Text(initials).font(Fonts.bebas(size * 0.42)).foregroundStyle(G.gold)
        }
        .frame(width: size, height: size)
    }
}
