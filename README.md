# NeuroLearn

NeuroLearn is an adaptive learning platform with a Next.js frontend and a
FastAPI backend. It combines course discovery, video learning, transcription,
question generation, attention monitoring, adaptive assessment, gamification,
and report generation into one full-stack learning workflow.

## Features

- Course dashboard, learning sessions, assessments, results, profile, and leaderboard views
- Authentication flows for signup, login, password reset, and current-user state
- Auto course discovery from topic input using scraping and metadata fallbacks
- Multi-source video learning with YouTube, MP4, and URL support
- Webcam attention monitoring with MediaPipe-backed scoring when ML dependencies are installed
- Whisper transcription and FLAN-T5 question generation with dummy fallbacks for local demos
- Cognitive Readiness Score (CSR) for adaptive difficulty selection
- XP, streaks, badges, challenges, notifications, and leaderboard endpoints
- PDF report generation and optional email delivery
- Frontend fallback data mode when the backend is unavailable

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide icons
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic, JWT auth
- ML and media: MediaPipe, OpenAI Whisper, FLAN-T5, PyTorch, OpenCV
- Reporting and delivery: ReportLab, Jinja2, SMTP

## Repository Layout

```text
NeuroLearn/
|-- backend/                  # FastAPI app, routers, auth, data, ML, reports, tests
|-- frontend/                 # Next.js app router UI and API client
|-- demo_files/               # Screenshots and sample report artifacts
|-- flow_diagram.png          # Project architecture diagram
|-- render.yaml               # Render deployment config
|-- vercel.json               # Vercel frontend config
`-- README.md                 # Root project guide
```

Useful sub-guides:

- `frontend/README.md`
- `backend/README.md`

## Prerequisites

- Node.js 20.9 or newer
- Python 3.10 or newer
- PostgreSQL running locally or a reachable PostgreSQL connection string
- Optional: a webcam for live attention monitoring
- Optional: FFmpeg for Whisper/video processing workflows

## Quick Start: Frontend Demo

The frontend can run by itself. If the backend is not available, it uses local
fallback data unless strict API mode is enabled.

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Frontend environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_STRICT=false
```

Set `NEXT_PUBLIC_API_STRICT=true` when you want backend connection failures to
surface immediately instead of falling back to demo data.

## Quick Start: Full Stack

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py
```

The API runs at `http://localhost:8000`.

- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- API overview: `http://localhost:8000/api`

On macOS/Linux, activate the virtual environment with:

```bash
source venv/bin/activate
```

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Backend Configuration

The backend reads configuration from `backend/.env`.

Common local variables:

```env
HOST=0.0.0.0
PORT=8000
DEBUG=true
CORS_ORIGINS=http://localhost:3000

PG_HOST=localhost
PG_PORT=5432
PG_DB=neurolearn
PG_USER=neurolearn
PG_PASSWORD=neurolearn_dev_pw

JWT_SECRET=change-this-for-local-dev
ACCESS_TOKEN_EXPIRE_MINUTES=30

WHISPER_MODEL_SIZE=base
FLAN_T5_MODEL=google/flan-t5-base

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_NAME=NeuroLearn
```

You can also provide a full SQLAlchemy URL:

```env
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/neurolearn
```

The application creates database tables on startup through SQLAlchemy. Alembic
configuration is also present under `backend/migrations`.

## Optional ML Setup

`backend/requirements.txt` installs the full ML stack. Some packages are large,
especially PyTorch, Whisper, Transformers, MediaPipe, and OpenCV.

After installing Playwright, install Chromium for the content-discovery scraper:

```bash
cd backend
python -m playwright install chromium
```

When ML models are unavailable, the backend keeps the JSON contract stable by
returning realistic fallback data for supported features.

## Main Backend Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/student/profile`
- `GET /api/courses`
- `POST /api/content/discover`
- `POST /api/attention/snapshot`
- `GET /api/transcription/{video_id}`
- `POST /api/assessment/generate`
- `POST /api/assessment/submit`
- `GET /api/csr/{student_id}/history`
- `GET /api/leaderboard`
- `POST /api/report/generate`

See `http://localhost:8000/docs` for the current schema and request bodies.

## Cognitive Readiness Score

CSR is the adaptive scoring layer used by the assessment engine. It combines:

- Performance: recent assessment score history
- Attention: gaze, head pose, and blink-normality signals
- Response integrity: timing behavior independent of correctness
- Learning trend: slope over recent scores
- Content complexity: transcript readability and technical density

The fused CSR value selects the next difficulty tier and is persisted so later
submissions can use the learner's recent history.

## Testing And Validation

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
pytest
```

Focused CSR tests:

```bash
cd backend
pytest tests/test_csr.py -v
```

## Deployment Notes

- The frontend is configured for Vercel with `vercel.json`.
- The backend includes Render-oriented configuration in `render.yaml`.
- Configure production CORS with `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`.
- Set a real `JWT_SECRET` in every non-local environment.
- Use managed PostgreSQL in production and avoid committing `.env` files.
- Configure SMTP credentials only where report email delivery is required.

## Demo Assets

Sample screenshots and report files live in `demo_files/`.

Screens included:

- Dashboard
- Video learning
- Assessment
- Results
