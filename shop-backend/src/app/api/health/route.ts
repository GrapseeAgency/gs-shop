import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Liveness probe for the GitHub keep-alive workflow and the mobile apps.
// 200 + { ok: true } means API + database are both up.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "grapsee-shop-backend",
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "database unreachable" },
      { status: 503 },
    );
  }
}
