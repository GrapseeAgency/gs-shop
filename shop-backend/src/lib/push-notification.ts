import { prisma } from './prisma'

export interface PushNotificationPayload {
  userId?: string | null
  customerEmail?: string | null
  title: string
  body: string
  data?: Record<string, any>
}

/**
 * Custom Push Notification Service
 * Sends notifications to customers using Grapsee's own infrastructure
 * Stores notifications in database for frontend polling
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<void> {
  const { userId, customerEmail, title, body, data } = payload

  // Store notification in database for delivery
  try {
    // Create notification record using existing Notification model
    await prisma.notification.create({
      data: {
        userId: userId || null,
        type: 'chat',
        title,
        message: body,
        metadata: data ? JSON.stringify(data) : null,
        priority: 'high',
        category: 'commerce'
      }
    })

    console.log('Notification stored in database for:', customerEmail || userId)

    // Frontend polls for notifications every 3 seconds via webhook
    // No need for WebSocket or email - the polling mechanism handles delivery

  } catch (error) {
    console.error('Failed to create notification record:', error)
    throw error
  }
}

/**
 * Register device token for push notifications
 * Called when customer enables notifications in the app
 */
export async function registerDeviceToken(userId: string, token: string, platform: 'web' | 'ios' | 'android'): Promise<void> {
  try {
    await prisma.deviceToken.upsert({
      where: {
        userId_token: {
          userId,
          token
        }
      },
      update: {
        platform,
        updatedAt: new Date()
      },
      create: {
        userId,
        token,
        platform,
        isActive: true
      }
    })
    console.log('Device token registered for user:', userId)
  } catch (error) {
    console.error('Failed to register device token:', error)
    throw error
  }
}

/**
 * Unregister device token
 */
export async function unregisterDeviceToken(userId: string, token: string): Promise<void> {
  try {
    await prisma.deviceToken.updateMany({
      where: {
        userId,
        token
      },
      data: {
        isActive: false
      }
    })
    console.log('Device token unregistered for user:', userId)
  } catch (error) {
    console.error('Failed to unregister device token:', error)
    throw error
  }
}

