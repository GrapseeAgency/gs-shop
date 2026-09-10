package com.grapsee.shop.core.cart

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.grapsee.shop.core.network.AppContext
import com.grapsee.shop.core.network.CartLine
import com.grapsee.shop.core.network.Inventory
import com.grapsee.shop.core.network.Wire
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.builtins.ListSerializer

private val Context.cartDataStore by preferencesDataStore(name = "grapsee_cart")

/**
 * Local cart, mirroring the web app's zustand cart (`grapsee-shop-cart` in
 * localStorage) line-for-line: the web cart is client-side, so the native app
 * keeps its own copy and hands it to the web checkout via the localStorage
 * injection in WebViewScreen. Same shapes => same behaviour on both sides.
 */
object CartStore {

    private val key = stringPreferencesKey("cart_json")
    private val mutex = Mutex()

    private val _lines = MutableStateFlow<List<CartLine>>(emptyList())
    val lines: StateFlow<List<CartLine>> = _lines.asStateFlow()

    val count: Flow<Int> = lines.map { l -> l.sumOf { it.quantity } }

    fun start() {
        // Kick an initial load; results land in [_lines].
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            load()
        }
    }    suspend fun load() {
        val raw = AppContext.get().cartDataStore.data.first()[key] ?: return
        val parsed = runCatching {
            Wire.json.decodeFromString(ListSerializer(CartLine.serializer()), raw)
        }.getOrDefault(emptyList())
        _lines.value = parsed
    }

    suspend fun add(line: CartLine): Result<Unit> = mutex.withLock {
        val current = _lines.value
        val existing = current.find { it.productId == line.productId }
        val newQty = (existing?.quantity ?: 0) + line.quantity

        // Same stock guard the web cart applies at add time (src/lib/store.ts).
        val inv: Inventory = runCatching {
            com.grapsee.shop.core.network.ApiClient.inventory(line.productId)
        }.getOrElse { return Result.failure(it) }
        if (!inv.isAvailable || inv.isSoldOut) {
            return Result.failure(IllegalStateException("This item is out of stock"))
        }
        if (newQty > inv.inventory) {
            return Result.failure(IllegalStateException("Only ${inv.inventory} in stock"))
        }

        val updated = if (existing != null) {
            current.map { if (it.productId == line.productId) it.copy(quantity = newQty) else it }
        } else {
            current + line
        }
        save(updated)
        Result.success(Unit)
    }

    suspend fun setQuantity(productId: String, quantity: Int) = mutex.withLock {
        val updated = if (quantity <= 0) {
            _lines.value.filterNot { it.productId == productId }
        } else {
            _lines.value.map { if (it.productId == productId) it.copy(quantity = quantity) else it }
        }
        save(updated)
    }

    suspend fun remove(productId: String) = setQuantity(productId, 0)

    suspend fun clear() = mutex.withLock { save(emptyList()) }

    /** Web-shaped zustand persist payload for the checkout handoff. */
    fun zustandPayload(items: List<CartLine>): String {
        val itemsJson = Wire.json.encodeToString(ListSerializer(CartLine.serializer()), items)
        return """{"state":{"items":$itemsJson},"version":0}"""
    }

    private suspend fun save(updated: List<CartLine>) {
        AppContext.get().cartDataStore.edit { prefs ->
            prefs[key] = Wire.json.encodeToString(ListSerializer(CartLine.serializer()), updated)
        }
        _lines.value = updated
    }
}
