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
            return self._generate_with_flan(
                transcript_text, difficulty, num_questions, topic_id
            )

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

        # FIX (MJ3, peer review packet): previously every question in the
        # batch was generated from the exact same transcript_text[:1000]
        # slice, so num_questions>1 meant num_questions prompts competing
        # for one FLAN-T5-base call over identical context — a small part
        # of why the review found generation quality "optimistic". This
        # rotates through non-overlapping ~800-char segments so each
        # question is grounded in a different part of what the student
        # actually watched, and falls back to the full text only when the
        # transcript is shorter than one segment.
        segment_len = 800
        segments = (
            [transcript_text[i : i + segment_len] for i in range(0, len(transcript_text), segment_len)]
            or [transcript_text]
        )

        for i in range(num_questions):
            segment = segments[i % len(segments)]
            # Construct prompt
            prompt = (
                f"Generate a {difficulty} multiple choice question "
                f"with 4 options based on the following text. "
                f"Format: Question: [question]\nA) [option1]\nB) [option2]\n"
                f"C) [option3]\nD) [option4]\nCorrect: [A/B/C/D]\n"
                f"Explanation: [why]\n\n"
                f"Text: {segment}"
            )

            # FIX: generation is now isolated per segment/iteration. A
            # failure on one segment (tokenize/generate/decode) no longer
            # aborts the whole batch and discards questions already
            # produced for other segments — it just falls through to bank
            # padding for this one slot, same as a parse failure would.
            try:
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
                logger.info(f"FLAN RAW OUTPUT: {generated_text}")

                # Parse generated text
                parsed = self._parse_generated_question(generated_text)
            except Exception:
                # FIX: log the actual traceback so a silent per-segment
                # failure is visible in the terminal instead of just
                # showing up later as an unexplained bank-fallback question.
                logger.exception(
                    f"FLAN-T5 generation failed for segment {i} (difficulty={difficulty})"
                )
                parsed = None

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
                    # FIX (MJ4, peer review packet): every question is now
                    # tagged with where it actually came from, so an
                    # assessment report can honestly state how many items
                    # were live FLAN-T5 generations vs. fallback-bank
                    # padding — see the "source" tally already surfaced by
                    # ml/question_generator.py's caller.
                    "source": "flan_t5_live",
                })

        # If FLAN didn't generate enough — or the parse failed validation —
        # pad with bank questions. This padding is expected and disclosed
        # (README "Dummy Mode" / reproducibility statement), not a silent
        # substitution: each padded item is tagged accordingly by
        # _generate_from_bank so downstream reports can report the mix.
        if len(questions) < num_questions:
            bank_fill = self._generate_from_bank(
                difficulty, num_questions - len(questions), topic_id
            )
            questions.extend(bank_fill)

        return questions[:num_questions]

    # FIX (perf/timeout request, item 7): accepts "A)", "(A)", and "[A]"
    # option-letter formats. Group 1 always captures the bare letter.
    _OPTION_LINE_RE = re.compile(r"^\(?\[?([A-D])[\)\]]\s*", re.IGNORECASE)

    def _parse_generated_question(self, text: str) -> Optional[dict]:
        """Parse FLAN-T5 output into structured question."""
        try:
            lines = text.strip().split("\n")
            question = ""
            options: list[str] = []
            correct = 0
            explanation = ""

            for line in lines:
                line = line.strip()
                if line.lower().startswith("question:"):
                    question = line.split(":", 1)[1].strip()
                    continue
                if line.lower().startswith("correct:"):
                    letter = line.split(":", 1)[1].strip().upper()
                    # Correct: may itself arrive as "(A)" / "[A]" / "A".
                    letter_match = re.search(r"[A-D]", letter)
                    if letter_match:
                        correct = {"A": 0, "B": 1, "C": 2, "D": 3}[letter_match.group(0)]
                    continue
                if line.lower().startswith("explanation:"):
                    explanation = line.split(":", 1)[1].strip()
                    continue
                option_match = self._OPTION_LINE_RE.match(line)
                if option_match:
                    options.append(line[option_match.end():].strip())

            # FIX (item 7): de-duplicate options case/whitespace-insensitively
            # while preserving first-seen order and original casing, so a
            # model repeating an option doesn't silently pass validation as
            # if it were a distinct choice.
            seen: set[str] = set()
            unique_options: list[str] = []
            for option in options:
                key = re.sub(r"\s+", " ", option.strip().casefold())
                if key and key not in seen:
                    seen.add(key)
                    unique_options.append(option)

            if not question or len(unique_options) < 2:
                return None

            # Pad to exactly 4 with distinct, clearly-synthetic fillers —
            # never a duplicate of a real option or of each other.
            filler_index = 1
            while len(unique_options) < 4:
                filler = f"None of the above ({filler_index})"
                if re.sub(r"\s+", " ", filler.casefold()) not in seen:
                    unique_options.append(filler)
                    seen.add(re.sub(r"\s+", " ", filler.casefold()))
                filler_index += 1

            unique_options = unique_options[:4]
            return {
                "question": question,
                "options": unique_options,
                "correct_answer": min(correct, len(unique_options) - 1),
                "explanation": explanation or "Review the material for more details.",
            }
        except Exception as e:
            logger.warning(f"Failed to parse question: {e}")

        return None

    def _generate_from_bank(
        self, difficulty: str, num_questions: int, topic_id: str
    ) -> list[dict]:
        """
        Generate questions from the static question bank.

        NOTE (MJ3, peer review packet): this bank is currently
        React/web-dev-specific — using it for a non-React course topic is
        a known, disclosed limitation (not fixed here, since a general
        fix requires per-subject question banks or a working live-model
        path for every topic). Every item returned is explicitly tagged
        `source: "question_bank_fallback"` (see below and in
        `_generate_with_flan`) precisely so this substitution is visible
        in any report generated from assessment data, instead of being
        indistinguishable from a live FLAN-T5 generation (MJ4).
        """
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
                "source": "question_bank_fallback",
            })

        return questions


# ── Singleton ──
FLAN_MODEL = os.getenv("FLAN_T5_MODEL", "google/flan-t5-base")
question_generator = QuestionGenerator(model_name=FLAN_MODEL)