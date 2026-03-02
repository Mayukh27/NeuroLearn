"""
============================================================
ROUTER: Transcription — Video transcription endpoints
Endpoints:
    GET  /api/transcription/{video_id}        — full transcript
    GET  /api/transcription/{video_id}/live    — segment at timestamp
    POST /api/transcription/chunk              — transcribe audio chunk
============================================================
"""

from fastapi import APIRouter, Query
from schemas.models import TranscriptSegment, TranscriptionRequest
from ml import transcription_service

router = APIRouter(prefix="/api/transcription", tags=["Transcription"])


@router.get("/{video_id}", response_model=list[TranscriptSegment])
async def get_full_transcript(video_id: str):
    """
    Get the complete transcript for a video.

    Returns all segments with word-level timestamps.
    In production, this would be pre-computed and cached.
    """
    return transcription_service.get_full_transcript(video_id)


@router.get("/{video_id}/live")
async def get_live_segment(video_id: str, current_time: float = Query(0.0)):
    """
    Get the transcript segment at a specific video timestamp.
    Used for live sync — frontend polls this as video plays.

    Query params:
        current_time: Current video playback time in seconds
    """
    segment = transcription_service.get_segment_at_time(current_time)
    if segment:
        return segment
    return {"id": None, "text": "", "timestamp": "", "message": "No segment at this timestamp"}


@router.post("/chunk")
async def transcribe_audio_chunk(request: TranscriptionRequest):
    """
    Transcribe a raw audio chunk (base64 encoded).

    Used for real-time transcription:
        1. Frontend captures audio from video
        2. Encodes as base64
        3. Sends to this endpoint
        4. Whisper processes → returns text

    Falls back to dummy data if Whisper not installed.
    """
    if request.audio_chunk_base64:
        segments = transcription_service.transcribe_audio_chunk(
            request.audio_chunk_base64
        )
        return {"video_id": request.video_id, "segments": segments}

    if request.video_url:
        segments = transcription_service.transcribe_video_url(request.video_url)
        return {"video_id": request.video_id, "segments": segments}

    return {"error": "Provide either audio_chunk_base64 or video_url"}
