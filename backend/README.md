# NeuroLearn Backend — Adaptive Learning Platform

## Architecture

```
backend/
├── main.py                 # FastAPI app entry point
├── .env                    # Environment configuration
├── requirements.txt        # Python dependencies
│
├── schemas/
│   └── models.py           # Pydantic models (JSON schemas)
│
├── routers/
│   ├── student.py          # Student profile, XP, badges
│   ├── courses.py          # Course listing, video links
│   ├── attention.py        # Camera attention monitoring
│   ├── transcription.py    # Video transcription (Whisper)
│   ├── assessment.py       # Quiz generation + submission
│   └── gamification.py     # Leaderboard, challenges, notifications
│
├── ml/
│   ├── attention_model.py  # MediaPipe face mesh → attention score
│   ├── transcription_model.py # Whisper → transcript segments
│   ├── question_generator.py  # FLAN-T5 → quiz questions
│   └── adaptive_engine.py  # Score + attention → next difficulty
│
└── data/
    └── database.py         # TinyDB dummy database + seed data
```

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run server
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Docs

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## ML Model Pipeline

```
Student Opens Video
       ↓
Video Playback Starts
       ↓
Camera + Transcript Collection
  ├── Camera frames → POST /api/attention/snapshot
  │     → MediaPipe Face Mesh
  │     → Eye tracking + Head pose + Blink rate
  │     → Attention score (0-100) + State (attentive/inattentive/unfocused)
  │
  └── Audio → POST /api/transcription/chunk
        → OpenAI Whisper
        → Text + word timestamps + confidence
       ↓
Assessment Generation: POST /api/assessment/generate
  ├── Adaptive Engine determines difficulty
  │     (based on previous_score + attention_score)
  └── FLAN-T5 generates questions from transcript
       ↓
Student Takes Quiz
       ↓
Submit: POST /api/assessment/submit
  ├── Grade answers
  ├── Adaptive Engine analyzes performance
  │     → Performance trend (improving/stable/declining)
  │     → Time analysis
  │     → Historical pattern
  └── Returns next_difficulty + XP + recommendations
       ↓
Next Assessment Difficulty Updated
```

## Dummy Mode

All ML models gracefully fall back to dummy data if not installed.
This means the frontend can be developed and tested without:
- GPU / CUDA
- MediaPipe
- Whisper
- Transformers / FLAN-T5

The API returns realistic dummy JSON in the exact same format.

## Key API Endpoints

### Attention Monitoring
```bash
# With camera frame
curl -X POST http://localhost:8000/api/attention/snapshot \
  -H "Content-Type: application/json" \
  -d '{"frame_base64": "...", "video_id": "v1", "student_id": "student_001"}'

# Dummy (no camera needed)
curl http://localhost:8000/api/attention/dummy-snapshot
```

### Assessment Generation
```bash
curl -X POST http://localhost:8000/api/assessment/generate \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course_001",
    "video_id": "v1",
    "student_id": "student_001",
    "attention_score": 75,
    "previous_score": null,
    "transcript_text": "React is a JavaScript library..."
  }'
```

### Assessment Submission
```bash
curl -X POST http://localhost:8000/api/assessment/submit \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_abc123",
    "student_id": "student_001",
    "answers": {"q_001": 1, "q_002": 0, "q_003": 2},
    "time_spent": 180
  }'
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| HOST | 0.0.0.0 | Server host |
| PORT | 8000 | Server port |
| DEBUG | true | Enable hot reload |
| CORS_ORIGINS | http://localhost:3000 | Allowed origins |
| WHISPER_MODEL_SIZE | base | Whisper model (tiny/base/small/medium/large) |
| FLAN_T5_MODEL | google/flan-t5-base | FLAN-T5 variant |
| DB_PATH | ./data/neurolearn_db.json | TinyDB file path |

## Frontend Integration

All endpoints return JSON matching the TypeScript interfaces in `lib/api.ts`.
Replace the dummy `fetch` calls with real API calls:

```typescript
// Before (dummy):
export async function fetchAttentionScore(): Promise<AttentionSnapshot> {
  await delay(100);
  return generateAttentionSnapshot();
}

// After (real FastAPI):
export async function fetchAttentionScore(frameBase64: string): Promise<AttentionSnapshot> {
  const res = await fetch(`${API_BASE}/attention/snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frame_base64: frameBase64,
      video_id: currentVideoId,
      student_id: currentStudentId,
    }),
  });
  return res.json();
}
```


