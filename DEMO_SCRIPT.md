# PLANB LAB: 3–5 Minute Demo Video Script & Recording Checklist

> **Target Duration:** 3 minutes 30 seconds  
> **Presenter:** Solo Founder / Senior Full-Stack Engineer  
> **Audience:** Hackathon Judges & Operational Decision Makers

---

## 📋 Recording Preparation Checklist

Before hitting record:
- [ ] Clean browser window with URL bar hidden or zoomed to 100% at 1920x1080 resolution.
- [ ] Ensure backend is running (`node src/server.js` on port 5000).
- [ ] Ensure frontend is running (`npm run dev` on port 5173).
- [ ] Close extraneous tabs and notifications.
- [ ] Test audio input for crisp voice capture.

---

## 🎬 Timed Demo Script

### Act 1: The Hook & Problem (0:00 – 0:40)
* **Screen:** Landing page (`http://localhost:5173`) showing the headline *"Every plan has a Plan B."*
* **Voiceover:**
  > *"Every year, operations leaders watch their plans crumble on day one. An event registration gate halts, a retail checkout freezes, or an emergency alert fails. Why? Because teams plan for the 'happy path' and fail to anticipate compound failure cascades.*
  >
  > *Welcome to **PLANB LAB**—the AI-assisted decision intelligence platform designed to break your plan before reality does. Let’s dive straight in."*
* **Action:** Click the **"Test My Plan"** or **"Explore Demo"** button on the landing page.

---

### Act 2: The Baseline Vulnerability (0:40 – 1:30)
* **Screen:** Dashboard showing **Overall Plan Health: High Risk** (0% Handled) and the summary cards.
* **Voiceover:**
  > *"Here is our benchmark scenario: A 500-student College Fest Registration pipeline. It requires internet access, SMS OTP validation, optical QR scanning, and identity desk volunteers.*
  >
  > *Notice our dashboard: with zero active safeguards, the plan health is **High Risk**. Behind the scenes, PLANB LAB's deterministic engine has systematically tested all 15 non-empty failure combinations of our 4 operational faults.*
  >
  > *Currently, all 15 compound scenarios fail. If the internet drops, Step 1 halts. Because Step 1 halts, SMS OTP never fires, QR validation can't check the cloud database, and 500 students are stranded outside the gates."*
* **Action:** Click **"Failure Map"** in the sidebar. Highlight how the Internet Infrastructure node links downstream into the stages. Click to toggle the fault on.

---

### Act 3: Auditable Probability Math (1:30 – 2:05)
* **Screen:** Risk Analysis view (`Risk Analysis` in sidebar).
* **Voiceover:**
  > *"Unlike tools that hallucinate random percentages, PLANB LAB is mathematically honest. We distinguish four distinct measurements:*
  > 1. *Individual component risk $P(A)$.*
  > 2. *Conditional induced failure $P(B \mid A)$.*
  > 3. *Joint compound probability $P(A \cap B) = P(A) \times P(B \mid A)$.*
  > 4. *And the deterministic scenario test coverage.*
  >
  > *Here, internet failure has a configured 20% risk. But because OTP requires cloud access, the conditional failure $P(\text{OTP} \mid \text{Internet})$ is 95%, resulting in a 19% compound failure rate."*
* **Action:** Move the probability slider to demonstrate real-time recalculation.

---

### Act 4: The Core Moment — "APPLY FIX & RETEST" (2:05 – 2:55)
* **Screen:** Click the prominent **"APPLY FIX & RETEST"** button in the top navbar.
* **Voiceover:**
  > *"Now, here is PLANB LAB’s core differentiator: **APPLY FIX & RETEST**.*
  >
  > *In the contingency panel, we introduce four safeguards:*
  > - *Encrypted Offline Registration Records.*
  > - *Alternative Physical ID Verification.*
  > - *Battery-operated Backup QR Scanners.*
  > - *And a Standby Floater Coordinator.*
  >
  > *Notice that these aren't magic wands: our engine evaluates real prerequisites. For instance, offline records only work if staff are on site.*
  >
  > *Now, we hit **Run Retest Simulation**."*
* **Action:** Toggle on all 4 contingencies and click **"Run Retest Simulation"**.
* **Voiceover:**
  > *"Look at that result: The baseline 0% is preserved. The retest jumps to **100% scenario coverage**—a verifiable **+100% resiliency gain**. All 15 compound scenarios are successfully handled, shifting our plan health to **Looks Resilient**."*

---

### Act 5: PLANB Copilot & Conclusion (2:55 – 3:30)
* **Screen:** Open **PLANB Copilot** drawer and click the prompt *"What happens if the internet fails?"*.
* **Voiceover:**
  > *"Finally, we built **PLANB Copilot**, powered by Google Gemini through our secure Express backend. Copilot doesn't guess—it ingests our live mathematical state and explains cascading dependencies in clear, actionable English.*
  >
  > *With JWT authentication, Zod validation, Supabase integration, and Vercel/Render configurations, PLANB LAB is ready for production.*
  >
  > *Remember: Every plan has a Plan B. Thank you."*
* **Action:** Close Copilot, showing the green *"Looks Resilient"* badge in the top navbar.
