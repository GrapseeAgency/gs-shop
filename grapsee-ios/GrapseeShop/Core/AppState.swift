import Foundation
import SwiftUI
import WebKit

// MARK: - Local cart (mirrors Android CartStore / web zustand shape)
struct WishMeta: Codable, Hashable {
    var name: String
    var price: Double
    var compare: Double?
}

struct CartLine: Codable, Identifiable, Hashable {    var productId: String
    var name: String
    var price: Double
    var quantity: Int = 1
    var imageUrl: String?
    var id: String { productId }
}

@MainActor
final class AppState: ObservableObject {
    static let shared = AppState()
    @Published var cart: [CartLine] = []
    @Published var wishlist: [String] = [] // product ids
    @Published var recent: [Product] = [] // recently viewed, max 10
    @Published var email: String? = nil

    var cartCount: Int { cart.reduce(0) { $0 + $1.quantity } }

    func addToCart(product: Product, qty: Int = 1) {
        if let i = cart.firstIndex(where: { $0.productId == product.id }) {
            cart[i].quantity += qty
        } else {
            cart.append(CartLine(productId: product.id, name: product.name, price: product.price, quantity: qty, imageUrl: product.imageUrl))
        }
        persist()
    }

    func toggleWishlist(_ id: String) {
        if wishlist.contains(id) { wishlist.removeAll { $0 == id } } else { wishlist.append(id) }
        persist()
    }

    /// Web parity: wishlist keeps price snapshots (comparePrice included).
    func toggleWishlist(_ product: Product) {
        if wishlist.contains(product.id) { wishlist.removeAll { $0 == product.id } }
        else { wishlist.append(product.id); wishmeta[product.id] = WishMeta(name: product.name, price: product.price, compare: product.comparePrice) }
        persist()
    }

    @Published var wishmeta: [String: WishMeta] = [:]

    func recordView(_ product: Product) {
        recent.removeAll { $0.id == product.id }
        recent.append(product)
        if recent.count > 10 { recent = Array(recent.suffix(10)) }
    }

    private let key = "grapsee-app-state"
    func persist() {
        let dto = ["cart": (try? JSONEncoder().encode(cart)).flatMap { String(data: $0, encoding: .utf8) } ?? "[]"]
        UserDefaults.standard.set(dto, forKey: key)
    }
}

// MARK: - WebView fallback (permanent home of the long tail, same as Android)
struct WebFallbackView: UIViewRepresentable {
    let path: String
    func makeUIView(context: Context) -> WKWebView {
        let wv = WKWebView()
        wv.customUserAgent = "GrapseeApp-iOS"
        return wv
    }
    func updateUIView(_ wv: WKWebView, context: Context) {
        let urlStr = path.hasPrefix("http") ? path : API.webBase + path
        if let url = URL(string: urlStr), wv.url == nil {
            wv.load(URLRequest(url: url))
        }
    }
}

// MARK: - Shared UI atoms
struct PriceText: View {
    let price: Double
    let compare: Double?
    var body: some View {
        HStack(spacing: 6) {
            Text("$\(price, specifier: "%.2f")").bold()
            if let c = compare, c > price {
                Text("$\(c, specifier: "%.2f")").strikethrough().foregroundColor(.secondary).font(.caption)
            }
        }
    }
}

struct ProductRow: View {
    let product: Product
    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 10).fill(Color.accentColor.opacity(0.12))
                .frame(width: 52, height: 52)
                .overlay(Text(product.name.prefix(1)).font(.title3))
            VStack(alignment: .leading, spacing: 2) {
                Text(product.name).lineLimit(1).font(.subheadline)
                PriceText(price: product.price, compare: product.comparePrice)
            }
            Spacer()
        }.padding(.vertical, 4)
    }
}
