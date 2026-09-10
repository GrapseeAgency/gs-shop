package com.grapsee.shop.core.push

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import com.grapsee.shop.MainActivity
import com.grapsee.shop.R
import kotlinx.coroutines.tasks.await

/**
 * Push is dormant until a `google-services.json` is dropped into `app/`
 * (the google-services plugin then wires it up; FirebaseApp init is guarded so
 * everything below no-ops gracefully without it).
 */
object PushManager {

    const val CHANNEL_GENERAL = "general"
    const val CHANNEL_ORDERS = "orders"

    fun init(context: Context) {
        if (FirebaseApp.getApps(context).isEmpty()) return
        createChannels(context)
    }

    /** Blocking; call from a background thread (bridge or service). */
    fun tokenBlocking(): String {
        val context = AppContextHolder.app ?: return ""
        if (FirebaseApp.getApps(context).isEmpty()) return ""
        return runCatching {
            kotlinx.coroutines.runBlocking {
                FirebaseMessaging.getInstance().token.await()
            }
        }.getOrDefault("")
    }

    fun createChannels(context: Context) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_GENERAL, context.getString(R.string.notification_channel_general), NotificationManager.IMPORTANCE_DEFAULT),
        )
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_ORDERS, context.getString(R.string.notification_channel_orders), NotificationManager.IMPORTANCE_HIGH),
        )
    }

    fun show(context: Context, title: String?, body: String?, link: String?) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        if (manager.getNotificationChannel(CHANNEL_ORDERS) == null) createChannels(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            if (!link.isNullOrBlank()) data = normalizeLink(context, link)
        }
        val pending = PendingIntent.getActivity(
            context, link?.hashCode() ?: 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ORDERS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title ?: "Grapsee")
            .setContentText(body ?: "")
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setContentIntent(pending)
            .build()
        manager.notify((link ?: title ?: body ?: "grapsee").hashCode(), notification)
    }

    /** Accepts https://captainpiracy.shop/... or grapsee:// links. */
    private fun normalizeLink(context: Context, link: String): Uri? = runCatching {
        if (link.startsWith("grapsee://")) Uri.parse(link) else Uri.parse(link)
    }.getOrNull()
}

/** Lazy context holder so the FCM service can reach the app context. */
object AppContextHolder {
    @Volatile
    var app: Context? = null
}
