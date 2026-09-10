package com.grapsee.shop

import android.app.Application
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.network.AppContext
import com.grapsee.shop.core.push.AppContextHolder
import com.grapsee.shop.core.push.PushManager
import com.grapsee.shop.core.wishlist.WishlistStore

class GrapseeApp : Application() {

    override fun onCreate() {
        super.onCreate()
        AppContext.init(this)
        AppContextHolder.app = this
        PushManager.init(this)
        CartStore.start()
        WishlistStore.start()
    }
}
