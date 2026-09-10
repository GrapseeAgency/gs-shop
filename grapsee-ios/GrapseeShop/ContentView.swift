import SwiftUI

// MARK: - App entry: 5 tabs mirroring the web bottom nav (Home/Explore/Cart/Wishlist/Profile)
@main
struct GrapseeShopApp: App {
    @StateObject private var state = AppState.shared
    var body: some Scene {
        WindowGroup {
            ContentView().environmentObject(state)
        }
    }
}

enum Tab: Hashable { case home, explore, cart, wishlist, profile }

struct ContentView: View {
    @EnvironmentObject var state: AppState
    @State private var tab = Tab.home
    var body: some View {
        ZStack(alignment: .top) {
            TabView(selection: $tab) {
                HomeView().tabItem { Label("Home", systemImage: "house") }.tag(Tab.home)
                ExploreView().tabItem { Label("Explore", systemImage: "location") }.tag(Tab.explore)
                CartView().tabItem { Label("Cart", systemImage: "cart") }
                    .badge(state.cartCount > 0 ? state.cartCount : 0).tag(Tab.cart)
                WishlistView().tabItem { Label("Wishlist", systemImage: "heart") }.tag(Tab.wishlist)
                ProfileView().tabItem { Label("Profile", systemImage: "person") }.tag(Tab.profile)
            }.tint(Theme.brand)
            UpdateBanner()
        }
        .accentColor(Theme.brand)
    }
}
