"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Sparkles,
  AlertCircle,
  Link2,
} from "lucide-react"

import VideoPlayer from "@/components/VideoPlayer"
import CameraFeed, { type AttentionSnapshotResponse } from "@/components/CameraFeed"
import AttentionPanel from "@/components/AttentionPanel"
import TranscriptionPanel from "@/components/TranscriptionPanel"
import VideoLinkSelector from "@/components/VideoLinkSelector"
import {
  fetchCourseById,
  fetchCourses,
  type Course,
  type VideoLink,
} from "@/lib/api"

export default function VideoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VideoContent />
    </Suspense>
  )
}

function VideoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get("course")
  const videoIdParam = searchParams.get("video")

  const [course, setCourse] = useState<Course | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoLink | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [videoEnded, setVideoEnded] = useState(false)
  const [customUrl, setCustomUrl] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Attention state
  const [latestAttention, setLatestAttention] = useState<AttentionSnapshotResponse | null>(null)
  const [attentionHistory, setAttentionHistory] = useState<number[]>([])
  const [sessionAvgAttention, setSessionAvgAttention] = useState(0)

  const effectiveUrl = selectedVideo?.url || customUrl || ""
  const effectiveTitle = selectedVideo?.title || (customUrl ? "Custom Video" : "Select a video")

  // Load course
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        if (courseIdParam) {
          const c = await fetchCourseById(courseIdParam)
          if (c) {
            setCourse(c)
            const vids = c.videoLinks || []
            const target = videoIdParam
              ? vids.find((v) => v.id === videoIdParam)
              : vids.find((v) => !v.completed) || vids[0]
            if (target) setSelectedVideo(target)
          }
        } else {
          const courses = await fetchCourses()
          if (courses.length > 0) {
            setCourse(courses[0])
            const vids = courses[0].videoLinks || []
            const first = vids.find((v) => !v.completed) || vids[0]
            if (first) setSelectedVideo(first)
          }
        }
      } catch (err) {
        console.error("Failed to load course:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [courseIdParam, videoIdParam])

  const handleTimeUpdate = useCallback((ct: number, dur: number) => {
    setCurrentTime(ct)
    setVideoDuration(dur)
  }, [])

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing)
    if (playing) setVideoEnded(false)
  }, [])

  const handleVideoEnd = useCallback(() => {
    setVideoEnded(true)
    setIsPlaying(false)
  }, [])

  // FIXED: Use functional updates — no stale closure on attentionHistory
  const handleAttentionUpdate = useCallback((snapshot: AttentionSnapshotResponse) => {
    setLatestAttention(snapshot)
    setAttentionHistory((prev) => {
      const next = [...prev, snapshot.score].slice(-60)
      // Compute avg inside the same update
      const avg = next.reduce((a, b) => a + b, 0) / next.length
      setSessionAvgAttention(avg)
      return next
    })
  }, [])

  const handleSelectVideo = useCallback((video: VideoLink) => {
    setSelectedVideo(video)
    setIsPlaying(false)
    setCurrentTime(0)
    setVideoEnded(false)
    setAttentionHistory([])
    setLatestAttention(null)
    setSessionAvgAttention(0)
    setCustomUrl("")
    setShowCustomInput(false)
  }, [])

  const handleCustomUrlSubmit = () => {
    if (!customUrl.trim()) return
    setSelectedVideo(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setVideoEnded(false)
    setAttentionHistory([])
    setLatestAttention(null)
    setShowCustomInput(false)
  }

  const goToAssessment = () => {
    // Build attention summary to thread through to report card
    const attentionSummary = {
      avgScore: Math.round(sessionAvgAttention * 10) / 10,
      scoreHistory: attentionHistory.slice(-40),
      totalSnapshots: attentionHistory.length,
      attentivePercent: Math.round((attentionHistory.filter(s => s >= 65).length / Math.max(attentionHistory.length, 1)) * 100),
      inattentivePercent: Math.round((attentionHistory.filter(s => s >= 35 && s < 65).length / Math.max(attentionHistory.length, 1)) * 100),
      unfocusedPercent: Math.round((attentionHistory.filter(s => s < 35).length / Math.max(attentionHistory.length, 1)) * 100),
      avgEyeContact: latestAttention?.modelResponse?.eyeContact ?? 0.8,
      avgBlinkRate: latestAttention?.modelResponse?.blinkRate ?? 16,
    }
    const params = new URLSearchParams({
      course: course?.id || "custom",
      video: selectedVideo?.id || "custom",
      courseTitle: course?.title || "Custom Video",
      videoTitle: selectedVideo?.title || "Video Session",
      attention: Math.round(sessionAvgAttention).toString(),
      attentionData: JSON.stringify(attentionSummary),
    })
    router.push(`/assessment?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push("/dashboard")}
            className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all">
            <ArrowLeft size={16} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Video Learning</h1>
            <p className="text-xs text-[var(--text-muted)]">AI-powered attention monitoring &amp; live transcription</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:border-violet-500/30 hover:text-violet-400 transition-all">
          <Link2 size={14} /> Play Custom URL
        </motion.button>
      </motion.div>

      {/* Custom URL input */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 overflow-hidden">
            <div className="flex gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <input type="text" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Paste any video URL — MP4 link, YouTube, etc."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleCustomUrlSubmit()} />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCustomUrlSubmit} disabled={!customUrl.trim()}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Play
              </motion.button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 px-1">Supports: Direct .mp4/.webm links, YouTube URLs, and embeddable video pages.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video list */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          {course && (
            <VideoLinkSelector videos={course.videoLinks || []} activeVideoId={selectedVideo?.id || null} onSelect={handleSelectVideo} courseTitle={course.title} />
          )}
        </div>

        {/* Center: Video player */}
        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
          {effectiveUrl ? (
            <VideoPlayer videoUrl={effectiveUrl} title={effectiveTitle} onTimeUpdate={handleTimeUpdate} onPlayStateChange={handlePlayStateChange} onVideoEnd={handleVideoEnd} />
          ) : (
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] aspect-video flex flex-col items-center justify-center gap-3">
              <BookOpen size={32} className="text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">Select a video from the list or paste a URL</p>
            </div>
          )}

          {/* Video ended → Assessment CTA */}
          <AnimatePresence>
            {videoEnded && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl p-5 border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Sparkles size={24} className="text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Ready for Assessment!</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      Your average attention score was{" "}
                      <span className="font-bold text-violet-400">{Math.round(sessionAvgAttention)}%</span>.
                      Based on this and the video content, we&apos;ll generate a personalized quiz.
                    </p>
                    <div className="flex items-center gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goToAssessment}
                        className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center gap-2">
                        <ClipboardCheck size={16} /> Take Assessment
                      </motion.button>
                      <button onClick={() => setVideoEnded(false)}
                        className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all">
                        Rewatch
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-violet-500/15">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{Math.round(sessionAvgAttention)}%</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Avg Attention</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{attentionHistory.length}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Snapshots</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{Math.floor(videoDuration / 60)}m {Math.floor(videoDuration % 60)}s</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Duration</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline attention alert during playback */}
          <AnimatePresence>
            {isPlaying && latestAttention && latestAttention.state !== "attentive" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-3 flex items-center gap-3 border ${
                  latestAttention.state === "inattentive" ? "bg-amber-500/8 border-amber-500/20" : "bg-red-500/8 border-red-500/20"
                }`}>
                <AlertCircle size={18} className={latestAttention.state === "inattentive" ? "text-amber-400" : "text-red-400"} />
                <p className="text-xs text-[var(--text-secondary)]">{latestAttention.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Camera + Attention + Transcription */}
        <div className="lg:col-span-3 space-y-4 order-3">
          <CameraFeed
            isVideoPlaying={isPlaying}
            videoId={selectedVideo?.id || "custom"}
            studentId="student_001"
            onAttentionUpdate={handleAttentionUpdate}
          />
          <AttentionPanel
            latestSnapshot={latestAttention}
            sessionAverage={sessionAvgAttention}
            scoreHistory={attentionHistory}
          />
          <TranscriptionPanel
            videoId={selectedVideo?.id || "custom"}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />
        </div>
      </div>
    </div>
  )
}
