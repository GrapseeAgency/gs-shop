package com.grapsee.shop.core.wishlist

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.grapsee.shop.core.network.AppContext
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.Wire
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.builtins.ListSerializer

private val Context.wishlistDataStore by preferencesDataStore(name = "grapsee_wishlist")

/**
 * Local wishlist (the web's wishlist is client-side too, so a local store is
 * the matching native behaviour; server sync can slot in behind the same API).
 */
object WishlistStore {

    @kotlinx.serialization.Serializable
    data class WishItem(
        val productId: String,
        val name: String,
        val price: Double,
        val comparePrice: Double? = null,
        val imageUrl: String? = null,
    )

    private val key = stringPreferencesKey("wishlist_json")
    private val mutex = Mutex()

    private val _items = MutableStateFlow<List<WishItem>>(emptyList())
    val items: StateFlow<List<WishItem>> = _items.asStateFlow()

    fun start() {
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch { load() }
    }

    suspend fun load() {
        val raw = AppContext.get().wishlistDataStore.data.first()[key] ?: return
        _items.value = runCatching {
            Wire.json.decodeFromString(ListSerializer(WishItem.serializer()), raw)
        }.getOrDefault(emptyList())
    }

    fun isWished(productId: String): Boolean = _items.value.any { it.productId == productId }

    /** Returns true when the product is now wished. */
    suspend fun toggle(product: Product): Boolean = mutex.withLock {
        val existing = _items.value.firstOrNull { it.productId == product.id }
        val updated = if (existing != null) {
            _items.value.filterNot { it.productId == product.id }
        } else {
            _items.value + WishItem(product.id, product.name, product.price, product.comparePrice, product.imageUrl)
        }
        save(updated)
        existing == null
    }

    suspend fun remove(productId: String) = mutex.withLock {
        save(_items.value.filterNot { it.productId == productId })
    }

    private suspend fun save(updated: List<WishItem>) {
        AppContext.get().wishlistDataStore.edit { prefs ->
            prefs[key] = Wire.json.encodeToString(ListSerializer(WishItem.serializer()), updated)
        }
        _items.value = updated
    }
}
