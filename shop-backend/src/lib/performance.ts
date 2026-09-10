import { NextRequest, NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

// Performance monitoring configuration
interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  slowRequests: number;
  errorCount: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: Date;
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    slowRequests: 0,
    errorCount: 0,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: new Date()
  };
  private responseTimes: number[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private slowRequestThreshold: number = 1000; // 1 second
  private maxCacheSize: number = 1000;
  private defaultCacheTTL: number = 300000; // 5 minutes

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Middleware for performance monitoring
  static async monitorRequest(request: NextRequest, handler: Function): Promise<NextResponse> {
    const optimizer = PerformanceOptimizer.getInstance();
    const startTime = performance.now();

    try {
      // Update request count
      optimizer.metrics.requestCount++;

      // Execute the handler
      const response = await handler(request);

      // Calculate response time
      const responseTime = performance.now() - startTime;
      optimizer.updateResponseTime(responseTime);

      // Check if it's a slow request
      if (responseTime > optimizer.slowRequestThreshold) {
        optimizer.metrics.slowRequests++;
        console.warn(`Slow request detected: ${request.method} ${request.url} - ${responseTime.toFixed(2)}ms`);
      }

      // Add performance headers
      response.headers.set('X-Response-Time', `${responseTime.toFixed(2)}ms`);
      response.headers.set('X-Request-ID', this.generateRequestId());
      response.headers.set('X-Server-Memory', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

      return response;
    } catch (error) {
      optimizer.metrics.errorCount++;
      console.error(`Request failed: ${request.method} ${request.url}`, error);
      throw error;
    }
  }

  // Update response time metrics
  private updateResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    
    // Keep only last 100 response times for average calculation
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  // Generate unique request ID
  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Cache management
  set<T>(key: string, data: T, ttl?: number): void {
    const size = this.calculateSize(data);
    
    // Check cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultCacheTTL,
      hits: 0,
      size
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.data as T;
  }

  // Evict least used cache entries
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  // Calculate approximate size of data
  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getCacheStats(): any {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    return {
      entries: this.cache.size,
      totalSize,
      averageSize: this.cache.size > 0 ? totalSize / this.cache.size : 0,
      hitRate: this.calculateHitRate()
    };
  }

  // Calculate cache hit rate
  private calculateHitRate(): number {
    const totalHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.hits, 0);
    
    return this.cache.size > 0 ? totalHits / this.cache.size : 0;
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage();
    this.metrics.timestamp = new Date();
    
    return { ...this.metrics };
  }

  // Optimize database queries
  static async optimizeDatabaseQuery<T>(
    query: () => Promise<T>,
    cacheKey?: string,
    ttl?: number
  ): Promise<T> {
    const optimizer = PerformanceOptimizer.getInstance();

    // Check cache first
    if (cacheKey) {
      const cached = optimizer.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Execute query
    const startTime = performance.now();
    const result = await query();
    const queryTime = performance.now() - startTime;

    // Log slow queries
    if (queryTime > 500) {
      console.warn(`Slow database query: ${queryTime.toFixed(2)}ms - ${cacheKey || 'unknown'}`);
    }

    // Cache result
    if (cacheKey) {
      optimizer.set(cacheKey, result, ttl);
    }

    return result;
  }

  // Compress response data
  static compressResponse(data: any): any {
    // Remove null and undefined values
    const cleanData = JSON.parse(JSON.stringify(data, (key, value) => 
      value === null || value === undefined ? undefined : value
    ));

    // Optimize arrays
    if (Array.isArray(cleanData)) {
      return cleanData.filter(item => item !== undefined);
    }

    return cleanData;
  }

  // Batch process requests
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    delay: number = 0
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);

      // Add delay between batches to prevent overwhelming
      if (delay > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  // Memory optimization
  static optimizeMemory(): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear expired cache
    const optimizer = PerformanceOptimizer.getInstance();
    optimizer.clearExpiredCache();

    console.log('Memory optimization completed');
  }

  // Health check
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: PerformanceMetrics;
    recommendations: string[];
  }> {
    const optimizer = PerformanceOptimizer.getInstance();
    const metrics = optimizer.getMetrics();
    const recommendations: string[] = [];

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check memory usage
    const memoryUsageMB = metrics.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 512) {
      status = 'degraded';
      recommendations.push('High memory usage detected. Consider increasing memory or optimizing queries.');
    }
    if (memoryUsageMB > 1024) {
      status = 'unhealthy';
      recommendations.push('Critical memory usage. Immediate optimization required.');
    }

    // Check response time
    if (metrics.averageResponseTime > 500) {
      status = 'degraded';
      recommendations.push('Average response time is high. Consider optimizing database queries or adding caching.');
    }
    if (metrics.averageResponseTime > 2000) {
      status = 'unhealthy';
      recommendations.push('Critical response time detected. Immediate performance optimization required.');
    }

    // Check error rate
    const errorRate = metrics.requestCount > 0 ? metrics.errorCount / metrics.requestCount : 0;
    if (errorRate > 0.05) {
      status = 'degraded';
      recommendations.push('High error rate detected. Check application logs for issues.');
    }
    if (errorRate > 0.1) {
      status = 'unhealthy';
      recommendations.push('Critical error rate. Immediate investigation required.');
    }

    // Check slow requests
    const slowRequestRate = metrics.requestCount > 0 ? metrics.slowRequests / metrics.requestCount : 0;
    if (slowRequestRate > 0.1) {
      status = 'degraded';
      recommendations.push('High number of slow requests. Consider optimizing performance bottlenecks.');
    }

    return {
      status,
      metrics,
      recommendations
    };
  }
}

// Performance monitoring middleware
export function withPerformanceMonitoring(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    return PerformanceOptimizer.monitorRequest(request, () => handler(request, ...args));
  };
}

// Caching decorator for API routes
export function withCache(ttl?: number) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
      const optimizer = PerformanceOptimizer.getInstance();

      // Try to get from cache
      const cached = optimizer.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      optimizer.set(cacheKey, result, ttl);

      return result;
    };
  };
}

// Database query optimization
export async function optimizedQuery<T>(
  query: () => Promise<T>,
  cacheKey?: string,
  ttl?: number
): Promise<T> {
  return PerformanceOptimizer.optimizeDatabaseQuery(query, cacheKey, ttl);
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();
