"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  Home,
  BarChart3,
  User,
  Loader2,
  Gift,
  Trophy,
  Star,
  CheckCircle2,
  ChevronLeft,
  Brain,
} from "lucide-react"
import { calculateRewardAmount } from "@/lib/user-service"
import { ref, update, push } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Transaction } from "@/lib/user-service"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  reward: number
}

const dailyQuestions: Question[] = [
  {
    id: "q1",
    question: "Qual é a moeda oficial de Moçambique?",
    options: ["Rand", "Metical", "Kwanza", "Dólar"],
    correctAnswer: 1,
    category: "Economia",
    reward: 25,
  },
  {
    id: "q2",
    question: "O que significa Forex?",
    options: ["Foreign Exchange", "Forward Export", "Foreign Expert", "Forex Trading"],
    correctAnswer: 0,
    category: "Forex",
    reward: 30,
  },
  {
    id: "q3",
    question: "Qual é a capital de Moçambique?",
    options: ["Beira", "Nampula", "Maputo", "Tete"],
    correctAnswer: 2,
    category: "Geografia",
    reward: 20,
  },
  {
    id: "q4",
    question: "O que é diversificação de investimentos?",
    options: [
      "Investir tudo num único ativo",
      "Distribuir investimentos em diferentes ativos",
      "Vender todos os investimentos",
      "Comprar apenas ações",
    ],
    correctAnswer: 1,
    category: "Investimentos",
    reward: 35,
  },
  {
    id: "q5",
    question: "Qual par de moedas é mais negociado no Forex?",
    options: ["USD/JPY", "EUR/USD", "GBP/USD", "USD/CHF"],
    correctAnswer: 1,
    category: "Forex",
    reward: 40,
  },
]

export default function RewardsPage() {
  const { user, userData, loading, refreshUserData } = useAuth()
  const router = useRouter()
  const [claiming, setClaiming] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [questionsCompleted, setQuestionsCompleted] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  const canClaimReward = () => {
    if (!userData.lastRewardDate) return true
    const lastReward = new Date(userData.lastRewardDate)
    const today = new Date()
    return lastReward.toDateString() !== today.toDateString()
  }

  const handleClaimDailyReward = async () => {
    if (!canClaimReward() || !user) return

    setClaiming(true)
    try {
      const rewardAmount = calculateRewardAmount(userData.level)
      const newBalance = userData.balance + rewardAmount
      const newDailyRewards = userData.dailyRewardsCompleted + 1

      const userRef = ref(database, `users/${user.uid}`)
      await update(userRef, {
        balance: newBalance,
        dailyRewardsCompleted: newDailyRewards,
        lastRewardDate: new Date().toISOString(),
      })

      // Create transaction
      const transactionRef = push(ref(database, `users/${user.uid}/transactions`))
      const transaction: Transaction = {
        id: transactionRef.key || Date.now().toString(),
        type: "reward",
        amount: rewardAmount,
        description: "Recompensa Diária",
        timestamp: new Date().toISOString(),
      }
      await update(transactionRef, transaction)

      await refreshUserData()
    } catch (error) {
      console.error("Error claiming reward:", error)
    } finally {
      setClaiming(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !user) return

    const currentQuestion = dailyQuestions[currentQuestionIndex]
    const correct = selectedAnswer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // Award points for correct answer
      const newBalance = userData.balance + currentQuestion.reward
      const userRef = ref(database, `users/${user.uid}`)
      await update(userRef, { balance: newBalance })

      // Create transaction
      const transactionRef = push(ref(database, `users/${user.uid}/transactions`))
      const transaction: Transaction = {
        id: transactionRef.key || Date.now().toString(),
        type: "reward",
        amount: currentQuestion.reward,
        description: `Resposta Correta - ${currentQuestion.category}`,
        timestamp: new Date().toISOString(),
      }
      await update(transactionRef, transaction)

      setTotalEarned(totalEarned + currentQuestion.reward)
      setQuestionsCompleted(questionsCompleted + 1)
      await refreshUserData()
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < dailyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsCorrect(false)
    }
  }

  const currentQuestion = dailyQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / dailyQuestions.length) * 100

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Recompensas</h1>
        </div>

        {/* Stats Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Gift className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{userData.dailyRewardsCompleted}</p>
                <p className="text-xs text-white/80">Dias</p>
              </div>
              <div className="text-center">
                <Trophy className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{questionsCompleted}</p>
                <p className="text-xs text-white/80">Corretas</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{totalEarned}</p>
                <p className="text-xs text-white/80">MZN Ganhos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 space-y-4">
        {/* Daily Reward Claim */}
        <Card className="border-secondary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-secondary" />
                <CardTitle className="text-lg">Recompensa Diária</CardTitle>
              </div>
              <Badge variant={canClaimReward() ? "default" : "secondary"} className="bg-secondary/20 text-secondary">
                {canClaimReward() ? "Disponível" : "Reclamado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-secondary">{calculateRewardAmount(userData.level)} MZN</p>
                <p className="text-sm text-muted-foreground mt-1">Sequência de {userData.dailyRewardsCompleted} dias</p>
              </div>
              <Button
                onClick={handleClaimDailyReward}
                disabled={!canClaimReward() || claiming}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reclamando...
                  </>
                ) : (
                  "Reclamar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Perguntas Diárias</CardTitle>
              </div>
              <Badge variant="outline">
                {currentQuestionIndex + 1}/{dailyQuestions.length}
              </Badge>
            </div>
            <CardDescription>Responda corretamente e ganhe recompensas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-3">
                    {currentQuestion.category}
                  </Badge>
                  <h3 className="text-lg font-semibold leading-relaxed">{currentQuestion.question}</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Recompensa</p>
                  <p className="text-xl font-bold text-secondary">{currentQuestion.reward} MZN</p>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${
                      selectedAnswer === index
                        ? showResult
                          ? index === currentQuestion.correctAnswer
                            ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400"
                            : "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400"
                          : "bg-secondary/10 border-secondary"
                        : showResult && index === currentQuestion.correctAnswer
                          ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400"
                          : ""
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                  >
                    <span className="flex items-center gap-3 w-full">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showResult && index === currentQuestion.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Result Message */}
              {showResult && (
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <p
                    className={`font-semibold ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                  >
                    {isCorrect ? `Correto! Você ganhou ${currentQuestion.reward} MZN` : "Incorreto. Tente a próxima!"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {!showResult ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    Confirmar Resposta
                  </Button>
                ) : currentQuestionIndex < dailyQuestions.length - 1 ? (
                  <Button onClick={handleNextQuestion} className="w-full bg-primary hover:bg-primary/90">
                    Próxima Pergunta
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/home")} className="w-full bg-primary hover:bg-primary/90">
                    Voltar ao Início
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como Ganhar Mais Recompensas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-secondary/10">
                <Gift className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Recompensa Diária</p>
                <p className="text-xs text-muted-foreground">Reclame todos os dias para manter sua sequência</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Perguntas Diárias</p>
                <p className="text-xs text-muted-foreground">
                  Responda corretamente para ganhar até 40 MZN por pergunta
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-secondary/10">
                <Trophy className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Suba de Nível</p>
                <p className="text-xs text-muted-foreground">Invista mais para aumentar suas recompensas diárias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto gap-1 text-muted-foreground"
            onClick={() => router.push("/home")}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto gap-1 text-muted-foreground"
            onClick={() => router.push("/home")}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Investir</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto gap-1 text-muted-foreground"
            onClick={() => router.push("/wallet")}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Carteira</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto gap-1 text-muted-foreground"
            onClick={() => router.push("/home")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
