'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Sparkles, ChevronRight, ChevronLeft,
  RotateCcw, Share2, Star, Package, CheckCircle2,
  Trophy, Target, Zap, Brain, Rocket, TrendingUp, Book, Palette, 
  DollarSign, CreditCard, Gem, Laptop, PenTool, LineChart,
  Globe, Settings, Timer, Search, Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface QuizOption {
  id: string
  text: string
  icon: React.ElementType
  value: string
}

interface QuizQuestion {
  id: string
  question: string
  type: string
  options: QuizOption[]
}

interface QuizResult {
  personality: {
    name: string
    description: string
    emoji?: string
    icon?: React.ElementType
  }
  recommendations: {
    id: string
    name: string
    price: number
    imageUrl: string | null
    category: string
    matchScore: number
    reason: string
  }[]
}

const fallbackQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: "What's your primary goal?",
    type: 'single',
    options: [
      { id: 'a', text: 'Boost productivity', icon: Rocket, value: 'productivity' },
      { id: 'b', text: 'Launch a business', icon: TrendingUp, value: 'business' },
      { id: 'c', text: 'Learn new skills', icon: Book, value: 'learning' },
      { id: 'd', text: 'Creative expression', icon: Palette, value: 'creative' },
    ],
  },
  {
    id: 'q2',
    question: "What's your budget range?",
    type: 'single',
    options: [
      { id: 'a', text: 'Under $500', icon: DollarSign, value: 'budget' },
      { id: 'b', text: '$500 - $2000', icon: CreditCard, value: 'mid' },
      { id: 'c', text: '$2000 - $5000', icon: Gem, value: 'premium' },
      { id: 'd', text: 'No limit', icon: Trophy, value: 'luxury' },
    ],
  },
  {
    id: 'q3',
    question: 'Which best describes you?',
    type: 'single',
    options: [
      { id: 'a', text: 'Developer', icon: Laptop, value: 'developer' },
      { id: 'b', text: 'Designer', icon: PenTool, value: 'designer' },
      { id: 'c', text: 'Entrepreneur', icon: LineChart, value: 'entrepreneur' },
      { id: 'd', text: 'Student', icon: Book, value: 'student' },
    ],
  },
  {
    id: 'q4',
    question: 'What type of product interests you?',
    type: 'single',
    options: [
      { id: 'a', text: 'Websites & Apps', icon: Globe, value: 'web' },
      { id: 'b', text: 'Design Assets', icon: Palette, value: 'design' },
      { id: 'c', text: 'Software Tools', icon: Settings, value: 'tools' },
      { id: 'd', text: 'Courses & Guides', icon: Book, value: 'courses' },
    ],
  },
  {
    id: 'q5',
    question: 'How soon do you need it?',
    type: 'single',
    options: [
      { id: 'a', text: 'Right now', icon: Zap, value: 'instant' },
      { id: 'b', text: 'This week', icon: Timer, value: 'week' },
      { id: 'c', text: 'This month', icon: Star, value: 'month' },
      { id: 'd', text: 'Just browsing', icon: Search, value: 'browsing' },
    ],
  },
]

export function ProductQuizPage() {
  const { goBack, goProduct } = useShopRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>(fallbackQuestions)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/product-quiz')
        if (res.ok) {
          const data = await res.json()
          if (data.questions?.length > 0) {
            setQuestions(data.questions)
          }
        }
      } catch {
        // use fallback
      }
    }
    fetchQuestions()
  }, [])

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleSelect = (questionId: string, optionValue: string) => {
    setSelectedOption(optionValue)
    setAnswers(prev => ({ ...prev, [questionId]: optionValue }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1)
      setCurrentQuestion(prev => prev + 1)
      setSelectedOption(answers[questions[currentQuestion + 1]?.id] || null)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setDirection(-1)
      setCurrentQuestion(prev => prev - 1)
      setSelectedOption(answers[questions[currentQuestion - 1]?.id] || null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/product-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      }
    } catch {
      // Fallback result
      setResult({
        personality: { name: 'The Explorer', description: 'You have diverse interests and love discovering new solutions.', icon: Compass },
        recommendations: [],
      })
    }
    setLoading(false)
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setSelectedOption(null)
    setResult(null)
    setDirection(1)
  }

  const handleShare = async () => {
    const text = `I'm ${result?.personality.name} on Grapsee Shop! Take the quiz to find your perfect products.`
    try {
      await navigator.share({ title: 'My Grapsee Quiz Result', text, url: window.location.href })
    } catch {
      await navigator.clipboard.writeText(text + ' ' + window.location.href)
      toast.success('Result copied to clipboard!')
    }
  }

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1
  const hasAnswer = !!answers[question?.id]

  // Result page
  if (result) {
    return (
      <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-500" /> Your Results
            </h1>
          </div>
        </div>

        <div className="px-4 py-6">
          {/* Personality Card */}
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {(() => { const PersonalityIcon = result.personality.icon || Star; return <PersonalityIcon className="h-16 w-16 text-muted-foreground" />; })()}
            </motion.div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">{result.personality.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-[300px]">{result.personality.description}</p>
          </motion.div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-rose-500" /> Recommended For You
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <motion.button
                    key={rec.id}
                    className="w-full flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => goProduct(rec.id)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
                      {rec.imageUrl ? (
                        <img src={rec.imageUrl} alt={rec.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 m-auto text-muted-foreground/40" />
                      )}
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                        {rec.matchScore}%
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{rec.name}</p>
                      <p className="text-[11px] text-muted-foreground">{rec.reason}</p>
                      <p className="text-xs text-primary font-bold">{formatPrice(rec.price)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <Button onClick={handleRetake} variant="outline" className="w-full gap-2">
              <RotateCcw className="h-4 w-4" /> Retake Quiz
            </Button>
            <Button onClick={handleShare} className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white">
              <Share2 className="h-4 w-4" /> Share Results
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Intro screen
  if (!quizStarted) {
    return (
      <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-rose-500" /> Product Quiz
            </h1>
          </div>
        </div>

        <div className="px-4 py-8 flex flex-col items-center text-center">
          {/* Animated Icon */}
          <motion.div
            className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 via-purple-500/10 to-pink-500/20 mb-6"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}>
              <Sparkles className="h-12 w-12 text-rose-500" />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Find Your Perfect Product
          </motion.h2>

          <motion.p
            className="mt-3 text-sm text-muted-foreground max-w-[300px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Answer a few quick questions and we&apos;ll recommend the best products tailored just for you!
          </motion.p>

          {/* Features */}
          <motion.div
            className="mt-8 w-full space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: Zap, text: 'Takes only 2 minutes', color: 'amber' },
              { icon: Target, text: 'Personalized recommendations', color: 'rose' },
              { icon: Trophy, text: 'Discover products you\'ll love', color: 'emerald' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${item.color}-500/10`}>
                  <item.icon className={`h-4 w-4 text-${item.color}-500`} />
                </div>
                <span className="text-sm text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Start Button */}
          <motion.div
            className="mt-8 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={() => setQuizStarted(true)}
              className="w-full gap-2 bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white h-12 text-base"
            >
              <Sparkles className="h-5 w-5" /> Start Quiz
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2">{questions.length} questions  No sign-up required</p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Quiz page
  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-rose-500" /> Product Quiz
            </h1>
          </div>
          <span className="text-xs text-muted-foreground">{currentQuestion + 1}/{questions.length}</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-purple-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Header */}
            <motion.div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 mb-3">
                <Zap className="h-7 w-7 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{question?.question}</h2>
              <p className="text-xs text-muted-foreground mt-1">Choose the option that best fits you</p>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {question?.options.map((option, i) => {
                const isSelected = answers[question.id] === option.value
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(question.id, option.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/5 shadow-sm'
                        : 'border-border/50 bg-card hover:border-rose-500/30'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {(() => { const OptionIcon = option.icon; return <OptionIcon className="h-9 w-9 text-muted-foreground" />; })()}
                    <span className={`text-sm font-medium ${isSelected ? 'text-rose-500' : 'text-foreground'}`}>
                      {option.text}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="h-5 w-5 text-rose-500" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-2 mt-6">
          {currentQuestion > 0 && (
            <Button variant="outline" onClick={handlePrev} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button
            className={`gap-2 ${hasAnswer ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}`}
            disabled={!hasAnswer || loading}
            onClick={handleNext}
          >
            {loading ? (
              <motion.div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} />
            ) : isLastQuestion ? (
              <>
                <Trophy className="h-4 w-4" /> See Results
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Skip hint */}
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Answer all questions for the best recommendations
        </p>
      </div>
    </motion.div>
  )
}

