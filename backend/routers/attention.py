"""
============================================================
ROUTER: Attention — Camera-based attention monitoring
Endpoints:
    GET  /api/attention/consent        — check consent status
    POST /api/attention/consent        — grant/revoke consent
    POST /api/attention/snapshot       — analyze a camera frame (consent-gated)
    GET  /api/attention/history        — get attention log for a session
    POST /api/attention/purge-expired  — retention-window cleanup (CR6)
============================================================

CONSENT (CR6, peer review packet): this router previously analyzed and
logged every frame the frontend sent with no consent check, no retention
policy, and no opt-out path. `/snapshot` now refuses to run the ML model
or write anything to the attention log unless a prior `granted=True`
consent record exists for that student_id AND the request itself carries
`consent_confirmed=True` (belt-and-suspenders: the frontend gates camera
start on consent, this is the server-side enforcement of the same rule).
Declining consent must not silently zero-out or otherwise penalize CSR —
`ml/csr.py` already defaults Attention (A) to a neutral 0.5 when no
attention_score_pct is supplied, so opting out only removes the *bonus*
signal, it never forces "easy" or "hard".
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from schemas.models import (
    AttentionSnapshot,
    AttentionFrameRequest,
    ConsentGrant,
    ConsentStatus,
)
from ml import attention_detector
from data.database import (
    log_attention,
    get_attention_logs,
    get_consent,
    set_consent,
    purge_expired_attention_logs,
)
from data.models_orm import User
from auth.security import get_current_user

router = APIRouter(prefix="/api/attention", tags=["Attention"])


@router.get("/consent", response_model=ConsentStatus)
async def get_consent_status(current_user: User = Depends(get_current_user)):
    """Return the current webcam-monitoring consent status for the authenticated student."""
    record = get_consent(current_user.id)
    if record is None:
        return ConsentStatus(student_id=current_user.id, granted=False)
    return ConsentStatus(**record)


@router.post("/consent", response_model=ConsentStatus)
async def grant_or_revoke_consent(
    grant: ConsentGrant,
    current_user: User = Depends(get_current_user),
):
    """
    Record the authenticated student's consent decision for webcam-based
    attention monitoring. Called by the frontend ConsentModal before the
    camera is ever started, and again if the student later revokes
    consent from their profile/privacy settings. `grant.student_id` is
    ignored for authorization — consent is always recorded against the
    JWT-identified student, never an arbitrary id the client supplies.
    """
    record = {
        "student_id": current_user.id,
        "granted": grant.granted,
        "granted_at": datetime.now(timezone.utc).isoformat(),
        "retention_days": grant.retention_days,
        "raw_frames_stored": grant.raw_frames_stored,
        "version": grant.version,
    }
    set_consent(record)
    return ConsentStatus(**record)


@router.post("/snapshot", response_model=AttentionSnapshot)
async def analyze_frame(
    request: AttentionFrameRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyze a camera frame for the authenticated student's attention.
    Consent-gated (CR6): returns 403 rather than analyzing or logging
    anything if the student has not granted consent, or if the request
    doesn't carry consent_confirmed=True.

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
        },
        "source": "live",
        "consent_confirmed": true
    }
    """
    consent_record = get_consent(current_user.id)
    consent_on_file = bool(consent_record and consent_record.get("granted"))

    if not (request.consent_confirmed and consent_on_file):
        raise HTTPException(
            status_code=403,
            detail=(
                "Webcam attention monitoring requires recorded consent. "
                "Call POST /api/attention/consent with granted=true first, "
                "then resend this request with consent_confirmed=true."
            ),
        )

    # Run ML model (frame is analyzed in-memory and never persisted raw —
    # only the derived score/sub-metrics below are written to storage)
    result = attention_detector.analyze_frame(request.frame_base64)
    result["consent_confirmed"] = True

    # Log only the derived score, under the retention window the student
    # consented to (see purge_expired_attention_logs / CR6).
    log_attention({
        "video_id": request.video_id,
        "student_id": current_user.id,
        **result,
    })

    return result


@router.post("/purge-expired")
async def purge_expired():
    """
    Delete attention_logs entries older than each student's consented
    retention window (default 30 days). Intended to run on a schedule;
    exposed as a manual endpoint for the prototype since there is no
    background job runner yet.
    """
    removed = purge_expired_attention_logs()
    return {"removed": removed}


@router.get("/history")
async def get_attention_history(video_id: str, current_user: User = Depends(get_current_user)):
    """Get attention logs for a video watching session (your own only)."""
    logs = get_attention_logs(video_id, current_user.id)
    return {
        "video_id": video_id,
        "student_id": current_user.id,
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
