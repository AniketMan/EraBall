// AudioManager.swift
// Era music playback. CDN: https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev
// Volume: 0.21 default (matching web app Math.pow(0.21, 2) ~= 0.044)

import AVFoundation
import Observation

@Observable
@MainActor
final class AudioManager {
    static let shared = AudioManager()

    var isMuted: Bool = false {
        didSet {
            applyVolume()
            UserDefaults.standard.set(isMuted, forKey: "eraball_muted")
        }
    }

    /// Linear 0…1 slider value. Player gets volume² for a perceptual loudness curve (web parity).
    var volume: Double = 0.21 {
        didSet {
            applyVolume()
            UserDefaults.standard.set(volume, forKey: "eraball_volume")
        }
    }
    var isSilent: Bool { isMuted || volume == 0 }

    private var player: AVPlayer?
    private var currentEra: String?

    private func applyVolume() { player?.volume = isMuted ? 0 : Float(volume * volume) }

    private let CDN = "https://pub-c85456ef7b454894a21cc859fee77b58.r2.dev"

    private func audioFile(for era: String) -> String {
        switch era {
        case "00s": return "2000s.mp3"
        case "10s": return "2010s.mp3"
        default:    return "\(era).mp3"
        }
    }

    private init() {
        isMuted = UserDefaults.standard.bool(forKey: "eraball_muted")
        let v = UserDefaults.standard.object(forKey: "eraball_volume") as? Double
        volume = v ?? 0.21
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    func play(era: String) {
        guard era != currentEra else { return }
        currentEra = era
        let file = audioFile(for: era)
        guard let url = URL(string: "\(CDN)/\(file)") else { return }
        let item = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: item)
        player?.volume = isMuted ? 0 : Float(volume)
        player?.play()
        // Loop
        NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime,
                                               object: item, queue: .main) { [weak self] _ in
            // Delivered on the main queue, so we're already on the main actor.
            MainActor.assumeIsolated {
                self?.player?.seek(to: .zero)
                self?.player?.play()
            }
        }
    }

    func stop() {
        player?.pause()
        player = nil
        currentEra = nil
    }

    func toggleMute() {
        isMuted.toggle()
    }
}
