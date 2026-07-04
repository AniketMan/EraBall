import SwiftUI

enum GamePhase {
    case loading
    case eraSelect
    case draft
    case coachDraft
    case simulation
    case results
}

@MainActor
@Observable
class AppState {
    var phase: GamePhase = .loading
    var selectedEra: String? = nil
    var isSalaryCapMode = false
    
    // Draft State
    var spinTeam: String? = nil
    var spinEra: String? = nil
    var slots: [String: Any] = [:] // Will type this properly with Engine bridge
    
    func boot() async {
        // Fetch data, init engine
        try? await Task.sleep(for: .seconds(1))
        withAnimation(.smooth(duration: 0.4)) {
            self.phase = .eraSelect
        }
    }
}
