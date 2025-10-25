"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Mail, Lock, Loader2 } from "lucide-react"
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
      setError("Erro ao fazer login com Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-secondary/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto bg-secondary/20 p-4 rounded-full w-fit">
            <Wallet className="w-12 h-12 text-secondary" strokeWidth={1.5} />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Bem-vindo</CardTitle>
            <CardDescription className="text-base mt-2">Entre na sua conta MozWallet</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Entrar com Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-secondary hover:underline font-semibold">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
