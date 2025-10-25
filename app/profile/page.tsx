"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Award, TrendingUp, Wallet, Gift, Edit, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"

export default function ProfilePage() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalEarned: 0,
    totalTransactions: 0,
    daysActive: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadStats = async () => {
      const transactionsRef = ref(database, `users/${user.uid}/transactions`)
      const snapshot = await get(transactionsRef)

      if (snapshot.exists()) {
        const transactions = Object.values(snapshot.val()) as any[]
        const invested = transactions.filter((t) => t.type === "investment").reduce((sum, t) => sum + t.amount, 0)
        const earned = transactions.filter((t) => t.type === "reward").reduce((sum, t) => sum + t.amount, 0)

        setStats({
          totalInvested: invested,
          totalEarned: earned,
          totalTransactions: transactions.length,
          daysActive: Math.floor(
            (Date.now() - new Date(userData?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24),
          ),
        })
      }
    }

    loadStats()
  }, [user, userData, router])

  if (!user || !userData) return null

  const levelProgress = ((userData.balance % 10000) / 10000) * 100
  const nextLevelAmount = (userData.level + 1) * 10000

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil</h1>
        </div>

        {/* Profile Card */}
        <Card className="bg-card/95 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-accent">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-bold">
                    {user.displayName?.[0] || user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent hover:bg-accent/90"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{user.displayName || "Usuário"}</h2>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

                <div className="flex items-center gap-2">
                  <Badge className="bg-accent text-accent-foreground">
                    <Award className="h-3 w-3 mr-1" />
                    Nível {userData.level}
                  </Badge>
                  <Badge variant="outline">{stats.daysActive} dias ativo</Badge>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso para Nível {userData.level + 1}</span>
                <span className="font-semibold">{levelProgress.toFixed(0)}%</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Faltam {(nextLevelAmount - userData.balance).toLocaleString("pt-MZ")} MZN
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Wallet className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo Total</p>
                  <p className="text-lg font-bold">{userData.balance.toLocaleString("pt-MZ")} MZN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Investido</p>
                  <p className="text-lg font-bold">{stats.totalInvested.toLocaleString("pt-MZ")} MZN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Gift className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ganhos</p>
                  <p className="text-lg font-bold">{stats.totalEarned.toLocaleString("pt-MZ")} MZN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Award className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transações</p>
                  <p className="text-lg font-bold">{stats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conquistas</CardTitle>
            <CardDescription>Suas realizações na MozWallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <div className="p-2 rounded-full bg-accent">
                <Award className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Primeiro Investimento</p>
                <p className="text-xs text-muted-foreground">Realizou seu primeiro investimento</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <div className="p-2 rounded-full bg-accent">
                <Gift className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Primeira Recompensa</p>
                <p className="text-xs text-muted-foreground">Ganhou sua primeira recompensa diária</p>
              </div>
            </div>

            {userData.level >= 2 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                <div className="p-2 rounded-full bg-accent">
                  <TrendingUp className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Subiu de Nível</p>
                  <p className="text-xs text-muted-foreground">Alcançou o nível {userData.level}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
