import SwiftUI

// MARK: - Home (full parity with web page.tsx + Android HomeScreen)
struct HomeView: View {
    @EnvironmentObject var state: AppState
    @State private var categories: [Category] = []
    @State private var deals: [Product] = []
    @State private var trending: [Product] = []
    @State private var arrivals: [Product] = []
    @State private var featured: [Product] = []
    @State private var allProducts: [Product] = []
    @State private var allPage = 1
    @State private var allPages = 1
    @State private var picks: [DailyPick] = []
    @State private var myVotes: Set<String> = []
    @State private var testimonials: [Testimonial] = []
    @State private var recommended: [Product] = []
    @State private var luxury: [Product] = []
    @State private var events: [ShopEvent] = []
    @State private var collections: [CollectionItem] = []
    @State private var posts: [BlogPost] = []
    @State private var brands: [Brand] = []
    @State private var groupBuys: [GroupBuy] = []
    @State private var drops: [Product] = []
    @State private var terms: [TrendingTerm] = []
    @State private var stats: PublicStats?
    @State private var unread = 0
    @State private var email = ""
    @State private var subscribed: Bool?
    @State private var heroPage = 0

    let heroes: [(badge: String, title: String, hi: String, desc: String, cta: String, cta2: String, route: Route, route2: Route)] = [
        ("Welcome to Grapsee Mall", "Build Your", "Digital Empire", "Premium websites, apps & DevOps  crafted by elite engineers. Your one-stop digital shopping mall.", "Shop Now", "Browse All Products", .categories, .search("")),
        ("Flash Deals Live", "Up to", "50% OFF", "Limited-time deals on Digital services. Don't miss out on the biggest sale of the season!", "Grab Deals", "View All Deals", .list(.deals), .list(.deals)),
        ("New Arrivals", "Next-Gen Tech,", "Built for You", "AI-powered tools and next-gen applications  the sharpest digital products now in one marketplace.", "Explore Tech", "Browse AI Tools", .categories, .search("")),
        ("Creative Studio", "Design That", "Actually Sells", "UI kits, brand templates & design systems built by professionals. Make your product impossible to ignore.", "Shop Designs", "Browse UI Kits", .categories, .search("")),
        ("Ship Faster", "Launch Faster.", "Grow Bigger.", "Ready-to-deploy solutions for startups and enterprises. Go from idea to live product in days, not months.", "Get Started", "View Enterprise", .categories, .search("")),
        ("Live Auctions", "Bid Smart.", "Win Big.", "Real-time auctions on premium digital products. Place your bid, track live countdowns, and claim exclusive deals.", "Join Auction", "Browse Lots", .list(.auctions), .list(.auctions)),
        ("Trusted Community", "Rated by", "Real Buyers", "Over 2,400 verified reviews from real customers. Every product rated, every seller accountable.", "Read Reviews", "Write a Review", .reviews, .reviews),
        ("Secure Checkout", "Pay Your Way,", "Always Safe.", "Card, wallet, gift card  every payment method, fully encrypted and protected. Zero-risk checkout.", "Shop Safely", "Payment Options", .categories, .search("")),
        ("Digital Downloads", "Buy Once.", "Use Forever.", "Instant download on all digital products  software, templates, ebooks, and more. Delivered in seconds.", "Browse Downloads", "View All Files", .downloads, .downloads),
        ("Loyalty Rewards", "Every Purchase", "Earns Points.", "Earn points on every order. Unlock Bronze, Silver, Gold tiers and redeem rewards in the Loyalty Mall.", "Earn Points", "View Rewards", .rewards, .rewards),
    ]

    let faqs: [(String, String)] = [
        ("How long does delivery take?", "Delivery times vary by product. Most digital services are delivered within 5-14 business days."),
        ("What payment methods do you accept?", "We accept Cash on Delivery, Bank Transfer, and Online Payments (credit/debit cards)."),
        ("Can I request a refund?", "Yes! We offer a 30-day money-back guarantee on all products."),
        ("Do you offer ongoing support?", "All purchases include 30 days of free support. Premium members get 24/7 priority support."),
        ("Can I customize a package?", "Absolutely! Use our Bundle & Save feature to combine any 3+ services and save 30%."),
        ("Is there a loyalty program?", "Yes! Join Grapsee Rewards to earn points on every purchase."),
    ]

    let floors: [(String, String, String, [String], Route)] = [
        ("💻", "Electronics & Tech", "Websites, Apps & DevOps", ["Websites", "Mobile Apps", "DevOps", "APIs"], .categories),
        ("👕", "Fashion & Lifestyle", "Design & Branding", ["UI/UX Design", "Brand Identity", "Social Media", "Graphics"], .categories),
        ("🏠", "Home & Living", "Productivity & Tools", ["Dashboards", "Analytics", "Automation", "CRM"], .categories),
        ("👑", "Premium & Luxury", "Enterprise Solutions", ["Enterprise Apps", "Cloud Infra", "AI/ML", "Consulting"], .list(.luxury)),
    ]

    var body: some View {
        NavigationStack {
            List {
                // 1. Hero
                Section {
                    TabView(selection: $heroPage) {
                        ForEach(heroes.indices, id: \.self) { i in
                            let h = heroes[i]
                            VStack(alignment: .leading, spacing: 6) {
                                Text(h.badge).font(.caption).bold().foregroundColor(.accentColor)
                                Text(h.title + " ").font(.title2) + Text(h.hi).font(.title2).bold().foregroundColor(.accentColor)
                                Text(h.desc).font(.subheadline).foregroundColor(.secondary).lineLimit(3)
                                HStack {
                                    NavigationLink(value: h.route) { Text(h.cta).font(.subheadline).bold().padding(.horizontal, 14).padding(.vertical, 8).background(Color.accentColor).foregroundColor(.white).cornerRadius(10) }
                                    NavigationLink(value: h.route2) { Text(h.cta2).font(.caption).foregroundColor(.accentColor) }
                                }
                            }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial).cornerRadius(16).tag(i)
                        }
                    }.tabViewStyle(.page(indexDisplayMode: .never)).frame(height: 210)
                    HStack {
                        Text(String(format: "%02d/%02d", heroPage + 1, heroes.count)).font(.caption).bold().foregroundColor(.secondary)
                        Spacer()
                        HStack(spacing: 4) { ForEach(heroes.indices, id: \.self) { i in Circle().fill(i == heroPage ? Color.accentColor : Color.secondary.opacity(0.3)).frame(width: i == heroPage ? 16 : 6, height: 6) } }
                    }
                }
                // 2. Categories
                if !categories.isEmpty {
                    Section("Shop by Category") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(categories.prefix(12)) { c in
                                    NavigationLink(value: Route.category(c.id, c.name)) {
                                        VStack { Text("🛍").font(.title2); Text(c.name).font(.caption).lineLimit(1).frame(width: 72) }
                                        .padding(8).background(.thinMaterial).cornerRadius(12)
                                    }
                                }
                            }
                        }
                        NavigationLink(value: Route.categories) { Text("Browse all categories").font(.caption).foregroundColor(.accentColor) }
                    }
                }
                // 3. Trending searches
                if !terms.isEmpty {
                    Section("Trending Now") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack { ForEach(terms) { t in
                                NavigationLink(value: Route.search(t.term)) { Text(t.term + t.countLabel).padding(8).background(.thinMaterial).cornerRadius(14) }
                            } }
                        }
                    }
                }
                // 4. Flash deals
                if !deals.isEmpty {
                    Section("Flash Deals") {
                        Text("Ends today!").font(.caption).foregroundColor(.red)
                        ForEach(deals.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.deals)) { Text("View All Deals").foregroundColor(.accentColor) }
                    }
                }
                // 5. Recommended
                if !recommended.isEmpty {
                    Section("Recommended For You") {
                        Text("Based on your preferences").font(.caption).foregroundColor(.secondary)
                        ForEach(recommended.prefix(6)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                    }
                }
                // 6. Live events
                if !events.isEmpty {
                    Section("Live Events") {
                        ForEach(events.prefix(3)) { e in
                            VStack(alignment: .leading) {
                                Text((e.type ?? "SALE").replacingOccurrences(of: "_", with: " ")).font(.caption).bold().foregroundColor(.accentColor)
                                Text(e.title.isEmpty ? (e.name ?? "") : e.title).font(.headline)
                            }
                        }
                        NavigationLink(value: Route.events) { Text("All Events").foregroundColor(.accentColor) }
                    }
                }
                // 7. Shop by Floor
                Section("Shop by Floor") {
                    Text("Browse like a real mall").font(.caption).foregroundColor(.secondary)
                    ForEach(Array(floors.enumerated()), id: \.offset) { _, fl in let (emoji, name, sub, tags, route) = fl
                        NavigationLink(value: route) {
                            VStack(alignment: .leading, spacing: 4) {
                                HStack { Text(emoji); VStack(alignment: .leading) { Text("Floor").font(.caption).bold().foregroundColor(.secondary); Text(name).font(.headline); Text(sub).font(.caption).foregroundColor(.secondary) } }
                                HStack { ForEach(tags, id: \.self) { t in Text(t).font(.caption).padding(.horizontal, 8).padding(.vertical, 4).background(Color.accentColor.opacity(0.1)).foregroundColor(.accentColor).cornerRadius(8) } }
                            }.padding(.vertical, 6)
                        }
                    }
                }
                // 8-9. Trending + New
                if !trending.isEmpty {
                    Section("Trending Now") {
                        ForEach(trending.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.categories) { Text("See All").foregroundColor(.accentColor) }
                    }
                }
                if !arrivals.isEmpty {
                    Section("New Arrivals") {
                        Text("\(arrivals.count) new").font(.caption).foregroundColor(.accentColor)
                        ForEach(arrivals.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.search("")) { Text("See All New").foregroundColor(.accentColor) }
                    }
                }
                // 10. Promo
                Section("Mega Sale") {
                    TabView {
                        ForEach(Array([("🔥 Mega Sale — up to 50% off", Route.list(.deals)), ("🚚 Free Delivery week", Route.search("")), ("🎁 Buy 1 Get 1", Route.list(.deals)), ("📦 Bundle & Save — 30%", Route.search("")), ("⚡ Flash Deal", Route.list(.deals)), ("👑 Premium Club", Route.list(.luxury))].enumerated()), id: \.offset) { _, pair in
                            let (title, route) = pair
                            NavigationLink(value: route) { Text(title).font(.headline).frame(maxWidth: .infinity).padding().background(.thinMaterial).cornerRadius(14) }
                        }
                    }.tabViewStyle(.page(indexDisplayMode: .never)).frame(height: 90)
                }
                // 11. Daily picks
                if !picks.isEmpty {
                    Section("Today's Picks") {
                        Text("\(picks.count) picks").font(.caption).foregroundColor(.accentColor)
                        ForEach(picks.prefix(2)) { pick in
                            if let p = pick.product {
                                HStack {
                                    NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) }
                                    Spacer()
                                    Button(myVotes.contains(pick.id) ? "▲ Voted" : "▲ Vote") {
                                        if myVotes.contains(pick.id) { myVotes.remove(pick.id) } else { myVotes.insert(pick.id) }
                                    }.font(.caption)
                                }
                            }
                        }
                        Text("🗳 \(picks.reduce(0) { $0 + $1.votes } + myVotes.count) total votes today").font(.caption).foregroundColor(.secondary)
                    }
                }
                // 12. Luxury
                if !luxury.isEmpty {
                    Section("Luxury Zone") {
                        Text("Premium tier excellence").font(.caption).foregroundColor(.secondary)
                        ForEach(luxury.prefix(3)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.luxury)) { Text("View All").foregroundColor(.accentColor) }
                    }
                }
                // Collections
                if !collections.isEmpty {
                    Section("Curated Collections") {
                        Text("Hand-picked for you").font(.caption).foregroundColor(.secondary)
                        ForEach(collections.prefix(4)) { c in
                            NavigationLink(value: Route.collection(c.id)) {
                                VStack(alignment: .leading) { Text("✨ \(c.displayTitle)").font(.headline); Text("\(c.productCount) items").font(.caption).foregroundColor(.accentColor) }
                            }
                        }
                        NavigationLink(value: Route.collections) { Text("View All").foregroundColor(.accentColor) }
                    }
                }
                // Voucher + VIP
                Section("Rewards") {
                    NavigationLink(value: Route.voucher) { Label("Voucher Center · Save more with coupons", systemImage: "tag") }
                    NavigationLink(value: Route.vip) { Label("VIP Club · Exclusive perks & rewards", systemImage: "crown") }
                    NavigationLink(value: Route.rewards) { Label("My Rewards", systemImage: "trophy") }
                }
                // Featured
                if !featured.isEmpty {
                    Section("Featured Products") {
                        ForEach(featured.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.featured)) { Text("View All").foregroundColor(.accentColor) }
                    }
                }
                // Recently viewed
                if !state.recent.isEmpty {
                    Section("Recently Viewed") {
                        ForEach(state.recent.reversed().prefix(5)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                    }
                }
                // Stats
                Section("Trusted Worldwide") {
                    Text("Numbers that speak for themselves").font(.caption).foregroundColor(.secondary)
                    HStack {
                        StatCell(value: "\(stats?.users ?? 0)", label: "Happy Customers")
                        StatCell(value: "\(stats?.products ?? allProducts.count)", label: "Products")
                        StatCell(value: "99.9%", label: "Uptime")
                    }
                    HStack {
                        StatCell(value: "24/7", label: "Support")
                        StatCell(value: stats.map { String(format: "%.1f", $0.averageRating) } ?? "—", label: "Rating")
                        StatCell(value: "\(stats?.totalReviews ?? 0)", label: "Reviews")
                    }
                }
                // All products
                if !allProducts.isEmpty {
                    Section("All Products") {
                        Text("\(allProducts.count) items").font(.caption).foregroundColor(.accentColor)
                        ForEach(allProducts) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        if allPage < allPages {
                            Button("Load more") {
                                Task { let next = allPage + 1; let res = await API.products(page: next); allProducts += res.items; allPage = next }
                            }
                        }
                    }
                }
                // Testimonials
                if !testimonials.isEmpty {
                    Section("What Clients Say") {
                        TabView {
                            ForEach(testimonials) { t in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(String(repeating: "★", count: max(0, min(5, Int(t.rating))))).font(.caption).foregroundColor(.yellow)
                                    Text(t.text).font(.subheadline).lineLimit(5)
                                    Text("\(t.name)\([t.role, t.company].compactMap { $0 }.joined(separator: ", "))").font(.caption).foregroundColor(.accentColor)
                                }.padding().background(.thinMaterial).cornerRadius(14)
                            }
                        }.tabViewStyle(.page(indexDisplayMode: .never)).frame(height: 170)
                    }
                }
                // Blog
                if !posts.isEmpty {
                    Section("From Our Blog") {
                        Text("Tips, news & insights").font(.caption).foregroundColor(.secondary)
                        ForEach(posts.prefix(2)) { post in
                            NavigationLink(value: Route.blogPost(post.slug.isEmpty ? post.id : post.slug)) {
                                VStack(alignment: .leading) { Text(post.title).font(.subheadline); Text(post.excerpt ?? "").font(.caption).foregroundColor(.secondary).lineLimit(2) }
                            }
                        }
                        NavigationLink(value: Route.blog) { Text("Read More").foregroundColor(.accentColor) }
                    }
                }
                // Community
                Section("Community") {
                    NavigationLink(value: Route.community) { Label("Join the Community", systemImage: "person.3") }
                    NavigationLink(value: Route.live) { Label("Live Shopping", systemImage: "dot.radiowaves.left.and.right") }
                    NavigationLink(value: Route.forum) { Label("Forum", systemImage: "bubble.left.and.bubble.right") }
                }
                // FAQ
                Section("Help Center") {
                    Text("Frequently asked questions").font(.caption).foregroundColor(.secondary)
                    ForEach(Array(faqs.enumerated()), id: \.offset) { _, qa in DisclosureGroup(qa.0) { Text(qa.1).font(.subheadline).foregroundColor(.secondary) } }
                    NavigationLink(value: Route.contact) { Text("Contact Support").foregroundColor(.accentColor) }
                }
                // Brands
                if !brands.isEmpty {
                    Section("Shop by Brand") {
                        Text("Top brands you trust").font(.caption).foregroundColor(.secondary)
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack { ForEach(brands.prefix(8)) { b in Text(b.name).padding(8).background(.thinMaterial).cornerRadius(12) } }
                        }
                        NavigationLink(value: Route.brands) { Text("View All").foregroundColor(.accentColor) }
                    }
                }
                // Newsletter
                Section("Stay in the Loop") {
                    Text("Get exclusive deals, new arrivals & 10% off your first order.").font(.caption).foregroundColor(.secondary)
                    HStack {
                        Text("🎁 10% Off First Order").font(.caption).padding(6).background(Color.accentColor.opacity(0.1)).foregroundColor(.accentColor).cornerRadius(12)
                        Text("✨ Early Access").font(.caption).padding(6).background(Color.accentColor.opacity(0.1)).foregroundColor(.accentColor).cornerRadius(12)
                    }
                    TextField("Enter your email", text: $email)
                    Button("Subscribe") { Task { subscribed = await API.subscribeEmail(email) } }.disabled(!email.contains("@"))
                    if let s = subscribed { Text(s ? "✅ Subscribed! Your code: WELCOME10" : "❌ Failed").font(.caption).bold(s) }
                }
                // Rewards tiers
                Section("Grapsee Rewards") {
                    Text("Join & unlock exclusive benefits").font(.caption).foregroundColor(.secondary)
                    Text("🛡 Bronze · ⭐ Silver · 👑 Gold · 🏆 Platinum · 💎 Diamond").font(.caption)
                    NavigationLink(value: Route.rewards) { Text("🏆 Start Earning Points →").foregroundColor(.accentColor) }
                }
                // Quick Actions
                Section("Quick Actions") {
                    NavigationLink(value: Route.track) { Label("Track Order", systemImage: "box") }
                    NavigationLink(value: Route.returns) { Label("Returns", systemImage: "arrow.uturn.left") }
                    NavigationLink(value: Route.contact) { Label("Contact", systemImage: "message") }
                    NavigationLink(value: Route.notifications) { Label("Notifications\(unread > 0 ? " (\(unread))" : "")", systemImage: "bell") }
                    NavigationLink(value: Route.help) { Label("View Help Center", systemImage: "questionmark.circle") }
                }
                // Reviews card
                Section("Customer Reviews") {
                    Text("4.8 ★ · Based on verified customer reviews").font(.subheadline)
                    NavigationLink(value: Route.reviews) { Text("See All").foregroundColor(.accentColor) }
                }
                // Quick Links
                Section("Quick Links") {
                    NavigationLink(value: Route.list(.bundles)) { Text("Bundles") }
                    NavigationLink(value: Route.styleguide) { Text("Style Guide") }
                    NavigationLink(value: Route.affiliate) { Text("Affiliate") }
                    NavigationLink(value: Route.sitemap) { Text("Sitemap") }
                }
                // Group Buy
                if !groupBuys.isEmpty {
                    Section("Group Buy") {
                        ForEach(groupBuys.prefix(2)) { g in NavigationLink(value: Route.groupbuy) { Text("\(g.displayTitle)").font(.subheadline) } }
                    }
                } else {
                    Section("Group Buy") {
                        NavigationLink(value: Route.groupbuy) { Text("Buy Together, Save Together · Up to 60% off").font(.subheadline) }
                    }
                }
                // Price drops
                if !drops.isEmpty {
                    Section("Price Drop Alerts") {
                        Text("Track price drops on your favorite items").font(.caption).foregroundColor(.secondary)
                        ForEach(drops.prefix(3)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.pricedrop) { Text("Track drops").foregroundColor(.accentColor) }
                    }
                }
                // Services
                Section("Services") {
                    NavigationLink(value: Route.installments) { Label("Installments · 0% EMI", systemImage: "creditcard") }
                    NavigationLink(value: Route.tradein) { Label("Trade-In · up to 55%", systemImage: "arrow.triangle.2.circlepath") }
                    NavigationLink(value: Route.trybuy) { Label("Try Before You Buy", systemImage: "house") }
                    NavigationLink(value: Route.mystery) { Label("Mystery Reward", systemImage: "gift") }
                    NavigationLink(value: Route.downloads) { Label("Digital Downloads", systemImage: "arrow.down.circle") }
                    NavigationLink(value: Route.outfit) { Label("Outfit Maker", systemImage: "tshirt") }
                    NavigationLink(value: Route.rental) { Label("Rent Products", systemImage: "key") }
                    NavigationLink(value: Route.giftwrap) { Label("Gift Wrap", systemImage: "gift") }
                    NavigationLink(value: Route.seller) { Label("Become a Seller · Earn up to 95%", systemImage: "storefront") }
                    NavigationLink(value: Route.topreviewers) { Label("Top Reviewers", systemImage: "megaphone") }
                }
                Section("More Features") {
                    NavigationLink(value: Route.videos) { Label("Videos", systemImage: "play.circle") }
                    NavigationLink(value: Route.quiz) { Label("Quiz", systemImage: "questionmark.circle") }
                    NavigationLink(value: Route.shipping) { Label("Shipping Calc", systemImage: "truck") }
                    NavigationLink(value: Route.darkstore) { Label("Dark Store", systemImage: "moon") }
                    NavigationLink(value: Route.loyaltycalc) { Label("Loyalty Calc", systemImage: "function") }
                    NavigationLink(value: Route.minigames) { Label("Mini Games", systemImage: "gamecontroller") }
                }
                Section {
                    Text("🏬 Grapsee Shop").font(.headline)
                    Text("Websites, apps & digital services — one mall").font(.caption).foregroundColor(.secondary)
                    Text("© Grapsee Shop · Powered by captainpiracy.shop").font(.caption).foregroundColor(.secondary)
                }
            }
            .navigationTitle("Grapsee Mall")
            .toolbar { NavigationLink(value: Route.search("")) { Image(systemName: "magnifyingglass") } }
            .navigationDestination(for: Route.self) { route in HomeDestination(route: route) }
            .task {
                async let c = API.categories(), d = API.products(flags: ["deals": "true"]),
                           t = API.products(flags: ["trending": "true"]), n = API.products(flags: ["new": "true"]),
                           f = API.products(flags: ["featured": "true"]), all = API.products(page: 1),
                           p = API.todaysPicks(), r = API.reviews(), rec = API.recommended(),
                           lx = API.luxury(limit: 6), ev = API.events(),
                           cols = API.collections(), bp = API.blogPosts(), br = API.brands(),
                           gb = API.groupBuys(), pd = API.priceDrops(),
                           tt = API.trendingSearches(), st = API.publicStats(),
                           tm = API.testimonials()
                categories = await c; deals = await d.items; trending = await t.items
                arrivals = await n.items; featured = await f.items
                let a = await all; allProducts = a.items; allPages = a.totalPages
                picks = await p; recommended = await rec
                luxury = await lx; events = await ev
                collections = await cols; posts = await bp; brands = await br
                groupBuys = await gb; drops = await pd
                terms = await tt; stats = await st; testimonials = await tm
                if let notes = await API.notifications() as [AppNotification]? { unread = notes.filter { !$0.seen }.count }
            }
            .refreshable {
                let a = await API.products(page: 1)
                allProducts = a.items; allPage = 1; allPages = a.totalPages
            }
        }
    }
}

struct HeroSlide: View {
    let badge: String
    let title: String
    let hi: String
    let desc: String
    let cta: String
    let cta2: String
    let route: Route
    let route2: Route
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(badge).font(.caption).bold().foregroundColor(.accentColor)
            Text(title + " ").font(.title2) + Text(hi).font(.title2).bold().foregroundColor(.accentColor)
            Text(desc).font(.subheadline).foregroundColor(.secondary).lineLimit(3)
            HStack {
                NavigationLink(value: route) { Text(cta).font(.subheadline).bold().padding(.horizontal, 14).padding(.vertical, 8).background(Color.accentColor).foregroundColor(.white).cornerRadius(10) }
                NavigationLink(value: route2) { Text(cta2).font(.caption).foregroundColor(.accentColor) }
            }
        }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial).cornerRadius(16)
    }
}

struct StatCell: View {
    let value: String
    let label: String
    var body: some View {
        VStack { Text(value).font(.headline); Text(label).font(.caption).foregroundColor(.secondary) }
        .frame(maxWidth: .infinity)
    }
}

// Shared destination map so Home, Explore and Profile stay identical.
struct HomeDestination: View {
    let route: Route
    var body: some View {
        switch route {
        case .product(let id): ProductDetailView(id: id)
        case .list(let mode): ProductListView(mode: mode)
        case .category(let id, let name): CategoryView(id: id, name: name)
        case .categories: CategoriesView()
        case .search(let q): SearchView(initial: q)
        case .collections: CollectionsView()
        case .collection(let id): CollectionDetailView(id: id)
        case .blog: BlogView()
        case .blogPost(let slug): BlogPostView(slug: slug)
        case .brands: BrandsView()
        case .reviews: ReviewsView()
        case .community: CommunityView()
        case .events: EventsView()
        case .forum: ForumView()
        case .forumTopic(let id): ForumTopicView(id: id)
        case .videos: VideosView()
        case .quiz: QuizView()
        case .live: LiveView()
        case .voucher: VoucherView()
        case .vip: VipView()
        case .wallet: WalletView()
        case .checkin: CheckinView()
        case .mystery: MysteryView()
        case .loyalty: LoyaltyView()
        case .giftcards: GiftCardsView()
        case .referrals: ReferralsView()
        case .rewards: RewardsFullView()
        case .track: TrackView()
        case .returns: ReturnsView()
        case .shipping: ShippingView()
        case .installments: InstallmentsView()
        case .tradein: TradeInView()
        case .trybuy: TryView()
        case .outfit: OutfitMakerView()
        case .rental: RentalView()
        case .downloads: DownloadsView()
        case .groupbuy: GroupBuyView()
        case .pricedrop: PriceDropView()
        case .giftwrap: GiftWrapView()
        case .codequality: CodeQualityView()
        case .student: StudentView()
        case .warranty: WarrantyView()
        case .techlib: TechLibraryView()
        case .seller: SellerView()
        case .opensource: OpenSourceView()
        case .shield: DeliveryShieldView()
        case .darkstore: DarkStoreView()
        case .loyaltycalc: LoyaltyCalcView()
        case .minigames: MiniGamesView()
        case .topreviewers: TopReviewersView()
        case .styleguide: StyleGuideView()
        case .notifications: NotificationsView()
        case .help: HelpView()
        case .helpArticle(let slug): HelpArticleView(slug: slug)
        case .contact: ContactView()
        case .sitemap: SitemapView()
        case .settings: SettingsView()
        case .affiliate: AffiliateView()
        case .emailsub: EmailSubscribeView()
        case .about: AboutView()
        case .privacy: PrivacyView()
        case .terms: TermsView()
        case .faqfull: FaqFullView()
        case .compare: CompareView()
        case .recentfull: RecentFullView()
        case .stores: StoresView()
        case .pricealerts: PriceAlertsView()
        case .subscriptions: SubscriptionsView()
        case .digital: DigitalHubView()
        case .certs: CertificationsView()
        case .features: FeaturesDirectoryView()
        case .emi: EmiView()
        case .currency: CurrencyView()
        case .tipcalc: TipCalcView()
        case .fuel: FuelView()
        case .measure: MeasureView()
        case .carbon: CarbonView()
        case .roi: RoiCalcView()
        case .resale: ResaleView()
        case .instcompare: InstallmentCompareView()
        case .taxrefund: TaxRefundView()
        case .pricelock: PriceLockView()
        case .unitprice: UnitPriceView()
        case .smartreorder: SmartReorderView()
        case .giftmatcher: GiftMatcherView()
        case .stylequiz: StyleQuizView()
        case .allergy: AllergyView()
        case .halal: HalalView()
        case .submanager: SubManagerView()
        case .coloradvisor: ColorAdvisorView()
        case .sizepredictor: SizePredictorView()
        case .discountstack: DiscountStackView()
        case .dealauth: DealAuthView()
        case .speccompare: SpecCompareView()
        case .smsorder: SmsOrderView()
        case .shopautocomplete: ShopAutocompleteView()
        case .docexpiry: DocExpiryView()
        case .vehicle: VehicleView()
        case .legaldocs: LegalDocsView()
        case .formbuilder: FormBuilderView()
        case .resumebuilder: ResumeBuilderView()
        case .insurance: InsuranceView()
        case .aitools: AiToolsView()
        case .aichat: AiChatView()
        case .audits: AuditsView()
        case .guides: GuidesView()
        case .cicd: CicdView()
        case .envsetup: EnvSetupView()
        case .dbschemas: DbSchemasView()
        case .notion: NotionView()
        case .tutorials: TutorialsView()
        case .web(let path): WebFallbackView(path: path)
        }
    }
}

// MARK: - Explore (quick menu; commerce batch routes go native)
struct ExploreView: View {
    let groups: [(String, [(String, Route)])] = [
        ("Search", [("Search Products", .search("")), ("All Categories", .categories)]),
        ("Shop", [("Flash Sale", .list(.flashSale)), ("Deals", .list(.deals)), ("Collections", .collections),
                  ("Luxury Zone", .list(.luxury)), ("Auctions", .list(.auctions)), ("Pre-order", .list(.preorder)), ("Bundles", .list(.bundles))]),
        ("Content", [("Blog", .blog), ("Brands", .brands), ("Reviews", .reviews), ("Community", .community),
                        ("Events", .events), ("Forum", .forum), ("Videos", .videos), ("Quiz", .quiz), ("Live", .live)]),
        ("Community", [("Community", .community), ("Live Shopping", .live), ("Blog", .blog),
                        ("Reviews", .reviews), ("Affiliate", .web("/affiliate"))]),
        ("Orders", [("Track Order", .track), ("Returns", .returns), ("Shipping Calculator", .shipping),
                        ("Installments", .installments), ("Trade-In", .tradein), ("Try Before You Buy", .trybuy),
                        ("Outfit Maker", .outfit), ("Rent Products", .rental), ("Digital Downloads", .downloads),
                        ("Group Buy", .groupbuy), ("Price Drops", .pricedrop)]),
        ("Services", [("Gift Wrap", .giftwrap), ("Code Quality", .codequality), ("Student", .student),
                        ("Warranty", .warranty), ("Tech Library", .techlib), ("Seller Center", .seller),
                        ("Open Source", .opensource), ("Protection", .shield), ("Dark Store", .darkstore),
                        ("Loyalty Calc", .loyaltycalc), ("Mini Games", .minigames), ("Top Reviewers", .topreviewers),
                        ("Track Order", .track), ("Support", .help)]),
        ("Account", [("Notifications", .notifications), ("Help Center", .help), ("Contact", .contact),
                        ("Sitemap", .sitemap), ("Settings", .settings), ("Affiliate", .affiliate),
                        ("Email Alerts", .emailsub), ("Style Guide", .styleguide)]),
        ("Rewards", [("Rewards", .rewards), ("Voucher Center", .voucher), ("VIP Club", .vip), ("Wallet", .wallet),
                        ("Daily Check-in", .checkin), ("Mystery Reward", .mystery), ("Gift Cards", .giftcards),
                        ("Referrals", .referrals)]),
        ("Info", [("About", .about), ("Privacy", .privacy), ("Terms", .terms), ("FAQ", .faqfull),
                        ("Compare", .compare), ("Recently Viewed", .recentfull), ("Stores", .stores),
                        ("Price Alerts", .pricealerts), ("Subscriptions", .subscriptions), ("Digital", .digital),
                        ("Certifications", .certs), ("All Features", .features)]),
        ("Calculators", [("EMI", .emi), ("Currency", .currency), ("Tip", .tipcalc), ("Fuel", .fuel),
                        ("Measure", .measure), ("Carbon", .carbon), ("ROI", .roi), ("Resale", .resale),
                        ("Installments", .instcompare)]),
    ]
    var body: some View {
        NavigationStack {
            List {
                ForEach(Array(groups.enumerated()), id: \.offset) { _, group in
                    Section(group.0) {
                        ForEach(Array(group.1.enumerated()), id: \.offset) { _, link in
                            NavigationLink(value: link.1) { Text(link.0) }
                        }
                    }
                }
            }
            .navigationTitle("Explore")
            .navigationDestination(for: Route.self) { route in HomeDestination(route: route) }
        }
    }
}

// MARK: - Cart / Wishlist / Profile
struct CartView: View {
    @EnvironmentObject var state: AppState
    var body: some View {
        NavigationStack {
            Group {
                if state.cart.isEmpty {
                    ContentUnavailableView("Cart is empty", systemImage: "cart", description: Text("Add products to get started"))
                } else {
                    List {
                        ForEach(state.cart) { line in
                            HStack { VStack(alignment: .leading) { Text(line.name).lineLimit(1); Text("Qty \(String(format: "%.2f", line.quantity)").font(.caption).foregroundColor(.secondary) }; Spacer(); Text("$\(line.price * Double(line.quantity)))").bold() }
                        }
                        NavigationLink(value: Route.web("/checkout/preview")) { Text("Checkout").bold().foregroundColor(.accentColor) }
                    }
                }
            }
            .navigationTitle("Cart")
            .navigationDestination(for: Route.self) { route in HomeDestination(route: route) }
        }
    }
}

struct WishlistView: View {
    @EnvironmentObject var state: AppState
    var body: some View {
        NavigationStack {
            Group {
                if state.wishlist.isEmpty {
                    ContentUnavailableView("No favorites yet", systemImage: "heart", description: Text("Tap the heart on any product"))
                } else {
                    WishlistListView(ids: state.wishlist)
                }
            }
            .navigationTitle("Wishlist")
            .navigationDestination(for: Route.self) { route in HomeDestination(route: route) }
        }
    }
}

struct WishlistListView: View {
    let ids: [String]
    var body: some View {
        List(ids, id: \.self) { id in
            NavigationLink(value: Route.product(id)) {
                WishlistRow(id: id)
            }
        }
    }
}

struct WishlistRow: View {
    @EnvironmentObject var state: AppState
    let id: String
    var body: some View {
        if let m = state.wishmeta[id] {
            VStack(alignment: .leading) {
                Text(m.name).font(.subheadline).lineLimit(1)
                PriceText(price: m.price, compare: m.compare)
            }
        } else {
            Text(id).lineLimit(1)
        }
    }
}

struct ProfileView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink(value: Route.web("/orders")) { Label("Orders", systemImage: "box") }
                NavigationLink(value: Route.rewards) { Label("Rewards", systemImage: "trophy") }
                NavigationLink(value: Route.wallet) { Label("Wallet", systemImage: "wallet.pass") }
                NavigationLink(value: Route.notifications) { Label("Notifications", systemImage: "bell") }
                NavigationLink(value: Route.settings) { Label("Settings", systemImage: "gear") }
                NavigationLink(value: Route.help) { Label("Help Center", systemImage: "questionmark.circle") }
            }
            .navigationTitle("Profile")
            .navigationDestination(for: Route.self) { route in HomeDestination(route: route) }
        }
    }
}
