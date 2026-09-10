"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Loader2,
  FileText,
  MessageCircle,
  ShoppingCart,
  Copy,
  Download,
  ChevronRight,
  MapPin,
  CreditCard,
  Tag,
  Shield,
  Navigation,
  Phone,
  ExternalLink,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Star,
  PenLine,
  Signature,
  Github,
  FolderOpen,
  FileArchive,
  MessageSquare,
  ChevronRight as ChevronRightIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useShopRouter } from "@/hooks/use-shop-router";
import { useShopStore } from "@/lib/store";
import { formatPrice } from "@/components/shop/product-card";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  total: number;
  discount: number;
  couponCode: string | null;
  status: string;
  paymentMethod: string | null;
  shippingAddress: string | null;
  trackingNumber: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface TrackingStep {
  status: string;
  label: string;
  location: string;
  date: string;
  completed: boolean;
  current: boolean;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: { name: string; logo: string; phone: string };
  deliveryAddress: string;
  steps: TrackingStep[];
  estimatedDelivery: string;
  currentStatus: string;
}

const STEPS = [
  { key: "pending", label: "Ordered", icon: Package },
  { key: "processing", label: "Processing", icon: Loader2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "completed", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_STEP_INDEX: Record<string, number> = {
  pending: 0,
  processing: 1,
  confirmed: 1,
  shipped: 2,
  in_transit: 3,
  out_for_delivery: 4,
  completed: 5,
  delivered: 5,
};

function getStepIndex(status: string): number {
  return STATUS_STEP_INDEX[status] ?? 0;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  // Phase VII GitHub delivery flow
  const [githubUsername, setGithubUsername] = useState("");
  const [githubStep, setGithubStep] = useState<
    "input" | "fetching" | "confirmed" | "granted"
  >("input");
  const [githubUser, setGithubUser] = useState<{
    login: string;
    avatar_url: string;
    name: string | null;
  } | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const { goBack, goInvoice, goContact, goProduct, goReturns, goTrack } =
    useShopRouter();
  const { addToCart } = useShopStore();

  const handleGithubVerify = async () => {
    if (!githubUsername.trim()) return;
    setGithubLoading(true);
    setGithubStep("fetching");
    try {
      const res = await fetch(
        `https://api.github.com/users/${githubUsername.trim()}`,
      );
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setGithubUser({
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name,
      });
      setGithubStep("confirmed");
    } catch {
      toast.error("GitHub user not found. Check the username and try again.");
      setGithubStep("input");
    } finally {
      setGithubLoading(false);
    }
  };

  const handleGithubGrant = async () => {
    if (!githubUser || !orderId) return;
    setGithubLoading(true);
    try {
      await fetch("/api/digital-downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          githubUsername: githubUser.login,
          action: "grant_repo_access",
        }),
      });
      setGithubStep("granted");
      toast.success(`Repo access granted to @${githubUser.login}!`);
    } catch {
      toast.error("Failed to grant access. Please contact support.");
    } finally {
      setGithubLoading(false);
    }
  };

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Fetch tracking info
  const fetchTracking = async () => {
    if (!orderId) return;
    setTrackingLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/track`);
      if (res.ok) {
        const data = await res.json();
        setTrackingInfo(data);
      }
    } catch {
      /* ignore */
    } finally {
      setTrackingLoading(false);
    }
  };

  // Auto-fetch tracking when showing
  useEffect(() => {
    if (showTracking && !trackingInfo && !trackingLoading) {
      fetchTracking();
    }
  }, [showTracking]);

  // Real-time status polling simulation
  useEffect(() => {
    if (!showTracking) return;
    const interval = setInterval(() => {
      setPollingCount((prev) => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [showTracking]);

  const handleCopyTracking = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setTrackingCopied(true);
      toast.success("Tracking number copied!");
      setTimeout(() => setTrackingCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleReorder = () => {
    order!.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      });
    });
    toast.success(`${order!.items.length} item(s) added to cart!`);
  };

  const handleSubmitFeedback = () => {
    if (feedbackRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setFeedbackSubmitted(true);
    toast.success("Thank you for your feedback!");
  };

  if (loading || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const orderNumber = order.id.slice(-8).toUpperCase();
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "completed";
  const progressPercent = isCancelled
    ? 0
    : Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">
              Order #{orderNumber}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge
            className={
              isCancelled
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : isDelivered
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }
          >
            {isCancelled ? "Cancelled" : isDelivered ? "Delivered" : "Active"}
          </Badge>
        </div>
      </div>

      {/* Visual Order Timeline */}
      {!isCancelled && (
        <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Order Status</h3>
            <Badge variant="outline" className="text-[10px]">
              {progressPercent}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4">
            <motion.div
              className={`h-full rounded-full ${isDelivered ? "bg-emerald-500" : "bg-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="relative">
            {STEPS.map((step, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.key}
                  className="relative flex items-start gap-3 pb-5 last:pb-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-[15px] top-9 h-[calc(100%-16px)] w-0.5">
                      <div
                        className={`h-full w-full ${i < currentStep ? "bg-primary" : "bg-border"}`}
                      />
                      {i < currentStep && (
                        <motion.div
                          className="absolute top-0 left-0 w-full bg-primary"
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ duration: 0.5, delay: i * 0.15 }}
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isCurrent && i === 1 ? "animate-spin" : ""}`}
                    />
                  </div>
                  <div className="pt-1">
                    <p
                      className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-primary">Current</p>
                    )}
                    {isCompleted && i < currentStep && (
                      <p className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping Tracker Section */}
      {!isCancelled && (
        <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Shipping</h3>
            </div>
          </div>

          {order.trackingNumber ? (
            <div className="space-y-3">
              {/* Tracking Number */}
              <div className="rounded-xl bg-primary/5 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    Tracking Number
                  </span>
                  <button
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                    onClick={() => handleCopyTracking(order.trackingNumber!)}
                  >
                    {trackingCopied ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {trackingCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-sm font-mono font-bold text-foreground">
                  {order.trackingNumber}
                </p>
              </div>

              {/* Track on Map Link */}
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => goTrack(order.trackingNumber!)}
              >
                <Navigation className="h-4 w-4" />
                Track on Map
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>

              {/* Expand Tracking Details Toggle */}
              <Button
                className="w-full gap-2"
                variant="ghost"
                size="sm"
                onClick={() => setShowTracking(!showTracking)}
              >
                {showTracking ? "Hide Details" : "View Details"}
                {showTracking ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-3 text-center">
              <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                No tracking number yet
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Tracking info will appear once shipped
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detailed Tracking (Expandable) */}
      <AnimatePresence>
        {showTracking && (
          <motion.div
            className="mx-4 mt-2 rounded-2xl border border-border/50 bg-card p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {trackingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading tracking info...
                </span>
              </div>
            ) : trackingInfo ? (
              <>
                {/* Carrier Info */}
                <div className="mb-4 flex items-center justify-between rounded-xl border border-border/30 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {trackingInfo.carrier.logo}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {trackingInfo.carrier.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Carrier
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => {
                      window.open(`tel:${trackingInfo.carrier.phone}`);
                      toast.info(
                        `Call ${trackingInfo.carrier.name}: ${trackingInfo.carrier.phone}`,
                      );
                    }}
                  >
                    <Phone className="h-3 w-3" />
                    Contact
                  </Button>
                </div>

                {/* Delivery Address */}
                {trackingInfo.deliveryAddress && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-border/30 p-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Delivery Address
                      </p>
                      <p className="text-xs text-foreground">
                        {trackingInfo.deliveryAddress}
                      </p>
                    </div>
                  </div>
                )}

                {/* Estimated Delivery */}
                <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      Estimated Delivery
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {formatDate(trackingInfo.estimatedDelivery)}
                    </p>
                  </div>
                  <Truck className="h-5 w-5 text-emerald-400" />
                </div>

                {/* Detailed Tracking Steps */}
                <h4 className="text-xs font-semibold text-foreground mb-3">
                  Tracking History
                </h4>
                <div className="space-y-0">
                  {trackingInfo.steps.map((step, i) => (
                    <div
                      key={step.status}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >
                      {i < trackingInfo.steps.length - 1 && (
                        <div
                          className={`absolute left-[11px] top-6 h-full w-0.5 ${
                            step.completed ? "bg-emerald-400" : "bg-border"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                          step.current
                            ? "bg-blue-500 ring-4 ring-blue-500/20"
                            : step.completed
                              ? "bg-emerald-500"
                              : "bg-muted border border-border"
                        }`}
                      >
                        {step.completed && !step.current ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        ) : step.current ? (
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p
                          className={`text-xs font-medium ${
                            step.current
                              ? "text-blue-500"
                              : step.completed
                                ? "text-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                          {step.current && (
                            <span className="ml-1.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] text-blue-500">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {step.location}
                        </p>
                        <p className="text-[9px] text-muted-foreground/70">
                          {formatDateTime(step.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Polling indicator */}
                {pollingCount > 0 && (
                  <p className="mt-3 text-center text-[9px] text-muted-foreground">
                    Last updated: just now  Checking for updates...
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Tracking information not yet available
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery Confirmation with Signature Placeholder */}
      {isDelivered && (
        <motion.div
          className="mx-4 mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              Delivery Confirmed
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Your order was delivered on {formatDate(order.updatedAt)}
          </p>

          {/* Signature Placeholder */}
          <div className="rounded-xl border border-dashed border-border/50 bg-background/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Signature className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Delivery Signature
              </span>
            </div>
            <div className="h-16 flex items-center justify-center rounded-lg bg-muted/30">
              <p className="text-sm italic text-muted-foreground/40 font-serif">
                Received by Customer
              </p>
            </div>
            <p className="text-[9px] text-muted-foreground/50 mt-1.5 text-right">
              Signed at delivery
            </p>
          </div>
        </motion.div>
      )}

      {/* Order Items */}
      <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">
          Items ({order.items.length})
        </h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <button
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"
                onClick={() => goProduct(item.productId)}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground/40" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.productName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-primary flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">
              {formatPrice(order.total + order.discount)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-500">Discount</span>
              <span className="text-emerald-500">
                -{formatPrice(order.discount)}
              </span>
            </div>
          )}
          {order.couponCode && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coupon</span>
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-primary" />
                <code className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-mono text-primary">
                  {order.couponCode}
                </code>
              </div>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-base font-bold text-foreground">Total</span>
            <span className="text-base font-bold text-primary">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment & Details */}
      <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">Details</h3>
        <div className="space-y-2.5">
          {order.paymentMethod && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Payment:</span>
              <span className="text-xs text-foreground capitalize">
                {order.paymentMethod}
              </span>
            </div>
          )}
          {order.shippingAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-xs text-muted-foreground">Shipping:</span>
                <p className="text-xs text-foreground">
                  {order.shippingAddress}
                </p>
              </div>
            </div>
          )}
          {order.trackingNumber && (
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tracking:</span>
              <code className="text-xs font-mono text-primary">
                {order.trackingNumber}
              </code>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-emerald-500">
              Money-back guarantee included
            </span>
          </div>
        </div>
      </div>

      {/* Order Feedback / Rating Section */}
      {isDelivered && !feedbackSubmitted && (
        <motion.div
          className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Rate Your Order
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            How was your experience with this order?
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFeedbackRating(star)}
                className="p-0.5 active:scale-110 transition-transform"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= feedbackRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            {feedbackRating > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {
                  ["", "Poor", "Fair", "Good", "Great", "Excellent"][
                    feedbackRating
                  ]
                }
              </span>
            )}
          </div>

          {/* Comment */}
          <textarea
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Share your experience (optional)"
            className="w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <Button
            className="w-full mt-3 gap-2"
            onClick={handleSubmitFeedback}
            disabled={feedbackRating === 0}
          >
            <Star className="h-4 w-4" />
            Submit Feedback
          </Button>
        </motion.div>
      )}

      {feedbackSubmitted && (
        <motion.div
          className="mx-4 mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Thank you for your feedback!
          </p>
          <p className="text-[11px] text-muted-foreground">
            Your review helps us improve our service.
          </p>
        </motion.div>
      )}

      {/* Phase VII Project Delivery Section */}
      <motion.div
        className="mx-4 mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="mb-1 text-sm font-bold text-foreground">
           Access Your Project
        </h3>
        <p className="mb-3 text-[10px] text-muted-foreground">
          Choose how youd like to receive your deliverable
        </p>

        {/* Quick download options */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-9 border-border/50"
          >
            <FileArchive className="h-3.5 w-3.5" />
            ZIP Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-9 border-border/50"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Folder Download
          </Button>
        </div>

        {/* GitHub Repo Sub-Flow */}
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Github className="h-4 w-4 text-foreground" />
            <span className="text-xs font-semibold text-foreground">
              GitHub Repo Access
            </span>
          </div>

          {githubStep === "input" && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter your GitHub username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGithubVerify()}
                className="h-8 text-xs bg-background"
              />
              <Button
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={handleGithubVerify}
                disabled={!githubUsername.trim()}
              >
                Verify
                <ChevronRightIcon className="h-3 w-3" />
              </Button>
            </div>
          )}

          {githubStep === "fetching" && (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                Fetching GitHub account
              </span>
            </div>
          )}

          {githubStep === "confirmed" && githubUser && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                <img
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  className="h-8 w-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    @{githubUser.login}
                  </p>
                  {githubUser.name && (
                    <p className="text-[10px] text-muted-foreground">
                      {githubUser.name}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    setGithubStep("input");
                    setGithubUser(null);
                    setGithubUsername("");
                  }}
                >
                  Change
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1"
                  onClick={handleGithubGrant}
                  disabled={githubLoading}
                >
                  {githubLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  Grant Access
                </Button>
              </div>
            </div>
          )}

          {githubStep === "granted" && githubUser && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Access granted to @{githubUser.login}!
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Check your GitHub email for the repo invitation.
              </p>
            </div>
          )}
        </div>

        {/* Chat with Engineer */}
        <Button
          variant="outline"
          className="w-full mt-2 gap-2 text-xs h-9 border-border/50"
          onClick={() => goContact()}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat with Engineer
        </Button>
      </motion.div>

      {/* Phase VIII Product Visibility Section */}
      {isDelivered && order.items[0]?.productId && (
        <ProductVisibilityControl productId={order.items[0].productId} />
      )}

      {/* Actions */}
      <div className="mx-4 mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="gap-2"
            onClick={() => goInvoice(order.id)}
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Invoice
          </Button>
          <Button className="gap-2" onClick={handleReorder} variant="outline">
            <ShoppingCart className="h-4 w-4" />
            Reorder
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="gap-2"
            onClick={() => goReturns()}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4" />
            Return/Refund
          </Button>
          <Button
            className="gap-2"
            onClick={() => goContact()}
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
            Help
          </Button>
        </div>
        {order.trackingNumber && (
          <Button
            className="w-full gap-2"
            onClick={() => goTrack(order.trackingNumber!)}
            variant="default"
          >
            <Navigation className="h-4 w-4" />
            Track Shipment
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Phase VIII Product Visibility Control Component
function ProductVisibilityControl({ productId }: { productId: string }) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Fetch current visibility status
  useEffect(() => {
    if (!productId || fetched) return;

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isPubliclyVisible === "boolean") {
          setIsVisible(data.isPubliclyVisible);
        }
        setFetched(true);
      })
      .catch(() => setFetched(true));
  }, [productId, fetched]);

  const handleToggle = async (newVisibility: boolean) => {
    if (isVisible === newVisibility) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPubliclyVisible: newVisibility }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsVisible(newVisibility);
        toast.success(
          newVisibility
            ? "Product is now visible on the shop"
            : "Product hidden from public shop"
        );
      } else {
        toast.error(data.error || "Failed to update visibility");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fetched || isVisible === null) {
    return (
      <motion.div
        className="mx-4 mt-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          <span className="text-xs text-muted-foreground">
            Loading visibility settings...
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mx-4 mt-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="mb-1 text-sm font-bold text-foreground flex items-center gap-2">
        <Eye className="h-4 w-4 text-violet-500" />
        Product Visibility
      </h3>
      <p className="mb-3 text-[10px] text-muted-foreground">
        Control whether this product appears in the public shop
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={isVisible ? "default" : "outline"}
          size="sm"
          className={`gap-1.5 text-xs h-9 ${
            isVisible
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "border-emerald-500/30 hover:bg-emerald-500/10"
          }`}
          onClick={() => handleToggle(true)}
          disabled={loading || isVisible === true}
        >
          <Eye className="h-3.5 w-3.5" />
          {loading && isVisible === false ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Visible"
          )}
        </Button>
        <Button
          variant={!isVisible ? "default" : "outline"}
          size="sm"
          className={`gap-1.5 text-xs h-9 ${
            !isVisible
              ? "bg-muted-foreground hover:bg-muted-foreground/80 text-white"
              : "border-muted-foreground/30 hover:bg-muted"
          }`}
          onClick={() => handleToggle(false)}
          disabled={loading || isVisible === false}
        >
          <EyeOff className="h-3.5 w-3.5" />
          {loading && isVisible === true ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Hidden"
          )}
        </Button>
      </div>

      <div className="mt-3 rounded-lg bg-background/50 p-2">
        {isVisible ? (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Product is <strong>visible</strong> on the shop. Others can see
              it&apos;s sold and view your username. Nobody can purchase it.
            </span>
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
            <EyeOff className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Product is <strong>hidden</strong> from public view. Only you can
              see it in your order history.
            </span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
