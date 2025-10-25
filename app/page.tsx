"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SplashScreen } from "@/components/splash-screen"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !showSplash) {
      if (user) {
        router.push("/home")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, showSplash, router])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return null
}
