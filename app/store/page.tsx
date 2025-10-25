"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Wallet,
  Home,
  BarChart3,
  User,
  Loader2,
  DollarSign,
  ChevronLeft,
  ShoppingCart,
  TrendingUp,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { ref, update, push } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Transaction } from "@/lib/user-service"

interface USDPackage {
  id: string
  amount: number
  price: number
  bonus: number
  popular?: boolean
  savings?: string
}

const usdPackages: USDPackage[] = [
  {
    id: "starter",
    amount: 10,
    price: 635,
    bonus: 0,
  },
  {
    id: "basic",
    amount: 50,
    price: 3175,
    bonus: 5,
    savings: "10% Bónus",
  },
  {
    id: "popular",
    amount: 100,
    price: 6350,
    bonus: 15,
    popular: true,
    savings: "15% Bónus",
  },
  {
    id: "premium",
    amount: 500,
    price: 31750,
    bonus: 100,
    savings: "20% Bónus",
  },
  {
    id: "vip",
    amount: 1000,
    price: 63500,
    bonus: 250,
    savings: "25% Bónus",
  },
]

export default function StorePage() {
  const { user, userData, loading, refreshUserData } = useAuth()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<USDPackage | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState("")

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

  const exchangeRate = 63.5 // USD to MZN

  const handlePurchase = async (pkg: USDPackage) => {
    if (!user || userData.balance < pkg.price) return

    setPurchasing(true)
    try {
      const totalUSD = pkg.amount + pkg.bonus
      const newBalance = userData.balance - pkg.price

      const userRef = ref(database, `users/${user.uid}`)
      await update(userRef, { balance: newBalance })

      // Create transaction
      const transactionRef = push(ref(database, `users/${user.uid}/transactions`))
      const transaction: Transaction = {
        id: transactionRef.key || Date.now().toString(),
        type: "purchase",
        amount: pkg.price,
        description: `Compra de ${totalUSD} USD${pkg.bonus > 0 ? ` (${pkg.bonus} USD bónus)` : ""}`,
        timestamp: new Date().toISOString(),
      }
      await update(transactionRef, transaction)

      await refreshUserData()
      setDialogOpen(false)
      setSelectedPackage(null)
    } catch (error) {
      console.error("Error purchasing USD:", error)
    } finally {
      setPurchasing(false)
    }
  }

  const handleCustomPurchase = async () => {
    const amount = Number.parseFloat(customAmount)
    if (!amount || amount <= 0 || !user) return

    const price = amount * exchangeRate
    if (userData.balance < price) return

    setPurchasing(true)
    try {
      const newBalance = userData.balance - price

      const userRef = ref(database, `users/${user.uid}`)
      await update(userRef, { balance: newBalance })

      // Create transaction
      const transactionRef = push(ref(database, `users/${user.uid}/transactions`))
      const transaction: Transaction = {
        id: transactionRef.key || Date.now().toString(),
        type: "purchase",
        amount: price,
        description: `Compra de ${amount} USD`,
        timestamp: new Date().toISOString(),
      }
      await update(transactionRef, transaction)

      await refreshUserData()
      setCustomAmount("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Error purchasing USD:", error)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Loja USD</h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Seu Saldo</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{userData.balance.toFixed(2)}</span>
                  <span className="text-white/80 text-lg">MZN</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm mb-1">Taxa de Câmbio</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-secondary">{exchangeRate}</span>
                  <span className="text-white/80 text-sm">MZN/USD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 space-y-4">
        {/* Info Banner */}
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-secondary/10">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Compre USD e Invista no Forex</h3>
                <p className="text-sm text-muted-foreground">
                  Adquira dólares americanos com bónus especiais e comece a investir no mercado Forex
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor Personalizado</CardTitle>
            <CardDescription>Compre a quantidade exata que você precisa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Quantidade em USD</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              {customAmount && Number.parseFloat(customAmount) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Custo: {(Number.parseFloat(customAmount) * exchangeRate).toFixed(2)} MZN
                </p>
              )}
            </div>
            <Button
              onClick={handleCustomPurchase}
              disabled={
                !customAmount ||
                Number.parseFloat(customAmount) <= 0 ||
                userData.balance < Number.parseFloat(customAmount) * exchangeRate ||
                purchasing
              }
              className="w-full bg-primary hover:bg-primary/90"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Comprar Agora
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Package Title */}
        <div className="pt-2">
          <h2 className="text-xl font-bold mb-1">Pacotes com Bónus</h2>
          <p className="text-sm text-muted-foreground">Economize mais comprando pacotes maiores</p>
        </div>

        {/* USD Packages */}
        <div className="grid gap-4">
          {usdPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${pkg.popular ? "border-secondary shadow-lg shadow-secondary/20" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-secondary/10">
                      <DollarSign className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{pkg.amount}</span>
                        <span className="text-muted-foreground">USD</span>
                      </div>
                      {pkg.bonus > 0 && (
                        <Badge variant="secondary" className="mt-1">
                          +{pkg.bonus} USD Bónus
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{pkg.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">MZN</p>
                    {pkg.savings && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{pkg.savings}</p>}
                  </div>
                </div>

                {pkg.bonus > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Você recebe:</span>
                      <span className="font-semibold text-secondary">{pkg.amount + pkg.bonus} USD</span>
                    </div>
                  </div>
                )}

                <Dialog open={dialogOpen && selectedPackage?.id === pkg.id} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setSelectedPackage(pkg)}
                      disabled={userData.balance < pkg.price}
                      className={`w-full ${pkg.popular ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"}`}
                    >
                      {userData.balance < pkg.price ? (
                        "Saldo Insuficiente"
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Pacote
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Compra</DialogTitle>
                      <DialogDescription>Revise os detalhes da sua compra</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="p-4 rounded-lg bg-muted space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Valor Base</span>
                          <span className="font-semibold">{pkg.amount} USD</span>
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Bónus</span>
                            <span className="font-semibold text-secondary">+{pkg.bonus} USD</span>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Total a Receber</span>
                            <span className="text-xl font-bold text-secondary">{pkg.amount + pkg.bonus} USD</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Custo</span>
                          <span className="font-semibold">{pkg.price.toLocaleString()} MZN</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Saldo Atual</span>
                          <span className="font-semibold">{userData.balance.toFixed(2)} MZN</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Saldo Após Compra</span>
                            <span className="text-lg font-bold">{(userData.balance - pkg.price).toFixed(2)} MZN</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handlePurchase(pkg)}
                          disabled={purchasing}
                          className="flex-1 bg-secondary hover:bg-secondary/90"
                        >
                          {purchasing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Confirmar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por que Comprar USD?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Investimento no Forex</p>
                <p className="text-xs text-muted-foreground">Use USD para negociar pares de moedas no mercado Forex</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Bónus Generosos</p>
                <p className="text-xs text-muted-foreground">Ganhe até 25% de bónus em pacotes maiores</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Proteção Cambial</p>
                <p className="text-xs text-muted-foreground">Proteja seu dinheiro contra flutuações do Metical</p>
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
          <Button variant="ghost" size="sm" className="flex-col h-auto gap-1 text-secondary">
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
