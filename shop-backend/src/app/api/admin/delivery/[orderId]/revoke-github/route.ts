import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/delivery/[orderId]/revoke-github - Revoke GitHub access
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { reason, notifyUser = true } = body;

    // Find the GitHub access
    const access = await prisma.gitHubAccess.findFirst({
      where: { orderId }
    });

    if (!access) {
      return NextResponse.json(
        { error: "GitHub access not found for this order" },
        { status: 404 }
      );
    }

    if (access.status === "revoked") {
      return NextResponse.json({
        success: true,
        message: "GitHub access already revoked",
        orderId,
        revokedAt: access.updatedAt
      });
    }

    // Revoke access
    const updatedAccess = await prisma.gitHubAccess.update({
      where: { id: access.id },
      data: {
        status: "revoked",
        updatedAt: new Date()
      }
    });

    // Get order details for notification
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    // Log the action
    console.log(`[GITHUB_REVOKED] Order: ${orderId}, User: ${access.username}, Reason: ${reason || "No reason provided"}`);

    // Notify user (placeholder for notification system)
    if (notifyUser && order) {
      console.log(`[NOTIFICATION] GitHub access revoked for ${order.customerEmail}, repo: ${access.repoUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "GitHub access revoked successfully",
      orderId,
      username: access.username,
      repoUrl: access.repoUrl,
      revokedAt: updatedAccess.updatedAt,
      reason: reason || null,
      note: "User has been removed from the repository (if implemented)"
    });

  } catch (error) {
    console.error("Error revoking GitHub access:", error);
    return NextResponse.json(
      { error: "Failed to revoke GitHub access" },
      { status: 500 }
    );
  }
}
