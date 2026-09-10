"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  Check,
  Zap,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Copy,
  CheckCheck,
  Award,
  BadgeCheck,
  Headphones,
  Facebook,
  Twitter,
  Link2,
  X,
  Minus,
  Plus,
  Bell,
  HelpCircle,
  ThumbsUp,
  Send,
  TrendingDown,
  TrendingUp,
  Package,
  ArrowRight,
  AlertCircle,
  Play,
  BookOpen,
  GitCompare,
  Eye,
  Users,
  ShoppingBag,
  Layers,
  Sparkles,
  Folder,
  FileCode,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useShopStore, type Product } from "@/lib/store";
import { formatPrice } from "@/components/shop/product-card";
import { toast } from "sonner";
import { useShopRouter } from "@/hooks/use-shop-router";
import { SizeGuide } from "@/components/shop/size-guide";
import { InventoryBadge } from "@/components/shop/inventory-badge";

// Import detailed product illustrations
import {
  DetailIllustrationBusinessLandingPage,
  DetailIllustrationEcommerce,
  DetailIllustrationCorporateWebsite,
  DetailIllustrationPortfolioWebsite,
  DetailIllustrationSaaSDashboard,
  DetailIllustrationiOSAndroidApp,
  DetailIllustrationMVPAppPrototype,
  DetailIllustrationFoodDeliveryApp,
  DetailIllustrationCICDPipeline,
  DetailIllustrationCloudInfrastructure,
  DetailIllustrationDockerKubernetes,
  DetailIllustrationBrandIdentityDesign,
  DetailIllustrationUIUXAudit,
  DetailIllustrationMobileAppUIKit,
  DetailIllustrationAIChatbotIntegration,
  DetailIllustrationMLDataPipeline,
  DetailIllustrationSEOOptimizationPackage,
  DetailIllustrationSocialMediaStrategy,
  DetailIllustrationMiniLandingPage,
  DetailIllustrationStarterBusinessSite,
  DetailIllustrationLinkInBioPage,
  DetailIllustrationSimpleTodoApp,
  DetailIllustrationBasicCalculatorApp,
  DetailIllustrationExpenseTrackerLite,
  DetailIllustrationAutoBackupScript,
  DetailIllustrationServerMonitorBot,
  DetailIllustrationIconPackStarter,
  DetailIllustrationWireframeKitLite,
  DetailIllustrationAITextSummarizer,
  DetailIllustrationSmartEmailClassifier,
  DetailIllustrationBasicImageRecognitionAPI,
  DetailIllustrationMetaTagsOptimizer,
  DetailIllustrationLocalSEOBooster,
  DetailIllustrationPlaceholder,
} from "@/components/shop/product-detail-illustrations";

// Get detail illustration based on product slug
function getDetailIllustration(slug: string) {
  switch (slug) {
    case "business-landing-page":
      return <DetailIllustrationBusinessLandingPage />;
    case "ecommerce-website":
      return <DetailIllustrationEcommerce />;
    case "corporate-website":
      return <DetailIllustrationCorporateWebsite />;
    case "portfolio-website":
      return <DetailIllustrationPortfolioWebsite />;
    case "saas-dashboard":
      return <DetailIllustrationSaaSDashboard />;
    case "ios-android-app":
      return <DetailIllustrationiOSAndroidApp />;
    case "mvp-app-prototype":
      return <DetailIllustrationMVPAppPrototype />;
    case "food-delivery-app":
      return <DetailIllustrationFoodDeliveryApp />;
    case "cicd-pipeline-setup":
      return <DetailIllustrationCICDPipeline />;
    case "cloud-infrastructure":
      return <DetailIllustrationCloudInfrastructure />;
    case "docker-kubernetes-setup":
      return <DetailIllustrationDockerKubernetes />;
    case "brand-identity-design":
      return <DetailIllustrationBrandIdentityDesign />;
    case "uiux-audit":
      return <DetailIllustrationUIUXAudit />;
    case "mobile-app-ui-kit":
      return <DetailIllustrationMobileAppUIKit />;
    case "ai-chatbot-integration":
      return <DetailIllustrationAIChatbotIntegration />;
    case "ml-data-pipeline":
      return <DetailIllustrationMLDataPipeline />;
    case "seo-optimization-package":
      return <DetailIllustrationSEOOptimizationPackage />;
    case "social-media-strategy":
      return <DetailIllustrationSocialMediaStrategy />;
    case "mini-landing-page":
      return <DetailIllustrationMiniLandingPage />;
    case "starter-business-site":
      return <DetailIllustrationStarterBusinessSite />;
    case "link-in-bio-page":
      return <DetailIllustrationLinkInBioPage />;
    case "simple-todo-app":
      return <DetailIllustrationSimpleTodoApp />;
    case "basic-calculator-app":
      return <DetailIllustrationBasicCalculatorApp />;
    case "expense-tracker-lite":
      return <DetailIllustrationExpenseTrackerLite />;
    case "auto-backup-script":
      return <DetailIllustrationAutoBackupScript />;
    case "server-monitor-bot":
      return <DetailIllustrationServerMonitorBot />;
    case "icon-pack-starter":
      return <DetailIllustrationIconPackStarter />;
    case "wireframe-kit-lite":
      return <DetailIllustrationWireframeKitLite />;
    case "ai-text-summarizer":
      return <DetailIllustrationAITextSummarizer />;
    case "smart-email-classifier":
      return <DetailIllustrationSmartEmailClassifier />;
    case "basic-image-recognition-api":
      return <DetailIllustrationBasicImageRecognitionAPI />;
    case "meta-tags-optimizer":
      return <DetailIllustrationMetaTagsOptimizer />;
    case "local-seo-booster":
      return <DetailIllustrationLocalSEOBooster />;
    default:
      return <DetailIllustrationPlaceholder />;
  }
}

// --- Types ---
interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface ProductQuestion {
  id: string;
  productId: string;
  author: string;
  question: string;
  answer: string | null;
  answeredBy: string | null;
  isHelpful: number;
  createdAt: string;
}

interface PriceHistoryEntry {
  id: string;
  productId: string;
  price: number;
  recordedAt: string;
}

interface PriceSummary {
  lowest: number;
  highest: number;
  average: number;
  current: number;
  totalRecords: number;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  estimatedDays: string | null;
  isActive: boolean;
  order: number;
}

type ServiceTier = "basic" | "standard" | "premium";

interface TierConfig {
  label: string;
  multiplier: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
}

const TIERS: Record<ServiceTier, TierConfig> = {
  basic: {
    label: "Basic",
    multiplier: 1,
    icon: Zap,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    features: [
      "Core functionality",
      "Standard delivery",
      "Email support",
      "1 revision",
    ],
  },
  standard: {
    label: "Standard",
    multiplier: 1.6,
    icon: Award,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    features: [
      "Full features",
      "Priority delivery",
      "Chat support",
      "3 revisions",
      "Source files",
    ],
  },
  premium: {
    label: "Premium",
    multiplier: 2.5,
    icon: BadgeCheck,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    features: [
      "Everything in Standard",
      "Express delivery",
      "24/7 dedicated support",
      "Unlimited revisions",
      "Source files",
      "Free consultation",
      "VIP handling",
    ],
  },
};

// --- Sub-Components ---

function ImageCarousel({
  images,
  productName,
  slug,
}: {
  images: string[];
  productName: string;
  slug: string;
}) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleTap = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (zoomed) {
        setZoomed(false);
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0]?.clientX ?? rect.left + rect.width / 2;
        clientY = e.touches[0]?.clientY ?? rect.top + rect.height / 2;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      setZoomOrigin({ x, y });
      setZoomed(true);
    },
    [zoomed],
  );

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-4 overflow-hidden rounded-2xl shadow-2xl"
        style={{ height: "280px" }}
      >
        {getDetailIllustration(slug)}
      </motion.div>
    );
  }

  return (
    <div className="mx-4">
      <div
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
        onClick={handleTap}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Carousel setApi={setApi} opts={{ loop: true }}>
              <CarouselContent>
                {images.map((img, i) => (
                  <CarouselItem key={i}>
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={img}
                        alt={`${productName} ${i + 1}`}
                        className="h-56 w-full object-cover sm:h-72"
                        animate={
                          zoomed
                            ? {
                                scale: 2.2,
                                originX: `${zoomOrigin.x}%`,
                                originY: `${zoomOrigin.y}%`,
                              }
                            : { scale: 1 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                        }}
                        draggable={false}
                      />
                      {zoomed && (
                        <div className="absolute inset-0 flex items-end justify-center pb-3">
                          <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                            Tap to zoom out
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "h-2 w-5 bg-primary"
                  : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
                ? "fill-amber-400/50 text-amber-400"
                : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [reviews]);

  const maxCount = Math.max(...distribution, 1);

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-2">
          <span className="w-3 text-right text-[11px] font-medium text-muted-foreground">
            {star}
          </span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{
                width: `${(distribution[star - 1] / maxCount) * 100}%`,
              }}
              transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
            />
          </div>
          <span className="w-6 text-right text-[11px] text-muted-foreground">
            {distribution[star - 1]}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const dateStr = useMemo(() => {
    try {
      return new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [review.createdAt]);

  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-card p-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {review.author}
              </span>
              {review.isVerified && (
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-[10px] text-muted-foreground">
                {dateStr}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {review.comment}
      </p>
    </motion.div>
  );
}

function WriteReviewSheet({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !comment.trim() || !author.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: author.trim(),
          rating,
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Review submitted!", {
          description: "Thank you for your feedback.",
        });
        setRating(0);
        setComment("");
        setAuthor("");
        setOpen(false);
        onSubmitted();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Write a Review
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-2xl"
      >
        <SheetHeader className="pb-2">
          <SheetTitle>Write a Review</SheetTitle>
          <SheetDescription>
            Share your experience with this product
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div>
            <Label className="mb-2 text-sm">Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-foreground">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </span>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="review-author" className="mb-1.5 text-sm">
              Your Name
            </Label>
            <Input
              id="review-author"
              placeholder=""
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="review-text" className="mb-1.5 text-sm">
              Your Review
            </Label>
            <Textarea
              id="review-text"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting || !rating || !comment.trim() || !author.trim()
            }
            className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Product Videos Section ---
function ProductVideosSection({ productId }: { productId: string }) {
  const [videos, setVideos] = useState<
    Array<{
      id: string;
      title: string;
      thumbnailUrl: string | null;
      videoUrl: string;
      duration: number | null;
      views: number;
      type: string;
    }>
  >([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/product-videos?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => setVideos(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
  }, [productId]);

  if (videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" /> Video Reviews
        </h3>
        <Badge variant="secondary" className="text-[10px]">
          {videos.length} videos
        </Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() =>
              setActiveVideo(video.id === activeVideo ? null : video.id)
            }
            className="flex-shrink-0 w-48 rounded-xl border border-border/50 overflow-hidden bg-card transition-all hover:border-primary/30"
          >
            <div className="relative h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {video.type === "review" ? (
                <Star className="h-6 w-6 text-primary/60" />
              ) : video.type === "unboxing" ? (
                <Package className="h-6 w-6 text-primary/60" />
              ) : video.type === "tutorial" ? (
                <BookOpen className="h-6 w-6 text-primary/60" />
              ) : (
                <GitCompare className="h-6 w-6 text-primary/60" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/80 flex items-center justify-center">
                  <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                </div>
              </div>
              {video.duration && (
                <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                  {Math.floor(video.duration / 60)}:
                  {(video.duration % 60).toString().padStart(2, "0")}
                </span>
              )}
            </div>
            <div className="p-2">
              <p className="text-[11px] font-medium text-foreground truncate">
                {video.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[8px] h-4 px-1 capitalize"
                >
                  {video.type}
                </Badge>
                <span className="text-[9px] text-muted-foreground">
                  {video.views} views
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Video Player */}
      <AnimatePresence>
        {activeVideo &&
          (() => {
            const video = videos.find((v) => v.id === activeVideo);
            if (!video) return null;
            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 rounded-xl border border-border/50 overflow-hidden bg-card"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center relative">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Video Player
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {video.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Phase I: Architecture Details Section ---
function ArchitectureDetailsSection({
  architectureStyle,
  folderStructure,
}: {
  architectureStyle?: string | null;
  folderStructure?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const architectureOptions = [
    { value: "monolithic", label: "Monolithic", desc: "Single unified codebase" },
    { value: "microservices", label: "Microservices", desc: "Independent services" },
    { value: "layered", label: "Layered", desc: "Presentation/Business/Data layers" },
    { value: "event-driven", label: "Event-Driven", desc: "Async event handling" },
    { value: "soa", label: "SOA", desc: "Service-Oriented Architecture" },
    { value: "serverless", label: "Serverless", desc: "Function-as-a-Service" },
    { value: "p2p", label: "P2P", desc: "Peer-to-Peer distributed" },
  ];

  const selected = architectureOptions.find(
    (opt) => opt.value === architectureStyle?.toLowerCase()
  );

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-foreground">
              Architecture Details
            </span>
            <p className="text-[10px] text-muted-foreground">
              {selected ? selected.label : "View system architecture"}
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 space-y-3 rounded-xl border border-border/50 bg-card p-4"
        >
          {/* Architecture Style */}
          {selected && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selected.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{selected.desc}</span>
            </div>
          )}

          {/* Architecture Options List */}
          <div className="grid grid-cols-2 gap-2">
            {architectureOptions.map((opt) => (
              <div
                key={opt.value}
                className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${
                  opt.value === architectureStyle?.toLowerCase()
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/30 bg-muted/30"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    opt.value === architectureStyle?.toLowerCase()
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
                <span className={opt.value === architectureStyle?.toLowerCase() ? "font-medium" : ""}>
                  {opt.label}
                </span>
              </div>
            ))}
          </div>

          {/* Folder Structure */}
          {folderStructure && (
            <div className="mt-3">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Folder Structure
              </h4>
              <FolderStructureSVG structure={folderStructure} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// --- Phase I: One-of-a-kind Section ---
function OneOfAKindSection({ isUnique, isSold, buyerUsername }: { isUnique?: boolean | null, isSold?: boolean, buyerUsername?: string | null }) {
  if (!isUnique) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
             Each product is one-of-a-kind
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sold once, then <strong className="text-foreground">Out of Stock</strong> forever.
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            This unique item will be removed from the shop after purchase. 
            Only the buyer will have access to it.
          </p>
          {isSold && buyerUsername && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
              <span className="text-xs font-medium text-emerald-600"> Bought by</span>
              <span className="text-xs font-semibold text-emerald-700">@{buyerUsername}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Phase I: Folder Structure SVG Component ---
function FolderStructureSVG({ structure }: { structure: string }) {
  // Parse folder structure from JSON or string format
  const parseStructure = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      // If not valid JSON, treat as simple text list
      return str.split("\n").filter(Boolean).map((line) => ({
        name: line.replace(/^[-\s]*/, ""),
        type: line.includes(".") ? "file" : "folder",
        level: (line.match(/^[-\s]*/) || [""])[0].length / 2,
      }));
    }
  };

  const items = parseStructure(structure);

  const renderItem = (item: any, index: number, level: number = 0) => {
    const isFile = item.type === "file" || item.name.includes(".");
    const Icon = isFile ? FileCode : FolderOpen;
    const colorClass = isFile
      ? "text-emerald-400"
      : "text-blue-400";

    return (
      <div
        key={`${item.name}-${index}`}
        className="flex items-center gap-2 py-1"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <Icon className={`h-4 w-4 ${colorClass} flex-shrink-0`} />
        <span className="text-xs font-mono text-muted-foreground truncate">
          {item.name}
        </span>
      </div>
    );
  };

  // If items is an array
  if (Array.isArray(items)) {
    return (
      <div className="rounded-lg border border-border/30 bg-muted/20 p-3 max-h-64 overflow-y-auto font-mono text-xs">
        {items.map((item, index) => renderItem(item, index, item.level || 0))}
      </div>
    );
  }

  // Fallback for simple string display
  return (
    <div className="rounded-lg border border-border/30 bg-muted/20 p-3 max-h-64 overflow-y-auto">
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
        {structure}
      </pre>
    </div>
  );
}

// --- Q&A Section ---
function QASection({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/product-questions?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmitQuestion = async () => {
    if (!authorName.trim() || !questionText.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/product-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: authorName.trim(),
          question: questionText.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Question submitted!", {
          description: "We'll notify you when it's answered.",
        });
        setAuthorName("");
        setQuestionText("");
        setAskOpen(false);
        fetchQuestions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit question");
      }
    } catch {
      toast.error("Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Questions & Answers
          </h3>
          {questions.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              {questions.length}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs"
          onClick={() => setAskOpen(!askOpen)}
        >
          <MessageSquare className="h-3 w-3" />
          Ask a Question
        </Button>
      </div>

      {/* Ask question form */}
      <AnimatePresence>
        {askOpen && (
          <motion.div
            className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="h-8 text-sm bg-background"
            />
            <Textarea
              placeholder="What would you like to know about this product?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="text-sm bg-background"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmitQuestion}
                disabled={
                  submitting || !authorName.trim() || !questionText.trim()
                }
                className="gap-1.5 bg-primary text-primary-foreground"
              >
                {submitting ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Submit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAskOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card p-3 space-y-2"
            >
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="max-h-72 space-y-2 overflow-y-auto custom-scrollbar">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              className="rounded-xl border border-border/50 bg-card p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  Q
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{q.question}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {q.author} {" "}
                    {new Date(q.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {q.answer && (
                <div className="flex items-start gap-2 mt-2 ml-0 pl-0">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{q.answer}</p>
                    {q.answeredBy && (
                      <p className="text-[10px] text-emerald-500 mt-0.5">
                        {q.answeredBy}  Seller
                      </p>
                    )}
                  </div>
                  {q.isHelpful > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      {q.isHelpful}
                    </div>
                  )}
                </div>
              )}
              {!q.answer && (
                <div className="mt-2 ml-0">
                  <p className="text-[10px] text-amber-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending answer from seller
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 p-4 text-center">
          <HelpCircle className="h-6 w-6 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No questions yet</p>
          <p className="text-[10px] text-muted-foreground">
            Be the first to ask about this product!
          </p>
        </div>
      )}
    </div>
  );
}

// --- Price History Section ---
function PriceHistorySection({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [summary, setSummary] = useState<PriceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/price-history?productId=${productId}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.data || []);
          setSummary(data.summary || null);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Price History
          </span>
        </div>
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (history.length === 0 || !summary) return null;

  // Build SVG chart
  const chartWidth = 300;
  const chartHeight = 80;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const points = history.map((entry, i) => {
    const x =
      padding.left +
      (i / Math.max(history.length - 1, 1)) *
        (chartWidth - padding.left - padding.right);
    const y =
      padding.top +
      (1 - (entry.price - minPrice) / priceRange) *
        (chartHeight - padding.top - padding.bottom);
    return { x, y, ...entry };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

  const isLowest = currentPrice <= summary.lowest;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Price History
          </span>
          <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
            90 days
          </Badge>
        </div>
        {isLowest ? (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 h-5 text-[10px]">
            <TrendingDown className="h-3 w-3 mr-0.5" />
            Lowest
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 h-5 text-[10px]">
            <TrendingUp className="h-3 w-3 mr-0.5" />
            {formatPrice(currentPrice - summary.lowest)} above lowest
          </Badge>
        )}
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={padding.left}
              y1={
                padding.top +
                frac * (chartHeight - padding.top - padding.bottom)
              }
              x2={chartWidth - padding.right}
              y2={
                padding.top +
                frac * (chartHeight - padding.top - padding.bottom)
              }
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="0.5"
            />
          ))}
          {/* Area fill */}
          <path d={areaPath} fill="url(#priceGrad)" />
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Current price dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3"
              fill="hsl(var(--primary))"
            />
          )}
          {/* Lowest price marker */}
          {points.length > 0 &&
            (() => {
              const lowestIdx = prices.indexOf(minPrice);
              if (lowestIdx >= 0 && lowestIdx < points.length) {
                return (
                  <circle
                    cx={points[lowestIdx].x}
                    cy={points[lowestIdx].y}
                    r="2.5"
                    fill="#10b981"
                    stroke="#10b981"
                    strokeWidth="0.5"
                  />
                );
              }
              return null;
            })()}
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-emerald-500/5 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Lowest</p>
          <p className="text-xs font-bold text-emerald-500">
            {formatPrice(summary.lowest)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Average</p>
          <p className="text-xs font-bold text-foreground">
            {formatPrice(summary.average)}
          </p>
        </div>
        <div className="rounded-lg bg-destructive/5 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Highest</p>
          <p className="text-xs font-bold text-destructive">
            {formatPrice(summary.highest)}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Delivery Estimate Section ---
function DeliveryEstimate({ deliveryTime }: { deliveryTime: string | null }) {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch("/api/shipping");
        if (res.ok) {
          const data = await res.json();
          setMethods(data.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Delivery Options
        </span>
      </div>

      {deliveryTime && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/5 p-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-foreground">
            Estimated delivery:{" "}
            <span className="font-bold text-primary">{deliveryTime}</span>
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : methods.length > 0 ? (
        <div className="space-y-1.5">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-lg border border-border/30 p-2"
            >
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <span className="text-xs font-medium text-foreground">
                    {method.name}
                  </span>
                  {method.estimatedDays && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      {method.estimatedDays} days
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-bold ${method.price === 0 ? "text-emerald-500" : "text-foreground"}`}
              >
                {method.price === 0 ? "FREE" : formatPrice(method.price)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Standard shipping rates apply
        </p>
      )}
    </div>
  );
}

function ServiceTierSelector({
  selectedTier,
  onTierChange,
  basePrice,
}: {
  selectedTier: ServiceTier;
  onTierChange: (tier: ServiceTier) => void;
  basePrice: number;
}) {
  const tiers: ServiceTier[] = ["basic", "standard", "premium"];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">
        Choose Your Plan
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier) => {
          const config = TIERS[tier];
          const Icon = config.icon;
          const isSelected = selectedTier === tier;
          const price = Math.round(basePrice * config.multiplier);

          return (
            <motion.button
              key={tier}
              onClick={() => onTierChange(tier)}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all ${
                isSelected
                  ? `${config.borderColor} ${config.bgColor} shadow-md`
                  : "border-border/50 bg-card hover:border-border"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {isSelected && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.div>
              )}
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className="text-xs font-semibold text-foreground">
                {config.label}
              </span>
              <span className="text-[11px] font-bold text-primary">
                {formatPrice(price)}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTier}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div
            className={`rounded-xl border ${TIERS[selectedTier].borderColor} ${TIERS[selectedTier].bgColor} p-3`}
          >
            <p className="mb-2 text-xs font-medium text-foreground">
              What&apos;s included in {TIERS[selectedTier].label}:
            </p>
            <div className="grid grid-cols-2 gap-1">
              {TIERS[selectedTier].features.map((feature) => (
                <div key={feature} className="flex items-center gap-1.5">
                  <Check
                    className={`h-3 w-3 flex-shrink-0 ${TIERS[selectedTier].color}`}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TrustSection({ deliveryTime }: { deliveryTime: string | null }) {
  const badges = [
    {
      icon: Shield,
      label: "Money-Back\nGuarantee",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: BadgeCheck,
      label: "Secure\nPayment",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Headphones,
      label: "Free\nConsultation",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: Truck,
      label: "Fast\nDelivery",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card p-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${badge.bg}`}
              >
                <Icon className={`h-4 w-4 ${badge.color}`} />
              </div>
              <span className="text-center text-[9px] leading-tight text-muted-foreground whitespace-pre-line">
                {badge.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {deliveryTime && (
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Estimated Delivery
              </span>
            </div>
            <span className="text-sm font-bold text-primary">
              {deliveryTime}
            </span>
          </div>
          <Progress value={35} className="h-1.5" />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Order placed
            </span>
            <span className="text-[10px] text-primary">In progress</span>
            <span className="text-[10px] text-muted-foreground">Delivered</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareSection({ productName }: { productName: string }) {
  const [copied, setCopied] = useState(false);

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Share This Product
      </h3>
      <div className="flex items-center gap-2">
        {typeof navigator !== "undefined" &&
          typeof (navigator as Navigator & { share?: unknown }).share ===
            "function" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWebShare}
              className="gap-1.5 flex-1 border-border/50"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-1.5 flex-1 border-border/50"
        >
          {copied ? (
            <CheckCheck className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-400"
        >
          <Facebook className="h-4 w-4" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(productName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-sky-500/10 hover:text-sky-400"
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(productName + " " + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-green-500/10 hover:text-green-400"
        >
          <Link2 className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string;
  currentProductId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { goProduct } = useShopRouter();

  useEffect(() => {
    if (!categoryId) return;
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?category=${categoryId}&limit=10`,
        );
        if (res.ok) {
          const data = await res.json();
          setProducts(
            (data.data || []).filter((p: Product) => p.id !== currentProductId),
          );
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          You May Also Like
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-32">
              <div className="aspect-square animate-pulse rounded-xl bg-muted" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          You May Also Like
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {products.length} products
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {products.map((product, i) => {
          const discount = product.comparePrice
            ? Math.round((1 - product.price / product.comparePrice) * 100)
            : 0;
          return (
            <motion.button
              key={product.id}
              onClick={() => goProduct(product.id)}
              className="group flex-shrink-0 w-32 text-left"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-card">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl opacity-30"></span>
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute left-1 top-1 h-4 bg-destructive/90 px-1 text-[9px] font-bold text-white">
                    -{discount}%
                  </Badge>
                )}
              </div>
              <h4 className="mt-1.5 text-xs font-medium text-foreground line-clamp-1">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Product Page ---

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { goBack, goCheckout } = useShopRouter();
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToRecentlyViewed,
    setSelectedProduct,
  } = useShopStore();

  const [product, setProduct] = useState<
    (Product & { reviews?: Review[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setSelectedProduct(data);
          if (data.reviews) {
            setReviews(data.reviews);
          }
          // Fetch real inventory for stock gate
          fetch(`/api/inventory/${id}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((inv) => {
              if (inv) {
                setStockCount(inv.inventory ?? 0);
                setIsSoldOut(inv.isSoldOut ?? false);
              }
            })
            .catch(() => {});
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, setSelectedProduct]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (product && !product.reviews?.length) {
      fetchReviews();
    }
  }, [product, fetchReviews]);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  }, [product, addToRecentlyViewed]);

  const images = useMemo(() => {
    if (!product) return [];
    try {
      const parsed = product.images ? JSON.parse(product.images) : [];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  // Track product view on mount
  useEffect(() => {
    if (!id) return;
    // Record view and get current viewer count
    fetch(`/api/products/${id}/view`, { method: 'POST' }).catch(() => {});
    
    // Poll for viewer count every 30 seconds
    const interval = setInterval(() => {
      fetch(`/api/products/${id}/viewers`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.count) setViewerCount(data.count);
        })
        .catch(() => {});
    }, 30000);
    
    return () => clearInterval(interval);
  }, [id]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-sm font-medium text-foreground">Product not found</p>
        <Button onClick={goBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const features: string[] = product.features
    ? JSON.parse(product.features)
    : [];
  const techStack: string[] = product.techStack
    ? JSON.parse(product.techStack)
    : [];
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    // Phase II: Stock validation check inventory before adding
    const result = await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });

    if (result.success) {
      toast.success("Added to cart", {
        description: `${product.name} has been added to your cart.`,
      });
    } else {
      toast.error("Cannot add to cart", {
        description: result.error || "Product is out of stock",
      });
    }
  };

  const handleBuyNow = async () => {
    console.log('[BuyNow] Clicked! Product:', product.id, product.name);
    toast.info('Adding to cart...');
    
    // Phase III: Stock validation + go to Order Preview first
    const result = await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });

    console.log('[BuyNow] addToCart result:', result);

    if (result.success) {
      toast.success('Added to cart! Going to checkout...');
      console.log('[BuyNow] Navigating to /checkout/preview');
      // Phase III: Navigate to Order Preview page first
      router.push("/checkout/preview");
    } else {
      console.error('[BuyNow] Failed:', result.error);
      toast.error("Cannot proceed to checkout", {
        description: result.error || "Product is out of stock",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (wishlisted) {
                removeFromWishlist(product.id);
                toast.success("Removed from wishlist");
              } else {
                addToWishlist({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  comparePrice: product.comparePrice,
                  imageUrl: product.imageUrl,
                });
                toast.success("Added to wishlist!");
              }
            }}
          >
            <Heart
              className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Gallery Carousel */}
      <ImageCarousel
        images={images}
        productName={product.name}
        slug={product.slug}
      />

      {/* Product Info */}
      <div className="px-4 pt-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>
          {product.isFeatured && (
            <Badge className="flex-shrink-0 bg-amber-500/10 text-amber-500 border-amber-500/20">
              <Zap className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>

        {product.category && (
          <p className="mb-3 text-xs text-muted-foreground">
            {product.category.name}
          </p>
        )}

        {/* Rating Summary Quick */}
        <div className="mb-3 flex items-center gap-2">
          <StarRating rating={avgRating} size="md" />
          <span className="text-sm font-semibold text-foreground">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
          </span>
        </div>

        {/* Price Block */}
        <motion.div
          className="mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-3"
          key={product?.price}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product?.price || 0)}
            </span>
            {product.comparePrice && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  Save {formatPrice(product.comparePrice - product.price)}
                </Badge>
              </>
            )}
          </div>

          {/* Set Price Alert Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 gap-1.5 h-7 text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 px-2"
            onClick={async () => {
              if (!product) return;
              try {
                const res = await fetch("/api/price-alerts", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    targetPrice: Math.round(product.price * 0.9),
                    currentPrice: product.price,
                  }),
                });
                if (res.ok) {
                  toast.success("Price alert set!", {
                    description: "We'll notify you when the price drops.",
                  });
                } else {
                  toast.error("Failed to set price alert. Try again.");
                }
              } catch {
                toast.error("Failed to set price alert.");
              }
            }}
          >
            <Bell className="h-3 w-3" />
            Set Price Alert
          </Button>
        </motion.div>

        {/* Stock / Sold-Out Banner */}
        <div className="mb-3">
          {isSoldOut ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              <span className="text-base"></span>
              <span className="font-medium">This product has been sold</span>
              {(product as any).buyerUsername && (
                <span className="font-semibold">
                  &middot; Purchased by @{(product as any).buyerUsername}
                </span>
              )}
            </div>
          ) : (
            <InventoryBadge stock={stockCount} />
          )}
        </div>

        {/* Trust Badges */}
        <div className="mb-4">
          <TrustSection deliveryTime={product.deliveryTime} />
        </div>

        {/* Delivery Estimate with Shipping Methods */}
        <div className="mb-4">
          <DeliveryEstimate deliveryTime={product.deliveryTime} />
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              What&apos;s Included
            </h3>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-secondary/50 text-secondary-foreground"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Phase I: Architecture Details Collapsed by default */}
        {(product.architectureStyle || product.folderStructure) && (
          <ArchitectureDetailsSection
            architectureStyle={product.architectureStyle}
            folderStructure={product.folderStructure}
          />
        )}

        <Separator className="my-4" />

        {/* Phase I: One-of-a-kind Messaging */}
        {product.showOneOfAKind !== false && (
          <OneOfAKindSection 
                      isUnique={product.isUnique} 
                      isSold={product.isSold}
                      buyerUsername={product.buyerUsername}
                    />
        )}

        <Separator className="my-4" />

        {/* Price History */}
        <div className="mb-4">
          <PriceHistorySection
            productId={product.id}
            currentPrice={product.price}
          />
        </div>

        <Separator className="my-4" />

        {/* Product Videos */}
        <div className="mb-4">
          <ProductVideosSection productId={product.id} />
        </div>

        <Separator className="my-4" />

        {/* Q&A Section */}
        <div className="mb-4">
          <QASection productId={product.id} />
        </div>

        <Separator className="my-4" />

        {/* Reviews Section */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Reviews</h3>
            <WriteReviewSheet
              productId={product.id}
              onSubmitted={fetchReviews}
            />
          </div>

          {reviews.length > 0 ? (
            <>
              <div className="flex gap-4 rounded-xl border border-border/50 bg-card p-3">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                  <StarRating rating={avgRating} size="sm" />
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex-1">
                  <RatingDistribution reviews={reviews} />
                </div>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto custom-scrollbar">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 p-6 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No reviews yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to share your experience!
              </p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Related Products */}
        {product.categoryId && (
          <>
            <div className="mb-4">
              <RelatedProducts
                categoryId={product.categoryId}
                currentProductId={product.id}
              />
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* Share & Social */}
        <div className="mb-4">
          <ShareSection productName={product.name} />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-2">
          <div className="sticky bottom-0 z-20 -mx-4 bg-background/90 backdrop-blur-xl px-4 py-3 border-t border-border/30">
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="flex-1 gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                variant="ghost"
              >
                <ShoppingCart className="h-4 w-4" />
                {isSoldOut ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className="flex-1 gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSoldOut ? "Unavailable" : "Buy Now"}
                {!isSoldOut && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
