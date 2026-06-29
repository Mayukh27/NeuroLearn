"""
============================================================
ROUTER: CSR — Cognitive Readiness Score read endpoints
Phase 11 of the NeuroLearn-MCL implementation spec.

Endpoints:
    GET /api/csr/{student_id}                    — current (most recent) CSR
    GET /api/csr/{student_id}/history             — full CSR history
    GET /api/csr/{student_id}/performance/history — Performance (P) history
    GET /api/csr/{student_id}/attention/history   — Attention (A) history
    GET /api/csr/{student_id}/integrity/history    — Integrity (I) history
    GET /api/csr/{student_id}/trend/history        — Trend (T) history
    GET /api/csr/{student_id}/complexity/history   — Complexity (C) history
    GET /api/csr/{student_id}/difficulty/reason    — latest adaptive explanation
============================================================

All endpoints are READ-only projections over the single `csr_history_table`
populated by routers/assessment.py's submit_assessment() (Phase 12). They
intentionally do not recompute anything — `ml/csr.py` is the only place
CSR math happens; this router just serves what's already been persisted.

Spec deviation note: the implementation spec listed these as flat paths
(e.g. "GET /csr", "GET /attention/history") with no student identifier in
the path. That can't address a specific student's data, so — consistent
with every other router in this codebase (e.g. GET /api/student/{id},
GET /api/assessment/results/{student_id}) — student_id is a required path
parameter here. This is the same pattern the rest of the API already
uses, not a new convention.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from data.database import (
    get_current_csr,
    get_csr_history,
    get_performance_history,
    get_attention_history,
    get_integrity_history,
    get_trend_history,
    get_complexity_history,
)

router = APIRouter(prefix="/api/csr", tags=["Cognitive Readiness Score"])


@router.get("/{student_id}")
async def get_current_csr_endpoint(student_id: str):
    """Most recent CSR record for a student (full component breakdown)."""
    record = get_current_csr(student_id)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail=f"No CSR history found for student '{student_id}' yet — "
                    "they need to complete at least one assessment.",
        )
    return record


@router.get("/{student_id}/history")
async def get_csr_history_endpoint(
    student_id: str, limit: Optional[int] = Query(default=None, ge=1, le=200)
):
    """Full CSR history (every component + fused score), oldest-first."""
    history = get_csr_history(student_id, limit=limit)
    return {"student_id": student_id, "count": len(history), "history": history}


@router.get("/{student_id}/performance/history")
async def performance_history(student_id: str, limit: Optional[int] = Query(default=None, ge=1, le=200)):
    return {"student_id": student_id, "component": "performance", "history": get_performance_history(student_id, limit)}


@router.get("/{student_id}/attention/history")
async def attention_history(student_id: str, limit: Optional[int] = Query(default=None, ge=1, le=200)):
    return {"student_id": student_id, "component": "attention", "history": get_attention_history(student_id, limit)}


@router.get("/{student_id}/integrity/history")
async def integrity_history(student_id: str, limit: Optional[int] = Query(default=None, ge=1, le=200)):
    return {"student_id": student_id, "component": "integrity", "history": get_integrity_history(student_id, limit)}


@router.get("/{student_id}/trend/history")
async def trend_history(student_id: str, limit: Optional[int] = Query(default=None, ge=1, le=200)):
    return {"student_id": student_id, "component": "trend", "history": get_trend_history(student_id, limit)}


@router.get("/{student_id}/complexity/history")
async def complexity_history(student_id: str, limit: Optional[int] = Query(default=None, ge=1, le=200)):
    return {"student_id": student_id, "component": "complexity", "history": get_complexity_history(student_id, limit)}


@router.get("/{student_id}/difficulty/reason")
async def difficulty_reason(student_id: str):
    """Latest adaptive explanation string — what the dashboard's
    'why was this difficulty chosen' tooltip (Phase 13) reads from."""
    record = get_current_csr(student_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"No CSR history found for student '{student_id}' yet.")
    return {
        "student_id": student_id,
        "difficulty": record["difficulty"],
        "explanation": record["explanation"],
        "timestamp": record["timestamp"],
    }
