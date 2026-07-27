---
Document Name: Enterprise Operations, IT Service Management (ITSM), Production Operations, SRE Operations & Organizational Operating Model Specification
Document Number: 24
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Distinguished Operations Architect, Principal SRE, Chief Operating Officer (COO), VP Engineering, ITSM Lead
Depends On: 00-23 Architecture Series
---

# 1. Executive Operations Vision
The Institutional Risk Engine (IRE) operates continuously in a highly hostile, rapidly evolving Tier-1 banking environment. Code deployment is merely the beginning of the software lifecycle. This specification defines the absolute operational rigor required to maintain 99.99% availability, strictly governing IT Service Management (ITSM), Incident Response, AI Operations, and the exact Organizational Topologies required to operate the platform securely and reliably.

# 2. Production Excellence & 3. Operational Philosophy
*   **Production is Sacred:** No human interacts with production systems manually. All changes are executed via CI/CD pipelines or automated break-glass procedures with mandatory audit trails.
*   **Toil is Technical Debt:** Any manual operational task performed more than twice must be automated via Python or Terraform.
*   **Blameless Culture:** Incidents are system failures, not human failures. Postmortems focus on process, never on assigning blame.

---

# IT Service Management (ITSM) & ITIL 4 (4 - 24)

### 4. IT Service Management (ITSM) & 5. ITIL 4
IRE adopts ITIL 4 practices, but modernizes them for a Cloud-Native, DevOps-centric environment. We reject heavy bureaucratic CAB meetings in favor of automated Change Enablement.

### 6. Service Strategy, 7. Design, 8. Transition, 9. Operations
Every microservice must complete a formal Service Transition checklist (Observability, Runbooks, Security Scans) before it is allowed to enter Service Operations (Production).

### 10. Service Portfolio & 11. Service Catalog
Backstage.io (Doc 21) serves as the definitive Service Catalog.

### 12. Configuration Management & 13. CMDB
The CMDB is entirely automated. AWS Config and Kubernetes custom controllers continuously update ServiceNow via APIs. Manual CMDB updates are banned.

### 16. Problem Management vs 17. Incident Management
*   **Incident Management:** Restoring service as quickly as possible (e.g., rebooting a pod).
*   **Problem Management:** Finding the root cause to prevent the incident from ever happening again (e.g., fixing the memory leak).

### 19. Change Enablement & 20. Emergency Changes
Standard changes (e.g., updating a Python library) are auto-approved by CI/CD. Emergency changes (e.g., bypassing CI to hotfix a Sev-1) require explicit VP Engineering approval via an automated Slack workflow.

### 23. Availability & 24. Capacity Management
Driven by Prometheus metrics and Karpenter auto-scaling. Humans do not manually scale nodes.

---

# Site Reliability Engineering (25 - 41)

### 25. SLIs, 26. SLOs, 27. SLAs
*   **SLI (Indicator):** `Total HTTP 500s / Total Requests`.
*   **SLO (Objective):** Internal goal (99.99%).
*   **SLA (Agreement):** Legal contract with customers (99.95%). Financial penalties apply if breached.

### 28. Error Budgets
If a squad depletes their 4.32-minute monthly error budget, all feature deployments are frozen. The squad may only deploy reliability fixes until the budget recovers.

### 33. Production Readiness Reviews (PRR)
SREs conduct rigorous PRRs before any new Bounded Context goes live. If the PRR fails, the launch is blocked.

### 35. Runbooks & 36. Playbooks
Attached to every single Datadog alert.
```yaml
# PagerDuty Runbook Link
alert: HighDatabaseCPU
annotations:
  runbook_url: "https://backstage.ire.internal/docs/runbooks/db-cpu-high"
  description: "Aurora CPU > 90% for 5m. Run `kubectl scale` on workers to shed load."
```

### 37. Game Days & 39. Chaos Engineering Operations
Chaos Mesh is deployed in Staging weekly to randomly terminate nodes, drop network packets, and corrupt Redis caches to ensure auto-recovery works.

### 41. Golden Signals, USE, RED Methods
*   **Golden Signals:** Latency, Traffic, Errors, Saturation.
*   **RED (Microservices):** Rate, Errors, Duration.
*   **USE (Infrastructure):** Utilization, Saturation, Errors.

---

# Incident Response (42 - 59)

### 44. On-call Engineering & 45. Follow-the-Sun Support
SRE operates across 3 global regions. Handoffs are meticulously documented in Jira.

### 47. PagerDuty & 48. Opsgenie Escalation
```mermaid
graph TD
    Alert[Datadog Alert] --> PD[PagerDuty Service]
    PD --> L1[L1: Primary Engineer (Immediate)]
    L1 -->|No ACK 5m| L2[L2: Secondary Engineer (5m)]
    L2 -->|No ACK 10m| L3[L3: Global SRE Commander (15m)]
    L3 -->|No ACK 15m| L4[L4: VP Engineering (30m)]
```

### 50. Severity Matrix & 51. War Rooms
*   **SEV-1 (Critical):** Automated creation of a dedicated Slack channel (`#inc-1234`), Zoom bridge, and Jira ticket.

### 55. Root Cause Analysis (RCA) & 56. Five Whys
Every SEV-1 and SEV-2 requires an RCA within 48 hours.

### 57. Blameless Postmortems
"Why did the system allow the engineer to push a bad config?" not "Why did the engineer push a bad config?"

---

# Production Operations (60 - 75)

### 62. Deployment Windows & 63. Freeze Periods
Deployments are continuous. End-of-Year (Dec 15 - Jan 2) freezes are enforced for core banking infrastructure.

### 65. Production Access & 66. Break Glass Procedures
SSH to production nodes is disabled. `kubectl exec` requires temporary Break-Glass access approved by a Maker/Checker workflow, logging all keystrokes to an immutable S3 bucket.

### 70. Rollback Automation
Argo Rollouts automatically revert to the previous ReplicaSet if the Prometheus error rate spikes during a Canary deployment.

---

# Monitoring & Observability (76 - 90)

### 77. Datadog, 78. Grafana, 79. Prometheus Operations
Prometheus collects metrics; Grafana visualizes them; Datadog handles Synthetics and APM tracing.

### 81. Alert Routing & 82. Event Correlation
AIOps tools (e.g., BigPanda) compress 100 simultaneous network alerts into a single actionable PagerDuty incident.

### 86. Log Retention
*   **Hot (OpenSearch):** 14 Days.
*   **Cold (S3):** 90 Days.
*   **Glacier (WORM):** 7 Years for OCC Compliance.

---

# Capacity, Storage & DB Operations (91 - 105)

### 92. Forecasting & 93. Cost Optimization
FinOps reviews AWS billing weekly. Orphaned EBS volumes and unattached Elastic IPs are automatically deleted by Lambda janitors.

### 95. GPU Operations
GPU node pools are highly elastic. EKS spins up `g5.2xlarge` instances ONLY when batch inference pipelines are triggered, scaling to 0 when idle.

### 99. Aurora & 100. Redis Maintenance
Minor version upgrades are fully automated during weekend maintenance windows using Blue/Green deployments.

### 104. Disaster Recovery & 105. Regional Failover
In the event of `us-east-1` total failure, Route53 routes traffic to `us-west-2`. Cross-region Aurora replication guarantees RPO < 1 minute.

---

# Security & Business Operations (106 - 128)

### 107. SOC Tier 1, 2, 3 Operations
The Security Operations Center monitors Falco (eBPF) for container breakouts.

### 115. Emergency Patching
Critical CVEs (e.g., Log4j equivalent) mandate a global deployment halt. All CI pipelines immediately pull the patched base image and redeploy within 4 hours.

### 124. Monthly Business Reviews (MBR)
Operations leadership presents availability, budget, and risk metrics to the Executive Steering Committee.

---

# AI & LLMOps Operations (129 - 139)

### 130. LLMOps Operations
Managing the lifecycle of proprietary Prompts and RAG pipelines.

### 133. Inference Monitoring
Tracking `Time-To-First-Token` (TTFT). If Azure OpenAI latency exceeds 2.0s, the gateway automatically fails over to AWS Bedrock.

### 135. AI Incident Response
Handling AI "Hallucinations." If a hallucination is detected in production, the prompt is rolled back to the previous Git commit instantly.

### 137. Vector Database Operations
`pgvector` indices (HNSW) are rebuilt nightly during off-peak hours to maintain fast semantic search performance.

---

# Organizational Operating Model (140 - 150)

### 140. Platform, 141. Domain, 142. Stream-aligned Teams
Structuring teams precisely along Bounded Contexts to minimize cross-team dependencies.

### 147. Engineering Council & 148. SRE Council
Governing bodies that set the technical standards (e.g., banning a specific Python package globally).

### 150. Escalation Matrix
Defines exactly who makes the call to failover the entire bank to the secondary AWS region during a SEV-0 crisis.

---

# 151. Operational ADRs (Selected)
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `OPS-01` | Automated CMDB | Manual ServiceNow | Manual CMDBs are perpetually out of date. AWS Config enforces truth. |
| `OPS-02` | Blameless RCAs | Punitive Postmortems | Punitive cultures hide bugs. Blameless cultures fix systemic flaws. |
| `OPS-03` | Immutable Infrastructure | Live Server Patching | Live patching causes configuration drift. Nodes must be destroyed and replaced. |
| `OPS-04` | LLM Gateway Failover | Single Provider | OpenAI/Anthropic APIs go down. Gateway failover ensures AI underwriting never halts. |

# 152. Operational Anti-Patterns
*   **Alert Fatigue:** Paging engineers at 3 AM for a high CPU warning that auto-resolves in 5 minutes.
*   **The "Bus Factor" of 1:** Only one engineer knows how to restore the database from an S3 backup.
*   **Change Approval Bureaucracy:** Requiring 5 managers to approve a 2-line CSS change.

# 153. Operational Fitness Functions
```python
# test_pagerduty_runbooks.py
def test_all_datadog_alerts_have_runbooks():
    # CI fails if a developer adds a Datadog monitor without a valid Backstage runbook URL
    monitors = get_datadog_monitors()
    for monitor in monitors:
        assert monitor.message.contains("runbook_url"), f"Monitor {monitor.id} missing runbook"
```

# 154. Production Readiness Checklist
- [ ] Datadog APM tracing enabled and passing `X-Correlation-ID`.
- [ ] PagerDuty escalation policy verified (L1 -> L2 -> L3).
- [ ] Chaos Engineering verifies auto-scaling limits are sufficient.
- [ ] Break-Glass emergency access roles tested and audited.

# 155. Executive Operational Scorecard
| Category | Status | Owner | Criteria |
| :--- | :--- | :--- | :--- |
| **Availability** | PASS | VP Eng | Core Platform Uptime > 99.99% for trailing 30 days. |
| **MTTR** | PASS | Principal SRE| Mean Time To Restore < 15 minutes for SEV-1. |
| **Alert Noise** | PASS | Ops Arch | Actionable alert percentage > 95%. |
| **FinOps** | PASS | FinOps Lead | AWS Compute spend within 5% of forecast. |

---
*Approval: Distinguished Operations Architect, Principal SRE, Chief Operating Officer (COO), VP Engineering, ITSM Lead*
