"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Wifi, WifiOff, ChevronDown } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface TranscriptSegment {
  id: string
  text: string
  timestamp: string
  start_time: number
  end_time: number
  confidence: number
  model_response: {
    language: string
    words: { word: string; start: number; end: number; confidence: number }[]
  }
}

interface TranscriptionPanelProps {
  videoId: string
  currentTime: number
  isPlaying: boolean
}

// Dummy segments for when backend is offline
const DUMMY_SEGMENTS: TranscriptSegment[] = [
  { id: "t1", text: "Welcome to this lesson on React fundamentals.", timestamp: "00:00", start_time: 0, end_time: 3, confidence: 0.97, model_response: { language: "en", words: [] } },
  { id: "t2", text: "Today we'll explore how React uses a virtual DOM for efficient rendering.", timestamp: "00:04", start_time: 4, end_time: 8, confidence: 0.94, model_response: { language: "en", words: [] } },
  { id: "t3", text: "Components are the building blocks of any React application.", timestamp: "00:09", start_time: 9, end_time: 12, confidence: 0.96, model_response: { language: "en", words: [] } },
  { id: "t4", text: "You can think of components as reusable, self-contained pieces of UI.", timestamp: "00:13", start_time: 13, end_time: 17, confidence: 0.92, model_response: { language: "en", words: [] } },
  { id: "t5", text: "There are two types: functional components and class components.", timestamp: "00:18", start_time: 18, end_time: 22, confidence: 0.95, model_response: { language: "en", words: [] } },
  { id: "t6", text: "Modern React strongly favors functional components with hooks.", timestamp: "00:23", start_time: 23, end_time: 27, confidence: 0.93, model_response: { language: "en", words: [] } },
  { id: "t7", text: "The useState hook lets you add state to functional components.", timestamp: "00:28", start_time: 28, end_time: 32, confidence: 0.96, model_response: { language: "en", words: [] } },
  { id: "t8", text: "useEffect handles side effects like data fetching and subscriptions.", timestamp: "00:33", start_time: 33, end_time: 37, confidence: 0.91, model_response: { language: "en", words: [] } },
  { id: "t9", text: "Props allow you to pass data from parent to child components.", timestamp: "00:38", start_time: 38, end_time: 42, confidence: 0.94, model_response: { language: "en", words: [] } },
  { id: "t10", text: "The key prop helps React efficiently update lists by tracking identity.", timestamp: "00:43", start_time: 43, end_time: 47, confidence: 0.93, model_response: { language: "en", words: [] } },
]

export default function TranscriptionPanel({
  videoId,
  currentTime,
  isPlaying,
}: TranscriptionPanelProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastFetchTime = useRef<number>(-1)

  // ── Fetch full transcript on mount ──
  useEffect(() => {
    async function fetchFullTranscript() {
      try {
        const res = await fetch(`${API_BASE}/transcription/${videoId}`)
        if (res.ok) {
          const data = await res.json()
          setSegments(data)
          setIsConnected(true)
          return
        }
      } catch {}
      // Fallback to dummy
      setSegments(DUMMY_SEGMENTS)
      setIsConnected(false)
    }
    fetchFullTranscript()
  }, [videoId])

  // ── Poll live segment as video plays ──
  useEffect(() => {
    if (!isPlaying) return

    const roundedTime = Math.floor(currentTime)

    // Only fetch when time changes by at least 1 second
    if (roundedTime === lastFetchTime.current) return
    lastFetchTime.current = roundedTime

    // Find active segment from already loaded segments
    const active = segments.find(
      (s) => currentTime >= s.start_time && currentTime < s.end_time
    )
    if (active) {
      setActiveSegmentId(active.id)
    }

    // Also try fetching live from backend (to get new segments)
    async function fetchLive() {
      try {
        const res = await fetch(
          `${API_BASE}/transcription/${videoId}/live?current_time=${currentTime}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.id && !segments.find((s) => s.id === data.id)) {
            setSegments((prev) => [...prev, data].sort((a, b) => a.start_time - b.start_time))
          }
          setIsConnected(true)
        }
      } catch {
        setIsConnected(false)
      }
    }

    fetchLive()
  }, [currentTime, isPlaying, videoId, segments])

  // ── Auto-scroll to active segment ──
  useEffect(() => {
    if (!autoScroll || !activeSegmentId || !scrollRef.current) return
    const el = scrollRef.current.querySelector(`[data-segment-id="${activeSegmentId}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [activeSegmentId, autoScroll])

  // ── Get full transcript text (for assessment generation) ──
  const getFullText = useCallback(() => {
    return segments.map((s) => s.text).join(" ")
  }, [segments])

  // Expose on window for parent page to access
  useEffect(() => {
    (window as any).__transcriptText = getFullText
  }, [getFullText])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Live Transcription
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi size={10} className="text-emerald-400" />
          ) : (
            <WifiOff size={10} className="text-amber-400" />
          )}
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-red-500"
            />
          )}
          <span className="text-[9px] text-[var(--text-muted)] font-mono">
            {segments.length} seg
          </span>
        </div>
      </div>

      {/* Transcript list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[380px]"
        onScroll={() => {
          // Disable auto-scroll if user manually scrolls up
          const el = scrollRef.current
          if (!el) return
          const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
          setAutoScroll(isAtBottom)
        }}
      >
        <AnimatePresence initial={false}>
          {segments.length > 0 ? (
            segments.map((seg, idx) => {
              const isActive = seg.id === activeSegmentId
              const isPast = currentTime > seg.end_time

              return (
                <motion.div
                  key={seg.id}
                  data-segment-id={seg.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex gap-2.5 items-start p-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-violet-500/10 border border-violet-500/20"
                      : isPast
                        ? "bg-[var(--bg-elevated)]/50 opacity-60"
                        : "bg-[var(--bg-elevated)] border border-transparent"
                  }`}
                >
                  {/* Timestamp */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <span
                      className={`text-[10px] font-mono ${
                        isActive ? "text-violet-400" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {seg.timestamp}
                    </span>
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1 h-1 rounded-full bg-violet-400 mt-1"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        isActive
                          ? "text-[var(--text-primary)] font-medium"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {seg.text}
                    </p>

                    {/* Confidence bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-0.5 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${seg.confidence * 100}%`,
                            background:
                              seg.confidence > 0.9
                                ? "#10b981"
                                : seg.confidence > 0.8
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        />
                      </div>
                      <span className="text-[8px] text-[var(--text-muted)] font-mono">
                        {(seg.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-xs">
              Waiting for transcription data...
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: scroll indicator */}
      {!autoScroll && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setAutoScroll(true)
            const el = scrollRef.current
            if (el) el.scrollTop = el.scrollHeight
          }}
          className="mx-3 mb-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-violet-500/15 transition-colors"
        >
          <ChevronDown size={12} />
          Jump to latest
        </motion.button>
      )}

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 text-[9px] text-[var(--text-muted)] flex justify-between">
        <span>Model: Whisper {isConnected ? "(live)" : "(cached)"}</span>
        <span>Lang: EN</span>
      </div>
    </motion.div>
  )
}
