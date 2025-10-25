"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  TrendingUp,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  BarChart3,
  User,
  LogOut,
  Loader2,
  Award,
  ShoppingBag,
} from "lucide-react"
import { calculateRewardAmount } from "@/lib/user-service"
import { ref, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { ForexChart } from "@/components/forex-chart"

export default function HomePage() {
  const { user, userData, loading, signOut, refreshUserData } = useAuth()
  const router = useRouter()
  const [claiming, setClaiming] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

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

  const handleClaimReward = async () => {
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

      await refreshUserData()
    } catch (error) {
      console.error("Error claiming reward:", error)
    } finally {
      setClaiming(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const levelProgress = ((userData.totalInvested % 1000) / 1000) * 100
  const nextLevelInvestment = Math.ceil(userData.totalInvested / 1000) * 1000

  const transactions = userData.transactions ? Object.values(userData.transactions) : []
  const sortedTransactions = transactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-secondary">
              <AvatarImage src={userData.photoURL || "/placeholder.svg"} />
              <AvatarFallback className="bg-secondary/20 text-secondary">
                {userData.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-white font-semibold text-lg">{userData.displayName}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Nível {userData.level}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/10">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <p className="text-white/80 text-sm mb-1">Saldo Total</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-white">{userData.balance.toFixed(2)}</span>
              <span className="text-white/80 text-lg">MZN</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/wallet")}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Depositar
              </Button>
              <Button
                onClick={() => router.push("/wallet")}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Retirar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="border-secondary/20 cursor-pointer hover:border-secondary/40 transition-colors"
            onClick={() => router.push("/rewards")}
          >
            <CardContent className="pt-6 text-center">
              <Gift className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-semibold text-sm">Recompensas</p>
              <p className="text-xs text-muted-foreground">Ganhe diariamente</p>
            </CardContent>
          </Card>
          <Card
            className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => router.push("/store")}
          >
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Loja USD</p>
              <p className="text-xs text-muted-foreground">Compre dólares</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Reward */}
        <Card
          className="border-secondary/20 cursor-pointer hover:border-secondary/40 transition-colors"
          onClick={() => router.push("/rewards")}
        >
          <CardHeader className="pb-3">
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
                <p className="text-2xl font-bold text-secondary">{calculateRewardAmount(userData.level)} MZN</p>
                <p className="text-sm text-muted-foreground">{userData.dailyRewardsCompleted} dias consecutivos</p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push("/rewards")
                }}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Ver Mais
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">Investido</p>
              </div>
              <p className="text-2xl font-bold">{userData.totalInvested.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">MZN</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-secondary" />
                <p className="text-sm text-muted-foreground">Nível</p>
              </div>
              <p className="text-2xl font-bold">{userData.level}</p>
              <p className="text-xs text-muted-foreground">de 6</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progresso do Nível</CardTitle>
            <CardDescription>
              Invista {nextLevelInvestment - userData.totalInvested} MZN para o próximo nível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={levelProgress} className="h-2" />
          </CardContent>
        </Card>

        <ForexChart />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTransactions.length > 0 ? (
              <div className="space-y-3">
                {sortedTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "deposit" || transaction.type === "reward"
                            ? "bg-green-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {transaction.type === "deposit" || transaction.type === "reward" ? (
                          <ArrowDownRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        transaction.type === "deposit" || transaction.type === "reward"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "deposit" || transaction.type === "reward" ? "+" : "-"}
                      {transaction.amount.toFixed(2)} MZN
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around px-4 py-3">
          <Button variant="ghost" size="sm" className="flex-col h-auto gap-1 text-secondary">
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto gap-1 text-muted-foreground"
            onClick={() => router.push("/store")}
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
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
