import SwiftUI

// MARK: - Home (full parity with web page.tsx §1–23 + Android HomeScreen)
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
    @State private var reviews: [ReviewItem] = []
    @State private var recommended: [Product] = []
    @State private var luxury: [Product] = []
    @State private var events: [ShopEvent] = []
    @State private var collections: [CollectionItem] = []
    @State private var posts: [BlogPost] = []
    @State private var brands: [Brand] = []
    @State private var groupBuys: [GroupBuy] = []
    @State private var drops: [Product] = []
    @State private var email = ""
    @State private var subscribed: Bool?

    let faqs: [(String, String)] = [
        ("How long does delivery take?", "Most digital services deliver in 5–14 business days. Enterprise packages may take 3–4 weeks."),
        ("What payment methods do you accept?", "Cash on Delivery, Bank Transfer, and Online Payments (credit/debit cards)."),
        ("Can I request a refund?", "Yes — 30-day money-back guarantee on all products."),
        ("Do you offer ongoing support?", "30 days free with every purchase; VIP members get 24/7 priority support."),
        ("Can I customize a package?", "Use Bundle & Save on any 3+ services, or contact us for enterprise solutions."),
        ("Is there a loyalty program?", "Join Grapsee Rewards to earn points redeemable for discounts and perks."),
    ]

    var body: some View {
        NavigationStack {
            List {
                // 1. Hero
                Section {
                    TabView {
                        HeroSlide(badge: "Welcome to Grapsee Mall", title: "Build Your Digital Empire", desc: "Premium websites, apps & DevOps — your one-stop digital mall.", cta: "Shop Now", route: .categories)
                        HeroSlide(badge: "Flash Deals Live", title: "Up to 50% OFF", desc: "Limited-time deals on digital services.", cta: "Grab Deals", route: .list(.flashSale))
                        HeroSlide(badge: "New Arrivals", title: "Next-Gen Tech, Built for You", desc: "AI-powered tools and next-gen applications.", cta: "Explore Tech", route: .list(.new))
                        HeroSlide(badge: "Creative Studio", title: "Design That Actually Sells", desc: "UI kits, brand templates & design systems.", cta: "Shop Designs", route: .downloads)
                    }.tabViewStyle(.page).frame(height: 170)
                }
                // 2. Categories
                if !categories.isEmpty {
                    Section("Categories") {
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
                Section("Trending Searches") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack { ForEach(["websites","mobile apps","devops","UI/UX design","AI/ML"], id: \.self) { t in
                            NavigationLink(value: Route.search(t)) { Text(t).padding(8).background(.thinMaterial).cornerRadius(14) }
                        } }
                    }
                }
                // 4. Flash deals
                if !deals.isEmpty {
                    Section("Flash Deals") {
                        Text("Ends at midnight").font(.caption).foregroundColor(.red)
                        ForEach(deals.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.deals)) { Text("See all").foregroundColor(.accentColor) }
                    }
                }
                // 5. Recommended
                let recs = recommended.isEmpty ? Array(trending.prefix(4)) : Array(recommended.prefix(4))
                if !recs.isEmpty {
                    Section("Recommended For You") {
                        ForEach(recs) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
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
                    NavigationLink(value: Route.list(.luxury)) { Label("Premium & Luxury", systemImage: "crown") }
                    NavigationLink(value: Route.collections) { Label("Curated Collections", systemImage: "square.grid.2x2") }
                    NavigationLink(value: Route.categories) { Label("All Departments", systemImage: "building.2") }
                }
                // 8–9. Trending + New
                if !trending.isEmpty {
                    Section("Trending Now") {
                        ForEach(trending.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.trending)) { Text("See all").foregroundColor(.accentColor) }
                    }
                }
                if !arrivals.isEmpty {
                    Section("New Arrivals") {
                        ForEach(arrivals.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.new)) { Text("See all new").foregroundColor(.accentColor) }
                    }
                }
                // 10. Promo carousel
                Section("Mega Sale") {
                    TabView {
                        ForEach([("🔥 Mega Sale — up to 50% off", Route.list(.deals)), ("🚚 Free Delivery week", Route.search("")), ("🎁 Buy 1 Get 1", Route.list(.deals)), ("⚡ Flash deals", Route.list(.flashSale)), ("👑 Premium Club", Route.vip)], id: \.0) { title, route in
                            NavigationLink(value: route) { Text(title).font(.headline).frame(maxWidth: .infinity).padding().background(.thinMaterial).cornerRadius(14) }
                        }
                    }.tabViewStyle(.page).frame(height: 90)
                }
                // 11. Daily picks
                if !picks.isEmpty {
                    Section("Today's Picks") {
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
                    }
                }
                // 12. Luxury
                if !luxury.isEmpty {
                    Section("Luxury Zone") {
                        ForEach(luxury.prefix(3)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.luxury)) { Text("Explore Luxury").foregroundColor(.accentColor) }
                    }
                }
                // Collections
                if !collections.isEmpty {
                    Section("Curated Collections") {
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
                    NavigationLink(value: Route.voucher) { Label("Voucher Center", systemImage: "tag") }
                    NavigationLink(value: Route.vip) { Label("VIP Club", systemImage: "crown") }
                    NavigationLink(value: Route.rewards) { Label("My Rewards", systemImage: "trophy") }
                }
                // 13–14. Featured + Recently viewed
                if !featured.isEmpty {
                    Section("Featured Products") {
                        ForEach(featured.prefix(4)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.list(.featured)) { Text("View All").foregroundColor(.accentColor) }
                    }
                }
                if !state.recent.isEmpty {
                    Section("Recently Viewed") {
                        ForEach(state.recent.reversed().prefix(5)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                    }
                }
                // Stats
                Section("Trusted Worldwide") {
                    HStack {
                        StatCell(value: "\(allProducts.count)+", label: "Products")
                        StatCell(value: "99.9%", label: "Uptime")
                        StatCell(value: "24/7", label: "Support")
                    }
                }
                // 16. All products
                if !allProducts.isEmpty {
                    Section("All Products") {
                        ForEach(allProducts) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        if allPage < allPages {
                            Button("Load more") {
                                Task {
                                    let next = allPage + 1
                                    let res = await API.products(page: next)
                                    allProducts += res.items; allPage = next
                                }
                            }
                        }
                    }
                }
                // 17. Testimonials
                if !reviews.isEmpty {
                    Section("What Members Say") {
                        ForEach(reviews.prefix(3)) { r in
                            VStack(alignment: .leading) {
                                Text(r.body ?? "").font(.subheadline).lineLimit(2)
                                Text(r.author ?? "Member").font(.caption).foregroundColor(.secondary)
                            }
                        }
                        NavigationLink(value: Route.reviews) { Text("All reviews · 4.8 ★").foregroundColor(.accentColor) }
                    }
                }
                // Blog
                if !posts.isEmpty {
                    Section("From the Blog") {
                        ForEach(posts.prefix(2)) { post in
                            NavigationLink(value: Route.blogPost(post.slug.isEmpty ? post.id : post.slug)) {
                                VStack(alignment: .leading) { Text(post.title).font(.subheadline); Text(post.excerpt ?? "").font(.caption).foregroundColor(.secondary).lineLimit(2) }
                            }
                        }
                        NavigationLink(value: Route.blog) { Text("Read All").foregroundColor(.accentColor) }
                    }
                }
                // Community + Live
                Section("Community") {
                    NavigationLink(value: Route.community) { Label("Join the Community", systemImage: "person.3") }
                    NavigationLink(value: Route.live) { Label("Live Shopping", systemImage: "dot.radiowaves.left.and.right") }
                    NavigationLink(value: Route.forum) { Label("Forum", systemImage: "bubble.left.and.bubble.right") }
                }
                // 19. FAQ
                Section("Help Center") {
                    ForEach(faqs, id: \.0) { q, a in
                        DisclosureGroup(q) { Text(a).font(.subheadline).foregroundColor(.secondary) }
                    }
                    NavigationLink(value: Route.help) { Text("More help").foregroundColor(.accentColor) }
                }
                // 20. Brands
                if !brands.isEmpty {
                    Section("Top Brands") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack { ForEach(brands.prefix(8)) { b in Text(b.name).padding(8).background(.thinMaterial).cornerRadius(12) } }
                        }
                        NavigationLink(value: Route.brands) { Text("All Brands").foregroundColor(.accentColor) }
                    }
                }
                // 21. Newsletter
                Section("Stay in the Loop") {
                    TextField("Enter your email", text: $email)
                    Button("Subscribe") { Task { subscribed = await API.subscribeEmail(email) } }.disabled(!email.contains("@"))
                    if let s = subscribed { Text(s ? "✅ You're in!" : "❌ Failed").font(.caption) }
                }
                // Quick help + links
                Section("Quick Help") {
                    NavigationLink(value: Route.track) { Label("Track Order", systemImage: "box") }
                    NavigationLink(value: Route.returns) { Label("Returns", systemImage: "arrow.uturn.left") }
                    NavigationLink(value: Route.contact) { Label("Contact", systemImage: "message") }
                }
                Section("Quick Links") {
                    NavigationLink(value: Route.list(.bundles)) { Text("Bundles") }
                    NavigationLink(value: Route.styleguide) { Text("Style Guide") }
                    NavigationLink(value: Route.affiliate) { Text("Affiliate") }
                    NavigationLink(value: Route.sitemap) { Text("Sitemap") }
                }
                // Group buy + price drops
                if !groupBuys.isEmpty {
                    Section("Group Buy") {
                        ForEach(groupBuys.prefix(2)) { g in
                            NavigationLink(value: Route.groupbuy) { Text(g.displayTitle).font(.subheadline) }
                        }
                    }
                }
                if !drops.isEmpty {
                    Section("Price Drops") {
                        ForEach(drops.prefix(3)) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                        NavigationLink(value: Route.pricedrop) { Text("Track drops").foregroundColor(.accentColor) }
                    }
                }
                // Service tiles
                Section("Services") {
                    NavigationLink(value: Route.installments) { Label("Installments · 0% EMI", systemImage: "creditcard") }
                    NavigationLink(value: Route.tradein) { Label("Trade-In · up to 55%", systemImage: "arrow.triangle.2.circlepath") }
                    NavigationLink(value: Route.trybuy) { Label("Try Before You Buy", systemImage: "house") }
                    NavigationLink(value: Route.mystery) { Label("Mystery Reward", systemImage: "gift") }
                    NavigationLink(value: Route.downloads) { Label("Digital Downloads", systemImage: "arrow.down.circle") }
                    NavigationLink(value: Route.outfit) { Label("Outfit Maker", systemImage: "tshirt") }
                    NavigationLink(value: Route.rental) { Label("Rent Products", systemImage: "key") }
                    NavigationLink(value: Route.giftwrap) { Label("Gift Wrap", systemImage: "gift") }
                    NavigationLink(value: Route.seller) { Label("Become a Seller", systemImage: "storefront") }
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
                // Footer
                Section { Text("Grapsee Mall · you've seen it all ✨").font(.caption).foregroundColor(.secondary) }
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
                           gb = API.groupBuys(), pd = API.priceDrops()
                categories = await c; deals = await d.items; trending = await t.items
                arrivals = await n.items; featured = await f.items
                let a = await all; allProducts = a.items; allPages = a.totalPages
                picks = await p; reviews = await r; recommended = await rec
                luxury = await lx; events = await ev
                collections = await cols; posts = await bp; brands = await br
                groupBuys = await gb; drops = await pd
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
    let desc: String
    let cta: String
    let route: Route
    var body: some View {
        NavigationLink(value: route) {
            VStack(alignment: .leading, spacing: 6) {
                Text(badge).font(.caption).bold().foregroundColor(.accentColor)
                Text(title).font(.title2).bold()
                Text(desc).font(.subheadline).foregroundColor(.secondary).lineLimit(2)
                Text(cta).font(.subheadline).bold().padding(.horizontal, 14).padding(.vertical, 8)
                    .background(Color.accentColor).foregroundColor(.white).cornerRadius(10)
            }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial).cornerRadius(16)
        }
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
        case .digital: DigitalHubView()
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
                ForEach(groups, id: \.0) { title, links in
                    Section(title) {
                        ForEach(links, id: \.0) { label, route in
                            NavigationLink(value: route) { Text(label) }
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
                            HStack { VStack(alignment: .leading) { Text(line.name).lineLimit(1); Text("Qty \(line.quantity)").font(.caption).foregroundColor(.secondary) }; Spacer(); Text("$\(line.price * Double(line.quantity), specifier: "%.2f")").bold() }
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
            if state.wishlist.isEmpty {
                ContentUnavailableView("No favorites yet", systemImage: "heart", description: Text("Tap the heart on any product"))
            } else {
                List(state.wishlist, id: \.self) { id in NavigationLink(value: Route.product(id)) { Text(id).lineLimit(1) } }
                    .navigationDestination(for: Route.self) { route in HomeDestination(route: route) }
            }
        }.navigationTitle("Wishlist")
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
