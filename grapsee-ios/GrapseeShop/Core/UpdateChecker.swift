import Foundation
import SwiftUI

// MARK: - Live update checker (GitHub Releases)
//
// Platform rule (Apple): iOS cannot sideload IPAs onto arbitrary devices —
// distribution goes through TestFlight / the App Store (or ad-hoc signed
// builds for registered devices). So unlike Android, the iPhone flow is:
// check → "new version available" → one tap opens the release / TestFlight
// page where the user installs it. Same trigger, platform-correct action.
enum UpdateConfig {
    // TODO: set to the public repo slug, e.g. "myuser/grapsee-shop"
    static let owner = "OWNER"
    static let repo = "REPO"
    // Optional: TestFlight public link for one-tap installs. Falls back to the release page.
    static let testFlightURL = ""
}

struct ReleaseAsset: Codable { var name: String = ""; var browser_download_url: String = "" }
struct GHRelease: Codable { var tag_name: String = ""; var name: String?; var body: String?; var html_url: String?; var assets: [ReleaseAsset] = [] }

@MainActor
final class UpdateChecker: ObservableObject {
    static let shared = UpdateChecker()
    @Published var available: GHRelease?
    @Published var checking = false

    var current: String { Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0" }

    func isNewer(_ latest: String, than current: String) -> Bool {
        func parts(_ v: String) -> [Int] {
            v.trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: "vV"))
                .components(separatedBy: CharacterSet(charactersIn: ".-+")).compactMap(Int.init)
        }
        let a = parts(latest), b = parts(current)
        for i in 0..<max(a.count, b.count) {
            let x = i < a.count ? a[i] : 0
            let y = i < b.count ? b[i] : 0
            if x != y { return x > y }
        }
        return false
    }

    func check() async {
        guard UpdateConfig.owner != "OWNER" else { return }
        checking = true
        defer { checking = false }
        guard let url = URL(string: "https://api.github.com/repos/\(UpdateConfig.owner)/\(UpdateConfig.repo)/releases/latest"),
              let (data, _) = try? await URLSession.shared.data(from: url),
              let rel = try? JSONDecoder().decode(GHRelease.self, from: data),
              isNewer(rel.tag_name, than: current) else { return }
        available = rel
    }

    func installURL(for rel: GHRelease) -> URL? {
        if !UpdateConfig.testFlightURL.isEmpty, let u = URL(string: UpdateConfig.testFlightURL) { return u }
        if let h = rel.html_url, let u = URL(string: h) { return u }
        return URL(string: "https://github.com/\(UpdateConfig.owner)/\(UpdateConfig.repo)/releases")
    }
}

struct UpdateBanner: View {
    @StateObject private var checker = UpdateChecker.shared
    @Environment(\.openURL) private var openURL
    var body: some View {
        Group {
            if let rel = checker.available {
                VStack(alignment: .leading, spacing: 6) {
                    Text("🎉 New version \(rel.tag_name)").font(.headline)
                    Text("Hey — your app has a new version!").font(.subheadline).foregroundColor(.secondary)
                    Button("Update now") {
                        if let u = checker.installURL(for: rel) { openURL(u) }
                    }.buttonStyle(.borderedProminent)
                    Button("Later") { checker.available = nil }.font(.caption).foregroundColor(.secondary)
                }
                .padding().background(.thinMaterial).cornerRadius(14).padding(.horizontal)
            }
        }.task { await checker.check() }
    }
}
