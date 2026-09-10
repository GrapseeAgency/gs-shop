package com.grapsee.shop.core.history

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.grapsee.shop.core.network.AppContext
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.Wire
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.builtins.ListSerializer

private val Context.historyDataStore by preferencesDataStore(name = "grapsee_history")

/** Recently viewed products (mirrors the web's recently-viewed store). */
object RecentlyViewedStore {
    private val key = stringPreferencesKey("history_json")
    private const val MAX = 10
    private val mutex = Mutex()

    private val _items = MutableStateFlow<List<Product>>(emptyList())
    val items: StateFlow<List<Product>> = _items.asStateFlow()

    fun start() {
        CoroutineScope(Dispatchers.IO).launch { load() }
    }

    suspend fun load() {
        val raw = AppContext.get().historyDataStore.data.first()[key] ?: return
        _items.value = runCatching {
            Wire.json.decodeFromString(ListSerializer(Product.serializer()), raw)
        }.getOrDefault(emptyList())
    }

    suspend fun record(product: Product): Unit = mutex.withLock {
        val updated = (_items.value.filterNot { it.id == product.id } + product).takeLast(MAX)
        _items.value = updated
        AppContext.get().historyDataStore.edit { prefs ->
            prefs[key] = Wire.json.encodeToString(ListSerializer(Product.serializer()), updated)
        }
    }

    suspend fun clear(): Unit = mutex.withLock {
        _items.value = emptyList()
        AppContext.get().historyDataStore.edit { it.remove(key) }
    }
}
