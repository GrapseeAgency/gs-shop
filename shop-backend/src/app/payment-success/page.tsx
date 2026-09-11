'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { CheckCircle, Sparkles, Mail, Smartphone, ShoppingBag, ArrowRight } from 'lucide-react';

function PaymentSuccessInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'USD';

  useEffect(() => {
    if (!orderId || !paymentId || !amount) {
      setError('Missing payment information');
      setIsLoading(false);
      return;
    }

    processPaymentSuccess();
  }, [orderId, paymentId, amount]);

  const processPaymentSuccess = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/payment/success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          customerEmail: '', // Will be filled by session
          totalAmount: parseFloat(amount),
          currency
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderData(data.order);
        setEmailSent(data.notifications.email.sent);
        setNotificationSent(data.notifications.mobile.sent);
      } else {
        setError(data.error || 'Payment processing failed');
      }
    } catch (err) {
      setError('Failed to process payment success');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const sparkleVariants: Variants = {
    hidden: { scale: 0, rotate: 0 },
    visible: {
      scale: 1,
      rotate: 360,
      transition: { duration: 1, ease: "easeInOut" }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-800 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4"> Error</h1>
          <p className="text-xl mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-red-900 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
      >
        {/* Success Icon with Sparkles */}
        <motion.div
          variants={sparkleVariants}
          className="relative mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-20 h-20 text-white" />
          </motion.div>
          
          {/* Sparkles around the success icon */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-6"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-60px)`,
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + i * 0.1,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={itemVariants}
          className="text-center text-white max-w-2xl mx-auto"
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
             Payment Successful!
          </h1>
          
          <p className="text-2xl mb-8 text-emerald-100">
            Thank you for your purchase!
          </p>

          {/* Order Details */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20"
          >
            <div className="flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 mr-2 text-emerald-300" />
              <span className="text-lg font-semibold">Order Details</span>
            </div>
            
            <div className="space-y-2 text-emerald-100">
              <p>Order ID: <span className="font-mono text-yellow-300">{orderId}</span></p>
              <p>Amount: <span className="text-xl font-bold text-green-300">{currency} {amount}</span></p>
              <p>Status: <span className="text-green-300 font-semibold"> Completed</span></p>
            </div>
          </motion.div>

          {/* Notifications Status */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            {/* Email Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Mail className={`w-5 h-5 mr-2 ${emailSent ? 'text-green-300' : 'text-yellow-300'}`} />
                <span className="font-semibold">Email Receipt</span>
              </div>
              <p className={`text-sm ${emailSent ? 'text-green-300' : 'text-yellow-300'}`}>
                {emailSent ? ' Sent to your email' : ' Processing...'}
              </p>
            </div>

            {/* Mobile Notification Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Smartphone className={`w-5 h-5 mr-2 ${notificationSent ? 'text-green-300' : 'text-yellow-300'}`} />
                <span className="font-semibold">Mobile Notification</span>
              </div>
              <p className={`text-sm ${notificationSent ? 'text-green-300' : 'text-yellow-300'}`}>
                {notificationSent ? ' Sent to your phone' : ' Processing...'}
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => router.push('/orders')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              View Orders
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all transform hover:scale-105 border border-white/20"
            >
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
