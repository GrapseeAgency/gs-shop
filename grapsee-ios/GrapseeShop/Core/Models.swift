import Foundation

// MARK: - Wire models (mirror shop-backend Next.js API + Android Models.kt)

struct Product: Codable, Identifiable, Hashable {
    var id: String = ""
    var name: String = ""
    var slug: String?
    var description: String?
    var price: Double = 0
    var comparePrice: Double?
    var categoryId: String?
    var imageUrl: String?
    var inventory: Int = 0
    var rating: Double = 0
    var reviewCount: Int = 0
    var isFeatured: Bool = false
    var isNew: Bool = false
    var isTrending: Bool = false
    var isFlashDeal: Bool = false
}

struct Category: Codable, Identifiable, Hashable {
    var id: String = ""
    var name: String = ""
    var slug: String?
    var icon: String?
    var imageUrl: String?
}

struct Inventory: Codable {
    var inventory: Int = 0
    var isAvailable: Bool = true
    var isSoldOut: Bool = false
}

struct Testimonial: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var role: String?
    var company: String?
    var rating: Double = 5
    var text: String = ""
}

struct TrendingTerm: Codable, Identifiable {
    var term: String = ""
    var hitCount: Int = 0
    var id: String { term }
    var countLabel: String { hitCount > 1000 ? String(format: "%.1fK", Double(hitCount) / 1000) : "\(hitCount)" }
}

struct PublicStats: Codable {
    var products: Int = 0
    var users: Int = 0
    var averageRating: Double = 0
    var totalReviews: Int = 0
}

struct ProductsEnvelope: Codable {
    var data: [Product]?
    var total: Int?
    var page: Int?
    var totalPages: Int?
}

struct DailyPick: Codable, Identifiable {
    var id: String = ""
    var productId: String?
    var votes: Int = 0
    var product: Product?
}

struct ReviewItem: Codable, Identifiable {
    var id: String = ""
    var rating: Double = 0
    var comment: String?
    var text: String?
    var content: String?
    var userName: String?
    var body: String? { comment ?? text ?? content }
    var author: String? { userName }
}

struct CollectionItem: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var name: String?
    var description: String?
    var type: String?
    var productCount: Int = 0
    var displayTitle: String { title.isEmpty ? (name ?? "") : title }
}

struct BlogPost: Codable, Identifiable {
    var id: String = ""
    var slug: String = ""
    var title: String = ""
    var excerpt: String?
    var content: String?
    var body: String?
    var author: String?
    var category: String?
    var readTime: Int = 0
    var likes: Int = 0
    var createdAt: String?
    var fullBody: String? { content ?? body }
}

struct Brand: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var slug: String?
    var logo: String?
    var icon: String?
    var category: String?
}

struct CommunityPost: Codable, Identifiable {
    var id: String = ""
    var content: String?
    var text: String?
    var author: String?
    var userName: String?
    var likes: Int = 0
    var likeCount: Int = 0
    var commentCount: Int = 0
    var body: String { content ?? text ?? "" }
    var authorName: String { author ?? userName ?? "Member" }
    var likeTotal: Int { likes != 0 ? likes : likeCount }
}

struct ForumTopic: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var content: String?
    var body: String?
    var category: String?
    var replyCount: Int = 0
    var replies: Int = 0
    var author: String?
    var text: String { content ?? body ?? "" }
    var totalReplies: Int { replyCount != 0 ? replyCount : replies }
}

struct ShopEvent: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var name: String?
    var type: String?
    var description: String?
}

struct ProductVideo: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var name: String?
    var url: String?
    var videoUrl: String?
    var duration: Int = 0
    var productId: String?
    var displayTitle: String { title.isEmpty ? (name ?? "") : title }
    var playUrl: String? { videoUrl ?? url }
}

struct QuizQuestion: Codable, Identifiable {
    var id: String = ""
    var question: String = ""
    var options: [String] = []
}

struct LiveStream: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var status: String?
    var viewerCount: Int = 0
    var streamUrl: String?
    var url: String?
    var isLive: Bool { status?.lowercased() == "live" }
}

// MARK: - Rewards batch
struct CouponResult: Codable {
    var valid: Bool = false
    var code: String?
    var label: String?
    var error: String?
}
struct WalletInfo: Codable { var balance: Double = 0 }

struct CheckinInfo: Codable {
    var checkedIn: Bool = false
    var streak: Int = 0
    var streakDays: Int = 0
    var currentStreak: Int { streak != 0 ? streak : streakDays }
}

struct MysteryInfo: Codable {
    var canClaim: Bool = false
    var possibleRewards: [String] = []
}

struct LoyaltyTier: Codable, Identifiable {
    var name: String = ""
    var pointsThreshold: Int = 0
    var benefits: [String] = []
    var current: Bool = false
    var id: String { name }
}

struct GiftCard: Codable, Identifiable {
    var id: String = ""
    var code: String = ""
    var balance: Double = 0
    var amount: Double = 0
    var value: Double { balance != 0 ? balance : amount }
}

struct RewardsSummary: Codable {
    var rewardsPoints: Int = 0
    var points: Int = 0
    var loyaltyTier: String?
    var tier: String?
    var nextTierPoints: Int = 0
    var isGuest: Bool = true
    var totalPoints: Int { rewardsPoints != 0 ? rewardsPoints : points }
    var tierName: String { loyaltyTier ?? tier ?? "bronze" }
}

// MARK: - Orders batch
struct ReturnItem: Codable, Identifiable {
    var id: String = ""
    var orderId: String = ""
    var status: String?
    var reason: String?
}

struct Rental: Codable, Identifiable {
    var id: String = ""
    var productId: String = ""
    var status: String?
    var startDate: String?
    var endDate: String?
    var totalPrice: Double = 0
}

struct DownloadInfo: Codable, Identifiable {
    var productId: String = ""
    var productName: String?
    var downloadsRemaining: Int = 0
    var totalDownloads: Int = 0
    var id: String { productId }
}

struct GroupBuy: Codable, Identifiable {
    var id: String = ""
    var title: String?
    var name: String?
    var productId: String?
    var joined: Bool = false
    var displayTitle: String { title ?? name ?? "" }
}

struct SavedOutfit: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var productIds: [String] = []
    var productNames: [String] = []
}

// MARK: - Info batch
struct Store: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var city: String?
    var address: String?
    var phone: String?
    var isOpen: Bool = false
    var formattedDistance: String?
}

struct PriceAlert: Codable, Identifiable {
    var id: String = ""
    var productId: String = ""
    var productName: String?
    var targetPrice: Double = 0
    var currentPrice: Double?
}

struct SubscriptionPlan: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var description: String?
    var monthlyPrice: Double = 0
    var features: [String] = []
}

struct DigitalItem: Codable, Identifiable {
    var id: String = ""
    var title: String?
    var name: String?
    var description: String?
    var price: Double = 0
    var level: String?
    var language: String?
    var displayTitle: String { title ?? name ?? "" }
}

struct CertProgram: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var description: String?
}

// MARK: - Tools wave-2
struct Deduction: Codable, Identifiable {
    var id: String = ""
    var title: String?
    var name: String?
    var amount: Double = 0
    var category: String?
    var displayTitle: String { title ?? name ?? "" }
}

struct UnitPriceItem: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var unitPrice: Double = 0
    var unitPriceDisplay: String?
    var isBest: Bool = false
}

struct HalalResult: Codable {
    var status: String?
    var reason: String?
}

// MARK: - Tools wave-3
struct ManagedSubscription: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var amount: Double = 0
    var frequency: String?
}

// MARK: - Tools wave-4
struct TrackedDocument: Codable, Identifiable {
    var id: String = ""
    var type: String?
    var documentType: String?
    var number: String?
    var documentNumber: String?
    var expiryDate: String?
    var daysUntil: Int = 0
    var kind: String { type ?? documentType ?? "" }
    var ref: String { number ?? documentNumber ?? "" }
}

struct Vehicle: Codable, Identifiable {
    var id: String = ""
    var name: String?
    var vehicleName: String?
    var type: String?
    var vehicleType: String?
    var status: String?
    var displayName: String { name ?? vehicleName ?? "" }
    var kind: String { type ?? vehicleType ?? "" }
}

struct OrderItem: Codable {    var productId: String = ""
    var name: String = ""
    var price: Double = 0
    var quantity: Int = 1
    var imageUrl: String?
}

struct Order: Codable, Identifiable {
    var id: String = ""
    var status: String = ""
    var total: Double = 0
    var items: [OrderItem]?
    var createdAt: String?
}

// MARK: - Lenient envelope decoding (bare array OR {data:[...]})

enum Wire {
    static let json: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    static func products(from data: Data) -> [Product] {
        if let arr = try? json.decode([Product].self, from: data) { return arr }
        if let env = try? json.decode(ProductsEnvelope.self, from: data) { return env.data ?? [] }
        return []
    }

    static func array<T: Decodable>(_ type: T.Type, from data: Data, keys: [String] = ["data"]) -> [T] {
        if let arr = try? json.decode([T].self, from: data) { return arr }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            for k in keys {
                if let inner = obj[k], JSONSerialization.isValidJSONObject(["v": inner]),
                   let d = try? JSONSerialization.data(withJSONObject: inner),
                   let arr = try? json.decode([T].self, from: d) { return arr }
            }
        }
        return []
    }

    static func object<T: Decodable>(_ type: T.Type, from data: Data, keys: [String] = ["data"]) -> T? {
        if let obj = try? json.decode(T.self, from: data) { return obj }
        if let outer = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            for k in keys {
                if let inner = outer[k], JSONSerialization.isValidJSONObject(inner),
                   let d = try? JSONSerialization.data(withJSONObject: inner),
                   let obj = try? json.decode(T.self, from: d) { return obj }
            }
        }
        return nil
    }
}

// MARK: - Services + Account batch
struct TechResource: Codable, Identifiable {
    var id: String = ""
    var title: String?
    var name: String?
    var type: String?
    var pointsCost: Int = 0
    var points: Int = 0
    var description: String?
    var displayTitle: String { title ?? name ?? "" }
    var cost: Int { pointsCost != 0 ? pointsCost : points }
}

struct OpenProject: Codable, Identifiable {
    var id: String = ""
    var name: String = ""
    var title: String?
    var description: String?
    var stars: Int = 0
}

struct DarkStoreInfo: Codable {
    var isOpen: Bool = false
    var nextEvent: String?
}

struct TopReviewer: Codable, Identifiable {
    var id: String = ""
    var name: String?
    var userName: String?
    var reviewsCount: Int = 0
    var reviews: Int = 0
    var badge: String?
    var displayName: String { name ?? userName ?? "Reviewer" }
    var totalReviews: Int { reviewsCount != 0 ? reviewsCount : reviews }
}

struct AppNotification: Codable, Identifiable {
    var id: String = ""
    var title: String = ""
    var message: String?
    var body: String?
    var isRead: Bool = false
    var read: Bool = false
    var link: String?
    var text: String { message ?? body ?? "" }
    var seen: Bool { isRead || read }
}

struct HelpArticleRef: Codable, Identifiable {
    var id: String = ""
    var slug: String?
    var title: String = ""
}

struct HelpIndex: Codable {
    var categories: [String] = []
    var popularArticles: [HelpArticleRef] = []
}

struct HelpArticle: Codable {
    var title: String = ""
    var content: String?
    var body: String?
    var fullBody: String { content ?? body ?? "" }
}

struct SitemapLink: Codable {
    var label: String = ""
    var title: String?
    var href: String = ""
    var url: String?
    var text: String { label.isEmpty ? (title ?? "") : label }
    var path: String { href.isEmpty ? (url ?? "") : href }
}

struct SitemapSection: Codable {
    var title: String = ""
    var name: String?
    var links: [SitemapLink] = []
    var heading: String { title.isEmpty ? (name ?? "") : title }
}

struct Sitemap: Codable { var sections: [SitemapSection] = [] }
