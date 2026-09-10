import { Capacitor } from '@capacitor/core';

/**
 * Initialize Capacitor push notifications.
 * Only runs on native Android/iOS silently skipped on web.
 * Call this from a client component on app start.
 */
export const initPush = async (): Promise<void> => {
  // Only available on native platforms
  if (!Capacitor.isNativePlatform()) return;

  // Dynamic import so web bundle doesn't fail
  const { PushNotifications } = await import('@capacitor/push-notifications');

  // 1. Request permission (Android 13+ needs runtime grant)
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') {
    console.warn(' Push permission denied');
    return;
  }

  // 2. Register with the platform (FCM / APNs)
  await PushNotifications.register();

  // 3. Receive the device token and send it to YOUR backend
  PushNotifications.addListener('registration', async (token) => {
    console.log(' Push token:', token.value);
    try {
      await fetch('/api/push-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value, platform: Capacitor.getPlatform() }),
      });
    } catch (err) {
      console.warn('Failed to register push token with server:', err);
    }
  });

  // 4. Registration error handler
  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err);
  });

  // 5. Foreground notification show in-app banner via custom event
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log(' Foreground notification:', notification);
    // Fire a custom DOM event so any component can listen and show a toast
    window.dispatchEvent(
      new CustomEvent('push-notification', { detail: notification })
    );
  });

  // 6. Background tap navigate to appropriate page
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log(' Notification tapped:', action);
    const data = action.notification.data ?? {};
    // Build the path from the notification data fields
    const path =
      data.url ||
      (data.orderId ? `/orders` : null) ||
      (data.dealId ? `/deals` : null) ||
      '/notifications';
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  });
};
