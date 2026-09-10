// Webhook service to notify Grapsee backend of real-time events
// Grapsee uses these to notify agents via WebSocket/email

const WEBHOOK_BASE_URL = process.env.GRAPSEE_WEBHOOK_BASE_URL || "http://localhost:3001/api/webhooks";
const WEBHOOK_KEY = process.env.GRAPSEE_SHOP_API_KEY || "";

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

async function sendWebhook(endpoint: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const url = `${WEBHOOK_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-grapsee-shop-key": WEBHOOK_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[WEBHOOK_FAILED] ${endpoint}: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`[WEBHOOK_SENT] ${endpoint}: ${payload.event}`);
    return true;
  } catch (error) {
    console.error(`[WEBHOOK_ERROR] ${endpoint}:`, error);
    return false;
  }
}

// Notify Grapsee when new chat session created (general or paid)
export async function notifyNewChatSession(session: {
  id: string;
  type: "general" | "paid";
  orderId?: string | null;
  productId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  productName: string;
  status: string;
  priority: string;
  createdAt: Date;
}): Promise<boolean> {
  return sendWebhook("/shop/chat/new-session", {
    event: "chat.session.created",
    timestamp: new Date().toISOString(),
    data: {
      sessionId: session.id,
      type: session.type,
      orderId: session.orderId,
      productId: session.productId,
      customerEmail: session.customerEmail,
      customerName: session.customerName,
      productName: session.productName,
      status: session.status,
      priority: session.priority,
      needsAssignment: session.status === "waiting",
      createdAt: session.createdAt
    }
  });
}

// Notify Grapsee when customer sends new message
export async function notifyNewChatMessage(message: {
  sessionId: string;
  sessionType: "general" | "paid";
  messageId: string;
  sender: string;
  message: string;
  timestamp: Date;
  assignedTo?: string | null;
  customerEmail: string;
}): Promise<boolean> {
  // Only notify if assigned to an agent, or if it's a new general chat
  if (message.assignedTo || message.sessionType === "general") {
    return sendWebhook("/shop/chat/new-message", {
      event: "chat.message.received",
      timestamp: new Date().toISOString(),
      data: {
        sessionId: message.sessionId,
        sessionType: message.sessionType,
        messageId: message.messageId,
        sender: message.sender,
        message: message.message.substring(0, 200), // Truncate for notification
        timestamp: message.timestamp,
        assignedTo: message.assignedTo,
        customerEmail: message.customerEmail
      }
    });
  }
  return false;
}

// Notify Grapsee when GitHub access requested
export async function notifyGithubAccessRequested(access: {
  id: string;
  orderId: string;
  productId: string;
  username: string;
  repoUrl: string;
  customerEmail: string;
  productName: string;
  requestedAt: Date;
}): Promise<boolean> {
  return sendWebhook("/shop/github/requested", {
    event: "github.access.requested",
    timestamp: new Date().toISOString(),
    data: {
      accessId: access.id,
      orderId: access.orderId,
      productId: access.productId,
      githubUsername: access.username,
      repoUrl: access.repoUrl,
      customerEmail: access.customerEmail,
      productName: access.productName,
      status: "pending",
      requestedAt: access.requestedAt
    }
  });
}

// Notify Grapsee when GitHub access granted/revoked
export async function notifyGithubAccessStatus(access: {
  id: string;
  orderId: string;
  username: string;
  status: "granted" | "revoked";
  repoUrl?: string;
  customerEmail: string;
}, action: "granted" | "revoked"): Promise<boolean> {
  return sendWebhook("/shop/github/status-changed", {
    event: `github.access.${action}`,
    timestamp: new Date().toISOString(),
    data: {
      accessId: access.id,
      orderId: access.orderId,
      githubUsername: access.username,
      status: action,
      repoUrl: access.repoUrl,
      customerEmail: access.customerEmail,
      notifyCustomer: true
    }
  });
}
