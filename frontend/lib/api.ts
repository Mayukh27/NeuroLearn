// ============================================================
// API SERVICE LAYER — FastAPI Backend + Dummy Fallback
//
// USAGE:
//   1. Set NEXT_PUBLIC_API_URL=http://localhost:8000/api in .env.local
//   2. Start FastAPI backend: cd backend && python main.py
//   3. Every function tries the backend first
//   4. On failure → falls back to local dummy data seamlessly
//
// To switch to BACKEND-ONLY mode (no fallback):
//   Set NEXT_PUBLIC_API_STRICT=true
// ============================================================

import {
  DUMMY_STUDENT,
  DUMMY_COURSES,
  DUMMY_LEADERBOARD,
  DUMMY_DAILY_CHALLENGES,
  DUMMY_NOTIFICATIONS,
  DUMMY_TRANSCRIPT_SEGMENTS,
  QUESTION_BANK,
  generateAttentionSnapshot,
  type StudentProfile,
  type Course,
  type VideoLink,
  type AttentionSnapshot,
  type TranscriptSegment,
  type AssessmentQuestion,
  type LeaderboardEntry,
  type DailyChallenge,
  type Notification,
} from "./dummyDb"

// ── Config ──
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const STRICT_MODE = process.env.NEXT_PUBLIC_API_STRICT === "true"
const SAVED_AUTO_COURSES_KEY = "neurolearn_saved_auto_courses"

// FIX (auth request): every request now carries the logged-in student's
// JWT, read lazily here to avoid a circular import at module-load time
// (lib/auth.ts doesn't import from lib/api.ts, but importing getToken
// directly up top is still safe — kept as a function call for clarity
// about where the token actually comes from).
import { getToken, getCachedUserId, tryRefreshAccessToken } from "./auth"

export interface DiscoveredVideo {
  id: string
  title: string
  url: string
  duration: number
  thumbnail: string
  channel: string
  assessmentAvailable: boolean
  transcriptionAvailable: boolean
  // FIX (course generator request): which curriculum stage this video
  // covers (Fundamentals/Core Concepts/Intermediate/Advanced/Applied
  // Project) — the generator used to return several videos that all
  // covered the same beginner ground; this field is what lets the UI
  // show (and lets you verify) that a course now actually has range.
  stageLabel?: string
}

export interface AutoCourse {
  courseId: string
  courseTitle: string
  topic: string
  description: string
  icon: string
  category: string
  difficulty: string
  tags: string[]
  videos: DiscoveredVideo[]
  totalFound: number
  generatedAt: number
  elapsedSeconds: number
  status: "success" | "partial" | "failed"
}

export interface DiscoverRequest {
  topic: string
  maxVideos?: number
  autoTranscribe?: boolean
}

export interface FullPipelineRequest {
  topic: string
  maxVideos?: number
  studentId?: string
  attentionScore?: number
}

export interface FullPipelineResponse {
  courseId: string
  courseTitle: string
  status: string
  message: string
  videosQueued: number
  assessmentSessions: object[]
}

export interface SaveAutoCourseResponse {
  saved: boolean
  courseId: string
  title: string
  message: string
}

export interface StudySession {
  studySessionId: string
  participantId: string
  condition: "MCRF" | "LEGACY"
  sequenceOrder: "MCRF_THEN_LEGACY" | "LEGACY_THEN_MCRF"
  courseId?: string | null
  moduleId?: string | null
  videoId?: string | null
  completionStatus: string
  experimentVersion: string
  applicationVersion?: string | null
}

export interface QuestionResponseEvent {
  questionId: string
  questionIndex: number
  presentedAt: string
  submittedAt?: string
  responseTimeSeconds?: number
  status: "submitted" | "unanswered" | "timeout" | "refresh" | "retry"
}

export interface PrePostResponse {
  questionId: string
  questionIndex: number
  correctness: boolean | null
  responseTimeSeconds: number | null
  score: number | null
  startedAt: string
  completedAt: string
}

// ── Helpers ──
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function getLocallySavedCourses(): Course[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(SAVED_AUTO_COURSES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mergeWithLocalSavedCourses(courses: Course[]): Course[] {
  const localSaved = getLocallySavedCourses()
  if (!localSaved.length) return courses

  const merged = [...courses]
  for (const localCourse of localSaved) {
    if (!merged.some((course) => course.id === localCourse.id)) {
      merged.push(localCourse)
    }
  }
  return merged
}

/**
 * Recursively convert snake_case keys to camelCase.
 * Handles the mismatch between FastAPI (snake_case) and frontend (camelCase).
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function normalizeKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(normalizeKeys)
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[snakeToCamel(key)] = normalizeKeys(obj[key])
      return acc
    }, {})
  }
  return obj
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  fallback?: () => T | Promise<T>
): Promise<T> {
  try {
    const doRequest = async () => {
      const token = getToken()
      return fetch(`${API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
        ...options,
      })
    }

    let res = await doRequest()

    // FIX (remaining-things request): access tokens now expire in 30
    // minutes (was a stateless 10h token with no refresh mechanism at
    // all). A 401 here first tries one silent refresh — this is what
    // stops "session expired" from happening every 30 minutes during
    // normal use instead of only at the very end of a long refresh-token
    // lifetime (30 days).
    if (res.status === 401) {
      const refreshed = await tryRefreshAccessToken()
      if (refreshed) {
        res = await doRequest()
      }
    }

    if (res.status === 401) {
      const { AuthError } = await import("./auth")
      throw new AuthError()
    }
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    const data = await res.json()
    // Normalize snake_case keys from backend to camelCase for frontend
    return normalizeKeys(data) as T
  } catch (err) {
    if (err instanceof Error && err.name === "AuthError") throw err

    const errMsg = err instanceof Error ? err.message : String(err)
    const isNetworkIssue = /Failed to fetch|NetworkError|Load failed/i.test(errMsg)

    if (isNetworkIssue && !fallback) {
      throw new Error(
        `Cannot reach backend at ${API_BASE}. Check NEXT_PUBLIC_API_URL and backend CORS settings.`
      )
    }

    if (STRICT_MODE) throw err
    console.warn(`[API] ${path} failed, using fallback:`, (err as Error).message)
    if (fallback) return await fallback()
    throw err
  }
}

/** POST /api/content/discover */
export async function discoverCourseContent(
  request: DiscoverRequest
): Promise<AutoCourse> {
  return apiFetch<AutoCourse>("/content/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: request.topic,
      max_videos: request.maxVideos ?? 5,
      auto_transcribe: request.autoTranscribe ?? false,
    }),
  })
}

/** POST /api/content/pipeline/full */
export async function runFullCoursePipeline(
  request: FullPipelineRequest
): Promise<FullPipelineResponse> {
  return apiFetch<FullPipelineResponse>("/content/pipeline/full", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: request.topic,
      max_videos: request.maxVideos ?? 3,
      student_id: request.studentId ?? "student_001",
      attention_score: request.attentionScore ?? 75,
    }),
  })
}

/** POST /api/content/courses/auto/:id/save */
export async function saveAutoCourseToDashboard(
  courseId: string
): Promise<SaveAutoCourseResponse> {
  return apiFetch<SaveAutoCourseResponse>(`/content/courses/auto/${courseId}/save`, {
    method: "POST",
  })
}

// ============================================================
// STUDENT
// ============================================================

/** GET /api/student/profile */
export async function fetchStudentProfile(): Promise<StudentProfile> {
  return apiFetch<StudentProfile>(
    "/student/profile",
    { method: "GET" },
    async () => {
      await delay(200)
      return JSON.parse(JSON.stringify(DUMMY_STUDENT))
    }
  )
}

/** POST /api/student/xp */
export async function awardXP(
  amount: number,
  studentId: string = getCachedUserId() ?? "student_001"
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean; xpToNextLevel: number }> {
  return apiFetch(
    "/student/xp",
    {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, amount, reason: "assessment" }),
    },
    async () => {
      await delay(100)
      const s = DUMMY_STUDENT
      s.xp += amount
      const leveledUp = s.xp >= s.xpToNextLevel
      if (leveledUp) { s.level++; s.xp -= s.xpToNextLevel; s.xpToNextLevel = Math.floor(s.xpToNextLevel * 1.2) }
      return { newXP: s.xp, newLevel: s.level, leveledUp, xpToNextLevel: s.xpToNextLevel }
    }
  )
}

// ============================================================
// COURSES
// ============================================================

/** GET /api/courses */
export async function fetchCourses(): Promise<Course[]> {
  const courses = await apiFetch<Course[]>(
    "/courses",
    { method: "GET" },
    async () => {
      await delay(300)
      return JSON.parse(JSON.stringify(DUMMY_COURSES))
    }
  )

  return mergeWithLocalSavedCourses(courses)
}

/** GET /api/courses/:id */
export async function fetchCourseById(courseId: string): Promise<Course | null> {
  return apiFetch<Course>(
    `/courses/${courseId}`,
    { method: "GET" },
    async () => {
      await delay(200)
      const localCourse = getLocallySavedCourses().find((c) => c.id === courseId)
      if (localCourse) return JSON.parse(JSON.stringify(localCourse))
      const c = DUMMY_COURSES.find((c) => c.id === courseId)
      return c ? JSON.parse(JSON.stringify(c)) : null
    }
  )
}

/** GET /api/courses/:courseId/videos/:videoId */
export async function fetchVideoById(
  courseId: string,
  videoId: string
): Promise<{ course: Course; video: VideoLink } | null> {
  return apiFetch(
    `/courses/${courseId}/videos/${videoId}`,
    { method: "GET" },
    async () => {
      await delay(150)
      const localCourse = getLocallySavedCourses().find((c) => c.id === courseId)
      const course = localCourse || DUMMY_COURSES.find((c) => c.id === courseId)
      if (!course) return null
      const video = course.videoLinks.find((v) => v.id === videoId)
      if (!video) return null
      return { course: JSON.parse(JSON.stringify(course)), video: JSON.parse(JSON.stringify(video)) }
    }
  )
}

// ============================================================
// ATTENTION — Camera frame → ML model → score
// ============================================================

/** POST /api/attention/snapshot — Send camera frame, get behavioral-cue score */
export async function sendAttentionFrame(
  frameBase64: string,
  videoId: string,
  sessionId: string,
  studySessionId?: string | null,
  studentId: string = getCachedUserId() ?? "student_001"
): Promise<AttentionSnapshot> {
  return apiFetch<AttentionSnapshot>(
    "/attention/snapshot",
    {
      method: "POST",
      // consent_confirmed must be explicitly true or the backend's
      // consent gate (CR6, peer review packet) 403s — see ConsentModal.tsx,
      // which is what actually gates whether this function should even
      // be called.
      body: JSON.stringify({
        frame_base64: frameBase64,
        video_id: videoId,
        session_id: sessionId,
        study_session_id: studySessionId || undefined,
        student_id: studentId,
        consent_confirmed: true,
      }),
    },
    async () => generateAttentionSnapshot()
  )
}

/** GET /api/attention/dummy-snapshot — No camera needed */
export async function fetchDummyAttention(): Promise<AttentionSnapshot> {
  return apiFetch<AttentionSnapshot>(
    "/attention/dummy-snapshot",
    { method: "GET" },
    async () => generateAttentionSnapshot()
  )
}

/** GET /api/attention/history */
export async function fetchAttentionHistory(
  videoId: string,
  studentId: string = getCachedUserId() ?? "student_001"
): Promise<{ logs: AttentionSnapshot[]; average_score: number }> {
  return apiFetch(
    `/attention/history?video_id=${videoId}&student_id=${studentId}`,
    { method: "GET" },
    async () => ({ logs: [], average_score: 0 })
  )
}

// ============================================================
// TRANSCRIPTION — Whisper model
// ============================================================

/** GET /api/transcription/:videoId — Full transcript */
export async function fetchTranscription(videoId: string): Promise<TranscriptSegment[]> {
  return apiFetch<TranscriptSegment[]>(
    `/transcription/${videoId}`,
    { method: "GET" },
    async () => {
      await delay(200)
      return JSON.parse(JSON.stringify(DUMMY_TRANSCRIPT_SEGMENTS))
    }
  )
}

/** GET /api/transcription/:videoId/live?current_time=X — Segment at timestamp */
export async function fetchLiveTranscriptSegment(
  videoId: string,
  currentTime: number
): Promise<TranscriptSegment | null> {
  return apiFetch<TranscriptSegment | null>(
    `/transcription/${videoId}/live?current_time=${currentTime}`,
    { method: "GET" },
    async () => {
      const seg = DUMMY_TRANSCRIPT_SEGMENTS.find(
        (t) => currentTime >= t.startTime && currentTime < t.endTime
      )
      return seg ? JSON.parse(JSON.stringify(seg)) : null
    }
  )
}

/** POST /api/transcription/chunk — Transcribe audio chunk */
export async function transcribeAudioChunk(
  videoId: string,
  audioBase64: string
): Promise<{ segments: TranscriptSegment[] }> {
  return apiFetch(
    "/transcription/chunk",
    {
      method: "POST",
      body: JSON.stringify({ video_id: videoId, audio_chunk_base64: audioBase64 }),
    },
    async () => ({ segments: JSON.parse(JSON.stringify(DUMMY_TRANSCRIPT_SEGMENTS)) })
  )
}

// ============================================================
// ASSESSMENT — Adaptive quiz generation + submission
// ============================================================

export async function startStudySession(
  courseId?: string,
  videoId?: string,
  moduleId?: string
): Promise<StudySession> {
  return apiFetch<StudySession>("/research/study-sessions", {
    method: "POST",
    body: JSON.stringify({
      course_id: courseId,
      video_id: videoId,
      module_id: moduleId || courseId,
    }),
  })
}

export async function savePrePostResults(
  studySessionId: string,
  testType: "pre" | "post",
  responses: PrePostResponse[]
): Promise<{ studySessionId: string; testType: string; score: number | null; learningGain: number | null }> {
  return apiFetch(`/research/study-sessions/${studySessionId}/prepost`, {
    method: "POST",
    body: JSON.stringify({
      test_type: testType,
      responses: responses.map((response) => ({
        question_id: response.questionId,
        question_index: response.questionIndex,
        correctness: response.correctness,
        response_time_seconds: response.responseTimeSeconds,
        score: response.score,
        started_at: response.startedAt,
        completed_at: response.completedAt,
      })),
    }),
  })
}

export async function completeStudySession(studySessionId: string): Promise<StudySession> {
  return apiFetch<StudySession>(`/research/study-sessions/${studySessionId}/complete`, {
    method: "POST",
    body: JSON.stringify({ completion_status: "completed" }),
  })
}

export interface AssessmentSession {
  id: string
  studySessionId?: string
  participantId?: string
  condition?: "MCRF" | "LEGACY"
  courseId: string
  videoId: string
  questions: AssessmentQuestion[]
  difficulty: "easy" | "medium" | "hard"
  timeLimit: number
  attentionScoreDuringVideo: number
  adaptiveMetadata: {
    previousScore: number | null
    adjustedDifficulty: string
    reason: string
  }
}

export interface CrsComponents {
  performance: number
  behavioralCue: number
  integrity: number
  trend: number
  complexity: number
}

export interface CrsBlock {
  score: number
  scorePct: number
  components: CrsComponents
  weightsUsed: Record<string, number>
  explanation: string
}

export interface CrsHistoryEntry {
  timestamp: number
  assessmentId: string | null
  performance: number
  behavioralCue: number
  integrity: number
  trend: number
  complexity: number
  crs: number
  difficulty: "easy" | "medium" | "hard"
  explanation: string
}

export interface AssessmentResult {
  sessionId: string
  score: number
  totalPoints: number
  earnedPoints: number
  percentage: number
  xpEarned: number
  // FIX (real XP request): reflects the *actual* persisted XP/level after
  // this submission (see backend routers/assessment.py's _apply_xp()) —
  // previously xpEarned was computed but never written to the student's
  // record, so there was nothing truthful to show here. Optional so
  // older cached results / the dummy fallback path don't break existing UI.
  totalXp?: number
  newLevel?: number
  leveledUp?: boolean
  timeSpent: number
  correctAnswers: number
  totalQuestions: number
  difficulty: string
  message: string
  nextDifficulty: "easy" | "medium" | "hard"
  suggestedTopics: string[]
  adaptiveResponse: {
    performanceTrend: "improving" | "stable" | "declining"
    recommendedAction: string
    nextAssessmentDifficulty: "easy" | "medium" | "hard"
    strengthAreas: string[]
    weakAreas: string[]
    // Phase 11/13 addition (NeuroLearn-MCL): present once the backend has
    // CRS_CONFIG.crs_enabled=True (the default). Optional so older cached
    // results / the legacy-engine fallback path don't break existing UI.
    crs?: CrsBlock
  }
}

/**
 * POST /api/assessment/generate
 * Sends behavioral-cue score + transcript to backend.
 * Backend adaptive engine picks difficulty, FLAN-T5 generates questions.
 */
export async function generateAssessment(
  courseId: string,
  videoId: string,
  attentionScore: number,
  previousScore: number | null,
  transcriptText: string = "",
  studySessionId?: string | null
): Promise<AssessmentSession> {
  return apiFetch<AssessmentSession>(
    "/assessment/generate",
    {
      method: "POST",
      body: JSON.stringify({
        course_id: courseId,
        video_id: videoId,
        student_id: getCachedUserId() ?? "student_001",
        study_session_id: studySessionId || undefined,
        attention_score: attentionScore,
        previous_score: previousScore,
        transcript_text: transcriptText,
      }),
    },
    async () => {
      // Local fallback: adaptive difficulty selection
      await delay(500)
      let difficulty: "easy" | "medium" | "hard" = "medium"
      let reason = "Default medium difficulty"

      if (previousScore !== null) {
        if (previousScore >= 80) { difficulty = "hard"; reason = `Prev score ${previousScore}% → hard` }
        else if (previousScore < 50) { difficulty = "easy"; reason = `Prev score ${previousScore}% → easy` }
      }
      if (attentionScore < 40 && difficulty !== "easy") {
        difficulty = "easy"
        reason += ` | Low behavioral_cue (${attentionScore}%) → easy`
      }

      const questions = QUESTION_BANK[difficulty].slice(0, 5)
      const timeLimits = { easy: 600, medium: 420, hard: 300 }

      return {
        id: `session_${Date.now()}`,
        studySessionId: studySessionId || undefined,
        courseId,
        videoId,
        questions,
        difficulty,
        timeLimit: timeLimits[difficulty],
        attentionScoreDuringVideo: attentionScore,
        adaptiveMetadata: { previousScore, adjustedDifficulty: difficulty, reason },
      }
    }
  )
}

/**
 * POST /api/assessment/submit
 * Submits answers → backend grades, runs adaptive engine, returns result + XP.
 */
export async function submitAssessment(
  sessionId: string,
  answers: Record<string, string | number>,
  questions: AssessmentQuestion[],
  timeSpent: number,
  responseEvents: QuestionResponseEvent[] = []
): Promise<AssessmentResult> {
  return apiFetch<AssessmentResult>(
    "/assessment/submit",
    {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        student_id: getCachedUserId() ?? "student_001",
        answers,
        time_spent: timeSpent,
        response_events: responseEvents.map((event) => ({
          question_id: event.questionId,
          question_index: event.questionIndex,
          presented_at: event.presentedAt,
          submitted_at: event.submittedAt,
          response_time_seconds: event.responseTimeSeconds,
          status: event.status,
        })),
      }),
    },
    async () => {
      // Local fallback grading
      await delay(400)
      let correct = 0
      let earned = 0
      const total = questions.reduce((s, q) => s + q.points, 0)

      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) { correct++; earned += q.points }
      })

      const pct = Math.round((correct / questions.length) * 100)
      const xp = Math.floor(earned * 1.5)

      let nextDiff: "easy" | "medium" | "hard" = "medium"
      let trend: "improving" | "stable" | "declining" = "stable"
      if (pct >= 80) { nextDiff = "hard"; trend = "improving" }
      else if (pct < 50) { nextDiff = "easy"; trend = "declining" }

      const msg = pct >= 90 ? "Outstanding! You've mastered this." : pct >= 70 ? "Well done! Solid understanding." : pct >= 50 ? "Decent effort. Review weak areas." : "Keep practicing! Rewatch the video."

      // Dummy CRS (NeuroLearn-MCL): mirrors the backend's CRS shape so
      // CRSPanel/CRSTrendWidget render identically whether the backend is
      // reachable or not — same dual-fallback philosophy as every other
      // function in this file, not a separate code path to maintain.
      const timeRatio = timeSpent / 420 // matches the medium-difficulty default in generateAssessment's fallback; submitAssessment isn't passed the actual session time_limit
      const integrityDummy = timeRatio < 0.15 || timeRatio > 1 ? 0.15 : timeRatio < 0.45 || timeRatio > 0.85 ? 0.6 : 1.0
      const crsComponents: CrsComponents = {
        performance: pct / 100,
        behavioralCue: 0.7,
        integrity: integrityDummy,
        trend: trend === "improving" ? 0.75 : trend === "declining" ? 0.25 : 0.5,
        complexity: 0.5,
      }
      const crsScore =
        0.2 * crsComponents.performance +
        0.2 * crsComponents.behavioralCue +
        0.2 * crsComponents.integrity +
        0.2 * crsComponents.trend +
        0.2 * crsComponents.complexity

      return {
        sessionId,
        score: pct,
        totalPoints: total,
        earnedPoints: earned,
        percentage: pct,
        xpEarned: xp,
        timeSpent,
        correctAnswers: correct,
        totalQuestions: questions.length,
        difficulty: questions[0]?.difficulty || "medium",
        message: msg,
        nextDifficulty: nextDiff,
        suggestedTopics: pct >= 70 ? ["Next: Advanced Topics"] : ["Review: Rewatch Video", "Practice: Easier Questions"],
        adaptiveResponse: {
          performanceTrend: trend,
          recommendedAction: pct >= 80 ? "Moving to harder content." : pct >= 50 ? "Keep practicing at this level." : "Review material and try again.",
          nextAssessmentDifficulty: nextDiff,
          strengthAreas: correct >= 3 ? ["Core Concepts", "Syntax"] : ["Basic Recognition"],
          weakAreas: correct < 3 ? ["Applied Knowledge", "Deep Understanding"] : [],
          crs: {
            score: crsScore,
            scorePct: Math.round(crsScore * 1000) / 10,
            components: crsComponents,
            weightsUsed: { alpha: 0.2, beta: 0.2, gamma: 0.2, delta: 0.2, epsilon: 0.2 },
            explanation: "Offline estimate — backend unreachable, showing locally-computed CRS.",
          },
        },
      }
    }
  )
}

// ============================================================
// COGNITIVE READINESS SCORE (CRS) — NeuroLearn-MCL, Phase 13
// ============================================================

function dummyCrsHistory(studentId: string): CrsHistoryEntry[] {
  // Plausible, clearly-offline-looking demo history — same purpose as the
  // other DUMMY_* fixtures in dummyDb.ts: lets every CRS-aware component
  // render meaningfully with no backend running at all.
  const now = Date.now() / 1000
  const base = [0.42, 0.51, 0.58, 0.63, 0.7]
  return base.map((crs, i) => ({
    timestamp: now - (base.length - i) * 86400,
    assessmentId: `demo_session_${i}`,
    performance: Math.min(1, crs + 0.05),
    behavioralCue: 0.7,
    integrity: i === 1 ? 0.4 : 0.9, // one dip, so the trend widget shows it's a real signal, not a flat line
    trend: crs,
    complexity: 0.5,
    crs,
    difficulty: crs > 0.75 ? "hard" : crs >= 0.45 ? "medium" : "easy",
    explanation: "Offline demo history — backend unreachable.",
  }))
}

/** GET /api/crs/{student_id} */
export async function fetchCurrentCrs(
  studentId: string = getCachedUserId() ?? "student_001"
): Promise<CrsHistoryEntry | null> {
  return apiFetch<CrsHistoryEntry | null>(
    `/crs/${studentId}`,
    { method: "GET" },
    async () => {
      await delay(150)
      const history = dummyCrsHistory(studentId)
      return history[history.length - 1] ?? null
    }
  )
}

/** GET /api/crs/{student_id}/history */
export async function fetchCrsHistory(
  studentId: string = getCachedUserId() ?? "student_001",
  limit?: number
): Promise<CrsHistoryEntry[]> {
  const query = limit ? `?limit=${limit}` : ""
  return apiFetch<{ history: CrsHistoryEntry[] }>(
    `/crs/${studentId}/history${query}`,
    { method: "GET" },
    async () => {
      await delay(200)
      return { history: dummyCrsHistory(studentId) } as any
    }
  ).then((res: any) => res.history ?? res)
}

// ============================================================
// GAMIFICATION — Leaderboard, Challenges, Notifications
// ============================================================

/** GET /api/leaderboard */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(
    "/leaderboard",
    { method: "GET" },
    async () => { await delay(250); return JSON.parse(JSON.stringify(DUMMY_LEADERBOARD)) }
  )
}

/** GET /api/challenges/daily */
export async function fetchDailyChallenges(): Promise<DailyChallenge[]> {
  return apiFetch<DailyChallenge[]>(
    "/challenges/daily",
    { method: "GET" },
    async () => { await delay(150); return JSON.parse(JSON.stringify(DUMMY_DAILY_CHALLENGES)) }
  )
}

/** GET /api/notifications */
export async function fetchNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>(
    "/notifications",
    { method: "GET" },
    async () => { await delay(100); return JSON.parse(JSON.stringify(DUMMY_NOTIFICATIONS)) }
  )
}

// ============================================================
// REPORT CARD
// ============================================================

export interface ReportPayload {
  student: { name: string; email: string; id: string; level: number; xp: number }
  course: { title: string; id: string }
  video: { title: string; id: string; duration: number }
  assessment: AssessmentResult
  behavioral_cue: {
    avgScore: number
    scoreHistory: number[]
    totalSnapshots: number
    attentivePercent: number
    inattentivePercent: number
    unfocusedPercent: number
    avgEyeContact: number
    avgBlinkRate: number
    headPoseDistribution?: Record<string, number>
  }
  transcription: { totalSegments: number; avgConfidence: number }
}

/**
 * POST /api/report/generate
 * Returns the PDF as a Blob for browser download.
 */
export async function generateReportPdf(payload: ReportPayload): Promise<Blob> {
  const res = await fetch(`${API_BASE}/report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Report generation failed: ${res.status}`)
  return res.blob()
}

/**
 * POST /api/report/email
 * Generates PDF and emails it to the given address.
 */
export async function emailReport(
  toEmail: string,
  payload: ReportPayload
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/report/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toEmail, reportData: payload }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || "Email failed")
  }
  return res.json()
}

/**
 * GET /api/report/email-status
 * Check if server SMTP is configured.
 */
export async function checkEmailStatus(): Promise<{ configured: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/report/email-status`)
  if (!res.ok) return { configured: false, message: "Server unreachable" }
  return res.json()
}

// ============================================================
// RE-EXPORT TYPES
// ============================================================
export type {
  StudentProfile,
  Course,
  VideoLink,
  AttentionSnapshot,
  TranscriptSegment,
  AssessmentQuestion,
  LeaderboardEntry,
  DailyChallenge,
  Notification,
  Badge,
} from "./dummyDb"
