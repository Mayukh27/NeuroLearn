"use client"

/**
 * ConsentModal — webcam attention-monitoring consent gate
 *
 * FIX (CR6, peer review packet): NeuroLearn previously started the camera
 * and streamed frames to /api/attention/snapshot with no consent prompt,
 * no retention disclosure, and no opt-out. This modal is shown once per
 * student (or whenever consent hasn't been recorded yet) before
 * CameraFeed is allowed to call getUserMedia, and its answer is persisted
 * via POST /api/attention/consent so the backend can enforce the same
 * rule server-side (see routers/attention.py).
 *
 * Declining does NOT penalize the student: CSR's Attention (A) component
 * defaults to a neutral 0.5 when no attention data is supplied
 * (backend/ml/csr.py), so opting out only removes a potential *upward*
 * signal, never forces a lower readiness score or an easier/harder tier.
 */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ShieldCheck, X } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const RETENTION_DAYS = 30

interface ConsentModalProps {
  studentId: string
  onDecision: (granted: boolean) => void
}

export default function ConsentModal({ studentId, onDecision }: ConsentModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const submit = async (granted: boolean) => {
    setSubmitting(true)
    try {
      await fetch(`${API_BASE}/attention/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          granted,
          retention_days: RETENTION_DAYS,
          raw_frames_stored: false,
          version: "1.0",
        }),
      })
    } catch {
      // If the backend is unreachable, still honor the student's choice
      // locally — CameraFeed will simply stay off and fall back to the
      // neutral-attention default rather than retry indefinitely.
    } finally {
      setSubmitting(false)
      onDecision(granted)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 text-white shadow-xl"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-indigo-500/20 p-2">
              <Camera className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Use your camera for attention monitoring?</h2>
              <p className="mt-1 text-sm text-white/60">
                This lesson can estimate your on-screen attention from your webcam.
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Raw video frames are analyzed in memory and are never saved — only a
              numeric attention score is stored.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              Stored scores are kept for {RETENTION_DAYS} days, then automatically deleted.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              You can decline or revoke this at any time from your profile's privacy
              settings — declining does not lower your score or lock you into easier
              content; it only removes one input to a five-part readiness estimate.
            </li>
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
            <button
              disabled={submitting}
              onClick={() => submit(true)}
              className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
            >
              Allow camera
            </button>
            <button
              disabled={submitting}
              onClick={() => submit(false)}
              className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:opacity-50"
            >
              Continue without camera
            </button>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => submit(false)}
            className="absolute right-4 top-4 text-white/40 hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
