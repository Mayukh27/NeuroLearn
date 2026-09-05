import os
import base64
import subprocess
import tempfile
import uuid
from typing import Optional

from loguru import logger

try:
    from faster_whisper import WhisperModel

    WHISPER_AVAILABLE = True
    logger.info("Faster-Whisper loaded — transcription model LIVE")
except ImportError:
    WHISPER_AVAILABLE = False
    logger.warning("Faster-Whisper not installed — using DUMMY transcription")


class TranscriptionService:

    DUMMY_SEGMENTS = [
        {
            "text": "Welcome to this lesson on React fundamentals.",
            "start": 0.0,
            "end": 3.0,
        },
        {
            "text": "Today we'll explore how React uses a virtual DOM for efficient rendering.",
            "start": 4.0,
            "end": 8.0,
        },
        {
            "text": "Components are the building blocks of any React application.",
            "start": 9.0,
            "end": 12.0,
        },
        {
            "text": "You can think of components as reusable, self-contained pieces of UI.",
            "start": 13.0,
            "end": 17.0,
        },
        {
            "text": "There are two types: functional components and class components.",
            "start": 18.0,
            "end": 22.0,
        },
        {
            "text": "Modern React strongly favors functional components with hooks.",
            "start": 23.0,
            "end": 27.0,
        },
        {
            "text": "The useState hook lets you add state to functional components.",
            "start": 28.0,
            "end": 32.0,
        },
        {
            "text": "useEffect handles side effects like data fetching and subscriptions.",
            "start": 33.0,
            "end": 37.0,
        },
        {
            "text": "Props allow you to pass data from parent to child components.",
            "start": 38.0,
            "end": 42.0,
        },
        {
            "text": "The key prop helps React efficiently update lists by tracking identity.",
            "start": 43.0,
            "end": 47.0,
        },
        {
            "text": "Conditional rendering lets you show or hide UI based on state.",
            "start": 48.0,
            "end": 52.0,
        },
        {
            "text": "Event handlers in React use camelCase naming convention.",
            "start": 53.0,
            "end": 57.0,
        },
        {
            "text": "Forms in React can be controlled or uncontrolled components.",
            "start": 58.0,
            "end": 62.0,
        },
        {
            "text": "Let's now look at a practical example of building a component.",
            "start": 63.0,
            "end": 67.0,
        },
        {
            "text": "This component will manage its own state and handle user input.",
            "start": 68.0,
            "end": 72.0,
        },
    ]

    def __init__(self, model_size: str = "base"):
        self.model = None
        self.model_size = model_size
        self._segment_counter = 0

        # Cache: video URL -> real Whisper transcript
        self._video_transcripts: dict[str, list[dict]] = {}

        if WHISPER_AVAILABLE:
            try:
                logger.info(f"Loading Whisper model: {model_size}")

                self.model = WhisperModel(
                    model_size,
                    device="cpu",
                    compute_type="int8",
                )

                logger.success(f"Whisper {model_size} loaded successfully")

            except Exception as e:
                logger.error(f"Failed to load Whisper: {e}")
                self.model = None

    # ============================================================
    # REAL VIDEO TRANSCRIPTION
    # ============================================================

    def transcribe_video_url(self, video_url: str) -> list[dict]:
        """
        Download audio from a video URL using yt-dlp + FFmpeg,
        then transcribe it with Faster-Whisper.

        Results are cached in memory for the lifetime of the backend.
        """

        if video_url in self._video_transcripts:
            logger.info(f"Using cached transcript for video: {video_url}")
            return self._video_transcripts[video_url]

        if not WHISPER_AVAILABLE or self.model is None:
            logger.warning("Whisper unavailable — returning dummy transcript")
            return self._get_dummy_segments()

        audio_path = None

        try:
            with tempfile.TemporaryDirectory() as temp_dir:

                output_template = os.path.join(
                    temp_dir,
                    "audio.%(ext)s",
                )

                logger.info(f"Downloading video audio with yt-dlp: {video_url}")

                subprocess.run(
                    [
                        "yt-dlp",
                         "--js-runtimes", "deno",
                        "-f",
                        "140/bestaudio[ext=m4a]/bestaudio",
                        "--no-playlist",
                        "-o",
                        output_template,
                        video_url,
                    ],
                    check=True,
                    capture_output=True,
                    text=True,
                )

                # Locate downloaded media
                downloaded_files = [
                    os.path.join(temp_dir, name) for name in os.listdir(temp_dir)
                ]

                if not downloaded_files:
                    raise RuntimeError("yt-dlp did not produce an audio file")

                source_path = downloaded_files[0]

                # Convert to WAV/PCM using FFmpeg
                audio_path = os.path.join(
                    temp_dir,
                    "audio.wav",
                )

                logger.info("Converting downloaded audio to WAV with FFmpeg")

                subprocess.run(
                    [
                        "ffmpeg",
                        "-y",
                        "-i",
                        source_path,
                        "-vn",
                        "-ac",
                        "1",
                        "-ar",
                        "16000",
                        "-sample_fmt",
                        "s16",
                        audio_path,
                    ],
                    check=True,
                    capture_output=True,
                    text=True,
                )

                logger.info("Running Faster-Whisper transcription")

                segments_generator, info = self.model.transcribe(
                    audio_path,
                    word_timestamps=True,
                    language="en",
                )

                segments = []

                for seg in segments_generator:

                    words = []

                    if seg.words:
                        for word in seg.words:
                            words.append(
                                {
                                    "word": word.word.strip(),
                                    "start": round(word.start, 2),
                                    "end": round(word.end, 2),
                                    "confidence": round(
                                        word.probability or 0.0,
                                        3,
                                    ),
                                }
                            )

                    segments.append(
                        {
                            "id": f"t_{uuid.uuid4().hex[:8]}",
                            "text": seg.text.strip(),
                            "timestamp": self._format_timestamp(seg.start),
                            "start_time": round(seg.start, 2),
                            "end_time": round(seg.end, 2),
                            "confidence": round(
                                getattr(
                                    info,
                                    "language_probability",
                                    0.0,
                                ),
                                3,
                            ),
                            "model_response": {
                                "language": getattr(
                                    info,
                                    "language",
                                    "en",
                                ),
                                "words": words,
                            },
                        }
                    )

                if not segments:
                    raise RuntimeError("Faster-Whisper returned no transcript segments")

                self._video_transcripts[video_url] = segments

                logger.success(
                    f"Transcription complete: " f"{len(segments)} real segments"
                )

                return segments

        except subprocess.CalledProcessError as e:
            logger.error(f"Media processing failed: {e.stderr}")
            return self._get_dummy_segments()

        except Exception as e:
            logger.error(f"Video transcription failed: {e}")
            return self._get_dummy_segments()

    # ============================================================
    # AUDIO CHUNK TRANSCRIPTION
    # ============================================================

    def transcribe_audio_chunk(
        self,
        audio_base64: str,
    ) -> list[dict]:
        """
        Transcribe a base64-encoded audio chunk with Faster-Whisper.
        """

        if not WHISPER_AVAILABLE or self.model is None:
            return self._get_dummy_segments()

        temp_path = None

        try:
            if "," in audio_base64:
                audio_base64 = audio_base64.split(",", 1)[1]

            audio_bytes = base64.b64decode(audio_base64)

            with tempfile.NamedTemporaryFile(
                suffix=".wav",
                delete=False,
            ) as f:
                f.write(audio_bytes)
                temp_path = f.name

            segments_generator, info = self.model.transcribe(
                temp_path,
                word_timestamps=True,
                language="en",
            )

            segments = []

            for seg in segments_generator:

                words = []

                if seg.words:
                    for word in seg.words:
                        words.append(
                            {
                                "word": word.word.strip(),
                                "start": round(word.start, 2),
                                "end": round(word.end, 2),
                                "confidence": round(
                                    word.probability or 0.0,
                                    3,
                                ),
                            }
                        )

                segments.append(
                    {
                        "id": f"t_{uuid.uuid4().hex[:8]}",
                        "text": seg.text.strip(),
                        "timestamp": self._format_timestamp(seg.start),
                        "start_time": round(seg.start, 2),
                        "end_time": round(seg.end, 2),
                        "confidence": round(
                            getattr(
                                info,
                                "language_probability",
                                0.0,
                            ),
                            3,
                        ),
                        "model_response": {
                            "language": getattr(
                                info,
                                "language",
                                "en",
                            ),
                            "words": words,
                        },
                    }
                )

            return segments

        except Exception as e:
            logger.error(f"Audio chunk transcription failed: {e}")
            return self._get_dummy_segments()

        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass

    # ============================================================
    # LIVE TIMESTAMP LOOKUP
    # ============================================================

    def get_segment_at_time(
        self,
        current_time: float,
        video_url: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Return the real Whisper transcript segment active at
        the requested video timestamp.
        """

        if video_url:
            segments = self.transcribe_video_url(video_url)
        else:
            segments = self.DUMMY_SEGMENTS

        for seg in segments:
            if seg["start_time"] <= current_time < seg["end_time"]:
                return seg

        return None

    # ============================================================
    # FULL TRANSCRIPT
    # ============================================================

    def get_full_transcript(
        self,
        video_id: str,
        video_url: Optional[str] = None,
    ) -> list[dict]:
        """
        Return the complete transcript.

        If a URL is provided, use the real Whisper transcript.
        """

        if video_url:
            return self.transcribe_video_url(video_url)

        return self._get_dummy_segments()

    # ============================================================
    # HELPERS
    # ============================================================

    def _format_timestamp(
        self,
        seconds: float,
    ) -> str:
        minutes = int(seconds) // 60
        secs = int(seconds) % 60
        return f"{minutes:02d}:{secs:02d}"

    def _generate_word_timestamps(
        self,
        text: str,
        start: float,
        end: float,
    ) -> list[dict]:

        words = text.split()

        if not words:
            return []

        duration = end - start
        word_duration = duration / len(words)

        result = []

        for i, word in enumerate(words):
            w_start = start + i * word_duration
            w_end = w_start + word_duration * 0.9

            result.append(
                {
                    "word": word,
                    "start": round(w_start, 2),
                    "end": round(w_end, 2),
                    "confidence": 0.85,
                }
            )

        return result

    def _get_dummy_segments(self) -> list[dict]:
        """
        Fallback only when real transcription is unavailable.
        """

        segments = []

        for i, seg in enumerate(self.DUMMY_SEGMENTS):

            segments.append(
                {
                    "id": f"dummy_{i + 1:04d}",
                    "text": seg["text"],
                    "timestamp": self._format_timestamp(seg["start"]),
                    "start_time": seg["start"],
                    "end_time": seg["end"],
                    "confidence": 0.0,
                    "model_response": {
                        "language": "en",
                        "words": self._generate_word_timestamps(
                            seg["text"],
                            seg["start"],
                            seg["end"],
                        ),
                    },
                }
            )

        return segments


# ================================================================
# SINGLETON
# ================================================================

WHISPER_MODEL_SIZE = os.getenv(
    "WHISPER_MODEL_SIZE",
    "base",
)

transcription_service = TranscriptionService(model_size=WHISPER_MODEL_SIZE)
