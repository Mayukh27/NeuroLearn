"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ClipboardList } from "lucide-react"
import {
  completeStudySession,
  savePrePostResults,
  startStudySession,
  type PrePostResponse,
  type StudySession,
} from "@/lib/api"

const QUESTIONS = [
  {
    id: "study_q1",
    question: "What is the main purpose of component state?",
    options: ["Store changing UI data", "Replace all CSS", "Compile the app", "Host the database"],
    correctAnswer: 0,
  },
  {
    id: "study_q2",
    question: "Which React hook is commonly used for side effects?",
    options: ["useEffect", "useTitle", "useClass", "useServer"],
    correctAnswer: 0,
  },
  {
    id: "study_q3",
    question: "Why do list items need stable keys?",
    options: ["To preserve identity during rendering", "To encrypt responses", "To start the camera", "To change passwords"],
    correctAnswer: 0,
  },
]

export default function StudyTestPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--text-muted)]">Loading study test...</div>}>
      <StudyTestContent />
    </Suspense>
  )
}

function StudyTestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") === "post" ? "post" : "pre"
  const courseId = searchParams.get("course") || "course_001"
  const videoId = searchParams.get("video") || "v1"
  const [studySession, setStudySession] = useState<StudySession | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [responses, setResponses] = useState<PrePostResponse[]>([])
  const [submitting, setSubmitting] = useState(false)
  const questionStartRef = useRef(Date.now())

  useEffect(() => {
    const existing = searchParams.get("studySession")
    if (existing) {
      setStudySession({
        studySessionId: existing,
        participantId: "",
        condition: "MCRF",
        sequenceOrder: "MCRF_THEN_LEGACY",
        completionStatus: "started",
        experimentVersion: "full-study-v1",
      })
      return
    }
    ;(async () => {
      const session = await startStudySession(courseId, videoId, courseId)
      setStudySession(session)
    })()
  }, [courseId, videoId, searchParams])

  useEffect(() => {
    questionStartRef.current = Date.now()
    setSelected(null)
  }, [currentIdx])

  const submitAnswer = async () => {
    if (selected === null || !studySession) return
    const question = QUESTIONS[currentIdx]
    const now = Date.now()
    const response: PrePostResponse = {
      questionId: question.id,
      questionIndex: currentIdx,
      correctness: selected === question.correctAnswer,
      responseTimeSeconds: Math.max(0, Math.round((now - questionStartRef.current) / 100) / 10),
      score: selected === question.correctAnswer ? 1 : 0,
      startedAt: new Date(questionStartRef.current).toISOString(),
      completedAt: new Date(now).toISOString(),
    }
    const nextResponses = [
      ...responses.filter((item) => item.questionId !== question.id),
      response,
    ]
    setResponses(nextResponses)

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((idx) => idx + 1)
      return
    }

    setSubmitting(true)
    await savePrePostResults(studySession.studySessionId, type, nextResponses)
    if (type === "pre") {
      const params = new URLSearchParams({
        course: courseId,
        video: videoId,
        studySession: studySession.studySessionId,
      })
      router.push(`/video?${params.toString()}`)
      return
    }

    await completeStudySession(studySession.studySessionId)
    const resultPayload = window.sessionStorage.getItem("neurolearn_last_result")
    if (resultPayload) {
      const parsed = JSON.parse(resultPayload)
      const params = new URLSearchParams(parsed)
      router.push(`/results?${params.toString()}`)
    } else {
      router.push("/dashboard")
    }
  }

  const current = QUESTIONS[currentIdx]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <ClipboardList size={20} className="text-violet-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {type === "pre" ? "Pre-test" : "Post-test"}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Question {currentIdx + 1} of {QUESTIONS.length}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">{current.question}</h2>
        <div className="space-y-3">
          {current.options.map((option, idx) => (
            <button
              key={option}
              onClick={() => setSelected(idx)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selected === idx
                  ? "border-violet-500 bg-violet-500/10 text-violet-100"
                  : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={submitAnswer}
          disabled={selected === null || submitting || !studySession}
          className="mt-6 w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          {currentIdx === QUESTIONS.length - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  )
}
