import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

interface PushNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'PAYMENT_SUCCESS' | 'ORDER_UPDATE' | 'PROMOTION' | 'SECURITY';
  data: any;
  priority?: 'low' | 'normal' | 'high';
  icon?: string;
  requestId?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const body: PushNotificationRequest = await request.json();
    const { userId, title, message, type, data, priority = 'normal', icon = '' } = body;

    // Input validation
    if (!userId || !title || !message || !type) {
      return NextResponse.json({ 
        error: "Missing required fields",
        required: ["userId", "title", "message", "type"]
      }, { status: 400 });
    }

    // Get user's device tokens for mobile notifications (skip if table doesn't exist)
    let userDevices: any[] = [];
    try {
      userDevices = await prisma.device.findMany({
        where: { 
          userId: userId,
          isActive: true,
          pushToken: { not: null }
        }
      });
    } catch (e) {
      console.log(`[PUSH_NOTIFICATION] Device table not found for user: ${userId}`);
    }

    if (userDevices.length === 0) {
      console.log(`[PUSH_NOTIFICATION] No active devices found for user: ${userId}`);
      return NextResponse.json({
        success: true,
        message: "No active devices found",
        devicesNotified: 0,
        requestId
      });
    }

    // Prepare notification payload
    const notificationPayload = {
      title,
      message,
      icon,
      data: {
        type,
        ...data,
        timestamp: new Date().toISOString(),
        requestId
      },
      priority,
      sound: priority === 'high' ? 'default' : 'none',
      badge: type === 'PAYMENT_SUCCESS' ? 1 : 0
    };

    // Send to mobile push notification service (Firebase, OneSignal, etc.)
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const device of userDevices) {
      try {
        const pushResponse = await sendPushNotification(device.pushToken!, notificationPayload);
        
        if (pushResponse.success) {
          successCount++;
          console.log(`[PUSH_NOTIFICATION] Sent to device: ${device.id}`);
        } else {
          failureCount++;
          errors.push(`Device ${device.id}: ${pushResponse.error}`);
          
          // Deactivate device if token is invalid (skip if table doesn't exist)
          if (pushResponse.error?.includes('Invalid token') || pushResponse.error?.includes('NotRegistered')) {
            try {
              await prisma.device.update({
                where: { id: device.id },
                data: { isActive: false }
              });
            } catch (e) {
              console.log("[PUSH_NOTIFICATION] Failed to deactivate device");
            }
          }
        }
      } catch (error) {
        failureCount++;
        errors.push(`Device ${device.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log notification event (skip if table doesn't exist)
    try {
      await prisma.securityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          type: 'MOBILE_NOTIFICATION_SENT',
          action: 'success',
          metadata: JSON.stringify({
            requestId,
            title,
            type,
            devicesFound: userDevices.length,
            successCount,
            failureCount,
            errors,
            processingTime: Date.now() - startTime
          }),
          createdAt: new Date(),
        }
      });
    } catch (e) {
      console.log("[PUSH_NOTIFICATION] securityLog table not found, skipping...");
    }

    return NextResponse.json({
      success: true,
      message: "Push notifications processed",
      requestId,
      summary: {
        devicesFound: userDevices.length,
        successCount,
        failureCount
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Push notification error:', error);
    
    // Log error (skip if table doesn't exist)
    try {
      await prisma.securityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: 'SYSTEM',
          type: 'PUSH_NOTIFICATION_ERROR',
          action: 'error',
          metadata: JSON.stringify({
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }),
          createdAt: new Date(),
        }
      });
    } catch (e) {
      console.log("[PUSH_NOTIFICATION] securityLog table not found, skipping error log...");
    }

    return NextResponse.json({
      error: "Push notification processing failed",
      requestId,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Simulate push notification service integration
async function sendPushNotification(pushToken: string, payload: any): Promise<{success: boolean, error?: string}> {
  try {
    // In production, this would integrate with Firebase Cloud Messaging, OneSignal, etc.
    // For now, we'll simulate the response
    
    console.log(`[PUSH_SERVICE] Sending notification to token: ${pushToken.substring(0, 10)}...`);
    
    // Simulate API call to push service
    if (process.env.NODE_ENV === 'development') {
      // In development, always succeed
      return { success: true };
    }
    
    // Simulate real push service response
    const mockResponse = {
      success: Math.random() > 0.1, // 90% success rate
      error: Math.random() > 0.9 ? 'Simulated push service error' : undefined
    };
    
    return mockResponse;
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Push service error' 
    };
  }
}
