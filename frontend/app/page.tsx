"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 1500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--bg-primary)]">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <span className="text-3xl font-black text-white tracking-tight">NL</span>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 rounded-3xl border-2 border-violet-500/30 border-t-violet-500"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold gradient-text mb-2">NeuroLearn</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Loading your learning experience...
        </p>
      </motion.div>

      {/* Loading bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="h-1 rounded-full progress-animated"
      />
    </div>
  )
}
