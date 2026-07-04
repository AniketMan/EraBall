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
    @State private var image: UIImage?

    private var initials: String {
        let parts = name.replacingOccurrences(of: "*", with: "").split(separator: " ")
        let first = parts.first?.first.map(String.init) ?? ""
        let last = parts.count > 1 ? (parts.last?.first.map(String.init) ?? "") : ""
        return (first + last).uppercased()
    }

    var body: some View {
        ZStack {
            Circle().fill(G.surface2)
            if let image {
                Image(uiImage: image).resizable().scaledToFill()
                    .frame(width: size, height: size).clipShape(Circle())
            } else {
                Text(initials).font(Fonts.bebas(size * 0.42)).foregroundStyle(G.gold)
            }
            Circle().strokeBorder(G.border, lineWidth: 1)
        }
        .frame(width: size, height: size)
        .task(id: name) { image = await CoachHeadshotLoader.shared.image(for: name) }
    }
}

/// Fetches a coach's photo from the Wikipedia REST summary thumbnail — the same source
/// the web app uses via /api/coach-headshot. Native URLSession, so no CORS proxy needed.
actor CoachHeadshotLoader {
    static let shared = CoachHeadshotLoader()
    private var cache: [String: UIImage] = [:]
    private var misses: Set<String> = []

    func image(for name: String) async -> UIImage? {
        if let hit = cache[name] { return hit }
        if misses.contains(name) { return nil }
        let clean = name.replacingOccurrences(of: "*", with: "").trimmingCharacters(in: .whitespaces)
        let title = clean.replacingOccurrences(of: " ", with: "_")
            .addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? clean
        guard let summaryURL = URL(string: "https://en.wikipedia.org/api/rest_v1/page/summary/\(title)") else {
            misses.insert(name); return nil
        }
        var req = URLRequest(url: summaryURL)
        req.setValue("EraBall/1.0 (NBA draft simulator)", forHTTPHeaderField: "User-Agent")
        do {
            let (data, _) = try await URLSession.shared.data(for: req)
            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let thumb = json["thumbnail"] as? [String: Any],
                  let src = thumb["source"] as? String, let imgURL = URL(string: src) else {
                misses.insert(name); return nil
            }
            let (imgData, _) = try await URLSession.shared.data(from: imgURL)
            guard let ui = UIImage(data: imgData) else { misses.insert(name); return nil }
            cache[name] = ui
            return ui
        } catch {
            misses.insert(name); return nil
        }
    }
}
