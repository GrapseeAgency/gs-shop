"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  Loader2,
  ArrowRight,
  User,
  Globe,
  Lock,
  Package,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VisibilityDecisionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decided, setDecided] = useState(false);
  const [product, setProduct] = useState<{ id: string; name: string } | null>(null);
  const [customerUsername, setCustomerUsername] = useState("");
  const [visibilityChoice, setVisibilityChoice] = useState<boolean | null>(null);

  useEffect(() => {
    if (!orderId || !productId) {
      toast.error("Order ID and Product ID required");
      setLoading(false);
      return;
    }
    fetchVisibilityStatus();
  }, [orderId, productId]);

  const fetchVisibilityStatus = async () => {
    try {
      const res = await fetch(`/api/products/visibility?orderId=${orderId}&productId=${productId}`);
      const data = await res.json();

      if (data.success) {
        if (data.decisionMade) {
          setDecided(true);
          setVisibilityChoice(data.visibility?.isVisible);
        }
        if (data.product) {
          setProduct(data.product);
        }
      }
    } catch (error) {
      toast.error("Failed to load visibility status");
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChoice = async (isVisible: boolean) => {
    if (!orderId || !productId) {
      toast.error("Missing order or product information");
      return;
    }

    setSubmitting(true);
    setVisibilityChoice(isVisible);

    try {
      const res = await fetch("/api/products/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId,
          isVisible,
          customerUsername: customerUsername.trim() || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setDecided(true);
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed to update visibility");
        setVisibilityChoice(null);
      }
    } catch (error) {
      toast.error("Network error");
      setVisibilityChoice(null);
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    router.push("/orders");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderId || !productId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Access</h1>
        <p className="mt-2 text-muted-foreground">Order ID and Product ID are required.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-violet-100 p-4 dark:bg-violet-900/20">
              <Eye className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">
            {decided ? "Visibility Decision Made" : "Keep Product Visible?"}
          </h1>
          <p className="text-muted-foreground">
            {decided 
              ? "Your choice has been saved. Here's what happens next:"
              : "Control whether others can see this product in the shop"
            }
          </p>
        </div>

        {/* Product Info */}
        {product && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-semibold">{product.name}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Username Input (only if not decided) */}
        {!decided && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 rounded-xl border border-border bg-card p-4"
          >
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Your Display Name (Optional)
            </label>
            <Input
              placeholder="Enter username to display on product (or leave blank)"
              value={customerUsername}
              onChange={(e) => setCustomerUsername(e.target.value)}
              className="mt-1"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This name will be shown as the buyer if you choose to keep the product visible
            </p>
          </motion.div>
        )}

        {/* Decision Cards */}
        {!decided ? (
          <div className="grid gap-4 md:grid-cols-2">
            {/* YES - Keep Visible */}
            <motion.div
              whileHover={{ scale: 1.02 } }
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg dark:from-emerald-900/20 dark:to-teal-900/10"
              onClick={() => !submitting && handleVisibilityChoice(true)}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/20 p-3">
                  <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
                     YES, Keep Visible
                  </h3>
                </div>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>Product stays live in shop</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>Shows &quot;Out of Stock&quot; badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>Your username displayed as buyer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>Others can see you purchased this</span>
                </li>
              </ul>

              {submitting && visibilityChoice === true && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
            </motion.div>

            {/* NO - Hide Product */}
            <motion.div
              whileHover={{ scale: 1.02 } }
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer rounded-xl border-2 border-muted-foreground/30 bg-gradient-to-br from-gray-50 to-slate-50 p-6 transition-all hover:border-muted-foreground/50 hover:shadow-lg dark:from-gray-900/20 dark:to-slate-900/10"
              onClick={() => !submitting && handleVisibilityChoice(false)}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gray-500/20 p-3">
                  <Lock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                     NO, Hide It
                  </h3>
                </div>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span>Removed from public shop</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span>Hidden from search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span>Only visible in your private profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span>No one else knows you bought this</span>
                </li>
              </ul>

              {submitting && visibilityChoice === false && (
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Decision Made - Show Result */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border-2 p-6 ${
              visibilityChoice 
                ? "border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10"
                : "border-gray-500/30 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/10"
            }`}
          >
            <div className="mb-4 flex items-center justify-center">
              <div className={`rounded-full p-4 ${
                visibilityChoice ? "bg-emerald-500/20" : "bg-gray-500/20"
              }`}>
                <CheckCircle2 className={`h-10 w-10 ${
                  visibilityChoice ? "text-emerald-600" : "text-gray-600"
                }`} />
              </div>
            </div>

            <h2 className="mb-4 text-center text-xl font-semibold">
              {visibilityChoice 
                ? " Product Will Remain Visible"
                : " Product Will Be Hidden"
              }
            </h2>

            <div className="space-y-3 text-sm">
              {visibilityChoice ? (
                <>
                  <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Globe className="h-4 w-4" />
                    Product stays live in the shop
                  </p>
                  <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Eye className="h-4 w-4" />
                    Shows &quot;Out of Stock&quot; to other visitors
                  </p>
                  <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <User className="h-4 w-4" />
                    Your username: <strong>{customerUsername || "Anonymous"}</strong>
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Lock className="h-4 w-4" />
                    Product removed from public shop
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <EyeOff className="h-4 w-4" />
                    Hidden from search and browse
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4" />
                    Only visible in your private orders
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <Button 
                onClick={finish}
                className="gap-2"
                size="lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                Finish
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Order Info Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Order: #{orderId.slice(-8)}</p>
          {productId && <p className="mt-1">Product ID: {productId.slice(-8)}</p>}
        </div>
      </motion.div>
    </div>
  );
}
