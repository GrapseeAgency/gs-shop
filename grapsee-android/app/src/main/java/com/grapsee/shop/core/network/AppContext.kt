package com.grapsee.shop.core.network

import android.content.Context

/** Application-scoped context for singletons that need one (created in GrapseeApp). */
object AppContext {
    @Volatile
    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun get(): Context = appContext ?: throw IllegalStateException("AppContext not initialised")
}
