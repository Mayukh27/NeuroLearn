import os
import base64
import time
import uuid
import tempfile
from typing import Optional

import numpy as np
from loguru import logger

# Try importing Whisper
try:
    from faster_whisper import WhisperModel
    WHISPER_AVAILABLE = True
    logger.info("Faster-Whisper loaded — transcription model LIVE")
except ImportError:
    WHISPER_AVAILABLE = False
    logger.warning("Faster-Whisper not installed — using DUMMY transcription")


class TranscriptionService:
 
    # Dummy transcript for when Whisper isn't available
    DUMMY_SEGMENTS = [
        {"text": "Welcome to this lesson on React fundamentals.", "start": 0.0, "end": 3.0},
        {"text": "Today we'll explore how React uses a virtual DOM for efficient rendering.", "start": 4.0, "end": 8.0},
        {"text": "Components are the building blocks of any React application.", "start": 9.0, "end": 12.0},
        {"text": "You can think of components as reusable, self-contained pieces of UI.", "start": 13.0, "end": 17.0},
        {"text": "There are two types: functional components and class components.", "start": 18.0, "end": 22.0},
        {"text": "Modern React strongly favors functional components with hooks.", "start": 23.0, "end": 27.0},
        {"text": "The useState hook lets you add state to functional components.", "start": 28.0, "end": 32.0},
        {"text": "useEffect handles side effects like data fetching and subscriptions.", "start": 33.0, "end": 37.0},
        {"text": "Props allow you to pass data from parent to child components.", "start": 38.0, "end": 42.0},
        {"text": "The key prop helps React efficiently update lists by tracking identity.", "start": 43.0, "end": 47.0},
        {"text": "Conditional rendering lets you show or hide UI based on state.", "start": 48.0, "end": 52.0},
        {"text": "Event handlers in React use camelCase naming convention.", "start": 53.0, "end": 57.0},
        {"text": "Forms in React can be controlled or uncontrolled components.", "start": 58.0, "end": 62.0},
        {"text": "Let's now look at a practical example of building a component.", "start": 63.0, "end": 67.0},
        {"text": "This component will manage its own state and handle user input.", "start": 68.0, "end": 72.0},
    ]

    def __init__(self, model_size: str = "base"):
        self.model = None
        self.model_size = model_size
        self._segment_counter = 0

        if WHISPER_AVAILABLE:
            try:
                logger.info(f"Loading Whisper model: {model_size}")
                self.model = WhisperModel(model_size,device="cpu", compute_type="int8")  # change to "cuda" if GPU available  # fast + low memory                                             
                logger.success(f"Whisper {model_size} loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Whisper: {e}")
                self.model = None

    def transcribe_audio_chunk(self, audio_base64: str) -> list[dict]:
        """
        Transcribe a base64-encoded audio chunk.

        Args:
            audio_base64: Base64 encoded audio (WAV/WebM)

        Returns:
            List of transcript segments as JSON-serializable dicts
        """
        if not WHISPER_AVAILABLE or self.model is None: 
            return self._get_dummy_segments()
        info = None
        segments_gen = []
        try:
            # Decode audio
            if "," in audio_base64:
                audio_base64 = audio_base64.split(",")[1]

            audio_bytes = base64.b64decode(audio_base64)

            # Write to temp file (Whisper needs file path)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            # Run Whisper
            result = self.model.transcribe(
                temp_path,
                word_timestamps=True,
                language="en",
            )

            # Clean up temp file
            os.unlink(temp_path)

            # Format output
            segments = []
            for seg in result.get("segments", []):
                segment_id = f"t_{uuid.uuid4().hex[:8]}"
                words = []

                for w in seg.get("words", []):
                    words.append({
                       "word": w.word.strip(),
                       "start": round(w.start, 2),
                       "end": round(w.end, 2),
                       "confidence": round(w.probability or 0.9, 3),
                    })

                segments.append({
                   "id": segment_id,
                   "text": seg.text.strip(),
                   "timestamp": self._format_timestamp(seg.start),
                   "start_time": round(seg.start, 2),
                   "end_time": round(seg.end, 2),
                   "confidence": round(info.language_probability, 2),
                   "model_response": {
                   "language": info.language,
                   "words": words,
                     },
                })

            return segments

        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return self._get_dummy_segments()

    def transcribe_video_url(self, video_url: str) -> list[dict]:
        """
        Transcribe audio from a video URL.
        In production, extract audio first using ffmpeg.

        For now, returns dummy data.
        """
        # TODO: Download video → extract audio with ffmpeg → transcribe
        # Example:
        # subprocess.run(["ffmpeg", "-i", video_url, "-vn", "-acodec", "pcm_s16le", output_path])
        logger.info(f"Transcription requested for URL: {video_url}")
        return self._get_dummy_segments()

    def get_segment_at_time(self, current_time: float) -> Optional[dict]:
        """
        Get the transcript segment active at a given video timestamp.
        Used for live sync with video playback.
        """
        for seg in self.DUMMY_SEGMENTS:
            if seg["start"] <= current_time < seg["end"]:
                self._segment_counter += 1
                return {
                    "id": f"t_{self._segment_counter:04d}",
                    "text": seg["text"],
                    "timestamp": self._format_timestamp(seg["start"]),
                    "start_time": seg["start"],
                    "end_time": seg["end"],
                    "confidence": round(0.88 + (hash(seg["text"]) % 12) / 100, 2),
                    "model_response": {
                        "language": "en",
                        "words": self._generate_word_timestamps(seg["text"], seg["start"], seg["end"]),
                    },
                }
        return None

    def get_full_transcript(self, video_id: str) -> list[dict]:
        """Get complete transcript for a video (all segments)."""
        segments = []
        for i, seg in enumerate(self.DUMMY_SEGMENTS):
            segments.append({
                "id": f"t_{i+1:04d}",
                "text": seg["text"],
                "timestamp": self._format_timestamp(seg["start"]),
                "start_time": seg["start"],
                "end_time": seg["end"],
                "confidence": round(0.88 + (hash(seg["text"]) % 12) / 100, 2),
                "model_response": {
                    "language": "en",
                    "words": self._generate_word_timestamps(seg["text"], seg["start"], seg["end"]),
                },
            })
        return segments

    def _format_timestamp(self, seconds: float) -> str:
        """Convert seconds to MM:SS format."""
        m = int(seconds) // 60
        s = int(seconds) % 60
        return f"{m:02d}:{s:02d}"

    def _generate_word_timestamps(self, text: str, start: float, end: float) -> list[dict]:
        """Generate synthetic word-level timestamps."""
        words = text.split()
        if not words:
            return []
        duration = end - start
        word_duration = duration / len(words)
        result = []
        for i, word in enumerate(words):
            w_start = start + i * word_duration
            w_end = w_start + word_duration * 0.9
            result.append({
                "word": word,
                "start": round(w_start, 2),
                "end": round(w_end, 2),
                "confidence": round(0.85 + (hash(word) % 15) / 100, 3),
            })
        return result

    def _get_dummy_segments(self) -> list[dict]:
        """Return dummy segments when model isn't available."""
        return self.get_full_transcript("dummy")


# ── Singleton ──
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
transcription_service = TranscriptionService(model_size=WHISPER_MODEL_SIZE)
