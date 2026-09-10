"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileArchive,
  FolderOpen,
  Github,
  MessageSquare,
  Download,
  Check,
  Loader2,
  ArrowRight,
  Package,
  User,
  Send,
  X,
  CheckCircle2,
  Eye,
  Zap,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  features: string[];
}

interface ChatMessage {
  id: string;
  sender: "customer" | "engineer";
  message: string;
  timestamp: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
} as const;

export default function DeliveryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubStatus, setGithubStatus] = useState<string>("not_requested");
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      toast.error("Order ID required");
      return;
    }
    fetchDeliveryMethods();
  }, [orderId]);

  const fetchDeliveryMethods = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SHOP_API_URL}/api/delivery/methods?orderId=${orderId}`);
      const data = await res.json();
      console.log("[Delivery Debug] API response:", data);
      
      if (data.success) {
        setMethods(data.methods);
        setSelectedMethod(data.selectedMethod);
        const pid = data.product?.id || null;
        console.log("[Delivery Debug] Setting productId:", pid);
        setProductId(pid);
        
        // Fallback: if no productId from delivery API, fetch from order API
        if (!pid && orderId) {
          fetchOrderProductId();
        }
      }
    } catch (error) {
      toast.error("Failed to load delivery options");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderProductId = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SHOP_API_URL}/api/orders/${orderId}`);
      const orderData = await res.json();
      console.log("[Delivery Debug] Order API response:", orderData);
      
      if (orderData.items && orderData.items.length > 0) {
        const pid = orderData.items[0]?.productId || null;
        console.log("[Delivery Debug] Setting productId from order:", pid);
        setProductId(pid);
      }
    } catch (error) {
      console.error("[Delivery Debug] Failed to fetch order:", error);
    }
  };

  const downloadZIP = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_SHOP_API_URL}/api/delivery/download/zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project_${orderId?.slice(-8)}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Download started!");
      } else {
        toast.error("Download failed");
      }
    } catch (error) {
      toast.error("Download error");
    } finally {
      setLoading(false);
    }
  };

  const downloadFolder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_SHOP_API_URL}/api/delivery/download/folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Folder structure ready!");
        window.open(data.downloadLinks.all, "_blank");
      } else {
        toast.error(data.error || "Failed to get folder");
      }
    } catch (error) {
      toast.error("Folder download error");
    } finally {
      setLoading(false);
    }
  };

  const pollGithubStatus = async (orderId: string, maxAttempts = 30) => {
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SHOP_API_URL}/api/delivery/github/status?orderId=${orderId}`);
        const data = await res.json();
        
        if (data.success && data.status === "invitation_sent") {
          setGithubStatus("invitation_sent");
          toast.success(" GitHub invitation sent! Check your email.");
          return true;
        }
        
        if (data.success && data.status === "granted") {
          setGithubStatus("granted");
          toast.success(" GitHub access granted!");
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Poll error:", error);
        return false;
      }
    };
    
    const interval = setInterval(async () => {
      attempts++;
      const done = await checkStatus();
      
      if (done || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!done && attempts >= maxAttempts) {
          setGithubStatus("pending");
          toast.info("Still processing... Check your email soon.");
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const requestGithubAccess = async () => {
    if (!githubUsername.trim()) {
      toast.error("Please enter your GitHub username");
      return;
    }

    try {
      setLoading(true);
      setGithubStatus("requesting"); // Show loading spinner
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_SHOP_API_URL}/api/delivery/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          githubUsername: githubUsername.trim(),
          action: "request"
        })
      });

      const data = await res.json();
      
      if (data.success) {
        if (data.autoGranted) {
          setGithubStatus("invitation_sent");
          toast.success(" GitHub invitation sent! Check your email.");
          // Start polling to confirm status
          pollGithubStatus(orderId!);
        } else {
          setGithubStatus("pending_admin");
          toast.success("GitHub access requested! Admin will grant access shortly.");
        }
      } else {
        setGithubStatus("not_requested");
        toast.error(data.error || "Request failed");
      }
    } catch (error) {
      setGithubStatus("not_requested");
      toast.error("GitHub request error");
    } finally {
      setLoading(false);
    }
  };

  const openChat = async () => {
    setShowChat(true);
    setChatLoading(true);
    
    try {
      const res = await fetch(`/api/delivery/chat?orderId=${orderId}`);
      const data = await res.json();
      
      if (data.success) {
        setChatMessages(data.chatSession.messages);
      }
    } catch (error) {
      toast.error("Failed to load chat");
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch("/api/delivery/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          message: newMessage,
          action: "send"
        })
      });

      if (res.ok) {
        setChatMessages([...chatMessages, {
          id: Date.now().toString(),
          sender: "customer",
          message: newMessage,
          timestamp: new Date().toISOString()
        }]);
        setNewMessage("");
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "engineer",
            message: "I'll prepare your files right away! What delivery method would you prefer?",
            timestamp: new Date().toISOString()
          }]);
        }, 1000);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Your Project is Ready
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:via-slate-300 dark:to-white">
            Choose Delivery Method
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Order <span className="font-mono font-semibold text-primary">#{orderId?.slice(-8)}</span>  Select how you want to receive your project
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2"
        >
          {/* ZIP Card */}
          <motion.div
            variants={cardVariants}
            onClick={() => setSelectedMethod("zip")}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 ${
              selectedMethod === "zip"
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20 dark:from-blue-950/30 dark:to-indigo-950/20"
                : "border-slate-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900/50"
            }`}
          >
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-2xl transition-all group-hover:scale-150" />
            
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all ${
                  selectedMethod === "zip" 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
                    : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 dark:from-blue-900/30 dark:to-indigo-900/30"
                }`}>
                  <FileArchive className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">ZIP Archive</h3>
                  <p className="text-sm text-muted-foreground">Complete project bundle</p>
                </div>
              </div>

              <p className="mb-6 text-muted-foreground">
                Download everything in a single compressed file. Perfect for quick transfer and storage.
              </p>

              <div className="mb-6 space-y-3">
                {["Single file download", "Compressed & optimized", "Instant access"].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      selectedMethod === "zip" ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-800"
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={selectedMethod === "zip" ? "text-slate-900 dark:text-white" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedMethod === "zip" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Button 
                      onClick={(e) => { e.stopPropagation(); downloadZIP(); }}
                      className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl"
                      size="lg"
                    >
                      <Download className="h-5 w-5" />
                      Download ZIP
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Folder Card */}
          <motion.div
            variants={cardVariants}
            onClick={() => setSelectedMethod("folder")}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 ${
              selectedMethod === "folder"
                ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20 dark:from-emerald-950/30 dark:to-teal-950/20"
                : "border-slate-200 bg-white/80 backdrop-blur-sm hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-slate-800 dark:bg-slate-900/50"
            }`}
          >
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-2xl transition-all group-hover:scale-150" />
            
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all ${
                  selectedMethod === "folder" 
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30"
                    : "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 dark:from-emerald-900/30 dark:to-teal-900/30"
                }`}>
                  <FolderOpen className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Organized Folder</h3>
                  <p className="text-sm text-muted-foreground">Structured file tree</p>
                </div>
              </div>

              <p className="mb-6 text-muted-foreground">
                Get files organized in proper folders. Best for developers who want to dive right in.
              </p>

              <div className="mb-6 space-y-3">
                {["Structured folders", "Organized by type", "Ready to use"].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      selectedMethod === "folder" ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800"
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={selectedMethod === "folder" ? "text-slate-900 dark:text-white" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coming Soon Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                Coming Soon
              </div>

              <AnimatePresence>
                {selectedMethod === "folder" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Button 
                      onClick={(e) => { e.stopPropagation(); downloadFolder(); }}
                      className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl"
                      size="lg"
                    >
                      <Download className="h-5 w-5" />
                      Preview Structure
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Full folder download coming soon. Use ZIP for now.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* GitHub Card */}
          <motion.div
            variants={cardVariants}
            onClick={() => setSelectedMethod("github")}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 ${
              selectedMethod === "github"
                ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20 dark:from-violet-950/30 dark:to-purple-950/20"
                : "border-slate-200 bg-white/80 backdrop-blur-sm hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 dark:border-slate-800 dark:bg-slate-900/50"
            }`}
          >
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 blur-2xl transition-all group-hover:scale-150" />
            
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all ${
                  selectedMethod === "github" 
                    ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-violet-500/30"
                    : "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 dark:from-violet-900/30 dark:to-purple-900/30"
                }`}>
                  <Github className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">GitHub Repository</h3>
                  <p className="text-sm text-muted-foreground">Private repo access</p>
                </div>
              </div>

              <p className="mb-6 text-muted-foreground">
                Get invited to a private GitHub repository. Version control and collaboration ready.
              </p>

              <div className="mb-6 space-y-3">
                {["Private repository", "Version control", "Team collaboration"].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      selectedMethod === "github" ? "bg-violet-500 text-white" : "bg-slate-200 dark:bg-slate-800"
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={selectedMethod === "github" ? "text-slate-900 dark:text-white" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedMethod === "github" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {githubStatus === "not_requested" ? (
                      <>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Your GitHub username"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            className="pl-10"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); requestGithubAccess(); }}
                          disabled={!githubUsername.trim()}
                          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl disabled:opacity-50"
                          size="lg"
                        >
                          <Code2 className="h-5 w-5" />
                          Request Access
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    ) : githubStatus === "pending_admin" ? (
                      <div className="rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-950/50">
                        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-amber-600" />
                        <p className="font-semibold text-amber-700 dark:text-amber-300">Request Sent</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">Check your email within 24 hours</p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/50">
                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
                        <p className="font-semibold text-emerald-700 dark:text-emerald-300">Access Granted!</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">Check your email for the invitation</p>
                        <Button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (!productId) {
                              toast.error("Product information not available. Please refresh the page.");
                              return;
                            }
                            router.push(`/visibility?orderId=${orderId}&productId=${productId}`);
                          }}
                          className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                          size="lg"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Chat Card */}
          <motion.div
            variants={cardVariants}
            onClick={() => setSelectedMethod("chat")}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 ${
              selectedMethod === "chat"
                ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-500/20 dark:from-amber-950/30 dark:to-orange-950/20"
                : "border-slate-200 bg-white/80 backdrop-blur-sm hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 dark:border-slate-800 dark:bg-slate-900/50"
            }`}
          >
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-2xl transition-all group-hover:scale-150" />
            
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all ${
                  selectedMethod === "chat" 
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/30"
                    : "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 dark:from-amber-900/30 dark:to-orange-900/30"
                }`}>
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Chat Support</h3>
                  <p className="text-sm text-muted-foreground">Talk to an engineer</p>
                </div>
              </div>

              <p className="mb-6 text-muted-foreground">
                Need something custom? Chat directly with our engineering team for personalized delivery.
              </p>

              <div className="mb-6 space-y-3">
                {["Real-time chat", "Custom delivery options", "Technical support"].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      selectedMethod === "chat" ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800"
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={selectedMethod === "chat" ? "text-slate-900 dark:text-white" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectedMethod === "chat" && !showChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Button 
                      onClick={(e) => { e.stopPropagation(); openChat(); }}
                      className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl"
                      size="lg"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Start Conversation
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Phase VIII CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
            <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl" />
            
            <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Eye className="h-8 w-8 text-violet-300" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold">Ready for the next step?</h3>
                <p className="text-slate-300">
                  After receiving your project, decide if you want to keep the product visible in the shop or make it private.
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log("[Delivery Debug] Continue clicked, productId:", productId);
                  if (!productId) {
                    toast.error("Product information not available");
                    return;
                  }
                  router.push(`/visibility?orderId=${orderId}&productId=${productId}`);
                }}
                disabled={!productId}
                className="gap-2 bg-white text-slate-900 shadow-lg hover:bg-slate-100 disabled:opacity-50"
                size="lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Chat Modal */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
              >
                <div className="flex items-center justify-between border-b bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-white/20 p-2">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Senior Engineer</h4>
                      <div className="flex items-center gap-1.5 text-xs text-white/80">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online now
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="rounded-full p-2 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
                  {chatLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.sender === "customer"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                              : "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                          }`}>
                            {msg.message}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t bg-white p-4 dark:bg-slate-900">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendChatMessage} 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
