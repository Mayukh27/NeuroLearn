

import time
from typing import Optional
from loguru import logger


class AdaptiveEngine:
   

    DIFFICULTY_LEVELS = ["easy", "medium", "hard"]

    # Score thresholds
    UPGRADE_THRESHOLD = 80
    MAINTAIN_THRESHOLD = 50

    # Attention modifiers
    LOW_ATTENTION_THRESHOLD = 40
    HIGH_ATTENTION_BONUS_THRESHOLD = 85

    # Time pressure: if completed in < 30% of time limit, they might be guessing
    SPEED_GUESS_RATIO = 0.3
    # If completed thoughtfully (50-80% of time), give slight bonus
    THOUGHTFUL_RATIO_LOW = 0.5
    THOUGHTFUL_RATIO_HIGH = 0.8

    def __init__(self):
        # In-memory history (in production, use database)
        self._history: dict[str, list[dict]] = {}
        logger.info("Adaptive engine initialized")

    def determine_difficulty(
        self,
        student_id: str,
        current_score: float,
        attention_score: float,
        time_spent: int,
        time_limit: int,
        previous_difficulty: str = "medium",
        previous_scores: Optional[list[float]] = None,
    ) -> dict:
        """
        Determine optimal next difficulty.

        Returns JSON-serializable adaptive response.
        """
        # ── Step 1: Score-based baseline ──
        if current_score >= self.UPGRADE_THRESHOLD:
            baseline = self._level_up(previous_difficulty)
            score_action = "upgrade"
        elif current_score >= self.MAINTAIN_THRESHOLD:
            baseline = previous_difficulty
            score_action = "maintain"
        else:
            baseline = self._level_down(previous_difficulty)
            score_action = "downgrade"

        # ── Step 2: Attention modifier ──
        attention_modifier = 0
        if attention_score < self.LOW_ATTENTION_THRESHOLD:
            attention_modifier = -1  # Low attention → easier content
            logger.info(f"Low attention ({attention_score}) → reducing difficulty")
        elif attention_score >= self.HIGH_ATTENTION_BONUS_THRESHOLD and current_score >= 70:
            attention_modifier = 0  # High attention reinforces but doesn't force upgrade

        # ── Step 3: Time analysis ──
        time_ratio = time_spent / max(time_limit, 1)
        time_modifier = 0
        time_note = ""

        if time_ratio < self.SPEED_GUESS_RATIO and current_score < 70:
            time_modifier = -1
            time_note = "Very fast completion with low score suggests guessing"
        elif self.THOUGHTFUL_RATIO_LOW <= time_ratio <= self.THOUGHTFUL_RATIO_HIGH:
            time_note = "Thoughtful pace — good engagement"

        # ── Step 4: Historical trend ──
        trend = self._analyze_trend(student_id, current_score, previous_scores)
        trend_modifier = 0
        if trend == "declining" and score_action != "downgrade":
            trend_modifier = -1
            logger.info(f"Declining trend detected for {student_id}")

        # ── Step 5: Aggregate ──
        current_idx = self.DIFFICULTY_LEVELS.index(baseline)
        total_modifier = attention_modifier + time_modifier + trend_modifier

        # Clamp to valid range
        final_idx = max(0, min(2, current_idx + total_modifier))
        next_difficulty = self.DIFFICULTY_LEVELS[final_idx]

        # ── Build reason string ──
        reasons = [f"Score: {current_score:.0f}% → {score_action}"]
        if attention_modifier != 0:
            reasons.append(f"Attention: {attention_score:.0f}% (low → easier)")
        if time_modifier != 0:
            reasons.append(time_note)
        if trend_modifier != 0:
            reasons.append(f"Trend: {trend} → reducing difficulty")

        reason = " | ".join(reasons)

        # ── Determine strength/weak areas ──
        strengths, weaknesses = self._analyze_areas(current_score, attention_score)

        # ── Recommended action message ──
        action_messages = {
            ("hard", "improving"): "Outstanding! You're mastering this material. Moving to advanced content.",
            ("hard", "stable"): "Great performance! Continue with challenging material.",
            ("hard", "declining"): "You've been doing well but recent scores dipped. Let's reinforce with some review.",
            ("medium", "improving"): "Good progress! Keep building — you'll unlock harder content soon.",
            ("medium", "stable"): "Solid and steady. Keep practicing at this level.",
            ("medium", "declining"): "You seem to be struggling a bit. Let's reinforce the fundamentals.",
            ("easy", "improving"): "You're getting stronger! This easier content will help build confidence.",
            ("easy", "stable"): "Take your time to build a strong foundation. You're doing fine!",
            ("easy", "declining"): "Don't worry! Let's go through the basics again. Rewatch the video if needed.",
        }
        recommended_action = action_messages.get(
            (next_difficulty, trend),
            "Keep learning! Every step counts."
        )

        # ── Store in history ──
        self._record_history(student_id, current_score, next_difficulty, attention_score)

        return {
            "performance_trend": trend,
            "recommended_action": recommended_action,
            "next_assessment_difficulty": next_difficulty,
            "strength_areas": strengths,
            "weak_areas": weaknesses,
            "_debug": {
                "baseline": baseline,
                "modifiers": {
                    "attention": attention_modifier,
                    "time": time_modifier,
                    "trend": trend_modifier,
                },
                "reason": reason,
                "time_ratio": round(time_ratio, 2),
            },
        }

    def get_initial_difficulty(
        self,
        student_id: str,
        attention_score: float,
        previous_score: Optional[float] = None,
    ) -> dict:
        """
        Determine initial assessment difficulty before quiz starts.

        Returns JSON with difficulty and adaptive metadata.
        """
        difficulty = "medium"
        reason = "Default medium difficulty for first attempt"

        if previous_score is not None:
            if previous_score >= 80:
                difficulty = "hard"
                reason = f"Previous score {previous_score:.0f}% → hard difficulty"
            elif previous_score >= 50:
                difficulty = "medium"
                reason = f"Previous score {previous_score:.0f}% → medium difficulty"
            else:
                difficulty = "easy"
                reason = f"Previous score {previous_score:.0f}% → easy for reinforcement"

        # Attention adjustment
        if attention_score < self.LOW_ATTENTION_THRESHOLD and difficulty != "easy":
            old_diff = difficulty
            difficulty = self._level_down(difficulty)
            reason += f" | Low attention ({attention_score:.0f}%) → {old_diff} reduced to {difficulty}"

        return {
            "difficulty": difficulty,
            "adaptive_metadata": {
                "previous_score": previous_score,
                "adjusted_difficulty": difficulty,
                "reason": reason,
            },
        }

    def _level_up(self, current: str) -> str:
        idx = self.DIFFICULTY_LEVELS.index(current)
        return self.DIFFICULTY_LEVELS[min(idx + 1, 2)]

    def _level_down(self, current: str) -> str:
        idx = self.DIFFICULTY_LEVELS.index(current)
        return self.DIFFICULTY_LEVELS[max(idx - 1, 0)]

    def _analyze_trend(
        self,
        student_id: str,
        current_score: float,
        previous_scores: Optional[list[float]] = None,
    ) -> str:
        """Analyze performance trend from history."""
        history = self._history.get(student_id, [])
        scores = [h["score"] for h in history[-5:]]  # Last 5 assessments

        if previous_scores:
            scores = previous_scores[-5:]

        scores.append(current_score)

        if len(scores) < 2:
            return "stable"

        # Check last 3 scores
        recent = scores[-3:] if len(scores) >= 3 else scores

        if all(recent[i] <= recent[i - 1] for i in range(1, len(recent))):
            return "declining"
        elif all(recent[i] >= recent[i - 1] for i in range(1, len(recent))):
            return "improving"
        else:
            # Compute average trend
            avg_change = sum(recent[i] - recent[i - 1] for i in range(1, len(recent))) / (len(recent) - 1)
            if avg_change > 5:
                return "improving"
            elif avg_change < -5:
                return "declining"
            return "stable"

    def _analyze_areas(self, score: float, attention: float) -> tuple[list[str], list[str]]:
        """Determine strength and weakness areas from metrics."""
        strengths = []
        weaknesses = []

        if score >= 80:
            strengths.extend(["Core Concepts", "Problem Solving"])
        elif score >= 60:
            strengths.append("Basic Recognition")
            weaknesses.append("Applied Knowledge")
        else:
            weaknesses.extend(["Core Concepts", "Deep Understanding"])

        if attention >= 70:
            strengths.append("Focus & Engagement")
        elif attention < 40:
            weaknesses.append("Sustained Attention")

        return strengths, weaknesses

    def _record_history(self, student_id: str, score: float, difficulty: str, attention: float):
        """Store assessment in memory history."""
        if student_id not in self._history:
            self._history[student_id] = []

        self._history[student_id].append({
            "score": score,
            "difficulty": difficulty,
            "attention": attention,
            "timestamp": time.time(),
        })

        # Keep last 20 entries
        self._history[student_id] = self._history[student_id][-20:]


# ── Singleton ──
adaptive_engine = AdaptiveEngine()
