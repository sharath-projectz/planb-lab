# PLANB LAB 🧪
### *Break the plan before reality does.*

> **Hackathon Track:** Decision Intelligence  
> **Primary Benchmark Demonstration:** College Event Registration & Gate Entry Pipeline (500 Attendees)  
> **Experience Loop:** `UNDERSTAND` $\to$ `DISCOVER` $\to$ `IMPROVE` $\to$ `RETEST`

---

## 🌟 Overview

**PLANB LAB** is a decision intelligence platform that simulates operational workflows under compound stress, traces downstream failure cascades, evaluates contingency safeguards, and quantifies plan resiliency before events go live.

---

## 🚀 Key Features

1. **Deterministic Combinatorial Simulation Engine:**
   - Evaluates all $2^4 - 1 = 15$ non-empty failure combinations systematically.
   - Evaluates real prerequisite rules (e.g. offline registration requires staff availability).
   - Zero dice rolls, zero arbitrary hallucinated probabilities.

2. **APPLY FIX & RETEST (Before vs After):**
   - Preserves baseline execution while stress-testing active contingency safeguards.
   - Computes recovery deltas, lists newly rescued scenarios, and isolates remaining bottlenecks.

3. **Interactive Failure Connection Map:**
   - Visual dependency tree displaying how upstream outages (Internet, OTP, QR Hardware, Staff) propagate to block downstream admission.
   - Clickable nodes, live status coloring (Optimal, Degraded, Blocked), and immediate fault injection toggles.

4. **Transparent Risk Calculations:**
   - Auditable probability models: $P(A)$, $P(B \mid A)$, $P(A \cap B) = P(A) \times P(B \mid A)$, and scenario coverage fractions.
   - Interactive sliders to tune assumptions and immediately recalculate dependent stress runs.

5. **PLANB Copilot (Google Gemini 1.5/2.5 AI):**
   - Context-aware decision intelligence assistant answering operational questions.
   - Grounded in mathematical state with explicit distinction between calculated facts, user assumptions, and AI recommendations.
   - Includes automatic heuristic fallback for offline evaluation.

6. **Full-Stack Security & Persistence:**
   - Express REST API with Zod request validation and bcrypt password hashing.
   - JWT authentication derived from verified token claims.
   - Supabase PostgreSQL database schema (`backend/schema.sql`) with seamless local in-memory fallback store.

---

## 🛠️ Architecture

```
PLAN B/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── simulationEngine.js   # Deterministic cascade & retest logic
│   │   │   └── copilotService.js     # Gemini AI & heuristic fallback
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   └── validate.js           # Zod schema validation
│   │   ├── db.js                     # Supabase & in-memory demo store
│   │   └── server.js                 # Express REST API routes
│   ├── tests/
│   │   ├── simulation.test.js        # Unit test for determinism & math
│   │   └── e2e.test.js               # End-to-end integration tests
│   ├── schema.sql                    # Supabase PostgreSQL schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, ContextPanel, Copilot, RetestModal, AuthModal
│   │   ├── views/                    # Landing, Dashboard, Workflows, Builder, Risk, FailureMap, Simulations, Copilot, History, Settings
│   │   ├── services/api.js           # API bridge with offline simulation client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── PROBLEM_STATEMENT.md
├── SOLUTION_DESCRIPTION.md
├── GITHUB_CHECKLIST.md
├── DEMO_SCRIPT.md
├── vercel.json                       # Frontend Vercel configuration
├── render.yaml                       # Backend Render configuration
├── .env.example                      # Environment variables reference
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/planb-lab.git
cd planb-lab
cp .env.example backend/.env
```

*(Edit `backend/.env` with your `GEMINI_API_KEY` or Supabase keys if available. If omitted, PLANB LAB automatically activates local heuristic demo mode with 100% feature availability).*

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Run Automated Verification Tests
```bash
cd backend
npm test                # Runs simulation determinism & probability tests
node tests/e2e.test.js  # Runs full end-to-end API test suite
cd ..
```

### 4. Start Development Servers
Run each in a separate terminal:

**Terminal 1 (Backend API):**
```bash
cd backend
npm start
# API starts on http://localhost:5000
```

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm run dev
# Vite UI starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Description | Required? |
| :--- | :--- | :--- |
| `PORT` | Backend port (default `5000`) | Optional |
| `NODE_ENV` | Environment (`development` or `production`) | Optional |
| `FRONTEND_URL` | Allowed frontend origin for CORS | Optional |
| `JWT_SECRET` | Secret key for signing JWT auth tokens | Recommended |
| `GEMINI_API_KEY` | Google Gemini API key for live AI Copilot | Optional (fallback active) |
| `SUPABASE_URL` | Supabase project URL | Optional (local store active) |
| `SUPABASE_ANON_KEY` | Supabase public anonymous key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase private service-role key (backend only) | Optional |

---

## 📡 REST API Endpoints

### Health & Meta
- `GET /api/health` — System status, database mode, and AI engine status.
- `GET /api/simulations/meta` — Failure modes, contingencies, and metadata.
- `GET /api/simulations/probabilities` — Mathematical models and joint probability calculations.

### Authentication
- `POST /api/auth/register` — Register user with bcrypt hashing and JWT.
- `POST /api/auth/login` — Login with credentials.
- `GET /api/auth/me` — Protected identity check.

### Workflows & Simulations
- `GET /api/workflows` — List benchmark and custom workflows.
- `GET /api/workflows/:id` — Get specific workflow details.
- `POST /api/simulations/run` — Run single scenario simulation.
- `POST /api/simulations/suite` — Execute full 15-combination stress test suite.
- `POST /api/simulations/retest` — Execute "APPLY FIX & RETEST" comparison.

### AI Copilot
- `POST /api/copilot/chat` — Contextual Copilot assistant query.
- `GET /api/copilot/conversations` — List audit history.
- `DELETE /api/copilot/conversations/:id` — Delete conversation.

---

## ☁️ Deployment Instructions

### Deploy Frontend to Vercel
1. Link repository to Vercel.
2. Select Root Directory or configure build settings:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
3. The project includes `vercel.json` with SPA routing rewrites.
4. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`.

### Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Root Directory: `backend`.
3. Build Command: `npm install`.
4. Start Command: `node src/server.js`.
5. Health Check Path: `/api/health`.
6. Add environment variables from `.env.example`.

### Database Setup on Supabase
1. Create a free project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** and paste the contents of `backend/schema.sql`.
3. Copy your project URL and service role key into `backend/.env`.

---

## ⚠️ Known Limitations & Scope
- **Configured vs Historical Data:** Baseline failure rates are configured operational assumptions. PLANB LAB does not fabricate sensor history where real telemetry does not exist.
- **Sequential Gate Assumption:** The primary demonstration models a single linear gate pipeline. Parallel multi-line turnstiles can be configured by adding parallel workflow nodes.
- **Offline LLM Notice:** When `GEMINI_API_KEY` is not provided, Copilot answers via the internal deterministic decision engine.
