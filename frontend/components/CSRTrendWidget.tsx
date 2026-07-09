"use client"

import { motion } from "framer-motion"
import { Brain, Info } from "lucide-react"
import type { CsrHistoryEntry } from "@/lib/api"

interface CSRTrendWidgetProps {
  history: CsrHistoryEntry[]
}

function bandColor(csr: number): string {
  return csr > 0.75 ? "#ef4444" : csr >= 0.45 ? "#f59e0b" : "#10b981"
}

export default function CSRTrendWidget({ history }: CSRTrendWidgetProps) {
  if (!history.length) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5"
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain size={18} className="text-violet-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Cognitive Readiness</h3>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] flex items-start gap-2">
          <Info size={12} className="shrink-0 mt-0.5" />
          Complete an assessment to start tracking your Cognitive Readiness Score.
        </p>
      </motion.div>
    )
  }

  const latest = history[history.length - 1]
  const recent = history.slice(-10)
  const w = 100
  const h = 32
  const points = recent.map((entry, i) => {
    const x = recent.length === 1 ? w : (i / (recent.length - 1)) * w
    const y = h - entry.csr * h
    return `${x},${y}`
  }).join(" ")

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain size={18} className="text-violet-400" />
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Cognitive Readiness</h3>
        <span
          className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: bandColor(latest.csr), backgroundColor: `${bandColor(latest.csr)}1a` }}
        >
          {(latest.csr * 100).toFixed(0)}
        </span>
      </div>

      <div className="w-full h-10 mb-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={bandColor(latest.csr)}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <p className="text-[10px] text-[var(--text-muted)]">
        Trending {latest.csr >= (recent[0]?.csr ?? latest.csr) ? "up" : "down"} over last {recent.length} session
        {recent.length === 1 ? "" : "s"} · current difficulty: <span className="capitalize font-semibold text-[var(--text-secondary)]">{latest.difficulty}</span>
      </p>
    </motion.div>
  )
}
