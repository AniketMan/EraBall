
import Foundation
import JavaScriptCore

class Engine {
    static let shared = Engine()
    let context = JSContext()!
    
    var isLoaded = false
    
    init() {
        context.exceptionHandler = { context, exception in
            print("JS Error: \(exception?.toString() ?? "unknown")")
        }
    }
    
    func load(jsCode: String, playersJSON: String, coachesCSV: String) {
        // Load the TS-compiled JS bundle into the context
        context.evaluateScript(jsCode)
        
        // Inject data
        let loadFunc = context.objectForKeyedSubscript("loadData")
        loadFunc?.call(withArguments: [playersJSON, coachesCSV])
        isLoaded = true
    }
    
    // Bridge functions to call JS from Swift
}
