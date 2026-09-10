// Service to call Grapsee backend for automated GitHub access granting
// This enables auto-accept when customer submits their GitHub username

const GRAPSEE_ADMIN_URL = process.env.GRAPSEE_ADMIN_API_URL || "http://localhost:3001/api/admin";
const GRAPSEE_SHOP_KEY = process.env.GRAPSEE_SHOP_API_KEY || "";

interface GithubGrantResult {
  success: boolean;
  message?: string;
  invited?: boolean;
  error?: string;
}

/**
 * Call Grapsee backend to automatically grant GitHub access
 * This adds the customer as a collaborator to the repository
 */
export async function autoGrantGithubAccess(
  orderId: string,
  username: string,
  repoUrl: string
): Promise<GithubGrantResult> {
  try {
    if (!GRAPSEE_SHOP_KEY) {
      console.error("[GITHUB_AUTO] GRAPSEE_SHOP_API_KEY not configured");
      return { success: false, error: "API key not configured" };
    }

    const url = `${GRAPSEE_ADMIN_URL}/shop/github/grant/${orderId}`;
    
    console.log(`[GITHUB_AUTO] Calling Grapsee: ${url}`);
    console.log(`[GITHUB_AUTO] Granting access for user: ${username}, repo: ${repoUrl}`);

    const requestBody = {
      username,
      repoUrl,
      notifyUser: true,
      autoGranted: true
    };
    console.log(`[GITHUB_AUTO] Request body:`, JSON.stringify(requestBody));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-grapsee-shop-key": GRAPSEE_SHOP_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GITHUB_AUTO] Grapsee API error: ${response.status} ${errorText}`);
      return { 
        success: false, 
        error: `Grapsee API error: ${response.status}` 
      };
    }

    const result = await response.json();
    console.log(`[GITHUB_AUTO] Success:`, result);

    return {
      success: true,
      invited: result.invited || true,
      message: result.message || "GitHub access granted automatically"
    };

  } catch (error) {
    console.error("[GITHUB_AUTO] Failed to grant GitHub access:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Check if Grapsee GitHub integration is configured and working
 */
export async function checkGithubIntegrationStatus(): Promise<{
  configured: boolean;
  message: string;
}> {
  try {
    if (!GRAPSEE_SHOP_KEY) {
      return { configured: false, message: "API key not set" };
    }

    const url = `${GRAPSEE_ADMIN_URL}/shop/github/status`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-grapsee-shop-key": GRAPSEE_SHOP_KEY
      }
    });

    if (!response.ok) {
      return { 
        configured: false, 
        message: `Grapsee API error: ${response.status}` 
      };
    }

    const result = await response.json();
    
    if (result.success && result.configured) {
      return { 
        configured: true, 
        message: `Connected as ${result.username}` 
      };
    }

    return { configured: false, message: "GitHub not configured on Grapsee" };

  } catch (error) {
    return { 
      configured: false, 
      message: error instanceof Error ? error.message : "Connection failed" 
    };
  }
}
