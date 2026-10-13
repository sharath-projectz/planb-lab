# PLANB LAB: Solution Description

> **Platform:** PLANB LAB  
> **Tagline:** Break the plan before reality does.  
> **Category:** Decision Intelligence & Operational Resiliency

---

## 1. Solution Architecture & Concept

**PLANB LAB** is a full-stack, AI-assisted decision intelligence platform designed to systematically identify, visualize, and neutralize failure cascades in operational plans. 

Rather than relying on vague generative text suggestions or unverified AI probabilities, PLANB LAB combines **deterministic combinatorial simulation** with **grounded LLM contextual reasoning**.

```
                ┌───────────────────────────────────────────────┐
                │             4-STEP DECISION LOOP              │
                │                                               │
                │  1. UNDERSTAND ──> 2. DISCOVER                │
                │         ▲                 │                   │
                │         │                 ▼                   │
                │  4. RETEST   <─── 3. IMPROVE                  │
                └───────────────────────────────────────────────┘
```

1. **UNDERSTAND:** Model the workflow as an auditable pipeline with explicit stages, baseline failure probabilities, and inter-component dependencies.
2. **DISCOVER:** Systematically generate all non-empty compound failure states ($2^N - 1 = 15$ scenarios) and compute deterministic cascade propagation trails.
3. **IMPROVE:** Attach contingency fallbacks (offline encrypted records, alternate physical ID checks, backup hardware, standby personnel) with explicit prerequisite rules.
4. **RETEST ("APPLY FIX & RETEST"):** Run the identical scenario suite against the modified configuration, calculating verifiable before-and-after recovery deltas without modifying the saved baseline.

---

## 2. Key Differentiators

### A. 100% Deterministic Combinatorial Simulation Engine
Simulation outcomes are calculated using formal workflow logic rather than random dice rolls or LLM guesswork:
- **Zero Hallucination:** A scenario fails or succeeds based solely on configured stage dependencies and active contingency criteria.
- **Prerequisite Validation:** Contingencies evaluate real preconditions. For instance, *Offline Registration Records* can mitigate an internet outage **only if trained staff are available**. If staff are down and no backup coordinator is on site, the offline fallback fails realistically.

### B. "APPLY FIX & RETEST" Live Diffing Engine
The core interactive feature compares baseline execution against the revised contingency suite:
- **Baseline preservation:** Keeps the initial state intact.
- **Recovered scenarios breakdown:** Explains precisely which compound outages changed from Halted $\to$ Handled.
- **Remaining blockers identification:** Flags lingering unmitigated paths.
- **Honest reporting:** Reports scenario coverage as a fraction of tested combinations (e.g. 15/15 = 100% handled), explicitly stating this is an objective stress-test metric rather than an empirical real-world guarantee.

### C. Mathematical Transparency & Disambiguation
Adheres strictly to statistical rigor:
- **Individual Risk:** $P(\text{Internet Outage}) = 0.20$.
- **Conditional Dependency:** $P(\text{OTP Failure} \mid \text{Internet Outage}) = 0.95$.
- **Joint Co-Occurrence:** $P(\text{Internet} \cap \text{OTP}) = P(\text{Internet}) \times P(\text{OTP} \mid \text{Internet}) = 0.20 \times 0.95 = 19.0\%$.
- **Independent Events:** $P(\text{Internet} \cap \text{QR Jam}) = P(\text{Internet}) \times P(\text{QR Jam}) = 0.20 \times 0.10 = 2.0\%$.
- Clear visual labeling separates user-configured assumptions from historical records.

### D. Grounded AI Copilot (Google Gemini 1.5/2.5)
The backend AI Copilot (`/api/copilot/chat`) passes the verified simulation state directly into Gemini:
- Distinguishes **calculated mathematical facts**, **user assumptions**, and **AI recommendations**.
- Never invents simulation metrics.
- Seamlessly falls back to an internal rule-based heuristic analyst engine if `GEMINI_API_KEY` is not present, guaranteeing 100% uninterrupted offline evaluation during hackathon demos.

---

## 3. Technology Stack & Implementation

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide Icons | Responsive dark navy/indigo/violet dashboard, glassmorphism cards, interactive dependency tree, collapsible Copilot drawer. |
| **Backend API** | Node.js, Express.js, JWT, bcryptjs, Zod | RESTful architecture, verified token claims, strict schema validation, deterministic simulation handlers. |
| **Simulation Core** | ES Modules Deterministic Engine | Bitmask combinatorial generation ($2^N - 1$), cascade evaluator, comparison diffing engine. |
| **Database** | Supabase PostgreSQL + Local Memory Fallback | Full SQL schema (`backend/schema.sql`) for production PostgreSQL, backed by in-memory demo store for zero-friction local testing. |
| **AI Integration** | Google Generative AI (Gemini 1.5 Flash) | Context-aware decision reasoning with prompt sandboxing and prompt minimization. |
| **Deployment** | Vercel (`vercel.json`) & Render (`render.yaml`) | Production-ready multi-cloud deployment configurations. |
