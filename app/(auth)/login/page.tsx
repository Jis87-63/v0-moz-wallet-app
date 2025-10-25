"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signIn(email, password)
      router.push("/home")
    } catch (err: any) {
      console.error("[v0] Login error:", err)
      setError("Email ou senha incorretos")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)

    try {
      await signInWithGoogle()
      router.push("/home")
    } catch (err: any) {
      console.error("[v0] Google login error:", err)
      setError("Erro ao fazer login com Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#002A54] to-[#001F3F] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md border-[#FFD700]/20 bg-[#0A1929]/95 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-[#FFD700]/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-4 rounded-2xl shadow-lg">
              <Wallet className="w-12 h-12 text-[#001F3F]" strokeWidth={2} />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-base text-gray-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              Entre e continue investindo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium">
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-[#0F2537] border-gray-700 focus:border-[#FFD700] text-white placeholder:text-gray-500 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium">
                Senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-[#0F2537] border-gray-700 focus:border-[#FFD700] text-white placeholder:text-gray-500 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-[#001F3F] font-bold text-base rounded-xl shadow-lg hover:shadow-[#FFD700]/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0A1929] px-3 text-gray-500 font-medium">Ou continue com</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-100 border-gray-300 text-gray-900 font-semibold rounded-xl transition-all"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="mr-3 h-6 w-6" />
            Entrar com Google
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-[#FFD700] hover:text-[#FFA500] font-semibold transition-colors inline-flex items-center gap-1"
              >
                Criar conta
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
