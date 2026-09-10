import Foundation
import SwiftUI

// MARK: - Live update checker (GitHub Releases)
//
// Platform rule (Apple): iOS cannot sideload IPAs onto arbitrary devices —
// distribution goes through TestFlight / the App Store (or ad-hoc signed
// builds for registered devices). So unlike Android, the iPhone flow is:
// check → "new version available" → one tap opens the release / TestFlight
// page where the user installs it. Same trigger, platform-correct action.
//
// Hardening mirrors Android UpdateLogic: blank/junk tags never prompt
// (fail closed), HTTP status is verified (no silent JSON mis-parse),
// transient failures retry once, concurrent checks collapse to one.
enum UpdateConfig {
    // Stamped by release.yml from the tag push; edit only for local builds.
    static let owner = "OWNER"
    static let repo = "REPO"
    // Optional: TestFlight public link for one-tap installs. Falls back to the release page.
    static let testFlightURL = ""
}

struct ReleaseAsset: Codable { var name: String = ""; var browser_download_url: String = "" }
struct GHRelease: Codable { var tag_name: String = ""; var name: String?; var body: String?; var html_url: String?; var assets: [ReleaseAsset] = [] }

enum UpdateLogic {
    static func segments(_ v: String) -> [Int] {
        let s = v.trimmingCharacters(in: .whitespacesAndNewlines)
        let stripped: String
        if s.hasPrefix("v") || s.hasPrefix("V") { stripped = String(s.dropFirst()) } else { stripped = s }
        if stripped.isEmpty { return [] }
        return stripped.components(separatedBy: CharacterSet(charactersIn: ".-_+")).compactMap(Int.init)
    }

    /// Strictly newer, fail-closed: unknown latest never prompts.
    static func isNewer(_ latest: String, than current: String) -> Bool {
        let a = segments(latest)
        if a.isEmpty { return false }
        let b = segments(current)
        for i in 0..<max(a.count, b.count) {
            let x = i < a.count ? a[i] : 0
            let y = i < b.count ? b[i] : 0
            if x != y { return x > y }
        }
        return false
    }
}

@MainActor
final class UpdateChecker: ObservableObject {
    static let shared = UpdateChecker()
    @Published var available: GHRelease?
    @Published var checking = false

    private let session: URLSession = {
        let c = URLSessionConfiguration.default
        c.timeoutIntervalForRequest = 20
        c.timeoutIntervalForResource = 30
        return URLSession(configuration: c)
    }()

    var current: String { Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "0" }

    func isNewer(_ latest: String, than current: String) -> Bool {
        UpdateLogic.isNewer(latest, than: current)
    }

    private func fetchLatest() async throws -> GHRelease {
        guard UpdateConfig.owner != "OWNER",
              UpdateConfig.owner.range(of: #"^[A-Za-z0-9_.-]+$"#, options: .regularExpression) != nil,
              UpdateConfig.repo.range(of: #"^[A-Za-z0-9_.-]+$"#, options: .regularExpression) != nil,
              let url = URL(string: "https://api.github.com/repos/\(UpdateConfig.owner)/\(UpdateConfig.repo)/releases/latest") else {
            throw URLError(.badURL)
        }
        var req = URLRequest(url: url)
        req.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
        req.setValue("2022-11-28", forHTTPHeaderField: "X-GitHub-Api-Version")
        let (data, resp) = try await session.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw URLError(.badServerResponse) }
        guard (200..<300).contains(http.statusCode) else {
            if http.statusCode == 404 { throw UpdateError.noReleases }
            if http.statusCode == 403 || http.statusCode == 429 { throw UpdateError.rateLimited }
            throw UpdateError.http(http.statusCode)
        }
        guard !data.isEmpty else { throw UpdateError.emptyBody }
        let rel = try JSONDecoder().decode(GHRelease.self, from: data)
        guard !rel.tag_name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw UpdateError.blankTag
        }
        return rel
    }

    func check() async {
        if checking { return } // single-flight
        guard UpdateConfig.owner != "OWNER" else { return }
        checking = true
        defer { checking = false }
        var rel: GHRelease?
        do {
            rel = try await fetchLatest()
        } catch {
            // One retry for transient transport failures only.
            if (error as? URLError)?.code == .timedOut || (error as? URLError)?.code == .notConnectedToInternet {
                try? await Task.sleep(nanoseconds: 1_500_000_000)
                rel = try? await fetchLatest()
            } else if let ue = error as? UpdateError, ue.transient {
                try? await Task.sleep(nanoseconds: 1_500_000_000)
                rel = try? await fetchLatest()
            }
        }
        guard let r = rel, isNewer(r.tag_name, than: current) else { return }
        available = r
    }

    func installURL(for rel: GHRelease) -> URL? {
        if !UpdateConfig.testFlightURL.isEmpty, let u = URL(string: UpdateConfig.testFlightURL) { return u }
        if let h = rel.html_url, let u = URL(string: h) { return u }
        return URL(string: "https://github.com/\(UpdateConfig.owner)/\(UpdateConfig.repo)/releases")
    }
}

enum UpdateError: Error {
    case noReleases, rateLimited, http(Int), emptyBody, blankTag
    var transient: Bool {
        if case .http(let c) = self { return (500..<600).contains(c) }
        return false
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
