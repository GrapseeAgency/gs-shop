import Foundation

// MARK: - Single HTTP surface (mirrors Android ApiClient.kt)
// Debug points at the LAN dev stack; override via -D flags / Info.plist in release.
enum API {
    static let apiBase = "http://192.168.43.79:3000"
    static let webBase = "http://192.168.43.79:3002"

    private static let session: URLSession = {
        let c = URLSessionConfiguration.default
        c.httpCookieStorage = .shared
        c.timeoutIntervalForRequest = 25
        return URLSession(configuration: c)
    }()

    private static func get(_ path: String) async -> Data? {
        let urlStr = path.hasPrefix("http") ? path : apiBase + path
        guard let url = URL(string: urlStr) else { return nil }
        return try? await session.data(from: url).0
    }

    private struct Envelope: Codable { var data: [Product]?; var total: Int?; var page: Int?; var totalPages: Int? }

    static func products(page: Int = 1, limit: Int = 20, flags: [String: String] = [:]) async -> (items: [Product], totalPages: Int) {
        var comps = URLComponents(string: apiBase + "/api/products")!
        var q = [URLQueryItem(name: "page", value: "\(page)"), URLQueryItem(name: "limit", value: "\(limit)")]
        for (k, v) in flags { q.append(URLQueryItem(name: k, value: v)) }
        comps.queryItems = q
        guard let url = comps.url, let (data, _) = try? await session.data(from: url) else { return ([], 1) }
        if let env = try? Wire.json.decode(Envelope.self, from: data) {
            return (env.data ?? Wire.products(from: data), env.totalPages ?? 1)
        }
        return (Wire.products(from: data), 1)
    }

    static func search(_ query: String, page: Int = 1) async -> [Product] {
        var comps = URLComponents(string: apiBase + "/api/products/search")!
        comps.queryItems = [URLQueryItem(name: "q", value: query), URLQueryItem(name: "page", value: "\(page)")]
        guard let url = comps.url, let (data, _) = try? await session.data(from: url) else { return [] }
        return Wire.products(from: data)
    }

    static func categories() async -> [Category] {
        guard let data = await get("/api/categories") else { return [] }
        return Wire.array(Category.self, from: data)
    }

    static func todaysPicks() async -> [DailyPick] {
        guard let data = await get("/api/todays-pick") else { return [] }
        return Wire.array(DailyPick.self, from: data, keys: ["picks", "data"])
    }

    static func reviews(limit: Int = 4) async -> [ReviewItem] {
        guard let data = await get("/api/reviews?limit=\(limit)") else { return [] }
        return Wire.array(ReviewItem.self, from: data, keys: ["data", "reviews"])
    }

    static func recommended(limit: Int = 6) async -> [Product] {
        guard let data = await get("/api/products/recommendations?limit=\(limit)") else { return [] }
        return Wire.products(from: data)
    }

    static func luxury(limit: Int = 3) async -> [Product] {
        guard let data = await get("/api/luxury-zone") else { return [] }
        let arr: [Product]
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["products"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            arr = Wire.products(from: d)
        } else { arr = Wire.products(from: data) }
        return Array(arr.prefix(limit))
    }

    static func flashSale() async -> [Product] {
        guard let data = await get("/api/flash-sale") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["products"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func auctions() async -> [Product] {
        guard let data = await get("/api/auctions") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["data"] ?? obj["auctions"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func preorder() async -> [Product] {
        guard let data = await get("/api/preorder") else { return [] }
        return Wire.products(from: data)
    }

    static func bundles() async -> [Product] {
        guard let data = await get("/api/bundles") else { return [] }
        return Wire.products(from: data)
    }

    static func collections() async -> [CollectionItem] {
        guard let data = await get("/api/collections?featured=true") else { return [] }
        return Wire.array(CollectionItem.self, from: data, keys: ["data", "collections"])
    }

    static func collectionProducts(id: String) async -> [Product] {
        guard let data = await get("/api/collections/\(id)") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["products"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func blogPosts(limit: Int = 10) async -> [BlogPost] {
        guard let data = await get("/api/blogs?limit=\(limit)") else { return [] }
        return Wire.array(BlogPost.self, from: data, keys: ["data", "posts"])
    }

    static func brands() async -> [Brand] {
        guard let data = await get("/api/brands") else { return [] }
        return Wire.array(Brand.self, from: data, keys: ["data", "brands"]).filter { !$0.id.isEmpty && !$0.name.isEmpty }
    }

    // MARK: - Content batch
    static func blogPost(slug: String) async -> BlogPost? {
        guard let data = await get("/api/blogs/\(slug)") else { return nil }
        return Wire.object(BlogPost.self, from: data)
    }

    static func communityPosts() async -> [CommunityPost] {
        guard let data = await get("/api/community/posts") else { return [] }
        return Wire.array(CommunityPost.self, from: data, keys: ["posts", "data"])
    }

    static func forumTopics() async -> [ForumTopic] {
        guard let data = await get("/api/forum") else { return [] }
        return Wire.array(ForumTopic.self, from: data, keys: ["topics", "data"])
    }

    static func forumTopic(id: String) async -> ForumTopic? {
        guard let data = await get("/api/forum/\(id)") else { return nil }
        return Wire.object(ForumTopic.self, from: data, keys: ["topic", "data"])
    }

    static func events() async -> [ShopEvent] {
        guard let data = await get("/api/events") else { return [] }
        return Wire.array(ShopEvent.self, from: data, keys: ["events", "data"])
    }

    static func productVideos() async -> [ProductVideo] {
        guard let data = await get("/api/product-videos") else { return [] }
        return Wire.array(ProductVideo.self, from: data, keys: ["videos", "data"])
    }

    static func quizQuestions() async -> [QuizQuestion] {
        guard let data = await get("/api/product-quiz") else { return [] }
        return Wire.array(QuizQuestion.self, from: data, keys: ["questions", "data"])
    }

    static func quizSubmit(answers: [String: String]) async -> [Product] {
        guard let url = URL(string: apiBase + "/api/product-quiz") else { return [] }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["answers": answers])
        guard let (data, _) = try? await session.data(for: req) else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["recommendations"] ?? obj["products"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func liveStreams() async -> [LiveStream] {
        guard let data = await get("/api/live-shopping/streams") else { return [] }
        return Wire.array(LiveStream.self, from: data, keys: ["streams", "data"])
    }

    // MARK: - Rewards batch
    static func validateCoupon(code: String) async -> CouponResult? {
        guard let url = URL(string: apiBase + "/api/coupons/validate") else { return nil }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["code": code])
        guard let (data, _) = try? await session.data(for: req) else { return nil }
        return try? Wire.json.decode(CouponResult.self, from: data)
    }

    static func wallet() async -> WalletInfo? {
        guard let data = await get("/api/wallet") else { return nil }
        return Wire.object(WalletInfo.self, from: data, keys: ["data", "wallet"])
    }

    static func checkinStatus() async -> CheckinInfo? {
        guard let data = await get("/api/daily-checkin") else { return nil }
        return try? Wire.json.decode(CheckinInfo.self, from: data)
    }

    static func checkin() async -> CheckinInfo? {
        guard let url = URL(string: apiBase + "/api/daily-checkin") else { return nil }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        guard let (data, _) = try? await session.data(for: req) else { return nil }
        return try? Wire.json.decode(CheckinInfo.self, from: data)
    }

    static func mysteryStatus() async -> MysteryInfo? {
        guard let data = await get("/api/mystery-reward") else { return nil }
        return try? Wire.json.decode(MysteryInfo.self, from: data)
    }

    static func mysteryClaim() async -> Bool {
        guard let url = URL(string: apiBase + "/api/mystery-reward") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        return (try? await session.data(for: req)) != nil
    }

    static func loyaltyTiers() async -> [LoyaltyTier] {
        guard let data = await get("/api/loyalty-tiers") else { return [] }
        return Wire.array(LoyaltyTier.self, from: data, keys: ["tiers", "data"])
    }

    static func giftCards() async -> [GiftCard] {
        guard let data = await get("/api/gift-cards") else { return [] }
        return Wire.array(GiftCard.self, from: data, keys: ["giftCards", "data"])
    }

    static func giftCardRedeem(code: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/gift-cards/redeem") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["code": code])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func rewardsSummary() async -> RewardsSummary? {
        guard let data = await get("/api/rewards") else { return nil }
        return try? Wire.json.decode(RewardsSummary.self, from: data)
    }

    static func rewardsDailyClaim() async -> Bool {
        guard let url = URL(string: apiBase + "/api/rewards/daily") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        return (try? await session.data(for: req)) != nil
    }

    // MARK: - Orders batch
    static func product(id: String) async -> Product? {
        guard let data = await get("/api/products/\(id)") else { return nil }
        let items = Wire.products(from: data)
        return items.first
    }

    static func inventory(productId: String) async -> Inventory? {
        guard let data = await get("/api/inventory/\(productId)") else { return nil }
        return try? Wire.json.decode(Inventory.self, from: data)
    }

    static func testimonials() async -> [Testimonial] {
        guard let data = await get("/api/testimonials"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let arr = obj["testimonials"],
              let dd = try? JSONSerialization.data(withJSONObject: arr) else { return [] }
        return (try? Wire.json.decode([Testimonial].self, from: dd)) ?? []
    }

    static func trendingSearches() async -> [TrendingTerm] {
        guard let data = await get("/api/trending-searches"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              (obj["success"] as? Bool) == true,
              let arr = obj["searches"],
              let dd = try? JSONSerialization.data(withJSONObject: arr) else { return [] }
        return ((try? Wire.json.decode([TrendingTerm].self, from: dd)) ?? []).filter { !$0.term.isEmpty }.prefix(10).map { $0 }
    }

    static func publicStats() async -> PublicStats? {
        guard let data = await get("/api/public-stats") else { return nil }
        return try? Wire.json.decode(PublicStats.self, from: data)
    }

    static func order(id: String) async -> Order? {
        guard let data = await get("/api/orders/\(id)") else { return nil }
        return try? Wire.json.decode(Order.self, from: data)
    }

    static func returns() async -> [ReturnItem] {
        guard let data = await get("/api/returns") else { return [] }
        return Wire.array(ReturnItem.self, from: data, keys: ["returns", "data"])
    }

    static func requestReturn(orderId: String, reason: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/returns") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["orderId": orderId, "reason": reason])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    /// Generic primitive map for calculator/quote endpoints.
    static func rawMap(path: String, payload: [String: Any]? = nil) async -> [String: String] {
        let urlStr = path.hasPrefix("http") ? path : apiBase + path
        guard let url = URL(string: urlStr) else { return [:] }
        var req = URLRequest(url: url)
        var bodyData: Data?
        if let p = payload {
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            bodyData = try? JSONSerialization.data(withJSONObject: p)
            req.httpBody = bodyData
        }
        guard let (data, _) = try? await session.data(for: req) else { return [:] }
        guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [:] }
        let src = (obj["data"] as? [String: Any]) ?? obj
        var out: [String: String] = [:]
        for (k, v) in src {
            if k.lowercased() == "success" { continue }
            if let s = v as? String, !s.isEmpty { out[k] = s }
            else if let n = v as? NSNumber { out[k] = "\(n)" }
            else if let d = v as? Double { out[k] = "\(d)" }
            else if let i = v as? Int { out[k] = "\(i)" }
        }
        return out
    }

    static func tradeInProducts() async -> [Product] {
        guard let data = await get("/api/trade-in") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["tradeInProducts"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func requestTrial(productId: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/try-before-buy/trial") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["productId": productId])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func rentalProducts() async -> [Product] {
        guard let data = await get("/api/rental") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["products"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func myRentals() async -> [Rental] {
        guard let data = await get("/api/rental") else { return [] }
        return Wire.array(Rental.self, from: data, keys: ["userRentals", "rentals"])
    }

    static func requestRental(productId: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/rental") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["productId": productId])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func downloadProducts() async -> [Product] {
        guard let data = await get("/api/digital-downloads") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let inner = obj["products"] ?? obj["data"],
           let d = try? JSONSerialization.data(withJSONObject: inner) {
            return Wire.products(from: d)
        }
        return Wire.products(from: data)
    }

    static func myDownloads() async -> [DownloadInfo] {
        guard let data = await get("/api/digital-downloads") else { return [] }
        return Wire.array(DownloadInfo.self, from: data, keys: ["myDownloads"])
    }

    static func groupBuys() async -> [GroupBuy] {
        guard let data = await get("/api/group-buy") else { return [] }
        return Wire.array(GroupBuy.self, from: data, keys: ["groupBuys", "data"])
    }

    static func joinGroupBuy(id: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/group-buy") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["id": id])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func priceDrops() async -> [Product] {
        guard let data = await get("/api/price-drop") else { return [] }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if let d = obj["data"] as? [String: Any], let arr = d["products"],
               let dd = try? JSONSerialization.data(withJSONObject: arr) {
                return Wire.products(from: dd)
            }
            if let arr = obj["products"], let dd = try? JSONSerialization.data(withJSONObject: arr) {
                return Wire.products(from: dd)
            }
        }
        return Wire.products(from: data)
    }

    static func trackPriceAlert(productId: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/price-drop") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["productId": productId])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    // MARK: - Services + Account batch
    static func simplePost(path: String, payload: [String: Any]) async -> Bool {
        guard let url = URL(string: apiBase + path) else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func giftOptions() async -> (designs: [String], ribbons: [String]) {
        guard let data = await get("/api/gift-wrapping"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return ([], []) }
        func strings(_ key: String) -> [String] {
            guard let arr = obj[key] as? [Any] else { return [] }
            return arr.compactMap {
                if let s = $0 as? String { return s }
                if let d = $0 as? [String: Any] { return (d["name"] ?? d["label"] ?? d["title"]) as? String }
                return nil
            }
        }
        return (strings("designs"), strings("ribbonColors"))
    }

    static func codeQualitySubscribe(planId: String) async -> Bool {
        await simplePost(path: "/api/code-quality/subscribe", payload: ["planId": planId])
    }

    static func studentStatus() async -> [String: String] {
        await rawMap(path: "/api/student-discount/check")
    }

    static func studentRequest(school: String, email: String) async -> Bool {
        await simplePost(path: "/api/student-discount/request", payload: ["school": school, "email": email])
    }

    static func techResources() async -> [TechResource] {
        guard let data = await get("/api/tech-library") else { return [] }
        return Wire.array(TechResource.self, from: data, keys: ["resources", "data"])
    }

    static func techUnlock(resourceId: String, pointsCost: Int) async -> Bool {
        await simplePost(path: "/api/tech-library/download", payload: ["resourceId": resourceId, "pointsCost": pointsCost])
    }

    static func sellerStatus() async -> [String: String] {
        await rawMap(path: "/api/seller-center")
    }

    static func sellerApply(shopName: String) async -> Bool {
        await simplePost(path: "/api/seller-onboarding", payload: ["shopName": shopName])
    }

    static func openProjects() async -> [OpenProject] {
        guard let data = await get("/api/open-source/projects") else { return [] }
        return Wire.array(OpenProject.self, from: data, keys: ["projects", "data"])
    }

    static func protectionSubscribe(planId: String) async -> Bool {
        await simplePost(path: "/api/delivery-protection/subscribe", payload: ["planId": planId])
    }

    static func darkStore() async -> (info: DarkStoreInfo?, products: [Product]) {
        guard let data = await get("/api/dark-store"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return (nil, []) }
        let d = (obj["data"] as? [String: Any]) ?? obj
        let info = (try? JSONSerialization.data(withJSONObject: d)).flatMap { try? Wire.json.decode(DarkStoreInfo.self, from: $0) }
        var products: [Product] = []
        if let arr = d["products"], let dd = try? JSONSerialization.data(withJSONObject: arr) {
            products = Wire.products(from: dd)
        }
        return (info, products)
    }

    static func loyaltyCalc(amount: Double) async -> [String: String] {
        await rawMap(path: "/api/loyalty-calculator", payload: ["purchaseAmount": amount])
    }

    static func miniQuiz() async -> [QuizQuestion] {
        guard let url = URL(string: apiBase + "/api/mini-games") else { return [] }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["gameType": "quiz"])
        guard let (data, _) = try? await session.data(for: req),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [] }
        let game = obj["game"] as? [String: Any]
        let arr = (game?["questions"] ?? obj["questions"])
        guard let a = arr, let dd = try? JSONSerialization.data(withJSONObject: a) else { return [] }
        return (try? Wire.json.decode([QuizQuestion].self, from: dd)) ?? []
    }

    static func topReviewers() async -> [TopReviewer] {
        guard let data = await get("/api/review-megaphone"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [] }
        let d = (obj["data"] as? [String: Any]) ?? obj
        guard let arr = d["reviewers"], let dd = try? JSONSerialization.data(withJSONObject: arr) else { return [] }
        return (try? Wire.json.decode([TopReviewer].self, from: dd)) ?? []
    }

    static func notifications() async -> [AppNotification] {
        guard let data = await get("/api/notifications") else { return [] }
        return Wire.array(AppNotification.self, from: data, keys: ["notifications", "data"])
    }

    static func notificationsMarkAllRead() async -> Bool {
        guard let url = URL(string: apiBase + "/api/notifications") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "PUT"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["markAll": true])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func notificationPrefs() async -> [String: String] {
        await rawMap(path: "/api/notifications/preferences")
    }

    static func notificationPrefsSet(enabled: Bool) async -> Bool {
        guard let url = URL(string: apiBase + "/api/notifications/preferences") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "PUT"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["push": enabled])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func helpIndex() async -> HelpIndex? {
        guard let data = await get("/api/help") else { return nil }
        return try? Wire.json.decode(HelpIndex.self, from: data)
    }

    static func helpArticle(slug: String) async -> HelpArticle? {
        guard let data = await get("/api/help/\(slug)") else { return nil }
        return Wire.object(HelpArticle.self, from: data, keys: ["article", "data"])
    }

    static func contactInfo() async -> [String: String] {
        guard let data = await get("/api/contact"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [:] }
        let info = (obj["contact"] as? [String: Any]) ?? obj
        var out: [String: String] = [:]
        for (k, v) in info { if let s = v as? String { out[k] = s } }
        return out
    }

    static func contactSend(name: String, email: String, message: String) async -> Bool {
        await simplePost(path: "/api/contact", payload: ["name": name, "email": email, "message": message])
    }

    static func sitemap() async -> Sitemap? {
        guard let data = await get("/api/sitemap-data") else { return nil }
        return try? Wire.json.decode(Sitemap.self, from: data)
    }

    static func affiliateInfo() async -> [String: String] {
        guard let data = await get("/api/affiliate"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [:] }
        let info = ((obj["programInfo"] ?? obj["data"]) as? [String: Any]) ?? obj
        var out: [String: String] = [:]
        for (k, v) in info {
            if let s = v as? String { out[k] = s }
            else if let n = v as? NSNumber { out[k] = "\(n)" }
        }
        return out
    }

    static func affiliateJoin() async -> Bool {
        await simplePost(path: "/api/affiliate", payload: [:])
    }

    static func subscribeEmail(_ email: String) async -> Bool {
        if await simplePost(path: "/api/email-subscribe", payload: ["email": email]) { return true }
        return await simplePost(path: "/api/newsletter", payload: ["email": email])
    }

    // MARK: - Info batch
    static func stores(city: String = "") async -> [Store] {
        let path = city.isEmpty ? "/api/stores" : "/api/stores?city=\(city.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? city)"
        guard let data = await get(path) else { return [] }
        return Wire.array(Store.self, from: data, keys: ["stores", "data"])
    }

    static func priceAlerts() async -> [PriceAlert] {
        guard let data = await get("/api/price-alerts") else { return [] }
        return Wire.array(PriceAlert.self, from: data, keys: ["priceAlerts", "data"])
    }

    static func priceAlertCreate(productId: String, productName: String, targetPrice: Double) async -> Bool {
        await simplePost(path: "/api/price-alerts", payload: ["productId": productId, "productName": productName, "targetPrice": targetPrice])
    }

    static func priceAlertDelete(id: String) async -> Bool {
        guard let url = URL(string: apiBase + "/api/price-alerts") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "DELETE"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["id": id])
        guard let (data, _) = try? await session.data(for: req) else { return false }
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any], obj["error"] != nil { return false }
        return true
    }

    static func subscriptionPlans() async -> [SubscriptionPlan] {
        guard let data = await get("/api/subscriptions/plans"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [] }
        if let arr = obj["plans"] ?? obj["data"], let dd = try? JSONSerialization.data(withJSONObject: arr) {
            return (try? Wire.json.decode([SubscriptionPlan].self, from: dd)) ?? []
        }
        return (try? Wire.json.decode([SubscriptionPlan].self, from: data)) ?? []
    }

    static func digitalItems(kind: String) async -> [DigitalItem] {
        guard let data = await get("/api/digital/\(kind)") else { return [] }
        return Wire.array(DigitalItem.self, from: data, keys: ["data", kind])
    }

    static func certPrograms() async -> [CertProgram] {
        guard let data = await get("/api/certifications/programs") else { return [] }
        return Wire.array(CertProgram.self, from: data, keys: ["programs", "data"])
    }

    // MARK: - Tools wave-2
    static func taxDeductions() async -> [Deduction] {
        guard let data = await get("/api/money-savers/tax-refund") else { return [] }
        return Wire.array(Deduction.self, from: data, keys: ["deductions", "data"])
    }

    static func priceLock(productId: String) async -> Bool {
        await simplePost(path: "/api/money-savers/price-lock", payload: ["productId": productId, "depositAmount": 100, "lockDays": 30])
    }

    static func unitPriceCompare(items: [[String: Any]]) async -> [UnitPriceItem] {
        guard let url = URL(string: apiBase + "/api/utilities/unit-price-calculator") else { return [] }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["products": items])
        guard let (data, _) = try? await session.data(for: req),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let arr = obj["products"],
              let dd = try? JSONSerialization.data(withJSONObject: arr) else { return [] }
        return (try? Wire.json.decode([UnitPriceItem].self, from: dd)) ?? []
    }

    static func smartReorder(modification: String = "") async -> Bool {
        await simplePost(path: "/api/time-savers/smart-reorder", payload: ["modification": modification])
    }

    static func halalCheck(barcode: String) async -> HalalResult? {
        guard let url = URL(string: apiBase + "/api/lifestyle/halal-checker") else { return nil }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["barcode": barcode])
        guard let (data, _) = try? await session.data(for: req) else { return nil }
        return try? Wire.json.decode(HalalResult.self, from: data)
    }

    // MARK: - Tools wave-3
    static func managedSubscriptions() async -> [ManagedSubscription] {
        guard let data = await get("/api/lifestyle/subscription-manager") else { return [] }
        return Wire.array(ManagedSubscription.self, from: data, keys: ["subscriptions", "data"])
    }

    static func managedSubscriptionAdd(name: String, amount: Double, frequency: String) async -> Bool {
        await simplePost(path: "/api/lifestyle/subscription-manager", payload: ["action": "add", "subscription": ["name": name, "amount": amount, "frequency": frequency]])
    }

    static func managedSubscriptionCancel(id: String) async -> Bool {
        await simplePost(path: "/api/lifestyle/subscription-manager", payload: ["action": "cancel", "subscriptionId": id])
    }

    // MARK: - Tools wave-4
    static func smsOrder(phone: String, message: String) async -> String? {
        guard let url = URL(string: apiBase + "/api/time-savers/sms-order") else { return nil }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["phoneNumber": phone, "message": message])
        guard let (data, _) = try? await session.data(for: req),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        return (obj["reply"] ?? obj["message"]) as? String
    }

    static func shopAutocomplete(query: String) async -> [String] {
        guard let q = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let data = await get("/api/time-savers/shopping-list-autocomplete?q=\(q)"),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [] }
        let arr = (obj["suggestions"] ?? obj["data"]) as? [Any] ?? []
        return arr.compactMap {
            if let s = $0 as? String { return s }
            if let d = $0 as? [String: Any] { return d["name"] as? String }
            return nil
        }
    }

    static func trackedDocuments() async -> [TrackedDocument] {
        guard let data = await get("/api/reminders/document-expiry") else { return [] }
        return Wire.array(TrackedDocument.self, from: data, keys: ["documents", "data"])
    }

    static func trackDocument(type: String, number: String, expiry: String) async -> Bool {
        await simplePost(path: "/api/reminders/document-expiry", payload: ["documentType": type, "documentNumber": number, "expiryDate": expiry])
    }

    static func vehicles() async -> [Vehicle] {
        guard let data = await get("/api/reminders/vehicle-service") else { return [] }
        return Wire.array(Vehicle.self, from: data, keys: ["vehicles", "data"])
    }

    static func addVehicle(name: String, type: String, lastService: String, odometer: String) async -> [String: String] {
        await rawMap(path: "/api/reminders/vehicle-service", payload: ["vehicleName": name, "vehicleType": type, "lastServiceDate": lastService, "odometer": Double(odometer) ?? 0])
    }

    static func legalGenerate(type: String, jurisdiction: String, parties: String, terms: String) async -> [String: String] {
        await rawMap(path: "/api/legal/generate", payload: ["documentType": type, "jurisdiction": jurisdiction, "parties": parties, "terms": terms])
    }

    static func formCreate(title: String, fields: [String]) async -> [String: String] {
        await rawMap(path: "/api/forms/create", payload: ["title": title, "fields": fields])
    }

    static func resumeGenerate(template: String, name: String, summary: String) async -> [String: String] {
        await rawMap(path: "/api/resume/generate", payload: ["template": template, "data": ["name": name, "summary": summary]])
    }

    static func insuranceClaim(productId: String, issue: String, damageType: String) async -> [String: String] {
        guard let url = URL(string: apiBase + "/api/money-savers/insurance-claim") else { return [:] }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["productId": productId, "issue": issue, "damageType": damageType])
        guard let (data, _) = try? await session.data(for: req),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return [:] }
        var out: [String: String] = [:]
        if let m = obj["message"] as? String { out["message"] = m }
        if let claim = obj["claim"] as? [String: Any] {
            for (k, v) in claim { if let s = v as? String { out["claim \(k)"] = s } }
        }
        return out
    }

    static func orders(email: String) async -> [Order] {
        var comps = URLComponents(string: apiBase + "/api/orders")!
        comps.queryItems = [URLQueryItem(name: "email", value: email)]
        guard let url = comps.url, let (data, _) = try? await session.data(from: url) else { return [] }
        return (try? Wire.json.decode([Order].self, from: data)) ?? []
    }
}
