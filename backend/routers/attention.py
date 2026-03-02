"""
============================================================
ROUTER: Attention — Camera-based attention monitoring
Endpoints:
    POST /api/attention/snapshot — analyze a camera frame
    GET  /api/attention/history  — get attention log for a session
============================================================
"""

from fastapi import APIRouter
from schemas.models import AttentionSnapshot, AttentionFrameRequest
from ml import attention_detector
from data.database import log_attention, get_attention_logs

router = APIRouter(prefix="/api/attention", tags=["Attention"])


@router.post("/snapshot", response_model=AttentionSnapshot)
async def analyze_frame(request: AttentionFrameRequest):
    """
    Analyze a camera frame for student attention.

    Receives base64-encoded frame from frontend webcam.
    Returns attention score, state, and message.

    JSON Response:
    {
        "timestamp": "...",
        "score": 85,
        "state": "attentive",
        "confidence": 0.92,
        "message": "Great focus!",
        "model_response": {
            "eye_contact": 0.88,
            "head_pose": "forward",
            "face_detected": true,
            "blink_rate": 15.0
        }
    }
    """
    # Run ML model
    result = attention_detector.analyze_frame(request.frame_base64)

    # Log to database
    log_attention({
        "video_id": request.video_id,
        "student_id": request.student_id,
        **result,
    })

    return result


@router.get("/history")
async def get_attention_history(video_id: str, student_id: str = "student_001"):
    """Get attention logs for a video watching session."""
    logs = get_attention_logs(video_id, student_id)
    return {
        "video_id": video_id,
        "student_id": student_id,
        "total_snapshots": len(logs),
        "logs": logs,
        "average_score": (
            sum(l.get("score", 0) for l in logs) / max(len(logs), 1)
        ),
    }


@router.get("/dummy-snapshot", response_model=AttentionSnapshot)
async def get_dummy_snapshot():
    """
    Get a dummy attention snapshot (no camera required).
    Useful for testing the frontend without webcam.
    """
    return attention_detector._generate_dummy_snapshot(
        __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime())
    )
