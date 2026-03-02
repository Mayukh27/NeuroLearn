"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Clock, Loader2 } from "lucide-react"
import AssessmentCard from "@/components/AssessmentCard"
import { generateAssessment, submitAssessment, type AssessmentSession, type AssessmentQuestion } from "@/lib/api"

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}

function AssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course") || "course_001"
  const videoId = searchParams.get("video") || "v1"
  const attentionScore = parseFloat(searchParams.get("attention") || "70")
  const prevScore = searchParams.get("prev") ? parseFloat(searchParams.get("prev")!) : null
  const attentionDataParam = searchParams.get("attentionData") || ""
  const courseTitleParam = searchParams.get("courseTitle") || "Course"
  const videoTitleParam = searchParams.get("videoTitle") || "Video"

  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [startTime] = useState(Date.now())
  const timerRef = useRef<NodeJS.Timeout>()

  // Fetch transcript text from window (set by TranscriptionPanel)
  const getTranscriptText = (): string => {
    if (typeof window !== "undefined" && (window as any).__transcriptText) {
      return (window as any).__transcriptText()
    }
    return ""
  }

  // Generate assessment on mount
  useEffect(() => {
    async function generate() {
      setIsLoading(true)
      try {
        const sess = await generateAssessment(
          courseId,
          videoId,
          attentionScore,
          prevScore,
          getTranscriptText()
        )
        setSession(sess)
        setTimeRemaining(sess.timeLimit)
      } catch (err) {
        console.error("Failed to generate assessment:", err)
      } finally {
        setIsLoading(false)
      }
    }
    generate()
  }, [courseId, videoId, attentionScore, prevScore])

  // Timer countdown
  useEffect(() => {
    if (!session || timeRemaining <= 0) return
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [session])

  const handleAutoSubmit = useCallback(async () => {
    if (!session) return
    await doSubmit()
  }, [session, answers])

  const handleAnswer = async (questionId: string, answer: string | number) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)

    if (currentIdx < (session?.questions.length || 0) - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      // Last question — submit
      await doSubmit(newAnswers)
    }
  }

  const doSubmit = async (finalAnswers?: Record<string, string | number>) => {
    if (!session || isSubmitting) return
    setIsSubmitting(true)
    clearInterval(timerRef.current)

    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const ans = finalAnswers || answers

    try {
      const result = await submitAssessment(session.id, ans, session.questions, elapsed)
      // Navigate to results with all data serialized (including attention for report card)
      const params = new URLSearchParams({
        data: JSON.stringify(result),
        attention: attentionDataParam,
        course: courseTitleParam,
        video: videoTitleParam,
      })
      router.push(`/results?${params.toString()}`)
    } catch (err) {
      console.error("Submit failed:", err)
      setIsSubmitting(false)
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">Generating Assessment...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            AI is creating questions adapted to your level
          </p>
        </div>
      </div>
    )
  }

  if (!session || session.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Brain size={32} className="text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">No questions available. Try watching a video first.</p>
        <button onClick={() => router.push("/dashboard")} className="text-xs text-violet-400 underline">
          Go to Dashboard
        </button>
      </div>
    )
  }

  const currentQ = session.questions[currentIdx]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Assessment</h1>
        <p className="text-xs text-[var(--text-muted)]">
          Difficulty:{" "}
          <span className="font-semibold capitalize text-violet-400">{session.difficulty}</span>
          {" · "}
          Attention during video:{" "}
          <span className="font-semibold text-cyan-400">{Math.round(session.attentionScoreDuringVideo)}%</span>
        </p>
        {session.adaptiveMetadata?.reason && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1 italic max-w-md mx-auto">
            {session.adaptiveMetadata.reason}
          </p>
        )}
      </motion.div>

      {/* Submitting overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3"
          >
            <Loader2 size={32} className="text-violet-400 animate-spin" />
            <p className="text-sm text-white">Analyzing your results...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <AssessmentCard
          key={currentQ.id}
          question={currentQ}
          questionNumber={currentIdx + 1}
          totalQuestions={session.questions.length}
          timeRemaining={timeRemaining}
          onSubmit={handleAnswer}
        />
      </AnimatePresence>

      {/* Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-[10px] text-[var(--text-muted)] mt-8"
      >
        💡 Questions adapt based on your video attention and previous performance
      </motion.p>
    </div>
  )
}
