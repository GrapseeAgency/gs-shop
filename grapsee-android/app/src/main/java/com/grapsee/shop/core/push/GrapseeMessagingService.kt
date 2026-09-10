package com.grapsee.shop.core.push

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * Receives FCM messages when Firebase is configured. Without a
 * google-services.json this class is never instantiated — harmless.
 */
class GrapseeMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(message: RemoteMessage) {
        val link = message.data["link"]
            ?: message.notification?.link?.toString()
        PushManager.show(
            context = this,
            title = message.notification?.title ?: message.data["title"],
            body = message.notification?.body ?: message.data["body"],
            link = link,
        )
    }

    override fun onNewToken(token: String) {
        // The backend has no push-token registry yet; surface the token to the
        // web session via the bridge (window.GrapseeNative.pushToken()) until one exists.
        PushManager.tokenBlocking()
    }
}
