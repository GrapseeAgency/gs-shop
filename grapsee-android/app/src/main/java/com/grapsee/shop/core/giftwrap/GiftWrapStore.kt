package com.grapsee.shop.core.giftwrap

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.grapsee.shop.core.network.AppContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

private val Context.giftwrapDataStore by preferencesDataStore(name = "grapsee_giftwrap")

/** Local gift-wrap choice (surfaced as a note on the native cart). */
object GiftWrapStore {
    private val designKey = stringPreferencesKey("design")
    private val ribbonKey = stringPreferencesKey("ribbon")
    private val messageKey = stringPreferencesKey("message")
    private val mutex = Mutex()

    data class Selection(val design: String = "", val ribbon: String = "", val message: String = "") {
        val active: Boolean get() = design.isNotEmpty()
    }

    private val _selection = MutableStateFlow(Selection())
    val selection: StateFlow<Selection> = _selection.asStateFlow()

    fun start() {
        CoroutineScope(Dispatchers.IO).launch { load() }
    }

    suspend fun load() {
        val prefs = AppContext.get().giftwrapDataStore.data.first()
        _selection.value = Selection(
            prefs[designKey].orEmpty(), prefs[ribbonKey].orEmpty(), prefs[messageKey].orEmpty(),
        )
    }

    suspend fun save(design: String, ribbon: String, message: String): Unit = mutex.withLock {
        AppContext.get().giftwrapDataStore.edit { prefs ->
            prefs[designKey] = design
            prefs[ribbonKey] = ribbon
            prefs[messageKey] = message
        }
        _selection.value = Selection(design, ribbon, message)
    }

    suspend fun clear(): Unit = mutex.withLock {
        AppContext.get().giftwrapDataStore.edit { it.clear() }
        _selection.value = Selection()
    }
}
