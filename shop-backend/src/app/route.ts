import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Grapsee Shop API",
    version: "1.0.0",
    description: "Full-featured e-commerce platform backend API",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        session: "GET /api/auth/session"
      },
      products: {
        list: "GET /api/products",
        details: "GET /api/products/:id",
        featured: "GET /api/products?featured=true"
      },
      cart: {
        get: "GET /api/cart",
        add: "POST /api/cart",
        remove: "DELETE /api/cart"
      },
      orders: "GET/POST /api/orders",
      wallet: "GET/POST /api/wallet",
      achievements: "GET/POST /api/achievements",
      flashSale: "GET /api/flash-sale",
      documentation: "https://docs.grapsee.com/api"
    },
    status: "operational",
    timestamp: new Date().toISOString()
  });
}