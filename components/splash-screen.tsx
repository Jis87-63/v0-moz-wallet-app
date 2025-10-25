"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Wallet } from "lucide-react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-secondary/30 border-t-secondary"
          />
          <div className="bg-secondary/20 p-8 rounded-full backdrop-blur-sm">
            <Wallet className="w-20 h-20 text-secondary" strokeWidth={1.5} />
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">MozWallet</h1>
          <p className="text-secondary text-lg font-medium">Invista, Ganhe e Cresça</p>
        </motion.div>

        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mt-4">
          <motion.div
            className="h-full bg-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  )
}
