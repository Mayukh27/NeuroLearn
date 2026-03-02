
import base64
import time
import math
import random
from typing import Optional
from io import BytesIO

import numpy as np
from loguru import logger

# Try importing ML libraries — fall back to dummy mode
try:
    import cv2
    import mediapipe as mp
    ML_AVAILABLE = True
    logger.info("OpenCV + MediaPipe loaded — attention model LIVE")
except ImportError:
    ML_AVAILABLE = False
    logger.warning("OpenCV/MediaPipe not installed — using DUMMY attention model")


class AttentionDetector:
   
    # MediaPipe Face Mesh landmark indices
    # Left eye
    LEFT_EYE = [362, 385, 387, 263, 373, 380]
    # Right eye
    RIGHT_EYE = [33, 160, 158, 133, 153, 144]
    # Nose tip, chin, left eye corner, right eye corner, left mouth, right mouth
    FACE_POSE_POINTS = [1, 152, 33, 263, 61, 291]

    # Attention thresholds
    ATTENTIVE_THRESHOLD = 65
    INATTENTIVE_THRESHOLD = 35

    # Messages for each state
    MESSAGES = {
        "attentive": [
            "Excellent focus! You're fully engaged.",
            "Great concentration! Keep it up.",
            "You're doing amazing — stay locked in!",
            "Perfect attention. You're absorbing this well.",
        ],
        "inattentive": [
            "Looks like your attention is drifting. Try refocusing.",
            "You seem a bit distracted. The key point is coming up!",
            "Hey, try to stay with the content — you've got this!",
            "A quick stretch might help you refocus.",
        ],
        "unfocused": [
            "You seem unfocused. Consider taking a short break.",
            "Your attention is very low. Pause and stretch if needed.",
            "Try closing other tabs and refocusing on the video.",
            "Take a 2-minute break, then come back refreshed!",
        ],
    }

    def __init__(self):
        self.face_mesh = None
        self.blink_counter = 0
        self.blink_timestamps: list[float] = []
        self.frame_count = 0
        self._prev_ear = 0.3
        self._blink_threshold = 0.21

        if ML_AVAILABLE:
            try:
                self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5,
                )
                logger.info("MediaPipe Face Mesh initialized")
            except Exception as e:
                logger.error(f"Failed to init Face Mesh: {e}")
                self.face_mesh = None

    def decode_frame(self, frame_base64: str) -> Optional[np.ndarray]:
        """Decode base64 string to OpenCV BGR image."""
        try:
            # Remove data URI prefix if present
            if "," in frame_base64:
                frame_base64 = frame_base64.split(",")[1]

            img_bytes = base64.b64decode(frame_base64)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            logger.error(f"Frame decode error: {e}")
            return None

    def _eye_aspect_ratio(self, landmarks, eye_indices, w: int, h: int) -> float:
        """
        Compute Eye Aspect Ratio (EAR).
        EAR drops when eye closes → blink detection.
        """
        pts = []
        for idx in eye_indices:
            lm = landmarks[idx]
            pts.append((lm.x * w, lm.y * h))

        # Vertical distances
        v1 = math.dist(pts[1], pts[5])
        v2 = math.dist(pts[2], pts[4])
        # Horizontal distance
        h1 = math.dist(pts[0], pts[3])

        ear = (v1 + v2) / (2.0 * h1 + 1e-6)
        return ear

    def _compute_gaze_score(self, landmarks, w: int, h: int) -> float:
        """
        Compute eye contact / gaze score (0-1).
        Based on iris position relative to eye corners.
        Higher = looking at screen.
        """
        try:
            # Left iris center (index 468-472 from refine_landmarks)
            left_iris = landmarks[468]
            # Right iris center
            right_iris = landmarks[473]

            # Left eye corners
            left_inner = landmarks[362]
            left_outer = landmarks[263]

            # Right eye corners
            right_inner = landmarks[133]
            right_outer = landmarks[33]

            # Compute horizontal iris position ratio for each eye
            def iris_ratio(iris, inner, outer):
                total = abs(outer.x - inner.x) + 1e-6
                pos = abs(iris.x - inner.x)
                return 1.0 - abs(0.5 - (pos / total)) * 2  # 1.0 = centered

            left_score = iris_ratio(left_iris, left_inner, left_outer)
            right_score = iris_ratio(right_iris, right_inner, right_outer)

            # Also check vertical — looking up/down
            left_eye_top = landmarks[386]
            left_eye_bottom = landmarks[374]
            vert_range = abs(left_eye_top.y - left_eye_bottom.y) + 1e-6
            vert_pos = abs(left_iris.y - left_eye_top.y) / vert_range
            vert_score = 1.0 - abs(0.5 - vert_pos) * 2

            gaze = (left_score + right_score + vert_score) / 3.0
            return max(0.0, min(1.0, gaze))

        except (IndexError, AttributeError):
            return 0.5  # Default if landmarks unavailable

    def _compute_head_pose(self, landmarks, w: int, h: int) -> str:
        """
        Estimate head pose from key facial landmarks.
        Returns: "forward", "slightly_away", "away"
        """
        try:
            nose = landmarks[1]
            chin = landmarks[152]
            left_eye = landmarks[33]
            right_eye = landmarks[263]

            # Face center X
            face_center_x = (left_eye.x + right_eye.x) / 2

            # How far nose deviates from center horizontally
            nose_deviation = abs(nose.x - face_center_x)

            # Vertical check — head tilt
            face_height = abs(chin.y - landmarks[10].y)
            nose_relative_y = (nose.y - landmarks[10].y) / (face_height + 1e-6)

            if nose_deviation > 0.08 or nose_relative_y > 0.75 or nose_relative_y < 0.35:
                return "away"
            elif nose_deviation > 0.04 or nose_relative_y > 0.65:
                return "slightly_away"
            else:
                return "forward"

        except (IndexError, AttributeError):
            return "forward"

    def _update_blink_rate(self, ear: float) -> float:
        """Track blinks and compute rate (blinks per minute)."""
        now = time.time()

        # Detect blink: EAR drops below threshold then recovers
        if self._prev_ear > self._blink_threshold and ear < self._blink_threshold:
            self.blink_timestamps.append(now)

        self._prev_ear = ear

        # Remove blinks older than 60 seconds
        self.blink_timestamps = [t for t in self.blink_timestamps if now - t < 60]

        return float(len(self.blink_timestamps))  # blinks per minute

    def analyze_frame(self, frame_base64: str) -> dict:
        """
        Main analysis pipeline.
        Input: base64 camera frame
        Output: JSON-serializable attention snapshot
        """
        self.frame_count += 1
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # ── If ML not available, return dummy ──
        if not ML_AVAILABLE or self.face_mesh is None:
            return self._generate_dummy_snapshot(timestamp)

        # ── Decode frame ──
        frame = self.decode_frame(frame_base64)
        if frame is None:
            return self._no_face_snapshot(timestamp)

        h, w, _ = frame.shape

        # ── Run MediaPipe ──
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb)

        if not results.multi_face_landmarks:
            return self._no_face_snapshot(timestamp)

        landmarks = results.multi_face_landmarks[0].landmark

        # ── Compute metrics ──
        # 1. Eye Aspect Ratio (for blink detection)
        left_ear = self._eye_aspect_ratio(landmarks, self.LEFT_EYE, w, h)
        right_ear = self._eye_aspect_ratio(landmarks, self.RIGHT_EYE, w, h)
        avg_ear = (left_ear + right_ear) / 2.0

        # 2. Blink rate
        blink_rate = self._update_blink_rate(avg_ear)

        # 3. Gaze / eye contact score
        gaze_score = self._compute_gaze_score(landmarks, w, h)

        # 4. Head pose
        head_pose = self._compute_head_pose(landmarks, w, h)

        # ── Aggregate attention score ──
        # Weights: gaze 40%, head pose 35%, blink normality 25%
        head_score = {"forward": 1.0, "slightly_away": 0.5, "away": 0.1}[head_pose]

        # Normal blink rate: 15-20/min. Too low = staring/distracted, too high = tired
        blink_normal = 1.0 - min(1.0, abs(blink_rate - 17) / 15)

        raw_score = (gaze_score * 0.40 + head_score * 0.35 + blink_normal * 0.25) * 100
        score = int(max(0, min(100, raw_score)))

        # ── Classify state ──
        if score >= self.ATTENTIVE_THRESHOLD:
            state = "attentive"
        elif score >= self.INATTENTIVE_THRESHOLD:
            state = "inattentive"
        else:
            state = "unfocused"

        # ── Confidence based on face detection quality ──
        confidence = min(1.0, 0.7 + gaze_score * 0.3)

        message = random.choice(self.MESSAGES[state])

        return {
            "timestamp": timestamp,
            "score": score,
            "state": state,
            "confidence": round(confidence, 2),
            "message": message,
            "model_response": {
                "eye_contact": round(gaze_score, 3),
                "head_pose": head_pose,
                "face_detected": True,
                "blink_rate": round(blink_rate, 1),
            },
        }

    def _no_face_snapshot(self, timestamp: str) -> dict:
        """Return snapshot when no face is detected."""
        return {
            "timestamp": timestamp,
            "score": 0,
            "state": "unfocused",
            "confidence": 0.3,
            "message": "No face detected. Please ensure your camera can see your face.",
            "model_response": {
                "eye_contact": 0.0,
                "head_pose": "away",
                "face_detected": False,
                "blink_rate": 0.0,
            },
        }

    def _generate_dummy_snapshot(self, timestamp: str) -> dict:
        """Generate realistic dummy data when ML models aren't loaded."""
        states = ["attentive", "inattentive", "unfocused"]
        weights = [0.6, 0.25, 0.15]
        r = random.random()
        if r > sum(weights[:2]):
            state = "unfocused"
        elif r > weights[0]:
            state = "inattentive"
        else:
            state = "attentive"

        ranges = {"attentive": (70, 100), "inattentive": (35, 69), "unfocused": (0, 34)}
        lo, hi = ranges[state]
        score = random.randint(lo, hi)

        head_poses = {"attentive": "forward", "inattentive": "slightly_away", "unfocused": "away"}

        return {
            "timestamp": timestamp,
            "score": score,
            "state": state,
            "confidence": round(random.uniform(0.7, 0.98), 2),
            "message": random.choice(self.MESSAGES[state]),
            "model_response": {
                "eye_contact": round(score / 100 * random.uniform(0.8, 1.0), 3),
                "head_pose": head_poses[state],
                "face_detected": random.random() > 0.05,
                "blink_rate": round(random.uniform(10, 22), 1),
            },
        }

    def cleanup(self):
        """Release resources."""
        if self.face_mesh:
            self.face_mesh.close()


# ── Singleton instance ──
attention_detector = AttentionDetector()
