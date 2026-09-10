package com.grapsee.shop.core.outfit

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.grapsee.shop.core.network.AppContext
import com.grapsee.shop.core.network.SavedOutfit
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
import java.util.UUID

private val Context.outfitDataStore by preferencesDataStore(name = "grapsee_outfits")

/** Local outfit board (the maker is a client-side composer; no server data). */
object OutfitStore {
    private val key = stringPreferencesKey("outfits_json")
    private val mutex = Mutex()

    private val _outfits = MutableStateFlow<List<SavedOutfit>>(emptyList())
    val outfits: StateFlow<List<SavedOutfit>> = _outfits.asStateFlow()

    fun start() {
        CoroutineScope(Dispatchers.IO).launch { load() }
    }

    suspend fun load() {
        val raw = AppContext.get().outfitDataStore.data.first()[key] ?: return
        _outfits.value = runCatching {
            Wire.json.decodeFromString(ListSerializer(SavedOutfit.serializer()), raw)
        }.getOrDefault(emptyList())
    }

    private suspend fun save() {
        AppContext.get().outfitDataStore.edit { prefs ->
            prefs[key] = Wire.json.encodeToString(ListSerializer(SavedOutfit.serializer()), _outfits.value)
        }
    }

    suspend fun add(name: String, productIds: List<String>, productNames: List<String>): Unit = mutex.withLock {
        _outfits.value = _outfits.value + SavedOutfit(UUID.randomUUID().toString(), name, productIds, productNames)
        save()
    }

    suspend fun remove(id: String): Unit = mutex.withLock {
        _outfits.value = _outfits.value.filterNot { it.id == id }
        save()
    }
}
