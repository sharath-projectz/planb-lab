# PLANB LAB: Problem Statement

> **Tagline:** Break the plan before reality does.  
> **Hackathon Theme:** Decision Intelligence  
> **Core Concept:** Pre-mortem operational stress-testing for nontechnical decision makers.

---

## 1. Executive Summary

Most real-world operational plans fail not because leaders lack ambition, but because they **fail to model compound failure cascades**. When designing workflows—such as event registration, customer checkouts, logistics pipelines, or emergency responses—planners routinely assume that individual steps operate in a vacuum.

In reality, modern operations rely on tightly coupled dependencies:
- **Cloud networks** (Wi-Fi, 4G/5G, gateways)
- **Third-party software** (OTP providers, identity verification APIs)
- **Local hardware** (barcodes, QR scanners, POS terminals)
- **Human personnel** (trained coordinators, volunteers, desk supervisors)

When **one component trips**, the failure rarely stays contained. It propagates downstream, halting dependent stages, causing bottleneck queues, customer churn, or safety hazards.

---

## 2. The Core Problem: The "Happy Path" Fallacy

Organizations repeatedly suffer from three critical blindspots during planning:

### A. The "Happy Path" Planning Bias
Planners focus 95% of their preparation on standard execution conditions and rarely stress-test combinations of adverse events. When asked *"What happens if the Wi-Fi drops at the gate?"*, the common response is *"We'll use offline records."* However, no one checks whether the staff member operating the offline tablet is actually trained or present.

### B. Compound Failure Invisibility
Single failures are relatively simple to anticipate; **compound combinations are catastrophic**. If an event has 4 potential operational vulnerabilities:
$$\text{Total Non-Empty Combinations} = 2^4 - 1 = 15 \text{ compound scenarios}$$
Human planners cannot intuitively calculate how 15 different failure states propagate across sequential stages without decision intelligence tools.

### C. Confusing Statistical Metrics
Planners and pseudo-AI tools frequently conflate:
1. Isolated component baseline failure probability $P(A)$.
2. Induced conditional failure probability $P(B \mid A)$.
3. Joint co-occurrence probability $P(A \cap B)$.
4. The deterministic scenario test pass/fail fraction.

Presenting arbitrary LLM-generated hallucinated percentages as real-world risk deceives decision-makers into false confidence.

---

## 3. Concrete Benchmark Demonstration: The 500-Student College Fest

To demonstrate this reality vividly, **PLANB LAB** implements an authentic benchmark: **A 500-student College Fest Registration & Gate Entry Pipeline**:

$$\text{Online Registration} \longrightarrow \text{OTP Verification} \longrightarrow \text{QR Ticket Scanning} \longrightarrow \text{Identity Verification} \longrightarrow \text{Turnstile Event Entry}$$

### Baseline Reality (Zero Active Contingencies)
Under baseline conditions with zero active safeguards:
- **Internet Outage (20% configured risk):** Immediately severs Step 1 (Portal) and Step 2 (SMS OTP), which in turn cascades to halt QR validation and admission.
- **Result:** **15 out of 15 compound stress combinations halt at or before Step 2.** The event gate is 100% bottlenecked before the first hundred attendees enter.

---

## 4. The Need for PLANB LAB

Non-technical event organizers, project managers, and operations leads need an intuitive platform that:
1. **UNDERSTANDS** the workflow stages and dependencies.
2. **DISCOVERS** hidden failure propagation paths across all 15 compound scenarios.
3. **IMPROVES** the design by configuring explicit contingency guardrails (offline caches, alternative physical ID checks, backup hardware, standby staff).
4. **RETESTS** the revised plan using a deterministic engine to prove measurable resiliency gain before the event goes live.
