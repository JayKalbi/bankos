---
Document Name: Enterprise Business Operations, Product Management & Organizational Operating Model Specification
Document Number: 17
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Distinguished Product Executive, Chief Product Officer, Chief Operating Officer
Depends On: 00-16 Architecture Series
---

# 1. Executive Business Vision
The Institutional Risk Engine (IRE) transcends software; it is a continuously evolving digital banking product. This specification defines the exact Operating Model, Product Governance, and Organizational Topologies required to operate IRE as a high-margin, highly compliant, Tier-1 financial technology business.

# 2. Product Operating Model
We operate as a **Product-Led Organization**. IT is not a cost center; it is the business. The Operating Model fundamentally aligns engineering output directly with banking revenue, risk reduction, and regulatory compliance via autonomous, stream-aligned teams.

# Business Architecture (3 - 8)

### 3. Business Architecture & 4. Business Capability Model
The Business Architecture maps technical bounded contexts (from Doc 03) directly to Business Capabilities (e.g., `Credit Decisioning`, `Identity Verification`, `Regulatory Reporting`).

### 5. Capability Mapping & 6. Value Streams
```mermaid
graph LR
    Lead[Sales Lead] --> Origination[Loan Origination]
    Origination --> Risk[Risk Assessment]
    Risk --> Committee[Credit Committee]
    Committee --> Funding[Loan Funding]
    Funding --> Servicing[Loan Servicing]

    style Risk fill:#f9f,stroke:#333,stroke-width:4px
    style Committee fill:#f9f,stroke:#333,stroke-width:4px
```
*IRE explicitly owns the `Risk Assessment` and `Credit Committee` Value Streams.*

### 7. Customer Journey Mapping
Every major feature must trace back to a specific phase in the Commercial Loan Officer's daily journey map, ensuring software solves actual human friction points.

### 8. Stakeholder Mapping
*   **Primary:** Chief Credit Officer, Loan Officers.
*   **Secondary:** Auditors, Regulators (OCC/Fed).
*   **Tertiary:** IT Operations, SecOps.

---

# Product Portfolio & Strategy (9 - 21)

### 9. Product Portfolio Management & 10. Product Governance
Governed by the Enterprise Product Council (EPC). The portfolio balances three horizons:
*   H1 (70%): Core Platform Stability & Compliance.
*   H2 (20%): Advanced AI/ML Credit Scoring.
*   H3 (10%): Autonomous Agentic Underwriting.

### 11. Product Strategy & 12. Product Lifecycle
Strategy is dictated by the CPO. The lifecycle strictly follows: `Discovery` $\rightarrow$ `Validation` $\rightarrow$ `Delivery` $\rightarrow$ `Launch` $\rightarrow$ `Iterate` $\rightarrow$ `Sunset`.

### 13. Product Discovery vs 14. Product Delivery
Discovery asks "Are we building the right thing?" (Prototyping, Customer Interviews). Delivery asks "Are we building it right?" (Architecture, Code). Discovery runs 1-2 sprints ahead of Delivery.

### 15. Lean Product Development & 16. Design Thinking
Build-Measure-Learn loops. We do not build massive upfront feature sets. We build MVPs (Minimum Viable Products), deploy behind LaunchDarkly feature flags, and measure adoption.

### 17. Product Analytics & 18. Product KPIs
Tracked via Amplitude/Mixpanel. Metrics include Feature Adoption Rate, Time-on-Task, and Drop-off Rate.

### 19. Product OKRs & 20. North Star Metrics
*   **North Star Metric:** "Time to Final Credit Decision" (Target: < 48 hours).
*   **Objective:** Radically accelerate credit underwriting.
*   **Key Result:** Reduce manual document data entry by 80%.

### 21. Product Roadmaps
Roadmaps are outcome-based (e.g., "Reduce Fraud by 10%"), not output-based (e.g., "Build Fraud Screen").

---

# Requirements & Backlog Management (22 - 32)

### 22. Release Planning & 23. Feature Prioritization (RICE/WSJF)
Features are strictly prioritized using **WSJF** (Weighted Shortest Job First) to maximize economic value.
*   `WSJF = (User Value + Time Criticality + Risk Reduction) / Job Size`

### 24. Requirements Engineering
No code is written without a Jira Epic containing explicit business justification and regulatory sign-off.

### 25. User Story Standards & 26. Acceptance Criteria Standards
*   **Format:** `As a [Persona], I want to [Action] so that [Value].`
*   **AC Format:** BDD Given-When-Then explicitly required.

### 27. Epic Management, 28. Initiative Management, 29. Backlog Management
The Product Manager owns the Backlog. The Engineering Lead owns the sizing.

### 30. Sprint Planning, 31. Sprint Review, 32. Sprint Retrospectives
Strict 2-week sprints.
*   **Planning:** Committing to achievable outcomes.
*   **Review:** Demonstrating working software to the Chief Credit Officer.
*   **Retro:** Continuous blameless improvement. Action items are added to the next sprint.

---

# Agile Governance & Frameworks (33 - 39)

### 33. Agile Governance, 34. Scrum Standards, 35. Kanban Standards
*   **Scrum:** Used for feature teams with predictable iteration boundaries.
*   **Kanban:** Used for SRE and Platform teams handling continuous, interrupt-driven flow.

### 36. SAFe Alignment, 37. Portfolio Planning, 38. Program Increment (PI)
While avoiding heavy SAFe bureaucracy, IRE utilizes PI Planning (Quarterly) to align the 15+ independent squads on cross-context dependencies (e.g., Auth team dependency on Credit team).

### 39. PMO Governance
The Project Management Office governs cross-departmental delivery, tracking risk registers, and ensuring resource allocation aligns with the C-suite's H1/H2/H3 budget targets.

---

# Operational Excellence & Lean (40 - 45)

### 40. Business Process Modeling (BPMN)
All manual business workflows (e.g., "Manual Credit Override Process") are mapped using BPMN 2.0 standards in Camunda/Lucidchart before automation begins.

### 41. Operational Excellence & 42. Continuous Improvement
Driven by the DevOps culture. If a business process requires 10 clicks, UX must reduce it to 3.

### 43. Lean Principles, 44. Six Sigma Integration, 45. Kaizen
Value stream mapping identifies "wait times" (e.g., waiting for Compliance approval). DMAIC (Define, Measure, Analyze, Improve, Control) is used to optimize the human-in-the-loop workflows.

---

# Organizational Structure & Topologies (46 - 56)

### 46. Organizational Structure & 47. Team Topologies
IRE uses Conway's Law to its advantage by structuring the organization exactly like the Django Modular Monolith (Doc 12).

### 48. Stream-Aligned Teams
Cross-functional squads (PM, Design, Eng, QA) owning end-to-end features (e.g., `Credit Decision Squad`).

### 49. Platform Teams
Provide internal paved roads (Kubernetes, CI/CD, Vault) to reduce cognitive load on Stream-Aligned Teams.

### 50. Enabling Teams & 51. Complicated Subsystem Teams
*   **Enabling:** AI/ML Coaches who help squads integrate prompt engineering.
*   **Subsystem:** PhD Quants managing the deterministic Math/Pricing algorithms.

### 52. RACI Matrix & 53. Decision Rights
| Process | Exec Sponsor | Product Mgr | Eng Lead | Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Feature Prioritization** | A | R | C | I |
| **Architecture Design** | I | C | R | C |
| **Cloud Deployment** | I | I | C | R |

### 54. Executive Steering Committee & 55. Risk Committee
Meets monthly. Authorizes budget shifts and reviews major regulatory risks.

### 56. Change Advisory Process
Business CAB approves the *rollout* (feature flag flip) to customers, while Tech CAB approves the *deployment* (code merge).

---

# Vendor & Customer Operations (57 - 67)

### 57. Business Continuity Governance
Ensuring the business can function if the software platform undergoes a SEV-0 outage (e.g., fallback to manual underwriting spreadsheets).

### 58. Vendor Governance & 59. Procurement Standards
All 3rd-party SaaS (e.g., Auth0, OpenAI) must pass a 90-day vendor risk assessment by the CISO.

### 60. Third Party Management
Continuous monitoring of vendor SLAs and SOC2 Type II compliance.

### 61. Customer Success & 62. Customer Support
Proactive engagement with internal Loan Officers to ensure they understand how the AI Swarm reached its decision.

### 63. Support Tiers, 64. SLA Governance, 65. Escalation
*   **Tier 1:** Helpdesk (Password resets).
*   **Tier 2:** Application Support (Bug replication).
*   **Tier 3:** Engineering Squad (Code fixes).

### 66. Complaint Management & 67. Business Communication
Any regulatory complaint (e.g., "The AI denied my loan unfairly") triggers an immediate Escaped Defect process and Legal review.

---

# Financial Planning & Executive Reporting (68 - 82)

### 68. Internal Communications, 69. Executive Reporting, 70. Board Reporting
Monthly automated executive dashboards pull directly from Jira, PagerDuty, and Datadog. PowerPoint is banned for status reporting.

### 71. Financial Planning & 72. Budget Governance
Zero-based budgeting. Engineering must justify cloud costs (FinOps).

### 73. Cost Allocation & 74. Chargeback Model
AWS and LLM Token costs are charged directly back to the specific banking business unit utilizing the risk engine via Kubernetes Namespace and API key tagging.

### 75. Forecasting, 76. Revenue Metrics, 77. Unit Economics
Tracking the cost-to-underwrite a loan. If an AI Swarm costs $5 in tokens to evaluate a $1,000,000 loan, the unit economics are wildly positive.

### 78. BI Governance & 79. Executive Dashboards
Tableau is the sole source of truth for financial KPIs.

### 80. Compliance Reporting, 81. Audit Readiness, 82. Regulatory Engagement
Auditors are granted read-only access to a specific Backstage portal containing immutable ADRs, SOC2 reports, and CI/CD deployment logs.

---

# KPIs, OKRs, and Innovation (83 - 91)

### 83. Organizational, 84. Business, 85. Operational KPIs
*   **Business:** Loan Approval Volume, Net Interest Margin enhancement.
*   **Org:** Employee eNPS, Developer Retention.

### 86. DORA Business Alignment
Engineering speed (Deployment Frequency) is explicitly correlated to Business agility (Time-to-Market for new credit products).

### 87. Innovation Governance & 88. AI Governance Committee
Controls the ethical rollout of AI. Approves which tasks the AI Swarm can fully automate vs which require a Human-in-the-Loop.

### 89. Ethics Committee
Ensures the AI models do not violate the Equal Credit Opportunity Act (ECOA) via proxy variables.

### 90. Sustainability Governance & 91. ESG Reporting
Tracking the carbon footprint of AWS GPU usage for model training.

---

# 92. Business ADRs (Selected)
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `BIZ-01` | WSJF Prioritization | HiPPO (Highest Paid Person's Opinion) | Forces mathematical rigor on the roadmap rather than executive whims. |
| `BIZ-02` | Stream-Aligned Teams | Functional Silos (Dev vs QA) | Silos create handoffs; handoffs create delays. Cross-functional teams ship faster. |
| `BIZ-03` | Feature Flag Rollouts | Big Bang Releases | Separates the engineering deployment from the business release. |
| `BIZ-04` | North Star: Time to Decision | Volume of Features | Shipping 100 features is useless if the loan takes 5 days to close. |

# 93. Business Anti-Patterns
*   **Feature Factories:** Measuring success by the number of tickets closed rather than the business value delivered.
*   **Water-Scrum-Fall:** Doing 6 months of requirements gathering, followed by 2-week coding sprints, followed by 3 months of manual QA.
*   **Shadow IT:** Business units buying SaaS products on credit cards because the core platform is too slow to deliver.

# 94. Business Fitness Functions
```gherkin
# Feature Flag Age Validation
Feature: Feature Flag Lifecycle
  Scenario: Prevent permanent technical debt
    Given a feature flag is flipped to 100% in production
    When 30 days have passed
    Then Jira must automatically generate a Sev-2 Tech Debt ticket to remove the flag
```

# 95. Organizational Readiness Checklist
- [ ] Product Managers have explicit, measurable OKRs.
- [ ] Team Topologies align 1:1 with Domain boundaries.
- [ ] Chargeback model is active in AWS Billing.
- [ ] Ethics Committee has reviewed the AI Swarm prompts.

# 96. Operating Model Scorecard & 97. Future Roadmap
*   **Future Roadmap:** Transitioning from Human-in-the-Loop (Co-Pilot) to Human-on-the-Loop (Auto-Pilot) for micro-loans under $50,000.

# 98. Executive Summary & 99. Final Business Scorecard
| Metric | Status | Owner | Criteria |
| :--- | :--- | :--- | :--- |
| **Org Alignment** | PASS | COO | Squads aligned to Value Streams. |
| **Prioritization**| PASS | CPO | WSJF strictly utilized in Jira. |
| **Unit Economics**| PASS | FinOps | AI token cost < $10 per evaluation. |
| **Compliance** | PASS | Chief Risk | Ethics committee approval secured. |

---
# 100. Approval Section
*Approval: Chief Operating Officer, Chief Product Officer, CTO*
