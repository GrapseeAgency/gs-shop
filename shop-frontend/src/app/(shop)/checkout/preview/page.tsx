"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Tag,
  Truck,
  Shield,
  Receipt,
  ChevronRight,
  Loader2,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useShopStore } from "@/lib/store";
import { toast } from "sonner";

// Green color palette
const COLORS = {
  hunter: "#355E3B",
  emerald: "#50C878",
  viridian: "#40826D",
  malachite: "#0BDA51",
  bottle: "#006A4E",
  cadmium: "#006B3C",
  deepJungle: "#004B49",
  british: "#004225",
  brunswick: "#1B4332",
  imperial: "#00755E",
  mint: "#98FF98",
  sage: "#8FBC8F",
  spring: "#00FF7F",
  seafoam: "#93E9BE",
}

interface PreviewItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PriceChart {
  base: number;
  fees: {
    platform: number;
    transaction: number;
    shipping: number;
    tax: number;
    total: number;
  };
  discount: number | null;
  total: number;
}

interface OrderPreview {
  items: PreviewItem[];
  itemCount: number;
  priceChart: PriceChart;
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  confirmation: {
    canProceed: boolean;
    warnings: string[];
    requiresConfirmation: boolean;
  };
  currency: string;
  expiresAt: string;
  customerEmail?: string;
}

export default function OrderPreviewPage() {
  const router = useRouter();
  const { cart } = useShopStore();
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [proceeding, setProceeding] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }
    fetchPreview();
  }, [cart]);

  const fetchPreview = async () => {
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: isNaN(item.quantity) || !item.quantity ? 1 : item.quantity,
        basePrice: item.price,
      }));

      const response = await fetch("/api/checkout/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load preview");
      }

      const data = await response.json();
      setPreview(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load order preview");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    setProceeding(true);
    sessionStorage.setItem("orderPreview", JSON.stringify(preview));
    router.push("/checkout/payment");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="h-10 w-10 text-[#0BDA51]" />
        </motion.div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Failed to load order preview</p>
          <button
            onClick={fetchPreview}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#0BDA51] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Order Preview</h1>
          <span className="ml-auto text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {preview.itemCount} {preview.itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Price Lock Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3.5"
        >
          <div className="flex items-center gap-2.5 text-amber-700">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">
              Prices are locked for 30 minutes. Complete before{" "}
              <span className="font-bold">{new Date(preview.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>.
            </span>
          </div>
        </motion.div>

        {/* Product Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0BDA51] to-[#006A4E] flex items-center justify-center shadow-md shadow-[#0BDA51]/20">
                <Package className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-base">Product Summary</span>
            </div>
          </div>
          <div className="p-5">
            {preview.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-[15px]">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Qty: {item.quantity}  {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <span className="font-bold text-gray-900 text-[15px]">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Base Total</span>
                <span className="font-bold text-gray-900 text-base">{formatPrice(preview.priceChart.base)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Price Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#50C878] to-[#355E3B] flex items-center justify-center shadow-md shadow-[#50C878]/20">
                <Receipt className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-base">Price Chart</span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex justify-between text-[15px] mb-4">
              <span className="text-gray-600">Base</span>
              <span className="font-semibold text-gray-900">{formatPrice(preview.priceChart.base)}</span>
            </div>
            
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">Fees</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-[#0BDA51]">{formatPrice(preview.priceChart.fees.platform)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction Fee</span>
                  <span className="font-medium text-[#0BDA51]">{formatPrice(preview.priceChart.fees.transaction)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-[#0BDA51]">
                    {preview.priceChart.fees.shipping === 0 ? "Free" : formatPrice(preview.priceChart.fees.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium text-[#0BDA51]">{formatPrice(preview.priceChart.fees.tax)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-3">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Total Fees</span>
                <span className="font-bold text-[#0BDA51]">{formatPrice(preview.priceChart.fees.total)}</span>
              </div>
            </div>

            {preview.priceChart.discount && preview.priceChart.discount > 0 && (
              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#0BDA51] flex items-center gap-1 font-medium">
                    <Tag className="h-3.5 w-3.5" />
                    Discount {preview.coupon && `(${preview.coupon.code})`}
                  </span>
                  <span className="text-[#0BDA51] font-bold">-{formatPrice(preview.priceChart.discount)}</span>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#0BDA51]">{formatPrice(preview.priceChart.total)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#00755E] flex items-center justify-center shadow-md shadow-[#006A4E]/20">
                <CheckCircle className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-base">Final Confirmation</span>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#98FF98]/30 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-4 w-4 text-[#006A4E]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-[15px]">
                    {preview.itemCount} {preview.itemCount === 1 ? "item" : "items"} ready
                  </p>
                  <p className="text-sm text-gray-500">Total: {formatPrice(preview.priceChart.total)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#98FF98]/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-[#006A4E]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-[15px]">Secure payment</p>
                  <p className="text-sm text-gray-500">Protected by buyer protection policy</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#98FF98]/30 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-[#006A4E]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-[15px]">Digital delivery</p>
                  <p className="text-sm text-gray-500">Source code delivered instantly</p>
                </div>
              </div>
            </div>

            {preview.confirmation.warnings.length > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700 space-y-1">
                    {preview.confirmation.warnings.map((warning, i) => (
                      <p key={i}>{warning}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Proceed Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sticky bottom-4 pt-2"
        >
          <button
            onClick={handleProceedToCheckout}
            disabled={proceeding || !preview.confirmation.canProceed}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#006A4E] via-[#0BDA51] to-[#006A4E] p-4 text-lg font-bold text-white shadow-xl shadow-[#0BDA51]/25 transition-all hover:shadow-2xl hover:shadow-[#0BDA51]/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {proceeding ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="h-5 w-5" />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  Select Payment Method
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0BDA51] via-[#50C878] to-[#0BDA51] opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          <p className="text-center text-xs text-gray-500 mt-3">
            By proceeding, you agree to our <span className="text-[#006A4E] font-medium">Terms of Service</span> and <span className="text-[#006A4E] font-medium">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
