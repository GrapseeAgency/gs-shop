"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/lib/store";
import { useShopRouter } from "@/hooks/use-shop-router";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* Confetti particles */
function ConfettiParticle({ index }: { index: number }) {
  const colors = ["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6"];
  const color = colors[index % colors.length];
  const leftPos = 10 + Math.random() * 80;
  const delay = Math.random() * 0.6;
  const duration = 1.5 + Math.random() * 1.5;
  const drift = (Math.random() - 0.5) * 60;

  return (
    <motion.div
      className="absolute top-0 h-2 w-2 rounded-sm"
      style={{ left: `${leftPos}%`, backgroundColor: color }}
      initial={{ y: -10, x: 0, rotate: 0, opacity: 1 }}
      animate={{ y: 300, x: drift, rotate: 720, opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    />
  );
}

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </div>
  );
}

/* Animated Checkmark */
function AnimatedCheckmark() {
  return (
    <motion.div
      className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <CheckCircle2 className="h-12 w-12 text-primary" />
    </motion.div>
  );
}

interface OrderData {
  id: string;
  total: number;
  status: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  createdAt: string;
  paymentMethod: string | null;
  customerEmail?: string;
  user?: { email?: string; name?: string };
}

/* Main Component */
export function OrderSuccess() {
  const { lastOrderId } = useShopStore();
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [notificationsSent, setNotificationsSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch order data and send notifications
  useEffect(() => {
    if (!lastOrderId) return;
    
    fetch(`/api/orders/${lastOrderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setOrderData(data);
          // Send notifications
          sendOrderNotifications(data);
        }
      })
      .catch(() => {});
  }, [lastOrderId]);

  // Send email and push notification
  const sendOrderNotifications = async (order: OrderData) => {
    if (notificationsSent) return;
    setNotificationsSent(true);
    
    // Get customer email from order data (customerEmail field from backend)
    console.log("[Email Debug] Order data:", { 
      customerEmail: order.customerEmail, 
      userEmail: order.user?.email,
      localStorage: localStorage.getItem("customerEmail"),
      fullOrder: order 
    });
    const customerEmail = order.customerEmail || order.user?.email || localStorage.getItem("customerEmail") || "";
    
    if (!customerEmail) {
      console.warn(" No customer email found, skipping email receipt");
      return;
    }
    
    try {
      // 1. Email receipt via Grapsee.com
      await fetch("/api/payment/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          paymentId: "local-test-payment",
          customerEmail,
          totalAmount: order.total,
          currency: "USD"
        }),
      });
      console.log(" Email receipt sent to:", customerEmail);

      // 2. Push notification
      try {
        await fetch("/api/notifications/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: (order as any).userId || "anonymous",
            title: "Order Confirmed! ",
            message: `Your order #${order.id.slice(-6)} has been confirmed`,
            type: "ORDER_CONFIRMED",
            data: { orderId: order.id }
          }),
        });
        console.log(" Push notification sent");
      } catch (pushError) {
        console.log(" Push notification skipped:", pushError);
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  const goToDelivery = () => {
    router.push(`/delivery?orderId=${lastOrderId}`);
  };

  return (
    <motion.div
      className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      {/* Confetti */}
      <AnimatePresence>{showConfetti && <ConfettiBurst />}</AnimatePresence>

      {/* Animated checkmark */}
      <AnimatedCheckmark />

      {/* Title */}
      <motion.h1
        className="mb-2 mt-6 text-2xl font-bold text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Order Placed! 
      </motion.h1>

      <motion.p
        className="mb-4 max-w-sm text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Thank you for your order! 
        <br />
        Email receipt and push notification sent.
      </motion.p>

      {/* Order ID */}
      {lastOrderId && (
        <motion.div
          className="mb-6 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-sm text-muted-foreground">Order:</span>
          <span className="text-sm font-semibold text-foreground">
            #{lastOrderId.slice(-8)}
          </span>
        </motion.div>
      )}

      {/* Phase VII: Delivery Button */}
      <motion.div
        className="w-full max-w-sm space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={goToDelivery}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
          size="lg"
        >
          Choose Delivery Method
          <ArrowRight className="h-5 w-5" />
        </Button>

        <p className="text-xs text-muted-foreground">
          ZIP - Folder - GitHub - Chat with Engineer
        </p>
      </motion.div>
    </motion.div>
  );
}

