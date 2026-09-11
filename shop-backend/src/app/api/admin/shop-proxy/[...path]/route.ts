import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin Shop Proxy - Routes all /api/admin/shop-proxy/* requests to actual admin handlers
 * This provides a unified API surface for the frontend admin panel
 */

// Route mapping from shop-proxy path to actual admin handler
const ROUTE_MAP: Record<string, { method: string; handler: (req: NextRequest) => Promise<NextResponse> }[]> = {
  'products': [],
  'products/cards': [],
  'categories': [],
  'brands': [],
  'orders': [],
  'users': [],
  'coupons': [],
  'gift-cards': [],
  'flash-sales': [],
  'auctions': [],
  'events': [],
  'flashback': [],
  'placements': [],
  'reviews': [],
  'cleanup': [],
}

// Import base route handlers (GET, POST only)
import { GET as getProducts, POST as createProduct } from '../../products/route'
import { GET as getProductCards } from '../../products/cards/route'
import { GET as getProductBulk, POST as createProductBulk } from '../../products/bulk/route'
import { GET as getProductLuxury } from '../../products/luxury/route'
import { GET as getProductPreview } from '../../products/preview/route'
import { GET as getProductDeliveryStatus } from '../../products/delivery-status/route'
import { POST as uploadProductSvg } from '../../products/upload-svg/route'
import { GET as getCategories, POST as createCategory } from '../../categories/route'
import { GET as getBrands, POST as createBrand } from '../../brands/route'
import { GET as getOrders } from '../../orders/route'
import { GET as getUsers } from '../../users/route'
import { GET as getCoupons, POST as createCoupon } from '../../coupons/route'
import { GET as getGiftCards, POST as createGiftCard } from '../../gift-cards/route'
import { GET as getFlashSales } from '../../flash-sales/route'
import { GET as getAuctions } from '../../auctions/route'
import { GET as getEvents, POST as createEvent } from '../../events/route'
import { GET as getFlashback } from '../../flashback/route'
import { GET as getPlacements, POST as createPlacement } from '../../placements/route'
import { GET as getReviews } from '../../reviews/route'
import { GET as getCleanupStats, POST as runCleanup } from '../../cleanup/route'
import { GET as getDashboard } from '../../dashboard/route'
import { GET as getStats } from '../../stats/route'
import { GET as getTestConnection } from '../../test-connection/route'
import { GET as getHealth } from '../../health/route'
import { GET as getGithubStatus } from '../../github/status/route'
import { GET as getSecurityLogs } from '../../security/logs/route'
import { GET as checkPriceAlerts } from '../../price-alerts/check/route'
import { GET as getPricingCompetitors, POST as createPricingCompetitor } from '../../pricing/competitors/route'
import { GET as getPricingRules, POST as createPricingRule } from '../../pricing/rules/route'
import { POST as applyPricing } from '../../pricing/apply/route'
import { GET as getPricingLogs } from '../../pricing/logs/route'
import { GET as getPendingSellers } from '../../sellers/pending/route'
import { GET as getAllSellers } from '../../sellers/all/route'
import { GET as getChatSessions } from '../../delivery/chat-sessions/route'
import { GET as getAdminChatSessions } from '../../chat/sessions/route'
import { GET as getPendingGithub } from '../../delivery/pending-github/route'

// Map handlers to routes (base routes - GET/POST only)
ROUTE_MAP['products'] = [
  { method: 'GET', handler: getProducts },
  { method: 'POST', handler: createProduct }
]
ROUTE_MAP['products/cards'] = [
  { method: 'GET', handler: getProductCards }
]
ROUTE_MAP['products/bulk'] = [
  { method: 'GET', handler: getProductBulk },
  { method: 'POST', handler: createProductBulk }
]
ROUTE_MAP['products/luxury'] = [
  { method: 'GET', handler: getProductLuxury }
]
ROUTE_MAP['products/preview'] = [
  { method: 'GET', handler: getProductPreview }
]
ROUTE_MAP['products/delivery-status'] = [
  { method: 'GET', handler: getProductDeliveryStatus }
]
ROUTE_MAP['products/upload-svg'] = [
  { method: 'POST', handler: uploadProductSvg }
]
ROUTE_MAP['categories'] = [
  { method: 'GET', handler: getCategories },
  { method: 'POST', handler: createCategory }
]
ROUTE_MAP['brands'] = [
  { method: 'GET', handler: getBrands },
  { method: 'POST', handler: createBrand }
]
ROUTE_MAP['orders'] = [
  { method: 'GET', handler: getOrders }
]
ROUTE_MAP['users'] = [
  { method: 'GET', handler: getUsers }
]
ROUTE_MAP['coupons'] = [
  { method: 'GET', handler: getCoupons },
  { method: 'POST', handler: createCoupon }
]
ROUTE_MAP['gift-cards'] = [
  { method: 'GET', handler: getGiftCards },
  { method: 'POST', handler: createGiftCard }
]
ROUTE_MAP['flash-sales'] = [
  { method: 'GET', handler: getFlashSales }
]
ROUTE_MAP['auctions'] = [
  { method: 'GET', handler: getAuctions }
]
ROUTE_MAP['events'] = [
  { method: 'GET', handler: getEvents },
  { method: 'POST', handler: createEvent }
]
ROUTE_MAP['flashback'] = [
  { method: 'GET', handler: getFlashback }
]
ROUTE_MAP['placements'] = [
  { method: 'GET', handler: getPlacements },
  { method: 'POST', handler: createPlacement }
]
ROUTE_MAP['reviews'] = [
  { method: 'GET', handler: getReviews }
]
ROUTE_MAP['cleanup'] = [
  { method: 'GET', handler: getCleanupStats },
  { method: 'POST', handler: runCleanup }
]
ROUTE_MAP['dashboard'] = [
  { method: 'GET', handler: getDashboard }
]
ROUTE_MAP['stats'] = [
  { method: 'GET', handler: getStats }
]
ROUTE_MAP['test-connection'] = [
  { method: 'GET', handler: getTestConnection }
]
ROUTE_MAP['health'] = [
  { method: 'GET', handler: getHealth }
]
ROUTE_MAP['github/status'] = [
  { method: 'GET', handler: getGithubStatus }
]
ROUTE_MAP['security/logs'] = [
  { method: 'GET', handler: getSecurityLogs }
]
ROUTE_MAP['price-alerts/check'] = [
  { method: 'GET', handler: checkPriceAlerts }
]
ROUTE_MAP['pricing/competitors'] = [
  { method: 'GET', handler: getPricingCompetitors },
  { method: 'POST', handler: createPricingCompetitor }
]
ROUTE_MAP['pricing/rules'] = [
  { method: 'GET', handler: getPricingRules },
  { method: 'POST', handler: createPricingRule }
]
ROUTE_MAP['pricing/apply'] = [
  { method: 'POST', handler: applyPricing }
]
ROUTE_MAP['pricing/logs'] = [
  { method: 'GET', handler: getPricingLogs }
]
ROUTE_MAP['sellers/pending'] = [
  { method: 'GET', handler: getPendingSellers }
]
ROUTE_MAP['sellers/all'] = [
  { method: 'GET', handler: getAllSellers }
]
ROUTE_MAP['delivery/chat-sessions'] = [
  { method: 'GET', handler: getChatSessions }
]
ROUTE_MAP['chat/sessions'] = [
  { method: 'GET', handler: getAdminChatSessions }
]
ROUTE_MAP['delivery/pending-github'] = [
  { method: 'GET', handler: getPendingGithub }
]

/**
 * Handle all shop-proxy requests
 */
async function handleRequest(request: NextRequest, method: string): Promise<NextResponse> {
  // Get the path from URL
  const url = new URL(request.url)
  const pathSegments = url.pathname.replace('/api/admin/shop-proxy/', '').split('/').filter(Boolean)
  
  // Check if this is a dynamic ID route (e.g., products/abc123 or categories/xyz789)
  // ID routes have exactly 2 segments: resource + id
  let path: string
  let resourceId: string | null = null
  
  if (pathSegments.length === 2) {
    // ID-based route: products/{id}, categories/{id}, etc.
    path = pathSegments[0]
    resourceId = pathSegments[1]
    const isValidId = /^[a-zA-Z0-9_-]{10,}$/.test(resourceId)
    if (!isValidId) {
      path = pathSegments.join('/')
      resourceId = null
    }
  } else if (pathSegments.length === 3) {
    // Nested ID route: products/{id}/price-history, orders/{id}/delivery, etc.
    path = pathSegments[0]
    resourceId = pathSegments[1]
    const subPath = pathSegments[2]
    const isValidId = /^[a-zA-Z0-9_-]{10,}$/.test(resourceId)
    if (isValidId) {
      // Forward to ../../{path}/[id]/{subPath}/route
      try {
        const dynamicHandler = await import(`../../${path}/[id]/${subPath}/route`)
        const methodHandler = dynamicHandler[method] || dynamicHandler.GET
        if (!methodHandler) {
          return NextResponse.json(
            { success: false, error: `Method ${method} not supported for ${path}/${subPath}` },
            { status: 405 }
          )
        }
        return await methodHandler(request, { params: Promise.resolve({ id: resourceId }) })
      } catch (error: any) {
        console.error(`Shop proxy error for ${method} ${path}/${resourceId}/${subPath}:`, error)
        return NextResponse.json(
          { success: false, error: error.message || 'Internal server error' },
          { status: 500 }
        )
      }
    }
    // Not a valid ID, treat as nested route
    path = pathSegments.join('/')
    resourceId = null
  } else if (pathSegments.length === 4) {
    // 4-segment path: chat/sessions/{id}/messages, chat/sessions/{id}/close
    const resource = pathSegments[0]
    const subResource = pathSegments[1]
    resourceId = pathSegments[2]
    const action = pathSegments[3]
    const isValidId = /^[a-zA-Z0-9_-]{10,}$/.test(resourceId)
    
    if (isValidId && resource === 'chat' && subResource === 'sessions') {
      // Forward to ../../{resource}/{subResource}/[id]/{action}/route
      try {
        const dynamicHandler = await import(`../../${resource}/${subResource}/[id]/${action}/route`)
        const methodHandler = dynamicHandler[method] || dynamicHandler.GET
        if (!methodHandler) {
          return NextResponse.json(
            { success: false, error: `Method ${method} not supported for ${resource}/${subResource}/${action}` },
            { status: 405 }
          )
        }
        return await methodHandler(request, { params: Promise.resolve({ id: resourceId }) })
      } catch (error: any) {
        console.error(`Shop proxy error for ${method} ${resource}/${subResource}/${resourceId}/${action}:`, error)
        return NextResponse.json(
          { success: false, error: error.message || 'Internal server error' },
          { status: 500 }
        )
      }
    }
    // Not a valid chat route, treat as regular nested route
    path = pathSegments.join('/')
    resourceId = null
  } else {
    // Regular route without ID
    path = pathSegments.join('/')
  }
  
  // Find matching route
  const handlers = ROUTE_MAP[path]

  if (!handlers) {
    return NextResponse.json(
      { success: false, error: `Route not found: ${path}` },
      { status: 404 }
    )
  }

  // If we have a resource ID, forward directly to the [id] dynamic route
  // Dynamic routes handle GET/PUT/DELETE for specific IDs independently of base ROUTE_MAP
  if (resourceId) {
    try {
      // Import and call the dynamic route handler
      const dynamicHandler = await import(`../../${path}/[id]/route`)
      const methodHandler = dynamicHandler[method] || dynamicHandler.GET

      if (!methodHandler) {
        return NextResponse.json(
          { success: false, error: `Method ${method} not supported for ${path} IDs` },
          { status: 405 }
        )
      }

      // Call the dynamic route handler with the ID
      return await methodHandler(request, { params: Promise.resolve({ id: resourceId }) })
    } catch (error: any) {
      console.error(`Shop proxy error for ${method} ${path}/${resourceId}:`, error)

      // Check for specific Prisma errors
      if (error.code === 'P2003') {
        return NextResponse.json(
          { success: false, error: 'Cannot delete: item is referenced by other records (foreign key constraint)' },
          { status: 400 }
        )
      }

      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Unique constraint violation' },
          { status: 400 }
        )
      }

      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Record not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: false, error: error.message || 'Internal server error' },
        { status: 500 }
      )
    }
  }

  // Find matching method handler for base routes (no ID)
  const handlerConfig = handlers.find(h => h.method === method)

  if (!handlerConfig) {
    return NextResponse.json(
      { success: false, error: `Method ${method} not allowed for ${path}` },
      { status: 405 }
    )
  }

  // Call the handler
  try {
    return await handlerConfig.handler(request)
  } catch (error: any) {
    console.error(`Shop proxy error for ${method} ${path}:`, error)
    
    // Check for specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete: item is referenced by other records (foreign key constraint)' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Unique constraint violation' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE')
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH')
}
