"""
backend/ml/csr.py

Cognitive Readiness Score (CSR) — Phase 2 of the implementation spec.

FIXES CR1 (peer review packet): the decision logic previously lived in
adaptive_engine.py as a rule cascade (score baseline +/-1 integer
modifiers, clamped to 3 tiers) — there was no normalized [0,1] readiness
value and no weights alpha..epsilon anywhere in code, despite both
appearing in the paper's Eq. (1), Fig. 2, and Table II.

    CSR = alpha*P + beta*A + gamma*I + delta*T + epsilon*C

This module is the single place that combines the five component modules
(performance, attention_subscores, response_integrity, trend,
content_complexity) into one CSR value, a difficulty recommendation, and a
human-readable explanation — exactly the three things Phase 2 specifies
`compute_csr()` must return, plus the component breakdown.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Optional, Sequence

from config.csr_config import CSR_CONFIG, CSRConfig
from ml.performance import compute_performance, PerformanceResult
from ml.response_integrity import compute_response_integrity, IntegrityResult
from ml.trend import compute_trend, TrendResult
from ml.content_complexity import compute_content_complexity, ComplexityResult


@dataclass(frozen=True)
class CSRComponents:
    """Raw [0,1] value of each of the five CSR inputs, for transparency/logging."""
    performance: float
    attention: float
    integrity: float
    trend: float
    complexity: float

    def as_dict(self) -> dict:
        return asdict(self)


@dataclass(frozen=True)
class CSRResult:
    csr: float  # [0,1] — the fused Cognitive Readiness Score
    csr_pct: float  # same value as 0-100, for display
    difficulty: str  # "easy" | "medium" | "hard"
    components: CSRComponents
    weights_used: dict
    explanation: str
    # Full detail from each component module, for debugging/history storage —
    # NOT required by every caller, but cheap to carry and very useful for
    # the GET /csr and GET /difficulty/reason endpoints planned in Phase 11.
    detail: dict


def _difficulty_from_csr(csr: float, config: CSRConfig) -> str:
    if csr > config.thresholds.hard_threshold:
        return "hard"
    if csr >= config.thresholds.medium_threshold:
        return "medium"
    return "easy"


def compute_csr(
    *,
    recent_scores_pct: Optional[Sequence[float]] = None,
    attention_score_pct: Optional[float] = None,
    time_spent: Optional[float] = None,
    time_limit: Optional[float] = None,
    was_correct: Optional[bool] = None,
    transcript_text: Optional[str] = None,
    config: CSRConfig = CSR_CONFIG,
) -> CSRResult:
    """
    Compute the Cognitive Readiness Score and a difficulty recommendation.

    All arguments are optional and independently defaultable, because CSR
    must be computable at different points in the student workflow (e.g.
    `get_initial_difficulty` has no `time_spent`/`time_limit`/`was_correct`
    yet, since the assessment hasn't started). Each missing input falls
    back to its component module's documented neutral default rather than
    silently being treated as zero — see PerformanceConfig.default_score_pct,
    IntegrityConfig.min_integrity is NOT used as a "missing" default (a
    truly missing timing pair returns a neutral 1.0 from the thoughtful-pace
    branch's logic only when explicitly given a neutral ratio; here we
    short-circuit to 0.5 directly — see below) and ComplexityConfig
    .default_complexity.

    Args:
        recent_scores_pct: history for both Performance (P) and Trend (T).
        attention_score_pct: 0-100 average attention for the session.
        time_spent / time_limit: seconds, for Response Integrity (I).
        was_correct: correctness of the most recent response (explanation
            text only for I — see response_integrity.py docstring).
        transcript_text: transcript of content viewed, for Complexity (C).
        config: CSRConfig (weights, thresholds, sub-configs).

    Returns:
        CSRResult — csr in [0,1], difficulty tier, component breakdown,
        weights actually used, and a human-readable explanation string.
    """
    perf: PerformanceResult = compute_performance(recent_scores_pct, config.performance)

    if attention_score_pct is None:
        attention_value = 0.5
        attention_explanation = "No attention data provided — neutral default (0.50)."
    else:
        attention_value = max(0.0, min(1.0, attention_score_pct / 100.0))
        attention_explanation = f"Session attention score = {attention_score_pct:.0f}%."

    if time_spent is None or time_limit is None:
        integrity_value = 1.0
        integrity_explanation = (
            "No timing data available yet (e.g. pre-assessment difficulty "
            "selection) — integrity defaults to its maximum so it does not "
            "penalize a student before they've answered anything."
        )
        integrity_detail: Optional[IntegrityResult] = None
    else:
        integrity_detail = compute_response_integrity(
            time_spent=time_spent,
            time_limit=time_limit,
            was_correct=bool(was_correct),
            config=config.integrity,
        )
        integrity_value = integrity_detail.integrity_score
        integrity_explanation = integrity_detail.reason

    trend_detail: TrendResult = compute_trend(recent_scores_pct, config.trend)
    trend_value = trend_detail.trend_score

    complexity_detail: ComplexityResult = compute_content_complexity(
        transcript_text, config=config.complexity
    )
    complexity_value = complexity_detail.complexity_score

    w = config.weights
    csr = (
        w.alpha * perf.score
        + w.beta * attention_value
        + w.gamma * integrity_value
        + w.delta * trend_value
        + w.epsilon * complexity_value
    )
    csr = max(0.0, min(1.0, csr))

    difficulty = _difficulty_from_csr(csr, config)

    components = CSRComponents(
        performance=round(perf.score, 4),
        attention=round(attention_value, 4),
        integrity=round(integrity_value, 4),
        trend=round(trend_value, 4),
        complexity=round(complexity_value, 4),
    )

    explanation = (
        f"CSR = {w.alpha:.2f}*P({perf.score:.2f}) + {w.beta:.2f}*A({attention_value:.2f}) "
        f"+ {w.gamma:.2f}*I({integrity_value:.2f}) + {w.delta:.2f}*T({trend_value:.2f}) "
        f"+ {w.epsilon:.2f}*C({complexity_value:.2f}) = {csr:.3f} -> '{difficulty}'. "
        f"P: {perf.explanation} A: {attention_explanation} "
        f"I: {integrity_explanation} T: {trend_detail.explanation} "
        f"C: {complexity_detail.explanation}"
    )

    return CSRResult(
        csr=round(csr, 4),
        csr_pct=round(csr * 100, 1),
        difficulty=difficulty,
        components=components,
        weights_used=w.as_dict(),
        explanation=explanation,
        detail={
            "performance": asdict(perf),
            "trend": asdict(trend_detail),
            "integrity": asdict(integrity_detail) if integrity_detail else None,
            "complexity": asdict(complexity_detail),
        },
    )
