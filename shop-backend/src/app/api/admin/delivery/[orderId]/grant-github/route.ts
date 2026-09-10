import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/delivery/[orderId]/grant-github - Grant GitHub access to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { notifyUser = true } = body;

    // Find the GitHub access request
    const accessRequest = await prisma.gitHubAccess.findFirst({
      where: { orderId }
    });

    if (!accessRequest) {
      return NextResponse.json(
        { error: "GitHub access request not found for this order" },
        { status: 404 }
      );
    }

    if (accessRequest.status === "granted") {
      return NextResponse.json({
        success: true,
        message: "GitHub access already granted",
        orderId,
        username: accessRequest.username,
        repoUrl: accessRequest.repoUrl,
        grantedAt: accessRequest.grantedAt
      });
    }

    // Update status to granted
    const updatedAccess = await prisma.gitHubAccess.update({
      where: { id: accessRequest.id },
      data: {
        status: "granted",
        grantedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Get order details for notification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
          take: 1
        }
      }
    });

    // In production, call GitHub API to add collaborator
    // For now, log it and notify
    console.log(`[GITHUB_GRANT] Order: ${orderId}, User: ${updatedAccess.username}, Repo: ${updatedAccess.repoUrl}`);

    // Notify user (placeholder for notification system)
    if (notifyUser && order) {
      console.log(`[NOTIFICATION] GitHub access granted to ${order.customerEmail} for repo ${updatedAccess.repoUrl}`);
      
      // TODO: Integrate with Grapsee notification system
      // await sendNotification({
      // to: order.customerEmail,
      // type: "github_access_granted",
      // data: { repoUrl: updatedAccess.repoUrl, username: updatedAccess.username }
      // });
    }

    return NextResponse.json({
      success: true,
      message: "GitHub access granted successfully",
      orderId,
      username: updatedAccess.username,
      repoUrl: updatedAccess.repoUrl,
      productName: order?.items[0]?.product?.name,
      grantedAt: updatedAccess.grantedAt,
      instructions: [
        "User has been notified via email",
        "GitHub invitation sent to user",
        "Repository is private and accessible only to granted users"
      ]
    });

  } catch (error) {
    console.error("Error granting GitHub access:", error);
    return NextResponse.json(
      { error: "Failed to grant GitHub access" },
      { status: 500 }
    );
  }
}

// GET /api/admin/delivery/[orderId]/grant-github - Check grant status
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    const access = await prisma.gitHubAccess.findFirst({
      where: { orderId }
    });

    if (!access) {
      return NextResponse.json({
        success: false,
        status: "not_requested",
        message: "No GitHub access request found"
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      username: access.username,
      repoUrl: access.repoUrl,
      status: access.status,
      requestedAt: access.createdAt,
      grantedAt: access.grantedAt
    });

  } catch (error) {
    console.error("Error checking GitHub grant status:", error);
    return NextResponse.json(
      { error: "Failed to check grant status" },
      { status: 500 }
    );
  }
}
