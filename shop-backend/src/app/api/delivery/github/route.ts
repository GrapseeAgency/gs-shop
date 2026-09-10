import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyGithubAccessRequested } from "@/lib/grapsee-webhook";
import { autoGrantGithubAccess } from "@/lib/grapsee-github";

// POST /api/delivery/github - Request GitHub repository access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, githubUsername, action } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order is paid/completed
    if (order.status !== "completed" && order.status !== "confirmed" && order.status !== "paid") {
      return NextResponse.json(
        { error: "Order not ready for delivery", status: order.status },
        { status: 400 }
      );
    }

    const product = order.items[0]?.product;
    if (!product) {
      return NextResponse.json(
        { error: "No products in order" },
        { status: 400 }
      );
    }

    // Get product info for repo naming
    const repoName = product ? product.name.replace(/[^a-z0-9]/gi, "-").toLowerCase() : "project";

    // Handle different actions
    if (action === "check") {
      // Check current GitHub access status
      const access = await prisma.gitHubAccess.findFirst({
        where: { orderId }
      });

      return NextResponse.json({
        success: true,
        status: access?.status || "not_requested",
        repoUrl: access?.repoUrl || null,
        username: access?.username || null,
        message: access?.status === "granted" 
          ? "Access already granted"
          : access?.status === "pending" 
            ? "GitHub access pending admin approval"
            : "GitHub access not requested yet"
      });
    }

    if (action === "request") {
      if (!githubUsername) {
        return NextResponse.json(
          { error: "GitHub username required" },
          { status: 400 }
        );
      }

      // Validate GitHub username (basic validation)
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(githubUsername)) {
        return NextResponse.json(
          { error: "Invalid GitHub username format" },
          { status: 400 }
        );
      }

      // Check if product has GitHub repo configured (stored in downloadUrl for test)
      const configuredRepo = product?.downloadUrl;
      console.log(`[GITHUB_DEBUG] Product: ${product?.name}, downloadUrl: ${configuredRepo}`);
      const isGithubRepo = configuredRepo && configuredRepo.includes('github.com');
      const repoUrl = isGithubRepo ? configuredRepo : `https://github.com/grapsee-projects/${repoName}-${orderId.slice(-8)}`;
      console.log(`[GITHUB_DEBUG] Using repoUrl: ${repoUrl}, isGithubRepo: ${isGithubRepo}`);
      const productId = product?.id || orderId;

      // Store or update GitHub access request
      const githubAccess = await prisma.gitHubAccess.upsert({
        where: { orderId },
        update: {
          username: githubUsername,
          productId,
          status: "pending",
          updatedAt: new Date()
        },
        create: {
          orderId,
          productId,
          username: githubUsername,
          repoUrl,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Notify Grapsee about new GitHub access request
      notifyGithubAccessRequested({
        id: githubAccess.id,
        orderId: githubAccess.orderId,
        productId: githubAccess.productId,
        username: githubAccess.username,
        repoUrl: githubAccess.repoUrl || repoUrl,
        customerEmail: order.customerEmail,
        productName: order.items[0]?.product?.name || "Unknown Product",
        requestedAt: githubAccess.createdAt
      }).catch(err => console.error("[WEBHOOK_ERROR] Failed to notify GitHub request:", err));

      // AUTO-GRANT: Call Grapsee backend to add customer as collaborator
      console.log(`[GITHUB_AUTO] Auto-granting access for order ${orderId}, user ${githubUsername}`);
      const autoGrantResult = await autoGrantGithubAccess(orderId, githubUsername, repoUrl);
      
      if (autoGrantResult.success) {
        // Update status to granted in our database
        await prisma.gitHubAccess.update({
          where: { orderId },
          data: { 
            status: "granted",
            grantedAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`[GITHUB_AUTO] Access granted successfully for ${githubUsername}`);
      } else {
        console.error(`[GITHUB_AUTO] Failed to grant access:`, autoGrantResult.error);
      }

      return NextResponse.json({
        success: true,
        message: autoGrantResult?.success 
          ? "GitHub access granted automatically! Check your email for the invitation."
          : "GitHub access request submitted",
        username: githubUsername,
        repoUrl,
        status: autoGrantResult?.success ? "granted" : "pending",
        autoGranted: autoGrantResult?.success || false,
        configured: !!configuredRepo,
        nextSteps: autoGrantResult?.success ? [
          "Access granted! Repository is ready",
          "View code below or open on GitHub",
          repoUrl
        ] : [
          "Auto-grant in progress...",
          "Refresh in a few seconds",
          "Or check your email for GitHub invitation"
        ]
      });
    }

    if (action === "grant") {
      // Admin action to grant access
      // In production, this would call GitHub API to add collaborator
      
      await prisma.gitHubAccess.updateMany({
        where: { orderId },
        data: {
          status: "granted",
          grantedAt: new Date(),
          updatedAt: new Date()
        }
      });

      const access = await prisma.gitHubAccess.findFirst({
        where: { orderId }
      });

      // Notify Grapsee admin system (placeholder for integration)
      console.log(`[GITHUB_ACCESS_GRANTED] Order: ${orderId}, User: ${access?.username}, Repo: ${access?.repoUrl}`);

      return NextResponse.json({
        success: true,
        message: "GitHub access granted",
        repoUrl: access?.repoUrl,
        username: access?.username,
        instructions: [
          "Check your email for GitHub invitation",
          "Accept the invitation to access the repository",
          "Repository is private and only accessible to you"
        ]
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use: check, request, or grant" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error handling GitHub access:", error);
    return NextResponse.json(
      { error: "Failed to process GitHub access request" },
      { status: 500 }
    );
  }
}

// GET /api/delivery/github?orderId=xxx - Check GitHub access status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    const access = await prisma.gitHubAccess.findFirst({
      where: { orderId }
    });

    return NextResponse.json({
      success: true,
      status: access?.status || "not_requested",
      repoUrl: access?.repoUrl || null,
      username: access?.username || null,
      grantedAt: access?.grantedAt || null
    });

  } catch (error) {
    console.error("Error checking GitHub access:", error);
    return NextResponse.json(
      { error: "Failed to check GitHub access status" },
      { status: 500 }
    );
  }
}
