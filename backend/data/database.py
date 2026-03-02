
import os
import json
from typing import Optional
from tinydb import TinyDB, Query
from loguru import logger

DB_PATH = os.getenv("DB_PATH", "./data/neurolearn_db.json")

# Ensure data directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

db = TinyDB(DB_PATH)

# Tables
students_table = db.table("students")
courses_table = db.table("courses")
assessments_table = db.table("assessment_sessions")
results_table = db.table("assessment_results")
leaderboard_table = db.table("leaderboard")
challenges_table = db.table("daily_challenges")
notifications_table = db.table("notifications")
attention_logs_table = db.table("attention_logs")
transcripts_table = db.table("transcripts")

def seed_database():
    """Populate database with initial dummy data if empty."""
    Q = Query()

    # ── Student ──
    if not students_table.search(Q.id == "student_001"):
        students_table.insert({
            "id": "student_001",
            "name": "Alex Johnson",
            "email": "alex@neurolearn.io",
            "avatar": "/placeholder-user.jpg",
            "level": 12,
            "xp": 4250,
            "xp_to_next_level": 5000,
            "streak": 7,
            "best_streak": 14,
            "total_courses_completed": 4,
            "total_watch_time": 1260,
            "joined_date": "2024-09-15",
            "rank": 23,
            "badges": [
                {"id": "b1", "name": "First Steps", "description": "Complete your first lesson", "icon": "👣", "earned": True, "earned_date": "2024-09-16", "rarity": "common"},
                {"id": "b2", "name": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "⚔️", "earned": True, "earned_date": "2024-09-23", "rarity": "rare"},
                {"id": "b3", "name": "Perfect Score", "description": "Score 100% on an assessment", "icon": "💯", "earned": False, "rarity": "epic"},
                {"id": "b4", "name": "Speed Learner", "description": "Complete 5 lessons in one day", "icon": "🚀", "earned": False, "rarity": "epic"},
                {"id": "b5", "name": "Century Club", "description": "Earn 1000 XP", "icon": "💎", "earned": True, "earned_date": "2024-10-01", "rarity": "legendary"},
                {"id": "b6", "name": "Night Owl", "description": "Study past midnight", "icon": "🦉", "earned": True, "earned_date": "2024-10-05", "rarity": "common"},
                {"id": "b7", "name": "Quiz Master", "description": "Complete 50 quizzes", "icon": "🧠", "earned": False, "rarity": "legendary"},
                {"id": "b8", "name": "Social Butterfly", "description": "Join a study group", "icon": "🦋", "earned": False, "rarity": "rare"},
            ],
        })
        logger.info("Seeded student profile")

    # ── Courses ──
    if not courses_table.search(Q.id == "course_001"):
        courses = [
            {
                "id": "course_001",
                "title": "Introduction to React",
                "description": "Master the fundamentals of React including components, props, state, and hooks",
                "icon": "⚛️", "category": "Frontend", "difficulty": "Beginner",
                "total_videos": 8, "completed_videos": 5, "progress": 65, "estimated_hours": 6,
                "tags": ["React", "JavaScript", "Frontend"],
                "video_links": [
                    {"id": "v1", "title": "What is React? — Introduction & Setup", "url": "https://www.youtube.com/watch?v=SqcY0GlETPk", "duration": 720, "thumbnail": "", "order": 1, "completed": True, "watched_percent": 100},
                    {"id": "v2", "title": "JSX & Components Deep Dive", "url": "https://www.youtube.com/watch?v=9YkUCRr3bVc", "duration": 890, "thumbnail": "", "order": 2, "completed": True, "watched_percent": 100},
                    {"id": "v3", "title": "Props & Data Flow", "url": "https://www.youtube.com/watch?v=PHaECbrKgs0", "duration": 650, "thumbnail": "", "order": 3, "completed": True, "watched_percent": 100},
                    {"id": "v4", "title": "State & useState Hook", "url": "https://www.youtube.com/watch?v=O6P86uwfdR0", "duration": 780, "thumbnail": "", "order": 4, "completed": True, "watched_percent": 100},
                    {"id": "v5", "title": "useEffect & Side Effects", "url": "https://www.youtube.com/watch?v=0ZJgIjIuY7U", "duration": 920, "thumbnail": "", "order": 5, "completed": True, "watched_percent": 100},
                    {"id": "v6", "title": "Event Handling & Forms", "url": "https://www.youtube.com/watch?v=dH6i3GurZW8", "duration": 640, "thumbnail": "", "order": 6, "completed": False, "watched_percent": 35},
                    {"id": "v7", "title": "Conditional Rendering", "url": "https://www.youtube.com/watch?v=4oCVDkb_peY", "duration": 540, "thumbnail": "", "order": 7, "completed": False, "watched_percent": 0},
                    {"id": "v8", "title": "Lists & Keys", "url": "https://www.youtube.com/watch?v=0sasRxl35_8", "duration": 480, "thumbnail": "", "order": 8, "completed": False, "watched_percent": 0},
                ],
            },
            {
                "id": "course_002",
                "title": "Advanced State Management",
                "description": "Redux, Context API, Zustand and modern state patterns",
                "icon": "🔄", "category": "Frontend", "difficulty": "Intermediate",
                "total_videos": 6, "completed_videos": 2, "progress": 42, "estimated_hours": 8,
                "tags": ["Redux", "Context API", "Zustand"],
                "video_links": [
                    {"id": "v9", "title": "Why State Management Matters", "url": "https://www.youtube.com/watch?v=CVpUuw9XSjY", "duration": 600, "thumbnail": "", "order": 1, "completed": True, "watched_percent": 100},
                    {"id": "v10", "title": "Context API Fundamentals", "url": "https://www.youtube.com/watch?v=5LrDIWkK_Bc", "duration": 750, "thumbnail": "", "order": 2, "completed": True, "watched_percent": 100},
                    {"id": "v11", "title": "Redux Toolkit Setup", "url": "https://www.youtube.com/watch?v=9zySeP5vH9c", "duration": 880, "thumbnail": "", "order": 3, "completed": False, "watched_percent": 20},
                    {"id": "v12", "title": "Redux Thunk & Async", "url": "https://www.youtube.com/watch?v=93p3LxR9xfM", "duration": 920, "thumbnail": "", "order": 4, "completed": False, "watched_percent": 0},
                    {"id": "v13", "title": "Zustand — Lightweight Alternative", "url": "https://www.youtube.com/watch?v=_ngCLZ5Iz-0", "duration": 680, "thumbnail": "", "order": 5, "completed": False, "watched_percent": 0},
                    {"id": "v14", "title": "State Architecture Patterns", "url": "https://www.youtube.com/watch?v=HKU24nY8Hsc", "duration": 700, "thumbnail": "", "order": 6, "completed": False, "watched_percent": 0},
                ],
            },
            {
                "id": "course_003",
                "title": "Performance Optimization",
                "description": "React.memo, useMemo, code splitting, lazy loading, and profiling",
                "icon": "⚡", "category": "Frontend", "difficulty": "Advanced",
                "total_videos": 5, "completed_videos": 1, "progress": 28, "estimated_hours": 5,
                "tags": ["Performance", "Optimization", "React"],
                "video_links": [
                    {"id": "v15", "title": "React Performance Basics", "url": "https://www.youtube.com/watch?v=b1IQI4aJHLM", "duration": 800, "thumbnail": "", "order": 1, "completed": True, "watched_percent": 100},
                    {"id": "v16", "title": "React.memo & useMemo", "url": "https://www.youtube.com/watch?v=THL1OPn72vo", "duration": 700, "thumbnail": "", "order": 2, "completed": False, "watched_percent": 40},
                    {"id": "v17", "title": "Code Splitting & Lazy Loading", "url": "https://www.youtube.com/watch?v=JU6sl_yyZqs", "duration": 650, "thumbnail": "", "order": 3, "completed": False, "watched_percent": 0},
                    {"id": "v18", "title": "Profiler & DevTools", "url": "https://www.youtube.com/watch?v=LfEkP0bpFLc", "duration": 600, "thumbnail": "", "order": 4, "completed": False, "watched_percent": 0},
                    {"id": "v19", "title": "Real-world Optimization Case Study", "url": "https://www.youtube.com/watch?v=i8xbddI2Mg8", "duration": 900, "thumbnail": "", "order": 5, "completed": False, "watched_percent": 0},
                ],
            },
        ]
        for course in courses:
            courses_table.insert(course)
        logger.info(f"Seeded {len(courses)} courses")

    # ── Leaderboard ──
    if not leaderboard_table.all():
        entries = [
            {"rank": 1, "student_id": "s10", "name": "Priya Sharma", "avatar": "", "xp": 12500, "level": 24, "streak": 32, "courses_completed": 12},
            {"rank": 2, "student_id": "s11", "name": "Marcus Chen", "avatar": "", "xp": 11200, "level": 22, "streak": 28, "courses_completed": 10},
            {"rank": 3, "student_id": "s12", "name": "Sofia Reyes", "avatar": "", "xp": 10800, "level": 21, "streak": 15, "courses_completed": 11},
            {"rank": 4, "student_id": "s13", "name": "Aiden Okafor", "avatar": "", "xp": 9500, "level": 19, "streak": 20, "courses_completed": 9},
            {"rank": 5, "student_id": "s14", "name": "Emma Williams", "avatar": "", "xp": 8900, "level": 18, "streak": 12, "courses_completed": 8},
            {"rank": 23, "student_id": "student_001", "name": "Alex Johnson", "avatar": "", "xp": 4250, "level": 12, "streak": 7, "courses_completed": 4},
        ]
        for e in entries:
            leaderboard_table.insert(e)
        logger.info("Seeded leaderboard")

    # ── Daily Challenges ──
    if not challenges_table.all():
        challenges = [
            {"id": "dc1", "title": "Watch 30 minutes", "description": "Watch any video for 30 minutes", "xp_reward": 50, "type": "watch", "completed": True, "progress": 30, "target": 30},
            {"id": "dc2", "title": "Perfect Quiz", "description": "Score 100% on any quiz", "xp_reward": 100, "type": "quiz", "completed": False, "progress": 0, "target": 1},
            {"id": "dc3", "title": "Streak Keeper", "description": "Log in and study today", "xp_reward": 25, "type": "streak", "completed": True, "progress": 1, "target": 1},
            {"id": "dc4", "title": "Review Master", "description": "Review 3 completed lessons", "xp_reward": 75, "type": "review", "completed": False, "progress": 1, "target": 3},
        ]
        for c in challenges:
            challenges_table.insert(c)
        logger.info("Seeded daily challenges")

    # ── Notifications ──
    if not notifications_table.all():
        notifs = [
            {"id": "n1", "type": "achievement", "title": "Badge Earned!", "message": "You earned the Night Owl badge", "timestamp": "2 hours ago", "read": False, "icon": "🦉"},
            {"id": "n2", "type": "milestone", "title": "Level Up!", "message": "You reached Level 12", "timestamp": "1 day ago", "read": False, "icon": "⬆️"},
            {"id": "n3", "type": "challenge", "title": "Daily Challenge", "message": "New challenges available!", "timestamp": "3 hours ago", "read": True, "icon": "🎯"},
        ]
        for n in notifs:
            notifications_table.insert(n)
        logger.info("Seeded notifications")

    logger.success("Database seeding complete")



def get_student(student_id: str) -> Optional[dict]:
    Q = Query()
    results = students_table.search(Q.id == student_id)
    return results[0] if results else None


def update_student(student_id: str, updates: dict):
    Q = Query()
    students_table.update(updates, Q.id == student_id)


def get_all_courses() -> list[dict]:
    return courses_table.all()


def get_course(course_id: str) -> Optional[dict]:
    Q = Query()
    results = courses_table.search(Q.id == course_id)
    return results[0] if results else None


def save_assessment_session(session: dict):
    assessments_table.insert(session)


def get_assessment_session(session_id: str) -> Optional[dict]:
    Q = Query()
    results = assessments_table.search(Q.id == session_id)
    return results[0] if results else None


def save_assessment_result(result: dict):
    results_table.insert(result)


def get_student_results(student_id: str) -> list[dict]:
    Q = Query()
    return results_table.search(Q.student_id == student_id)


def log_attention(log: dict):
    attention_logs_table.insert(log)


def get_attention_logs(video_id: str, student_id: str) -> list[dict]:
    Q = Query()
    return attention_logs_table.search(
        (Q.video_id == video_id) & (Q.student_id == student_id)
    )


def get_leaderboard() -> list[dict]:
    return sorted(leaderboard_table.all(), key=lambda x: x.get("rank", 999))


def get_daily_challenges() -> list[dict]:
    return challenges_table.all()


def get_notifications(student_id: str = "student_001") -> list[dict]:
    return notifications_table.all()
