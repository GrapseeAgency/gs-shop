import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/delivery/github/repo?orderId=xxx - Fetch repo contents for display
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

    // Check if user has been granted access
    const access = await prisma.gitHubAccess.findFirst({
      where: { 
        orderId,
        status: "granted"
      }
    });

    if (!access) {
      return NextResponse.json(
        { error: "GitHub access not granted yet" },
        { status: 403 }
      );
    }

    // Extract repo info from stored URL
    const repoUrl = access.repoUrl;
    if (!repoUrl) {
      return NextResponse.json(
        { error: "No repository configured" },
        { status: 404 }
      );
    }

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid repository URL" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;

    // Fetch repo contents from GitHub API via Grapsee
    const GRAPSEE_ADMIN_URL = process.env.GRAPSEE_ADMIN_API_URL || "http://localhost:3001/api/admin";
    const GRAPSEE_SHOP_KEY = process.env.GRAPSEE_SHOP_API_KEY || "";

    const response = await fetch(
      `${GRAPSEE_ADMIN_URL}/shop/github/repo/${owner}/${repo}`,
      {
        headers: {
          "x-grapsee-shop-key": GRAPSEE_SHOP_KEY
        }
      }
    );

    if (!response.ok) {
      // Return basic repo info if fetch fails
      return NextResponse.json({
        success: true,
        repoUrl,
        owner,
        repo,
        message: "Access granted - open on GitHub to view",
        files: []
      });
    }

    const repoData = await response.json();

    return NextResponse.json({
      success: true,
      repoUrl,
      owner,
      repo,
      ...repoData
    });

  } catch (error) {
    console.error("[GITHUB_REPO] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository" },
      { status: 500 }
    );
  }
}
