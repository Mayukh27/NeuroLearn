from .student import router as student_router
from .courses import router as courses_router
from .attention import router as attention_router
from .transcription import router as transcription_router
from .assessment import router as assessment_router
from .gamification import router as gamification_router
from .report import router as report_router

__all__ = [
    "student_router",
    "courses_router",
    "attention_router",
    "transcription_router",
    "assessment_router",
    "gamification_router",
    "report_router",
]
