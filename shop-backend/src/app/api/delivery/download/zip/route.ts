import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
import { Readable } from "stream";

// POST /api/delivery/download/zip - Download order as ZIP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order is paid/completed
    if (order.status !== "completed" && order.status !== "confirmed" && order.status !== "paid") {
      return NextResponse.json(
        { error: "Order not ready for delivery", status: order.status },
        { status: 400 }
      );
    }

    const product = order.items[0]?.product;
    if (!product) {
      return NextResponse.json(
        { error: "No products in order" },
        { status: 400 }
      );
    }

    const projectName = product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    // Check if product has uploaded ZIP file
    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId: product.id }
    });

    // If real ZIP file uploaded, redirect to it or stream it
    if (digitalDelivery?.zipFileUrl) {
      // For external URLs (S3, etc), redirect
      if (digitalDelivery.zipFileUrl.startsWith('http')) {
        return NextResponse.json({
          success: true,
          downloadUrl: digitalDelivery.zipFileUrl,
          fileSize: digitalDelivery.zipFileSize,
          fileName: `${projectName}_${orderId.slice(-8)}.zip`
        });
      }
      // For local files, would stream here
    }

    // Create placeholder ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk) => chunks.push(chunk));

    // Add README
    const readmeContent = `# ${product.name}

Order ID: ${orderId}
Customer: ${order.customerEmail}
Date: ${new Date().toISOString()}

## Project Details
${product.description || "No description available"}

## Delivery Status
${digitalDelivery?.zipFileUrl ? 'Files ready for download' : 'Files being prepared - check back soon'}

## Support
For support, contact us at support@grapsee.com
`;
    archive.append(readmeContent, { name: `${projectName}/README.md` });

    // Add project info
    const projectInfo = {
      orderId,
      productName: product.name,
      productId: product.id,
      customerEmail: order.customerEmail,
      total: order.total,
      purchasedAt: order.createdAt,
      deliveredAt: new Date().toISOString(),
      deliveryStatus: digitalDelivery?.zipFileUrl ? 'ready' : 'preparing'
    };
    archive.append(JSON.stringify(projectInfo, null, 2), { name: `${projectName}/project-info.json` });

    // Add placeholder for actual project files
    archive.append("Project files will be added here by admin", { name: `${projectName}/src/.gitkeep` });
    archive.append("# Installation instructions\n\nComing soon...", { name: `${projectName}/INSTALL.md` });

    // Finalize archive
    await archive.finalize();

    // Wait for all chunks
    await new Promise((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    const zipBuffer = Buffer.concat(chunks);

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${projectName}_${orderId.slice(-8)}.zip"`,
        "Content-Length": zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error("Error creating ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    );
  }
}
