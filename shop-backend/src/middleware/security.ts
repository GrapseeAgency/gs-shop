import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryption } from '@/lib/encryption';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Neural interface endpoints
  '/api/neural/connect': { windowMs: 60000, maxRequests: 5 },
  '/api/neural/signals': { windowMs: 60000, maxRequests: 100 },
  '/api/neural/calibrate': { windowMs: 300000, maxRequests: 3 },
  
  // DNA analysis endpoints
  '/api/dna/analysis': { windowMs: 3600000, maxRequests: 1 },
  '/api/dna/compatibility': { windowMs: 60000, maxRequests: 20 },
  
  // Quantum computing endpoints
  '/api/quantum/teleportation': { windowMs: 60000, maxRequests: 10 },
  '/api/quantum/predictions': { windowMs: 60000, maxRequests: 50 },
  
  // Live shopping endpoints
  '/api/live-shopping': { windowMs: 60000, maxRequests: 200 },
  '/api/live-shopping/interact': { windowMs: 60000, maxRequests: 100 },
  
  // Holographic endpoints
  '/api/holographic/animations': { windowMs: 60000, maxRequests: 30 },
  '/api/holographic/textures': { windowMs: 60000, maxRequests: 20 },
  '/api/holographic/snapshot': { windowMs: 60000, maxRequests: 10 },
  
  // General endpoints
  '/api/products': { windowMs: 60000, maxRequests: 1000 },
  '/api/orders': { windowMs: 60000, maxRequests: 50 },
  '/api/users': { windowMs: 60000, maxRequests: 100 }
};

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
  blocked: boolean;
}>();

// Security threat detection
interface SecurityThreat {
  type: 'sql_injection' | 'xss' | 'csrf' | 'brute_force' | 'data_exfiltration' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  ip: string;
  userAgent?: string;
  userId?: string;
}

const securityThreats: SecurityThreat[] = [];

// Suspicious patterns for threat detection
const SUSPICIOUS_PATTERNS = {
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/,
    /(\bOR\b.*=.*\bOR\b|\bAND\b.*=.*\bAND\b)/i
  ],
  xss: [
    /(<script|<iframe|<object|<embed|javascript:|vbscript:|onload=|onerror=)/i,
    /(<.*>.*<\/.*>)/,
    /(document\.|window\.|alert\(|confirm\(|prompt\()/i
  ],
  pathTraversal: [
    /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
    /(\/etc\/passwd|\/windows\/system32|c:\\\\)/i
  ],
  commandInjection: [
    /(;|\||&|`|\$\(|\$\{)/,
    /(cat|ls|dir|rm|del|format|shutdown|reboot)/i
  ]
};

export class SecurityMiddleware {
  // Main security middleware function
  static async apply(request: NextRequest): Promise<NextResponse | null> {
    try {
      const clientIP = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';
      const pathname = new URL(request.url).pathname;

      // Log security event
      this.logSecurityEvent('request', {
        ip: clientIP,
        userAgent,
        path: pathname,
        method: request.method,
        timestamp: new Date()
      });

      // Check IP blacklist
      if (this.isIPBlacklisted(clientIP)) {
        return this.createSecurityResponse('IP address blacklisted', 403);
      }

      // Detect suspicious patterns
      const threat = await this.detectSuspiciousPatterns(request);
      if (threat) {
        this.handleSecurityThreat(threat);
        return this.createSecurityResponse('Suspicious activity detected', 403);
      }

      // Apply rate limiting
      const rateLimitResult = this.checkRateLimit(request, clientIP);
      if (!rateLimitResult.allowed) {
        this.logSecurityEvent('rate_limit_exceeded', {
          ip: clientIP,
          path: pathname,
          limit: rateLimitResult.limit,
          windowMs: rateLimitResult.windowMs
        });
        return this.createSecurityResponse('Rate limit exceeded', 429);
      }

      // Validate request size
      if (!this.validateRequestSize(request)) {
        return this.createSecurityResponse('Request too large', 413);
      }

      // Check for session hijacking
      if (this.detectSessionHijacking(request)) {
        this.handleSecurityThreat({
          type: 'unauthorized_access',
          severity: 'high',
          description: 'Potential session hijacking detected',
          timestamp: new Date(),
          ip: clientIP,
          userAgent
        });
        return this.createSecurityResponse('Session validation failed', 401);
      }

      // All checks passed
      return null;
    } catch (error) {
      console.error('Security middleware error:', error);
      // Fail open - allow request but log error
      return null;
    }
  }

  // Get client IP address
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = 'unknown'; // NextRequest doesn't have ip property

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    return clientIP;
  }

  // Check if IP is blacklisted
  private static isIPBlacklisted(ip: string): boolean {
    // In production, check against database or Redis
    const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || [];
    return blacklistedIPs.includes(ip);
  }

  // Detect suspicious patterns in request
  private static async detectSuspiciousPatterns(request: NextRequest): Promise<SecurityThreat | null> {
    const url = new URL(request.url);
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check URL and query parameters
    const urlToCheck = url.pathname + url.search;
    
    for (const [threatType, patterns] of Object.entries(SUSPICIOUS_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(urlToCheck)) {
          return {
            type: threatType as any,
            severity: 'high',
            description: `Suspicious pattern detected: ${pattern.source}`,
            timestamp: new Date(),
            ip: clientIP,
            userAgent
          };
        }
      }
    }

    // Check request body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = request.clone();
        const bodyText = await body.text();
        
        for (const [threatType, patterns] of Object.entries(SUSPICIOUS_PATTERNS)) {
          for (const pattern of patterns) {
            if (pattern.test(bodyText)) {
              return {
                type: threatType as any,
                severity: 'high',
                description: `Suspicious pattern in request body: ${pattern.source}`,
                timestamp: new Date(),
                ip: clientIP,
                userAgent
              };
            }
          }
        }
      } catch (error) {
        // Ignore body parsing errors
      }
    }

    return null;
  }

  // Check rate limiting
  private static checkRateLimit(request: NextRequest, clientIP: string): {
    allowed: boolean;
    limit?: number;
    windowMs?: number;
  } {
    const pathname = new URL(request.url).pathname;
    
    // Find matching rate limit config
    let config: RateLimitConfig | undefined;
    for (const [path, limitConfig] of Object.entries(RATE_LIMITS)) {
      if (pathname.startsWith(path)) {
        config = limitConfig;
        break;
      }
    }

    if (!config) {
      return { allowed: true };
    }

    const key = `${clientIP}:${pathname}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
      rateLimitStore.set(key, entry);
    }

    // Check if blocked
    if (entry.blocked) {
      return { allowed: false, limit: config.maxRequests, windowMs: config.windowMs };
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      
      // Auto-unblock after window
      setTimeout(() => {
        const currentEntry = rateLimitStore.get(key);
        if (currentEntry && currentEntry.blocked) {
          currentEntry.blocked = false;
          currentEntry.count = 0;
        }
      }, config.windowMs);

      return { allowed: false, limit: config.maxRequests, windowMs: config.windowMs };
    }

    return { allowed: true };
  }

  // Validate request size
  private static validateRequestSize(request: NextRequest): boolean {
    const contentLength = request.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength) > maxSize) {
      return false;
    }

    return true;
  }

  // Detect session hijacking
  private static detectSessionHijacking(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent');
    const clientIP = this.getClientIP(request);

    // In production, check against stored session data
    // For now, just check for obvious signs
    if (!userAgent || userAgent.length < 10) {
      return true;
    }

    // Check for suspicious user agents
    const suspiciousAgents = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ];

    for (const pattern of suspiciousAgents) {
      if (pattern.test(userAgent) && !new URL(request.url).pathname.includes('/api/')) {
        return true;
      }
    }

    return false;
  }

  // Handle security threat
  private static handleSecurityThreat(threat: SecurityThreat): void {
    securityThreats.push(threat);

    // Log threat
    console.error('Security threat detected:', threat);

    // Take action based on severity
    switch (threat.severity) {
      case 'critical':
        // Block IP immediately
        this.blockIP(threat.ip);
        break;
      case 'high':
        // Increase monitoring
        this.increaseMonitoring(threat.ip);
        break;
      case 'medium':
        // Log and monitor
        this.logSecurityEvent('threat_detected', threat);
        break;
      case 'low':
        // Just log
        console.warn('Low severity threat:', threat);
        break;
    }

    // Clean old threats (keep last 1000)
    if (securityThreats.length > 1000) {
      securityThreats.splice(0, securityThreats.length - 1000);
    }
  }

  // Block IP address
  private static blockIP(ip: string): void {
    // In production, add to database or Redis blacklist
    console.warn(`IP blocked: ${ip}`);
    
    // Add to temporary block list
    rateLimitStore.set(`blocked:${ip}`, {
      count: 0,
      resetTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      blocked: true
    });
  }

  // Increase monitoring for IP
  private static increaseMonitoring(ip: string): void {
    console.warn(`Increased monitoring for IP: ${ip}`);
    // In production, add to monitoring list
  }

  // Create security response
  private static createSecurityResponse(message: string, status: number): NextResponse {
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status }
    );

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  // Log security events
  private static logSecurityEvent(event: string, data: any): void {
    const logEntry = {
      event,
      data,
      timestamp: new Date().toISOString()
    };

    console.log('Security event:', JSON.stringify(logEntry));
    
    // In production, send to security monitoring service
  }

  // Get security statistics
  static getSecurityStats(): any {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    const recentThreats = securityThreats.filter(t => t.timestamp.getTime() > last24Hours);
    const threatsByType = recentThreats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const threatsBySeverity = recentThreats.reduce((acc, threat) => {
      acc[threat.severity] = (acc[threat.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalThreats: recentThreats.length,
      threatsByType,
      threatsBySeverity,
      activeRateLimits: rateLimitStore.size,
      blockedIPs: Array.from(rateLimitStore.keys()).filter(key => key.startsWith('blocked:')).length
    };
  }

  // Clean up old rate limit entries
  static cleanupRateLimits(): void {
    const now = Date.now();
    
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Middleware wrapper for API routes
export function withSecurity(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Apply security middleware
    const securityResult = await SecurityMiddleware.apply(request);
    
    if (securityResult) {
      return securityResult;
    }

    // Proceed with original handler
    return handler(request, ...args);
  };
}

// Advanced threat detection for revolutionary features
export class RevolutionaryFeatureSecurity {
  // Detect neural data tampering
  static detectNeuralDataTampering(neuralData: any): boolean {
    if (!neuralData) return false;

    // Check for unrealistic values
    if (neuralData.brainwavePatterns) {
      for (const [frequency, value] of Object.entries(neuralData.brainwavePatterns)) {
        const numValue = value as number;
        if (numValue < 0 || numValue > 1) {
          return true;
        }
      }
    }

    // Check for impossible emotional states
    if (neuralData.emotionalState) {
      const { intensity } = neuralData.emotionalState;
      if (intensity < 0 || intensity > 1) {
        return true;
      }
    }

    return false;
  }

  // Validate DNA data integrity
  static validateDNADataIntegrity(dnaData: any): boolean {
    if (!dnaData) return false;

    // Check genetic marker format
    if (dnaData.geneticMarkers) {
      for (const [gene, marker] of Object.entries(dnaData.geneticMarkers)) {
        if (!marker || typeof marker !== 'object') return false;
        if (!('variant' in marker) || !('frequency' in marker)) return false;
        const freq = (marker as any).frequency;
        if (freq < 0 || freq > 1) return false;
      }
    }

    return true;
  }

  // Detect quantum anomalies
  static detectQuantumAnomalies(quantumData: any): boolean {
    if (!quantumData) return false;

    // Check coherence values
    if (quantumData.coherence !== undefined) {
      if (quantumData.coherence < 0 || quantumData.coherence > 1) {
        return true;
      }
    }

    // Check for impossible superposition states
    if (quantumData.superposition === false && quantumData.entanglement === true) {
      // This could be valid in some quantum systems, but worth investigating
      console.warn('Quantum anomaly: collapsed state with entanglement');
    }

    return false;
  }

  // Encrypt sensitive revolutionary feature data
  static encryptRevolutionaryData(data: any, featureType: string): any {
    const sensitiveFields = {
      neural: ['brainwavePatterns', 'emotionalSignatures', 'biometricBaseline'],
      dna: ['geneticMarkers', 'healthFactors', 'personalityTraits'],
      quantum: ['quantumState', 'superposition', 'entanglement'],
      live: ['neuralBiddings', 'emotionalData', 'viewerData']
    };

    const fieldsToEncrypt = sensitiveFields[featureType as keyof typeof sensitiveFields] || [];
    const encryptedData = { ...data };

    fieldsToEncrypt.forEach(field => {
      if (data[field]) {
        encryptedData[field] = encryption.encrypt(data[field], featureType as any);
      }
    });

    return encryptedData;
  }
}

// Export security monitoring functions
export { securityThreats, rateLimitStore };
