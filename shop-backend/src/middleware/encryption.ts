import { NextRequest, NextResponse } from 'next/server';
import { encryption, encryptSensitiveResponse, isEncrypted } from '@/lib/encryption';

// List of endpoints that require encryption
const ENCRYPTED_ENDPOINTS = [
  '/api/neural/profile',
  '/api/neural/signals',
  '/api/dna/analysis',
  '/api/dna/compatibility',
  '/api/quantum/predictions',
  '/api/quantum/teleportation',
  '/api/holographic/products',
  '/api/live-shopping/sessions',
  '/api/emotional-truth-matrix'
];

// Data type mapping for different endpoints
const ENDPOINT_DATA_TYPES: Record<string, string> = {
  '/api/neural/profile': 'neural',
  '/api/neural/signals': 'neural',
  '/api/dna/analysis': 'dna',
  '/api/dna/compatibility': 'dna',
  '/api/quantum/predictions': 'quantum',
  '/api/quantum/teleportation': 'quantum',
  '/api/holographic/products': 'general',
  '/api/live-shopping/sessions': 'general',
  '/api/emotional-truth-matrix': 'general'
};

export function withEncryption(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Check if this endpoint requires encryption
    const requiresEncryption = ENCRYPTED_ENDPOINTS.some(endpoint => 
      pathname.startsWith(endpoint)
    );

    if (!requiresEncryption) {
      // No encryption needed, proceed normally
      return handler(request, ...args);
    }

    try {
      // Get the original response
      const response = await handler(request, ...args);

      // Only encrypt successful responses
      if (response.status === 200) {
        const responseData = await response.json();
        
        // Check if data is already encrypted
        if (responseData.data && !isEncrypted(responseData.data)) {
          const dataType = ENDPOINT_DATA_TYPES[pathname] || 'general';
          const encryptedData = encryptSensitiveResponse(responseData.data, dataType);
          
          // Return encrypted response
          return new NextResponse(JSON.stringify({
            ...responseData,
            data: encryptedData,
            encrypted: true
          }), {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'X-Encrypted': 'true'
            }
          });
        }
      }

      return response;
    } catch (error) {
      console.error('Encryption middleware error:', error);
      // If encryption fails, return original response
      return handler(request, ...args);
    }
  };
}

// Function to decrypt incoming encrypted requests
export async function decryptRequest(request: NextRequest): Promise<NextRequest> {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const clonedRequest = request.clone();
      const body = await clonedRequest.json();

      // Check if request body contains encrypted data
      if (body.data && isEncrypted(body.data)) {
        const pathname = new URL(request.url).pathname;
        const dataType = ENDPOINT_DATA_TYPES[pathname] || 'general';

        const decryptedData = encryption.decrypt(body.data, dataType as any);
        
        if (decryptedData.success) {
          // Create new request with decrypted data
          const newBody = {
            ...body,
            data: decryptedData.decrypted
          };
          
          return new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(newBody)
          });
        }
      }
    }
  } catch (error) {
    console.error('Request decryption error:', error);
  }
  
  return request;
}

// Rate limiting for encryption operations
const encryptionRateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkEncryptionRateLimit(clientId: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const clientData = encryptionRateLimit.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit
    encryptionRateLimit.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (clientData.count >= limit) {
    return false; // Rate limit exceeded
  }

  clientData.count++;
  return true;
}

// Security headers for encrypted responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Audit logging for encryption operations
export function logEncryptionOperation(
  operation: string,
  endpoint: string,
  userId?: string,
  success: boolean = true
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    endpoint,
    userId: userId || 'anonymous',
    success,
    ip: 'client-ip' // In real implementation, get from request
  };

  console.log('Encryption audit:', JSON.stringify(logEntry));
  
  // In a real implementation, this would be sent to a secure logging service
}

// Key rotation monitoring
export function monitorKeyRotation(): void {
  // Check if keys need rotation (e.g., every 30 days)
  const lastRotation = process.env.LAST_KEY_ROTATION;
  const rotationInterval = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  
  if (!lastRotation || Date.now() - parseInt(lastRotation) > rotationInterval) {
    console.warn('Encryption keys may need rotation');
    // In a real implementation, this would trigger key rotation process
  }
}
