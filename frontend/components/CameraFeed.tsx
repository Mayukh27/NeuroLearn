"use client"

/**
 * CameraFeed — Webcam capture + attention scoring pipeline
 *
 * PIPELINE (runs every 500ms while video plays):
 *   1. getUserMedia → <video srcObject={stream}>
 *   2. video.onloadeddata → cameraReady = true
 *   3. canvas.drawImage(video) → canvas.toDataURL("image/jpeg")
 *   4. POST base64 frame → /api/attention/snapshot
 *   5. Parse response → call onAttentionUpdate(snapshot)
 *   6. If backend down → generate local dummy score
 *
 * Every step is logged to console for debugging.
 */

import { useRef, useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Camera, CameraOff, AlertTriangle, Wifi, WifiOff } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const CAPTURE_INTERVAL_MS = 500 // capture frame every 500ms
const SEND_INTERVAL_MS = 2000   // send to backend every 2s (not every frame)

export interface AttentionSnapshotResponse {
  timestamp: string
  score: number
  state: "attentive" | "inattentive" | "unfocused"
  confidence: number
  message: string
  modelResponse: {
    eyeContact: number
    headPose: string
    faceDetected: boolean
    blinkRate: number
  }
}

interface CameraFeedProps {
  isVideoPlaying: boolean
  videoId: string
  studentId: string
  onAttentionUpdate?: (snapshot: AttentionSnapshotResponse) => void
}

/** Normalize snake_case backend JSON → camelCase frontend type */
function normSnap(data: any): AttentionSnapshotResponse {
  const mr = data.model_response || data.modelResponse || {}
  return {
    timestamp: data.timestamp || new Date().toISOString(),
    score: data.score ?? 0,
    state: data.state || "attentive",
    confidence: data.confidence ?? 0.5,
    message: data.message || "",
    modelResponse: {
      eyeContact: mr.eye_contact ?? mr.eyeContact ?? 0,
      headPose: mr.head_pose ?? mr.headPose ?? "forward",
      faceDetected: mr.face_detected ?? mr.faceDetected ?? false,
      blinkRate: mr.blink_rate ?? mr.blinkRate ?? 0,
    },
  }
}

function generateLocalDummy(): AttentionSnapshotResponse {
  const r = Math.random()
  const state: "attentive" | "inattentive" | "unfocused" =
    r > 0.85 ? "unfocused" : r > 0.6 ? "inattentive" : "attentive"
  const ranges = { attentive: [70, 100], inattentive: [35, 69], unfocused: [0, 34] } as const
  const [lo, hi] = ranges[state]
  const score = Math.floor(Math.random() * (hi - lo + 1)) + lo
  const messages = {
    attentive: "Great focus! Keep it up.",
    inattentive: "Try to stay focused on the content.",
    unfocused: "Your attention is very low. Take a break?",
  }
  return {
    timestamp: new Date().toISOString(),
    score,
    state,
    confidence: Math.random() * 0.3 + 0.7,
    message: messages[state],
    modelResponse: {
      eyeContact: score / 100,
      headPose: state === "attentive" ? "forward" : state === "inattentive" ? "slightly_away" : "away",
      faceDetected: true,
      blinkRate: Math.round(12 + Math.random() * 10),
    },
  }
}

export default function CameraFeed({
  isVideoPlaying,
  videoId,
  studentId,
  onAttentionUpdate,
}: CameraFeedProps) {
  // ── Refs (never stale) ──
  const videoElRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sendLoopRef = useRef<number | null>(null)
  const cameraReadyRef = useRef(false)
  const isSendingRef = useRef(false)
  const latestFrameRef = useRef<string | null>(null)

  // Keep callback/ids in refs so interval never goes stale
  const callbackRef = useRef(onAttentionUpdate)
  callbackRef.current = onAttentionUpdate
  const videoIdRef = useRef(videoId)
  videoIdRef.current = videoId
  const studentIdRef = useRef(studentId)
  studentIdRef.current = studentId

  // ── UI State ──
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [framesSent, setFramesSent] = useState(0)
  const [lastScore, setLastScore] = useState<number | null>(null)

  // ══════════════════════════════════════════════════════════
  // STEP 1: Start webcam — getUserMedia → video.srcObject
  // ══════════════════════════════════════════════════════════
  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    cameraReadyRef.current = false

    try {
      console.log("[CameraFeed] Requesting webcam access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      })
      console.log("[CameraFeed] Got webcam stream:", stream.getVideoTracks()[0]?.label)

      streamRef.current = stream
      const videoEl = videoElRef.current
      if (videoEl) {
        videoEl.srcObject = stream

        // CRITICAL: Wait for video to actually have frame data
        videoEl.onloadeddata = () => {
          console.log("[CameraFeed] Video element loaded data — camera READY")
          cameraReadyRef.current = true
        }

        await videoEl.play()
        setIsActive(true)
        console.log("[CameraFeed] Camera active, video playing")
      }
    } catch (err: unknown) {
      const e = err as Error
      console.error("[CameraFeed] Camera error:", e)
      if (e.name === "NotAllowedError") setError("Camera permission denied.")
      else if (e.name === "NotFoundError") setError("No camera found.")
      else setError("Camera error: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ══════════════════════════════════════════════════════════
  // STEP 2: Capture frame — video → canvas → base64
  // Runs on a fast loop (500ms) to keep latestFrameRef fresh
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isActive) return

    const captureLoop = setInterval(() => {
      const videoEl = videoElRef.current
      const canvas = canvasRef.current
      if (!videoEl || !canvas || !cameraReadyRef.current) return

      // Extra safety: check video dimensions are valid
      if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 320
      canvas.height = 240
      ctx.drawImage(videoEl, 0, 0, 320, 240)
      const base64 = canvas.toDataURL("image/jpeg", 0.6)
      latestFrameRef.current = base64
    }, CAPTURE_INTERVAL_MS)

    console.log("[CameraFeed] Frame capture loop started (every", CAPTURE_INTERVAL_MS, "ms)")

    return () => {
      clearInterval(captureLoop)
      console.log("[CameraFeed] Frame capture loop stopped")
    }
  }, [isActive])

  // ══════════════════════════════════════════════════════════
  // STEP 3: Send frame to backend — POST every 2s
  // Runs whenever camera is active (NOT gated on isVideoPlaying,
  // because YouTube/embed videos play inside an iframe and we
  // cannot detect their play state from the parent)
  // ══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isActive) {
      if (sendLoopRef.current) {
        clearInterval(sendLoopRef.current)
        sendLoopRef.current = null
      }
      return
    }

    const sendToBackend = async () => {
      // Don't stack requests — skip if previous still in-flight
      if (isSendingRef.current) return
      isSendingRef.current = true

      const frame = latestFrameRef.current
      let delivered = false

      // ── Try real backend with 2s timeout ──
      if (frame) {
        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 2000)

          const res = await fetch(`${API_BASE}/attention/snapshot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: ctrl.signal,
            body: JSON.stringify({
              frame_base64: frame,
              video_id: videoIdRef.current,
              student_id: studentIdRef.current,
            }),
          })
          clearTimeout(timer)

          if (res.ok) {
            const data = await res.json()
            const snap = normSnap(data)
            console.log("[CameraFeed] Backend response: score =", snap.score, "state =", snap.state)
            setIsConnected(true)
            setFramesSent((p) => p + 1)
            setLastScore(snap.score)
            callbackRef.current?.(snap)
            delivered = true
          }
        } catch (e) {
          // Fetch failed or timed out — fall through
          console.log("[CameraFeed] Backend unreachable, using local fallback")
        }
      }

      // ── Local fallback — always fires if backend didn't respond ──
      if (!delivered) {
        setIsConnected(false)
        const dummy = generateLocalDummy()
        console.log("[CameraFeed] Local dummy: score =", dummy.score, "state =", dummy.state)
        setFramesSent((p) => p + 1)
        setLastScore(dummy.score)
        callbackRef.current?.(dummy)
      }

      isSendingRef.current = false
    }

    // Fire immediately, then every SEND_INTERVAL_MS
    sendToBackend()
    sendLoopRef.current = window.setInterval(sendToBackend, SEND_INTERVAL_MS) as unknown as number

    console.log("[CameraFeed] Send loop started (every", SEND_INTERVAL_MS, "ms)")

    return () => {
      if (sendLoopRef.current) {
        clearInterval(sendLoopRef.current)
        sendLoopRef.current = null
      }
      console.log("[CameraFeed] Send loop stopped")
    }
  }, [isActive])

  // ══════════════════════════════════════════════════════════
  // Stop camera
  // ══════════════════════════════════════════════════════════
  const stopCamera = useCallback(() => {
    console.log("[CameraFeed] Stopping camera")
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    cameraReadyRef.current = false
    latestFrameRef.current = null
    if (videoElRef.current) videoElRef.current.srcObject = null
    if (sendLoopRef.current) clearInterval(sendLoopRef.current)
    sendLoopRef.current = null
    setIsActive(false)
    setIsConnected(false)
  }, [])

  // Auto-start camera when video plays
  useEffect(() => {
    if (isVideoPlaying && !isActive && !error) startCamera()
  }, [isVideoPlaying, isActive, error, startCamera])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)]"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">Camera Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" title={isConnected ? "Connected to backend" : "Local fallback"}>
            {isConnected ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-amber-400" />}
            <span className="text-[9px] text-[var(--text-muted)]">{isConnected ? "API" : "Local"}</span>
          </div>
          {isActive && (
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </div>
      </div>

      {/* Camera view */}
      <div className="relative aspect-video bg-[var(--bg-primary)] overflow-hidden">
        {!isActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
              <CameraOff size={20} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {isVideoPlaying ? "Starting camera..." : "Camera starts when video plays"}
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-500/5 p-4">
            <AlertTriangle size={24} className="text-red-400" />
            <p className="text-xs text-red-400 text-center">{error}</p>
            <button onClick={startCamera} className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors mt-1">Retry</button>
          </div>
        )}

        {/* Webcam video element — always rendered, hidden when inactive */}
        <video
          ref={videoElRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isActive ? "block" : "hidden"}`}
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Hidden canvas for frame extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay badge with live score */}
        {isActive && (
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] text-white/80 font-mono">AI Monitor · {framesSent} frames</span>
            </div>
            {lastScore !== null && (
              <div className={`px-2 py-1 rounded-md backdrop-blur-sm text-[10px] font-bold font-mono ${
                lastScore >= 70 ? "bg-emerald-500/30 text-emerald-300" :
                lastScore >= 40 ? "bg-amber-500/30 text-amber-300" :
                "bg-red-500/30 text-red-300"
              }`}>
                Score: {lastScore}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 flex gap-2">
        {!isActive ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startCamera} disabled={isLoading}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50">
            {isLoading ? "Starting..." : "Enable Camera"}
          </motion.button>
        ) : (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={stopCamera}
            className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
            Stop Camera
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
