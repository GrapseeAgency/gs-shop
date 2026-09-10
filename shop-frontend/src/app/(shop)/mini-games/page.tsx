'use client'

import { useState } from 'react'
import { Gamepad2, Brain, Puzzle, Sparkles, ChevronRight, Trophy, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const GAMES = [
  {
    id: 'quiz',
    name: 'Tech Knowledge Quiz',
    description: 'Test your tech knowledge and win rewards!',
    icon: Brain,
    difficulty: 'Medium',
    reward: 'Up to 100 pts',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'matching',
    name: 'Tech Stack Matcher',
    description: 'Match technologies with their use cases',
    icon: Puzzle,
    difficulty: 'Easy',
    reward: 'Up to 50 pts',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'memory',
    name: 'Service Memory',
    description: 'Match pairs of our services',
    icon: Sparkles,
    difficulty: 'Hard',
    reward: 'Up to 75 pts',
    color: 'from-violet-500 to-purple-500'
  }
]

export default function MiniGamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameData, setGameData] = useState<any>(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)

  const startGame = async (gameId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/mini-games?type=${gameId}`)
      if (res.ok) {
        const data = await res.json()
        setGameData(data.game)
        setSelectedGame(gameId)
        setScore(0)
      }
    } catch (error) {
      toast.error('Failed to load game')
    } finally {
      setLoading(false)
    }
  }

  const submitScore = async (finalScore: number) => {
    try {
      const res = await fetch('/api/mini-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: selectedGame,
          score: finalScore,
          timeTaken: 0
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.reward) {
          toast.success(data.message)
        } else {
          toast.info('Good try! Play again to win rewards.')
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  if (selectedGame && gameData) {
    return (
      <GameScreen 
        game={selectedGame} 
        data={gameData} 
        onComplete={(s) => {
          submitScore(s)
          setSelectedGame(null)
          setGameData(null)
        }}
        onBack={() => {
          setSelectedGame(null)
          setGameData(null)
        }}
      />
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" />
          Mini Games
        </h1>
        <p className="text-muted-foreground">
          Play fun games and win points, coupons, and exclusive rewards!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Points Won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAMES.map((game) => {
          const Icon = game.icon
          return (
            <Card key={game.id} className="group cursor-pointer hover:shadow-lg transition-all">
              <CardHeader className={`bg-gradient-to-br ${game.color} text-white`}>
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {game.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-white mt-4">{game.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    {game.reward}
                  </Badge>
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={() => startGame(game.id)}
                    disabled={loading}
                  >
                    Play
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* How It Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">1</span>
            </div>
            <p className="text-sm text-muted-foreground">Choose a game and start playing</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">2</span>
            </div>
            <p className="text-sm text-muted-foreground">Score 60+ points to win rewards</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">3</span>
            </div>
            <p className="text-sm text-muted-foreground">Higher scores = better rewards!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple Quiz Game Screen
function GameScreen({ game, data, onComplete, onBack }: { 
  game: string
  data: any
  onComplete: (score: number) => void
  onBack: () => void 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)

  if (game === 'quiz') {
    const questions = data.questions || []
    const question = questions[currentQuestion]

    if (showResult) {
      const correct = answers.filter((a, i) => a === questions[i].correct).length
      const percentage = Math.round((correct / questions.length) * 100)

      return (
        <div className="container max-w-2xl py-8">
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-muted-foreground">
                  {correct}/{questions.length} correct
                </p>
              </div>
              <p className="text-lg font-medium">
                {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? ' Good job!' : ' Keep practicing!'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onBack}>
                  Back to Games
                </Button>
                <Button onClick={() => onComplete(percentage)}>
                  Claim Reward
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (!question) {
      return <div className="container py-8">Loading...</div>
    }

    const handleAnswer = (index: number) => {
      const newAnswers = [...answers, index]
      setAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setShowResult(true)
      }
    }

    return (
      <div className="container max-w-2xl py-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
           Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <Badge variant="secondary">
                {Math.round(((currentQuestion) / questions.length) * 100)}%
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4"
                  onClick={() => handleAnswer(index)}
                >
                  <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default for other games
  return (
    <div className="container max-w-2xl py-8 text-center">
      <Button variant="ghost" onClick={onBack} className="mb-4">
         Back
      </Button>
      <Card className="py-12">
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">This game is coming soon!</p>
          <Button onClick={onBack}>Back to Games</Button>
        </CardContent>
      </Card>
    </div>
  )
}
