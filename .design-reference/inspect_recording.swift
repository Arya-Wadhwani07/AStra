import Foundation
import AVFoundation
import AppKit

let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let duration = CMTimeGetSeconds(asset.duration)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: 900, height: 600)
let supplied = CommandLine.arguments.dropFirst(2).compactMap { Double($0) }
let times = supplied.isEmpty ? (0..<8).map { duration * Double($0) / 8 } : supplied
var frames: [[String: Any]] = []
for second in times {
    let cg = try generator.copyCGImage(at: CMTime(seconds: second, preferredTimescale: 600), actualTime: nil)
    let rep = NSBitmapImageRep(cgImage: cg)
    let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.35])!
    frames.append(["second": second, "image": data.base64EncodedString()])
}
let json = try JSONSerialization.data(withJSONObject: ["duration": duration, "frames": frames])
print(String(data: json, encoding: .utf8)!)
