import SwiftUI

// MARK: - Rewards batch (mirrors Android RewardsScreens.kt)

struct VoucherView: View {
    @State private var code = ""
    @State private var result: String?
    @State private var checking = false
    var body: some View {
        List {
            Section("Have a code?") {
                TextField("Voucher code", text: $code).textInputAutocapitalization(.characters)
                Button(checking ? "Checking…" : "Validate") {
                    checking = true
                    Task {
                        let r = await API.validateCoupon(code: code)
                        result = (r?.valid == true) ? "✅ \(r?.label ?? "Valid coupon") — auto-applies at checkout" : "❌ Invalid or expired"
                        checking = false
                    }
                }.disabled(code.isEmpty || checking)
            }
            if let r = result { Section { Text(r) } }
        }.navigationTitle("Voucher Center")
    }
}

struct VipView: View {
    @State private var tiers: [LoyaltyTier] = []
    @State private var summary: RewardsSummary?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    if let s = summary, !s.isGuest {
                        Section { Text("\(s.totalPoints) points · \(s.tierName.capitalized)").font(.headline).foregroundColor(.accentColor) }
                    }
                    ForEach(tiers) { t in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack { Text(t.name.capitalized).font(.headline); Spacer(); if t.current { Text("YOU").font(.caption).bold().padding(4).background(Color.accentColor).foregroundColor(.white).cornerRadius(6) } }
                            Text("\(t.pointsThreshold)+ points").font(.caption).foregroundColor(.secondary)
                            ForEach(t.benefits, id: \.self) { Text("• \($0)").font(.subheadline) }
                        }.padding(.vertical, 4)
                    }
                }.listStyle(.plain)
            }
        }.navigationTitle("VIP Club").task {
            async let t = API.loyaltyTiers(), s = API.rewardsSummary()
            tiers = await t; summary = await s; loading = false
        }
    }
}

struct WalletView: View {
    @State private var balance: Double?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let b = balance {
                List { Section { Text("Available balance").font(.caption).foregroundColor(.secondary); Text("$\(String(format: "%.2f", b))").font(.largeTitle).foregroundColor(.accentColor) } }
            } else { ContentUnavailableView("Sign in to sync rewards", systemImage: "person.crop.circle") }
        }.navigationTitle("Wallet").task { balance = await API.wallet()?.balance; loading = false }
    }
}

struct CheckinView: View {
    @State private var streak = 0
    @State private var checkedIn = false
    @State private var loaded = false
    var body: some View {
        List {
            Section {
                Text("🔥 \(streak)-day streak").font(.headline)
                Text(checkedIn ? "Checked in today — come back tomorrow" : "You haven't checked in today").font(.subheadline).foregroundColor(.secondary)
                Button("Check in now") {
                    Task { if let s = await API.checkin() { streak = s.currentStreak; checkedIn = s.checkedIn } }
                }.disabled(checkedIn)
            }
        }.navigationTitle("Daily Check-in").task {
            if let s = await API.checkinStatus() { streak = s.currentStreak; checkedIn = s.checkedIn }
            loaded = true
        }
    }
}

struct MysteryView: View {
    @State private var canClaim = false
    @State private var options: [String] = []
    @State private var claimed = false
    var body: some View {
        List {
            Section {
                Text(canClaim ? "🎁 A reward is waiting" : "⏳ Next reward soon").font(.headline)
                if claimed { Text("Claimed — check your rewards").foregroundColor(.accentColor).font(.subheadline) }
                Button("Reveal now") {
                    Task { claimed = await API.mysteryClaim(); if let s = await API.mysteryStatus() { canClaim = s.canClaim; options = s.possibleRewards } }
                }.disabled(!canClaim)
            }
            if !options.isEmpty { Section("Possible rewards") { ForEach(options, id: \.self) { Text($0) } } }
        }.navigationTitle("Mystery Reward").task {
            if let s = await API.mysteryStatus() { canClaim = s.canClaim; options = s.possibleRewards }
        }
    }
}

struct LoyaltyView: View {
    @State private var tiers: [LoyaltyTier] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(tiers) { t in
                VStack(alignment: .leading) { Text("\(t.name.capitalized) · \(t.pointsThreshold)+ pts").font(.headline)
                    ForEach(t.benefits, id: \.self) { Text("• \($0)").font(.subheadline) } }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Loyalty Program").task { tiers = await API.loyaltyTiers(); loading = false }
    }
}

struct GiftCardsView: View {
    @State private var cards: [GiftCard] = []
    @State private var code = ""
    @State private var message: String?
    var body: some View {
        List {
            Section("Redeem a card") {
                TextField("Gift card code", text: $code).textInputAutocapitalization(.characters)
                Button("Redeem") {
                    Task {
                        let ok = await API.giftCardRedeem(code: code)
                        message = ok ? "✅ Redeemed" : "❌ Invalid code"
                        if ok { cards = await API.giftCards() }
                    }
                }.disabled(code.isEmpty)
                if let m = message { Text(m).font(.subheadline) }
            }
            Section("My cards") {
                if cards.isEmpty { Text("No gift cards").foregroundColor(.secondary) }
                ForEach(cards) { c in
                    VStack(alignment: .leading) { Text(c.code).bold(); Text("$\(String(format: "%.2f", c.value))").font(.subheadline).foregroundColor(.secondary) }
                }
            }
        }.navigationTitle("Gift Cards").task { cards = await API.giftCards() }
    }
}

struct ReferralsView: View {
    var body: some View {
        List {
            Section {
                Text("Share Grapsee Mall").font(.headline)
                Text("Send your invite link — you both earn when they join.").font(.subheadline).foregroundColor(.secondary)
                ShareLink(item: API.webBase + "/referrals", preview: SharePreview("Invite to Grapsee Mall"))
            }
        }.navigationTitle("Referrals")
    }
}

struct RewardsFullView: View {
    @State private var summary: RewardsSummary?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let s = summary, !s.isGuest {
                List {
                    Section {
                        Text("\(s.totalPoints) points").font(.largeTitle).foregroundColor(.accentColor)
                        Text("\(s.tierName.capitalized) tier · \(s.nextTierPoints) to next").font(.caption).foregroundColor(.secondary)
                        Button("Claim daily bonus") { Task { if await API.rewardsDailyClaim() { summary = await API.rewardsSummary() } } }
                    }
                    Section { NavigationLink(value: Route.loyalty) { Text("View loyalty tiers") } }
                }
            } else { ContentUnavailableView("Sign in to sync rewards", systemImage: "person.crop.circle") }
        }.navigationTitle("Rewards").task { summary = await API.rewardsSummary(); loading = false }
    }
}
