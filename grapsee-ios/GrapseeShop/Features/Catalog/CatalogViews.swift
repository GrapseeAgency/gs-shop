import SwiftUI

// MARK: - Native listing (mirrors Android ProductListScreen modes)
enum ListMode: String, CaseIterable {
    case deals, trending, featured, newArrivals = "new"
    case flashSale = "flash-sale", luxury, auctions, preorder, bundles

    var title: String {
        switch self {
        case .deals: return "Deals"
        case .trending: return "Trending Now"
        case .featured: return "Featured"
        case .newArrivals: return "New Arrivals"
        case .flashSale: return "Flash Sale"
        case .luxury: return "Luxury Zone"
        case .auctions: return "Auctions"
        case .preorder: return "Pre-order"
        case .bundles: return "Bundles"
        }
    }

    func load(page: Int) async -> [Product] {
        switch self {
        case .deals: return await API.products(page: page, flags: ["deals": "true"]).items
        case .trending: return await API.products(page: page, flags: ["trending": "true"]).items
        case .featured: return await API.products(page: page, flags: ["featured": "true"]).items
        case .newArrivals: return await API.products(page: page, flags: ["new": "true"]).items
        case .flashSale: return await API.flashSale()
        case .luxury: return await API.luxury(limit: 100)
        case .auctions: return await API.auctions()
        case .preorder: return await API.preorder()
        case .bundles: return await API.bundles()
        }
    }
}

struct ProductListView: View {
    let mode: ListMode
    @State private var items: [Product] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if items.isEmpty {
                ContentUnavailableView("Nothing here yet", systemImage: "bag", description: Text("Check back soon — new drops land daily"))
            } else {
                List(items) { p in
                    NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) }
                }.listStyle(.plain)
            }
        }
        .navigationTitle(mode.title)
        .task { items = await mode.load(page: 1); loading = false }
    }
}

// MARK: - Collections
struct CollectionsView: View {
    @State private var items: [CollectionItem] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List(items) { c in
                    NavigationLink(value: Route.collection(c.id)) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("✨ \(c.displayTitle)").font(.headline)
                            if let d = c.description, !d.isEmpty { Text(d).font(.subheadline).foregroundColor(.secondary).lineLimit(2) }
                            Text("\(c.productCount) items").font(.caption).foregroundColor(.accentColor)
                        }.padding(.vertical, 4)
                    }
                }.listStyle(.plain)
            }
        }
        .navigationTitle("Curated Collections")
        .task { items = await API.collections(); loading = false }
    }
}

struct CollectionDetailView: View {
    let id: String
    @State private var items: [Product] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List(items) { p in
                    NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) }
                }.listStyle(.plain)
            }
        }
        .navigationTitle("Collection")
        .task { items = await API.collectionProducts(id: id); loading = false }
    }
}

// MARK: - Router
enum Route: Hashable {    case product(String), list(ListMode), collections, collection(String), web(String)
    case blog, blogPost(String), brands, reviews, community, events, forum, forumTopic(String)
    case videos, quiz, live
    case voucher, vip, wallet, checkin, mystery, loyalty, giftcards, referrals, rewards
    case track, returns, shipping, installments, tradein, trybuy, outfit, rental, downloads, groupbuy, pricedrop
    case giftwrap, codequality, student, warranty, techlib, seller, opensource, shield, darkstore, loyaltycalc, minigames, topreviewers, styleguide
    case notifications, help, helpArticle(String), contact, sitemap, settings, affiliate, emailsub
    case about, privacy, terms, faqfull, compare, recentfull, stores, pricealerts, subscriptions, digital, certs, features
    case emi, currency, tipcalc, fuel, measure, carbon, roi, resale, instcompare
    case taxrefund, pricelock, unitprice, smartreorder, giftmatcher, stylequiz, allergy, halal
    case submanager, coloradvisor, sizepredictor, discountstack, dealauth, speccompare
    case smsorder, shopautocomplete, docexpiry, vehicle, legaldocs, formbuilder, resumebuilder, insurance
    case aiscoper, aicompetitor, aipreview, aiproposal, freeaudit, qualitycert, portfolioproof, casestudies
    case emergencybuy, clipboardbuy, flashback, expiryguar, priceguar, smartupsell, studentbudget, subexpiry, altfinder, assembly
    case autocoupon, bulkbuy, reorder, pricedroprefund, grocery, recipe, petsup, schoolsup, movingkit, appliance, safety, verifiedphotos
    case childgrowth, diabetic, ingscan, ingswap, medinteract, medtracker, rxscan, healthmon
    case projdash, projplan, milestones, deadline, scopechange, handoff, slagen, qbr
    case churn, clientltv, command, corpcredit, crowd, demand, dispute, vault, pricetest, liquidator, profit
    case bodytype, usecasematcher, wardrobe, revtokens, trendforecaster, eventstylist
    case aitools, aichat, audits, guides, cicd, envsetup, dbschemas, notion, tutorials
    case category(String, String), search(String), categories
}

// MARK: - Category + Search (home parity)

struct CategoryView: View {
    let id: String
    let name: String
    @State private var items: [Product] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if items.isEmpty { ContentUnavailableView("No products", systemImage: "bag") }
            else { List(items) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }.listStyle(.plain) }
        }
        .navigationTitle(name.isEmpty ? "Category" : name)
        .task { items = await API.products(flags: ["category": id]).items; loading = false }
    }
}

struct CategoriesView: View {
    @State private var items: [Category] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(items) { c in
                NavigationLink(value: Route.category(c.id, c.name)) {
                    HStack { Text("🛍"); VStack(alignment: .leading) { Text(c.name).font(.headline); if let s = c.slug { Text(s).font(.caption).foregroundColor(.secondary) } } }
                }
            }.listStyle(.plain) }
        }
        .navigationTitle("All Categories")
        .task { items = await API.categories(); loading = false }
    }
}

struct SearchView: View {
    @State var initial: String = ""
    @State private var query = ""
    @State private var results: [Product] = []
    @State private var searching = false
    @State private var searched = false
    var body: some View {
        List {
            Section {
                HStack {
                    TextField("Search products", text: $query).textInputAutocapitalization(.never)
                    Button("Go") { run() }.disabled(query.isEmpty || searching)
                }
            }
            if searching { ProgressView() }
            ForEach(results) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
            if searched && results.isEmpty && !searching { ContentUnavailableView("No matches", systemImage: "magnifyingglass") }
        }
        .navigationTitle("Search")
        .onAppear { if !initial.isEmpty && !searched { query = initial; run() } }
    }
    private func run() {
        searching = true
        Task { results = await API.search(query); searching = false; searched = true }
    }
}

// MARK: - Path resolver (mirrors Android Nav resolveContent)
func appRoute(for path: String) -> Route {
    switch path {
    case "/flash-sale": return .list(.flashSale)
    case "/deals": return .list(.deals)
    case "/luxury": return .list(.luxury)
    case "/collections": return .collections
    case "/preorder": return .list(.preorder)
    case "/auctions": return .list(.auctions)
    case "/bundles": return .list(.bundles)
    case "/wishlist": return .web("/wishlist")
    case "/blog": return .blog
    case "/brands": return .brands
    case "/reviews": return .reviews
    case "/community": return .community
    case "/events": return .events
    case "/forum": return .forum
    case "/product-videos": return .videos
    case "/product-quiz": return .quiz
    case "/live": return .live
    case "/voucher": return .voucher
    case "/vip": return .vip
    case "/wallet": return .wallet
    case "/daily-checkin": return .checkin
    case "/mystery-reward": return .mystery
    case "/loyalty", "/loyalty-tiers": return .loyalty
    case "/gift-cards": return .giftcards
    case "/referrals", "/referral-system": return .referrals
    case "/rewards": return .rewards
    case "/track": return .track
    case "/returns": return .returns
    case "/shipping-calculator": return .shipping
    case "/installment": return .installments
    case "/trade-in": return .tradein
    case "/try-before-buy": return .trybuy
    case "/outfit-maker": return .outfit
    case "/rental": return .rental
    case "/digital-downloads": return .downloads
    case "/group-buy": return .groupbuy
    case "/price-drop": return .pricedrop
    case "/gift-wrapping": return .giftwrap
    case "/code-quality": return .codequality
    case "/student-discount": return .student
    case "/warranty-center": return .warranty
    case "/tech-library": return .techlib
    case "/seller-center": return .seller
    case "/open-source": return .opensource
    case "/delivery-protection": return .shield
    case "/dark-store": return .darkstore
    case "/loyalty-calculator": return .loyaltycalc
    case "/mini-games": return .minigames
    case "/review-megaphone": return .topreviewers
    case "/notifications": return .notifications
    case "/help": return .help
    case "/contact": return .contact
    case "/sitemap": return .sitemap
    case "/settings": return .settings
    case "/affiliate": return .affiliate
    case "/email-subscribe": return .emailsub
    case "/category": return .categories
    case "/orders": return .web("/orders")
    case "/style-guide": return .styleguide
    case "/about": return .about
    case "/privacy", "/privacy-policy": return .privacy
    case "/terms", "/terms-of-service": return .terms
    case "/faq": return .faqfull
    case "/compare": return .compare
    case "/recently-viewed": return .recentfull
    case "/stores": return .stores
    case "/price-alerts": return .pricealerts
    case "/subscriptions": return .subscriptions
    case "/digital", "/courses": return .digital
    case "/templates": return .digital
    case "/ui-kits", "/snippets": return .digital
    case "/certifications": return .certs
    case "/features": return .features
    case "/emi-calculator": return .emi
    case "/currency-converter": return .currency
    case "/tip-calculator": return .tipcalc
    case "/fuel-cost-calculator": return .fuel
    case "/measurement-converter": return .measure
    case "/carbon-calculator": return .carbon
    case "/roi-calculator": return .roi
    case "/resale-calculator": return .resale
    case "/installment-compare": return .instcompare
    case "/tax-refund": return .taxrefund
    case "/price-lock": return .pricelock
    case "/unit-price-calculator": return .unitprice
    case "/smart-reorder": return .smartreorder
    case "/gift-matcher": return .giftmatcher
    case "/style-quiz": return .stylequiz
    case "/allergy-checker": return .allergy
    case "/halal-checker": return .halal
    case "/subscription-manager": return .submanager
    case "/color-advisor": return .coloradvisor
    case "/size-predictor": return .sizepredictor
    case "/discount-stacking": return .discountstack
    case "/deal-authenticity": return .dealauth
    case "/spec-compare": return .speccompare
    case "/sms-order": return .smsorder
    case "/ai-scoper": return .aiscoper
    case "/ai-competitor": return .aicompetitor
    case "/ai-preview": return .aipreview
    case "/ai-proposal": return .aiproposal
    case "/free-audit": return .freeaudit
    case "/quality-certificate": return .qualitycert
    case "/portfolio-proof": return .portfolioproof
    case "/case-studies": return .casestudies
    case "/emergency-quick-buy": return .emergencybuy
    case "/clipboard-purchase": return .clipboardbuy
    case "/flashback-deals": return .flashback
    case "/expiry-guarantee": return .expiryguar
    case "/price-guarantee": return .priceguar
    case "/smart-upsell": return .smartupsell
    case "/student-budget": return .studentbudget
    case "/subscription-expiry": return .subexpiry
    case "/alternative-finder": return .altfinder
    case "/assembly-finder": return .assembly
    case "/auto-coupon": return .autocoupon
    case "/bulk-buy": return .bulkbuy
    case "/one-click-reorder": return .reorder
    case "/price-drop-refund": return .pricedroprefund
    case "/grocery-list-import": return .grocery
    case "/recipe-to-cart": return .recipe
    case "/pet-supplies": return .petsup
    case "/school-supplies": return .schoolsup
    case "/moving-kit": return .movingkit
    case "/appliance-repair": return .appliance
    case "/safety-recall": return .safety
    case "/verified-photos": return .verifiedphotos
    case "/child-growth": return .childgrowth
    case "/diabetic-scanner": return .diabetic
    case "/ingredient-scanner": return .ingscan
    case "/ingredient-swap": return .ingswap
    case "/medicine-interaction": return .medinteract
    case "/medicine-tracker": return .medtracker
    case "/prescription-scan": return .rxscan
    case "/health-monitor": return .healthmon
    case "/project-dashboard": return .projdash
    case "/project-planner": return .projplan
    case "/milestones": return .milestones
    case "/deadline-predictor": return .deadline
    case "/scope-change": return .scopechange
    case "/handoff-portal": return .handoff
    case "/sla-generator": return .slagen
    case "/qbr-reports": return .qbr
    case "/churn-prediction": return .churn
    case "/client-community": return .community
    case "/client-ltv": return .clientltv
    case "/command-center": return .command
    case "/corporate-credit": return .corpcredit
    case "/crowd-wisdom": return .crowd
    case "/demand-forecast": return .demand
    case "/dispute-resolution": return .dispute
    case "/guarantee-vault": return .vault
    case "/pricing-test": return .pricetest
    case "/product-liquidator": return .liquidator
    case "/profitability": return .profit
    case "/shopping-list-autocomplete": return .shopautocomplete
    case "/document-expiry": return .docexpiry
    case "/vehicle-service": return .vehicle
    case "/legal-documents": return .legaldocs
    case "/form-builder": return .formbuilder
    case "/resume-builder": return .resumebuilder
    case "/insurance-claim": return .insurance
    case "/body-type": return .bodytype
    case "/use-case-matcher": return .usecasematcher
    case "/wardrobe-planner": return .wardrobe
    case "/revision-tokens": return .revtokens
    case "/trend-forecaster": return .trendforecaster
    case "/event-stylist": return .eventstylist
    case "/ai-tools": return .aitools
    case "/ai-chatbot": return .aichat
    case "/audits": return .audits
    case "/guides": return .guides
    case "/cicd": return .cicd
    case "/env-setup": return .envsetup
    case "/database-schemas": return .dbschemas
    case "/notion-templates": return .notion
    case "/short-tutorials": return .tutorials
    default:
        if path.hasPrefix("/blog/") { return .blogPost(String(path.dropFirst(6))) }
        if path.hasPrefix("/collections/") { return .collection(String(path.dropFirst(13))) }
        if path.hasPrefix("/forum/") { return .forumTopic(String(path.dropFirst(7))) }
        if path.hasPrefix("/help/") { return .helpArticle(String(path.dropFirst(6))) }
        if path.hasPrefix("/templates/") { return .digital }
        return .web(path)
    }
}
