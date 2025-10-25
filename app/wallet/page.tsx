"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  BarChart3,
  User,
  Loader2,
  CreditCard,
  Smartphone,
  Building2,
  ChevronLeft,
} from "lucide-react"
import { ref, update, push } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Transaction } from "@/lib/user-service"

export default function WalletPage() {
  const { user, userData, loading, refreshUserData } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("wallet")
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [processing, setProcessing] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"mpesa" | "card" | "bank">("mpesa")

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

  const handleDeposit = async () => {
    const amount = Number.parseFloat(depositAmount)
    if (!amount || amount <= 0 || !user) return

    setProcessing(true)
    try {
      const newBalance = userData.balance + amount
      const userRef = ref(database, `users/${user.uid}`)

      // Create transaction
      const transactionRef = push(ref(database, `users/${user.uid}/transactions`))
      const transaction: Transaction = {
        id: transactionRef.key || Date.now().toString(),
        type: "deposit",
        amount: amount,
        description: `Depósito via ${selectedMethod === "mpesa" ? "M-Pesa" : selectedMethod === "card" ? "Cartão" : "Banco"}`,
        timestamp: new Date().toISOString(),
      }

      await update(userRef, { balance: newBalance })
      await update(transactionRef, transaction)
      await refreshUserData()

      setDepositAmount("")
      setDepositDialogOpen(false)
    } catch (error) {
      console.error("Error depositing:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (!amount || amount <= 0 || amount > userData.balance || !user) return

    setProcessing(true)
    try {
      const newBalance = userData.balance - amount
      const userRef = ref(database, `users/${user.uid}`)

      // Create transaction
      const transactionRef = push(ref(database, `users/${user.uid}/transactions`))
      const transaction: Transaction = {
        id: transactionRef.key || Date.now().toString(),
        type: "purchase",
        amount: amount,
        description: `Levantamento via ${selectedMethod === "mpesa" ? "M-Pesa" : selectedMethod === "card" ? "Cartão" : "Banco"}`,
        timestamp: new Date().toISOString(),
      }

      await update(userRef, { balance: newBalance })
      await update(transactionRef, transaction)
      await refreshUserData()

      setWithdrawAmount("")
      setWithdrawDialogOpen(false)
    } catch (error) {
      console.error("Error withdrawing:", error)
    } finally {
      setProcessing(false)
    }
  }

  const transactions = userData.transactions ? Object.values(userData.transactions) : []
  const sortedTransactions = transactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Carteira</h1>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-white/80" />
              <p className="text-white/80 text-sm">Saldo Disponível</p>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-white">{userData.balance.toFixed(2)}</span>
              <span className="text-white/80 text-xl">MZN</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                    Depositar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Depositar Fundos</DialogTitle>
                    <DialogDescription>Adicione dinheiro à sua carteira MozWallet</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Método de Pagamento</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedMethod === "mpesa" ? "default" : "outline"}
                          className={selectedMethod === "mpesa" ? "bg-secondary" : ""}
                          onClick={() => setSelectedMethod("mpesa")}
                        >
                          <Smartphone className="w-4 h-4 mr-1" />
                          M-Pesa
                        </Button>
                        <Button
                          variant={selectedMethod === "card" ? "default" : "outline"}
                          className={selectedMethod === "card" ? "bg-secondary" : ""}
                          onClick={() => setSelectedMethod("card")}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Cartão
                        </Button>
                        <Button
                          variant={selectedMethod === "bank" ? "default" : "outline"}
                          className={selectedMethod === "bank" ? "bg-secondary" : ""}
                          onClick={() => setSelectedMethod("bank")}
                        >
                          <Building2 className="w-4 h-4 mr-1" />
                          Banco
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Valor (MZN)</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {[100, 500, 1000, 5000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositAmount(amount.toString())}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={handleDeposit}
                      disabled={!depositAmount || Number.parseFloat(depositAmount) <= 0 || processing}
                      className="w-full bg-secondary hover:bg-secondary/90"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Confirmar Depósito"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Levantar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Levantar Fundos</DialogTitle>
                    <DialogDescription>Retire dinheiro da sua carteira MozWallet</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                      <p className="text-2xl font-bold">{userData.balance.toFixed(2)} MZN</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Método de Levantamento</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedMethod === "mpesa" ? "default" : "outline"}
                          className={selectedMethod === "mpesa" ? "bg-secondary" : ""}
                          onClick={() => setSelectedMethod("mpesa")}
                        >
                          <Smartphone className="w-4 h-4 mr-1" />
                          M-Pesa
                        </Button>
                        <Button
                          variant={selectedMethod === "card" ? "default" : "outline"}
                          className={selectedMethod === "card" ? "bg-secondary" : ""}
                          onClick={() => setSelectedMethod("card")}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Cartão
                        </Button>
                        <Button
                          variant={selectedMethod === "bank" ? "default" : "outline"}
                          className={selectedMethod === "bank" ? "bg-secondary" : ""}
                          onClick={() => setSelectedMethod("bank")}
                        >
                          <Building2 className="w-4 h-4 mr-1" />
                          Banco
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Valor (MZN)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {[100, 500, 1000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setWithdrawAmount(amount.toString())}
                          disabled={amount > userData.balance}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        !withdrawAmount ||
                        Number.parseFloat(withdrawAmount) <= 0 ||
                        Number.parseFloat(withdrawAmount) > userData.balance ||
                        processing
                      }
                      className="w-full bg-secondary hover:bg-secondary/90"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Confirmar Levantamento"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <div className="px-4 -mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Todas as suas transações recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="deposit">Depósitos</TabsTrigger>
                <TabsTrigger value="reward">Recompensas</TabsTrigger>
                <TabsTrigger value="other">Outras</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-3 mt-4">
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
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
                            {new Date(transaction.timestamp).toLocaleString("pt-PT")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "deposit" || transaction.type === "reward"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.type === "deposit" || transaction.type === "reward" ? "+" : "-"}
                          {transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type === "deposit"
                            ? "Depósito"
                            : transaction.type === "reward"
                              ? "Recompensa"
                              : transaction.type === "investment"
                                ? "Investimento"
                                : "Compra"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda</p>
                )}
              </TabsContent>
              <TabsContent value="deposit" className="space-y-3 mt-4">
                {sortedTransactions.filter((t) => t.type === "deposit").length > 0 ? (
                  sortedTransactions
                    .filter((t) => t.type === "deposit")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500/10">
                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleString("pt-PT")}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-500">+{transaction.amount.toFixed(2)}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhum depósito ainda</p>
                )}
              </TabsContent>
              <TabsContent value="reward" className="space-y-3 mt-4">
                {sortedTransactions.filter((t) => t.type === "reward").length > 0 ? (
                  sortedTransactions
                    .filter((t) => t.type === "reward")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500/10">
                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleString("pt-PT")}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-500">+{transaction.amount.toFixed(2)}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhuma recompensa ainda</p>
                )}
              </TabsContent>
              <TabsContent value="other" className="space-y-3 mt-4">
                {sortedTransactions.filter((t) => t.type !== "deposit" && t.type !== "reward").length > 0 ? (
                  sortedTransactions
                    .filter((t) => t.type !== "deposit" && t.type !== "reward")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-500/10">
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleString("pt-PT")}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-red-500">-{transaction.amount.toFixed(2)}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda</p>
                )}
              </TabsContent>
            </Tabs>
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
          <Button variant="ghost" size="sm" className="flex-col h-auto gap-1 text-secondary">
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
