import SwiftUI
import MetalKit

struct StarfieldView: UIViewRepresentable {
    func makeUIView(context: Context) -> MTKView {
        let mtkView = MTKView()
        mtkView.device = MTLCreateSystemDefaultDevice()
        mtkView.backgroundColor = .clear
        mtkView.delegate = context.coordinator
        return mtkView
    }

    func updateUIView(_ uiView: MTKView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, MTKViewDelegate {
        var parent: StarfieldView
        var commandQueue: MTLCommandQueue?

        init(_ parent: StarfieldView) {
            self.parent = parent
            super.init()
            if let device = MTLCreateSystemDefaultDevice() {
                self.commandQueue = device.makeCommandQueue()
            }
        }

        func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

        func draw(in view: MTKView) {
            guard let drawable = view.currentDrawable,
                  let renderPassDescriptor = view.currentRenderPassDescriptor,
                  let commandQueue = commandQueue,
                  let commandBuffer = commandQueue.makeCommandBuffer(),
                  let renderEncoder = commandBuffer.makeRenderCommandEncoder(descriptor: renderPassDescriptor) else {
                return
            }

            // Simple clear color for now, full Metal shader would go here
            renderEncoder.endEncoding()
            commandBuffer.present(drawable)
            commandBuffer.commit()
        }
    }
}
