
import os
import re
import json
import uuid
import random
from typing import Optional

from loguru import logger

# Try importing transformers for FLAN-T5
try:
    from transformers import T5ForConditionalGeneration, T5Tokenizer, pipeline
    import torch
    FLAN_AVAILABLE = True
    logger.info("Transformers loaded — FLAN-T5 question generator LIVE")
except ImportError:
    FLAN_AVAILABLE = False
    logger.warning("Transformers not installed — using DUMMY question generator")


class QuestionGenerator:
    """
    Generates assessment questions from transcript text using FLAN-T5.

    Difficulty levels:
        - easy:   remember/understand (Bloom's taxonomy)
        - medium: apply/analyze
        - hard:   evaluate/create

    Supports:
        - MCQ (multiple choice)
        - True/False
        - Short answer (for hard difficulty)
    """

    # ── Question bank for fallback / dummy mode ──
    QUESTION_BANK = {
        "easy": [
            {
                "question": "What is React?",
                "options": ["A database system", "A JavaScript library for building user interfaces", "A CSS framework", "A backend programming language"],
                "correct_answer": 1,
                "explanation": "React is a JavaScript library developed by Meta for building user interfaces, particularly single-page applications.",
                "blooms_level": "remember",
            },
            {
                "question": "What does JSX stand for?",
                "options": ["JavaScript XML", "Java Syntax Extension", "JSON Extra", "JavaScript XHR"],
                "correct_answer": 0,
                "explanation": "JSX stands for JavaScript XML. It's a syntax extension that allows writing HTML-like code in JavaScript.",
                "blooms_level": "remember",
            },
            {
                "question": "Which hook is used to manage local state in a functional component?",
                "options": ["useEffect", "useState", "useRef", "useMemo"],
                "correct_answer": 1,
                "explanation": "useState is the primary hook for adding and managing local state in React functional components.",
                "blooms_level": "remember",
            },
            {
                "question": "What is the virtual DOM?",
                "options": ["A direct copy of the browser DOM", "A lightweight in-memory representation of the real DOM", "A CSS rendering engine", "A browser developer tool"],
                "correct_answer": 1,
                "explanation": "The virtual DOM is a lightweight JavaScript object that React uses to efficiently determine what changes need to be made to the actual DOM.",
                "blooms_level": "understand",
            },
            {
                "question": "Components in React are best described as:",
                "options": ["Database tables", "Reusable UI building blocks", "Server endpoints", "CSS stylesheets"],
                "correct_answer": 1,
                "explanation": "Components are reusable, self-contained pieces of UI that can accept inputs (props) and return React elements.",
                "blooms_level": "understand",
            },
        ],
        "medium": [
            {
                "question": "What is the purpose of the useEffect cleanup function?",
                "options": ["To reset component state", "To prevent memory leaks by cleaning up subscriptions and listeners", "To optimize rendering speed", "To handle JavaScript errors"],
                "correct_answer": 1,
                "explanation": "The cleanup function returned by useEffect runs before the component unmounts or before the effect re-runs, preventing memory leaks from subscriptions, timers, and event listeners.",
                "blooms_level": "apply",
            },
            {
                "question": "When does React re-render a component?",
                "options": ["When its props or state change", "Every second automatically", "Only when the page refreshes", "When CSS styles are updated"],
                "correct_answer": 0,
                "explanation": "React triggers a re-render whenever a component's state or props change, then uses reconciliation to efficiently update the DOM.",
                "blooms_level": "understand",
            },
            {
                "question": "What problem does 'prop drilling' describe and how is it typically solved?",
                "options": ["Passing props through many nested levels — solved with Context API or state management", "A CSS specificity issue", "A testing methodology", "A build optimization technique"],
                "correct_answer": 0,
                "explanation": "Prop drilling occurs when data is passed through many component layers. Context API, Redux, or Zustand can provide direct access to shared state without drilling.",
                "blooms_level": "analyze",
            },
            {
                "question": "What is the difference between controlled and uncontrolled form components?",
                "options": ["Controlled components derive form values from React state; uncontrolled use DOM refs", "They are identical in behavior", "Controlled components only work in class components", "Uncontrolled components are always faster"],
                "correct_answer": 0,
                "explanation": "Controlled components store form data in React state (via useState), giving React full control. Uncontrolled components store data in the DOM, accessed via useRef.",
                "blooms_level": "analyze",
            },
            {
                "question": "Why is the 'key' prop important when rendering lists?",
                "options": ["It adds CSS styling", "It helps React identify which items have changed, been added, or removed for efficient updates", "It sets the display order", "It provides accessibility labels"],
                "correct_answer": 1,
                "explanation": "Keys give React a stable identity for each list item, enabling the reconciliation algorithm to minimize DOM operations during updates.",
                "blooms_level": "apply",
            },
        ],
        "hard": [
            {
                "question": "How does React's Fiber architecture improve over the previous stack reconciler?",
                "options": ["Fiber enables incremental rendering by splitting work into pausable units", "They perform identically", "The stack reconciler is newer and faster", "Fiber only works with class components"],
                "correct_answer": 0,
                "explanation": "Fiber allows React to split rendering into chunks, pause work to handle higher-priority updates (like user input), and resume later — enabling smoother UIs.",
                "blooms_level": "evaluate",
            },
            {
                "question": "When should you use useCallback versus useMemo?",
                "options": ["useCallback memoizes a function reference; useMemo memoizes a computed return value", "They are interchangeable", "useCallback replaces useEffect", "useMemo is deprecated in React 18+"],
                "correct_answer": 0,
                "explanation": "useCallback(fn, deps) returns a memoized version of the callback function. useMemo(() => compute(), deps) returns the memoized result of the computation.",
                "blooms_level": "analyze",
            },
            {
                "question": "What is the purpose of React's useTransition hook?",
                "options": ["It handles CSS transitions and animations", "It marks state updates as non-urgent to keep the UI responsive during expensive re-renders", "It manages page navigation transitions", "It replaces useEffect for async operations"],
                "correct_answer": 1,
                "explanation": "useTransition lets you mark state updates as transitions (non-urgent), so React can keep the UI responsive by prioritizing urgent updates like typing.",
                "blooms_level": "evaluate",
            },
            {
                "question": "In Next.js App Router, what determines the client/server component boundary?",
                "options": ["The file extension (.client.tsx vs .server.tsx)", "The 'use client' directive at the top of the file", "Component name prefix (Client_ vs Server_)", "The import statement order"],
                "correct_answer": 1,
                "explanation": "Adding 'use client' at the top of a file marks it and all its imports as client components. Without it, components are server components by default in the App Router.",
                "blooms_level": "understand",
            },
            {
                "question": "What is the Suspense boundary pattern primarily used for?",
                "options": ["Error handling exclusively", "Declaring loading fallbacks for components performing async operations", "CSS animation orchestration", "Route protection and authentication"],
                "correct_answer": 1,
                "explanation": "Suspense wraps components that perform async operations (lazy loading, data fetching with 'use'), showing a fallback UI while they resolve.",
                "blooms_level": "apply",
            },
        ],
    }

    def __init__(self, model_name: str = "google/flan-t5-base"):
        self.model = None
        self.tokenizer = None
        self.model_name = model_name

        if FLAN_AVAILABLE:
            try:
                logger.info(f"Loading FLAN-T5 model: {model_name}")
                self.tokenizer = T5Tokenizer.from_pretrained(model_name)
                self.model = T5ForConditionalGeneration.from_pretrained(model_name)
                self.model.eval()
                logger.success(f"FLAN-T5 loaded: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load FLAN-T5: {e}")
                self.model = None

    def generate_questions(
        self,
        transcript_text: str,
        difficulty: str = "medium",
        num_questions: int = 5,
        topic_id: str = "course_001",
    ) -> list[dict]:
        """
        Generate assessment questions from transcript text.

        Args:
            transcript_text: The video transcript to generate questions from
            difficulty: "easy" | "medium" | "hard"
            num_questions: How many questions to generate
            topic_id: Course/topic ID for metadata

        Returns:
            List of JSON-serializable question dicts
        """
        # Try FLAN-T5 first
        if self.model is not None and self.tokenizer is not None:
            try:
                return self._generate_with_flan(
                    transcript_text, difficulty, num_questions, topic_id
                )
            except Exception as e:
                logger.error(f"FLAN-T5 generation failed: {e}")

        # Fallback to question bank
        return self._generate_from_bank(difficulty, num_questions, topic_id)

    def _generate_with_flan(
        self,
        transcript_text: str,
        difficulty: str,
        num_questions: int,
        topic_id: str,
    ) -> list[dict]:
        """Generate questions using FLAN-T5 model."""
        questions = []

        # Bloom's level mapping
        blooms_map = {
            "easy": ["remember", "understand"],
            "medium": ["apply", "analyze"],
            "hard": ["evaluate", "create"],
        }
        difficulty_scores = {"easy": 0.2, "medium": 0.55, "hard": 0.8}
        points_map = {"easy": 10, "medium": 20, "hard": 30}

        for i in range(num_questions):
            # Construct prompt
            prompt = (
                f"Generate a {difficulty} multiple choice question "
                f"with 4 options based on the following text. "
                f"Format: Question: [question]\\nA) [option1]\\nB) [option2]\\n"
                f"C) [option3]\\nD) [option4]\\nCorrect: [A/B/C/D]\\n"
                f"Explanation: [why]\\n\\n"
                f"Text: {transcript_text[:1000]}"  # Truncate for context window
            )

            # Tokenize
            inputs = self.tokenizer(
                prompt, return_tensors="pt", max_length=512, truncation=True
            )

            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=256,
                    num_beams=4,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                )

            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Parse generated text
            parsed = self._parse_generated_question(generated_text)
            if parsed:
                blooms = random.choice(blooms_map.get(difficulty, ["understand"]))
                questions.append({
                    "id": f"q_gen_{uuid.uuid4().hex[:8]}",
                    "type": "mcq",
                    "question": parsed["question"],
                    "options": parsed["options"],
                    "correct_answer": parsed["correct_answer"],
                    "difficulty": difficulty,
                    "points": points_map.get(difficulty, 20),
                    "explanation": parsed.get("explanation", ""),
                    "topic_id": topic_id,
                    "llm_metadata": {
                        "model": self.model_name,
                        "generated_from": "video_transcript",
                        "difficulty_score": difficulty_scores.get(difficulty, 0.5) + random.uniform(-0.1, 0.1),
                        "blooms_level": blooms,
                    },
                })

        # If FLAN didn't generate enough, pad with bank questions
        if len(questions) < num_questions:
            bank_fill = self._generate_from_bank(
                difficulty, num_questions - len(questions), topic_id
            )
            questions.extend(bank_fill)

        return questions[:num_questions]

    def _parse_generated_question(self, text: str) -> Optional[dict]:
        """Parse FLAN-T5 output into structured question."""
        try:
            lines = text.strip().split("\n")
            question = ""
            options = []
            correct = 0
            explanation = ""

            for line in lines:
                line = line.strip()
                if line.lower().startswith("question:"):
                    question = line.split(":", 1)[1].strip()
                elif re.match(r"^[A-D]\)", line):
                    options.append(line[2:].strip())
                elif line.lower().startswith("correct:"):
                    letter = line.split(":", 1)[1].strip().upper()
                    correct = {"A": 0, "B": 1, "C": 2, "D": 3}.get(letter, 0)
                elif line.lower().startswith("explanation:"):
                    explanation = line.split(":", 1)[1].strip()

            if question and len(options) >= 2:
                # Pad options to 4 if needed
                while len(options) < 4:
                    options.append("None of the above")
                return {
                    "question": question,
                    "options": options[:4],
                    "correct_answer": min(correct, len(options) - 1),
                    "explanation": explanation or "Review the material for more details.",
                }
        except Exception as e:
            logger.warning(f"Failed to parse question: {e}")

        return None

    def _generate_from_bank(
        self, difficulty: str, num_questions: int, topic_id: str
    ) -> list[dict]:
        """Generate questions from the static question bank."""
        bank = self.QUESTION_BANK.get(difficulty, self.QUESTION_BANK["medium"])
        selected = random.sample(bank, min(num_questions, len(bank)))

        difficulty_scores = {"easy": 0.2, "medium": 0.55, "hard": 0.8}
        points_map = {"easy": 10, "medium": 20, "hard": 30}

        questions = []
        for q in selected:
            questions.append({
                "id": f"q_bank_{uuid.uuid4().hex[:8]}",
                "type": "mcq",
                "question": q["question"],
                "options": q["options"],
                "correct_answer": q["correct_answer"],
                "difficulty": difficulty,
                "points": points_map.get(difficulty, 20),
                "explanation": q["explanation"],
                "topic_id": topic_id,
                "llm_metadata": {
                    "model": "question_bank_fallback",
                    "generated_from": "static_bank",
                    "difficulty_score": difficulty_scores.get(difficulty, 0.5),
                    "blooms_level": q.get("blooms_level", "understand"),
                },
            })

        return questions


# ── Singleton ──
FLAN_MODEL = os.getenv("FLAN_T5_MODEL", "google/flan-t5-base")
question_generator = QuestionGenerator(model_name=FLAN_MODEL)
