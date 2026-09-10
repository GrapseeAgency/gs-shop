import { NextRequest, NextResponse } from "next/server";
import { checkGithubIntegrationStatus } from "@/lib/grapsee-github";

// GET /api/admin/github/status - Check GitHub auto-grant integration status
export async function GET(request: NextRequest) {
  // Verify API key from header against env
  const apiKey = request.headers.get("x-grapsee-shop-key");
  const expectedKey = process.env.GRAPSEE_SHOP_API_KEY || "gsa_I0wRUXcdjVNvZupfIm7UBchuE1cG4E54";
  
  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing x-grapsee-shop-key header" },
      { status: 401 }
    );
  }
  try {
    const status = await checkGithubIntegrationStatus();
    
    return NextResponse.json({
      success: true,
      autoGrant: {
        enabled: status.configured,
        message: status.message
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      autoGrant: {
        enabled: false,
        message: "Integration check failed"
      },
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
