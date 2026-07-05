//  FilmGrain.metal
//  Luminance-dependent film grain, per Steve Yedlin ASC's film-science research
//  (github: yedlin-film-science). Real grain amplitude is NOT uniform: it peaks in the
//  upper shadows/midtones and fades in deep shadows and bright highlights. Unlike a
//  blended noise overlay, this samples the actual rendered content luminance and applies
//  Yedlin's dual-Gaussian amplitude curve directly, so the grain is correct per-pixel.

#include <metal_stdlib>
#include <SwiftUI/SwiftUI.h>
using namespace metal;

// Cheap per-pixel/per-frame hash noise in [0,1].
static float hash21(float2 p, float t) {
    p = fract(p * float2(123.34, 345.45));
    p += dot(p, p + 34.345 + t);
    return fract(p.x * p.y);
}

// SwiftUI layerEffect entry point. `layer` is the view being modified (the graded UI);
// `time` animates the reseed; `amount` scales overall grain strength.
[[ stitchable ]] half4 filmGrain(float2 pos, SwiftUI::Layer layer, float time, float amount) {
    half4 c = layer.sample(pos);
    if (c.a == 0.0h) { return c; }

    // Rec.601 luma of the underlying content.
    float lum = dot(float3(c.rgb), float3(0.299, 0.587, 0.114));

    // Yedlin amplitude curve: main peak in the upper shadows (~0.35), secondary in the
    // lower midtones (~0.6); fades to ~0 in deep shadows and bright highlights.
    float amp = 0.8 * exp(-pow(lum - 0.35, 2.0) / (2.0 * 0.15 * 0.15))
              + 0.3 * exp(-pow(lum - 0.60, 2.0) / (2.0 * 0.20 * 0.20));
    amp /= 0.8;

    // Gaussian-ish signed noise: average two hashes and center on 0 (both lighter and
    // darker specks, like real grain) rather than a single uniform, only-lighten field.
    float n = (hash21(pos, time) + hash21(pos + 17.0, time + 3.7)) - 1.0;
    float g = n * amp * amount;

    return half4(c.rgb + half3(g), c.a);
}
