"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Bell,
  Globe,
  Shield,
  Moon,
  LogOut,
  ChevronRight,
  Mail,
  Lock,
  HelpCircle,
  FileText,
  Info,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [biometric, setBiometric] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao sair:", error)
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </CardTitle>
            <CardDescription>Gerencie suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-xs text-muted-foreground">Receber alertas no dispositivo</p>
              </div>
              <Switch id="push-notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                <p className="text-xs text-muted-foreground">Receber atualizações por e-mail</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize a aparência do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-xs text-muted-foreground">Ativar tema escuro</p>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Idioma</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Português</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </CardTitle>
            <CardDescription>Proteja sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Alterar Senha</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Alterar E-mail</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="biometric">Autenticação Biométrica</Label>
                <p className="text-xs text-muted-foreground">Usar impressão digital</p>
              </div>
              <Switch id="biometric" checked={biometric} onCheckedChange={setBiometric} />
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Suporte
            </CardTitle>
            <CardDescription>Ajuda e informações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Central de Ajuda</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Termos de Uso</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Política de Privacidade</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Sobre a MozWallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">v1.0.0</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>

        <p className="text-center text-xs text-muted-foreground">MozWallet © 2025. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
