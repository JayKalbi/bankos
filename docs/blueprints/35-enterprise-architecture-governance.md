---
Document Name: Enterprise Architecture Governance, Technology Governance, Architecture Review Board (ARB) & Technical Standards Specification
Document Number: 35
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Chief Enterprise Architect, Distinguished Engineer Council, Chief Technology Officer (CTO)
Depends On: 00-34 Architecture Series
---

# 1. Enterprise Architecture Governance & 2. Architecture Principles
The Institutional Risk Engine (IRE) operates under deterministic architecture governance. "Governance" in IRE is not a bureaucratic committee that stamps PDF documents; it is **Policy-as-Code** executed continuously in the deployment pipeline. The role of Enterprise Architecture is to define the boundaries of the playing field, construct the Golden Paths, and mathematically enforce adherence to enterprise standards.

# 8. Domain Driven Governance & 9. Architecture Review Board (ARB)
Governance is federated. The central ARB governs enterprise-wide, Tier-0 concerns (Cloud strategy, Identity, Networking, Database engines). Domain Architecture Boards govern bounded-context concerns (e.g., Credit Domain, Fraud Domain). 

# 10. Technical Design Review (TDR), 11. RFC Process & 12. Architecture Decision Records (ADR)
Every significant technical change begins as a Request for Comment (RFC) published in GitHub. Once the RFC is debated and approved by the Principal Engineer Council, it is formalized as an immutable Architecture Decision Record (ADR) in the `docs/adr` repository. 

---

# Technology Lifecycle & Radar (13 - 18)

### 13. Technology Radar & 14. Approved Technology Catalog
IRE maintains an internal Thoughtworks-style Technology Radar:
*   **Adopt:** Approved for Tier-0 production (e.g., PostgreSQL, Apache Kafka, Go, Python).
*   **Trial:** Approved for non-critical greenfield projects (e.g., Rust, Temporal.io).
*   **Assess:** R&D phase, limited to Sandbox environments.
*   **Hold (Deprecate):** Existing usage permitted, but banned for new projects (e.g., MongoDB, Legacy ESBs).

### 15. Technology Lifecycle Management & 16. Emerging Technology Evaluation
Engineers proposing a new technology (e.g., a new Vector Database) must present a PoC and a total-cost-of-ownership (TCO) analysis to the ARB. If approved, the Platform team assumes responsibility for Day-2 operations of the technology.

---

# Automated Governance & Policy-as-Code (20 - 36)

### 27. Platform Governance Integration & 31. Policy as Code
Governance is automated via Open Policy Agent (OPA) and Kyverno. Manual code reviews cannot catch every compliance violation. 
```rego
# OPA Gatekeeper Policy: Ban public LoadBalancers
package k8s.ingress
deny[msg] {
  input.request.kind.kind == "Service"
  input.request.object.spec.type == "LoadBalancer"
  not input.request.object.metadata.annotations["service.beta.kubernetes.io/aws-load-balancer-internal"]
  msg := "Public LoadBalancers are banned. Use internal ingress."
}
```

### 33. Software Supply Chain Governance, 35. License Compliance & 36. SBOM Governance
The CI/CD pipeline enforces strict Open Source governance. Trivy scans the Syft-generated Software Bill of Materials (SBOM). The pipeline mathematically rejects any build containing AGPL (viral open-source licenses) or Critical/High CVEs.

---

# Exception Management & Change Advisory (37 - 47)

### 38. Risk Acceptance Process & 40. Waiver Process
If a Domain Squad must deploy code that violates a standard (e.g., using an unapproved cloud service for a critical deadline), they must file an Architecture Waiver. Waivers require a VP signature and possess a strict 90-day Time-to-Live (TTL). If the tech debt is not remediated in 90 days, the deployment pipeline is automatically locked.

### 41. Enterprise Change Advisory Board (CAB) & 42. Production Change Governance
The legacy manual CAB is deprecated. We utilize an **Automated CAB**. If a deployment satisfies all automated checks (Unit tests > 90%, OPA policies pass, SLSA 3 signed, Chaos tests pass), the change is automatically approved and deployed. Human CABs are reserved exclusively for Tier-0 infrastructure changes (e.g., upgrading EKS clusters).

---

# Technical Debt & Continuous Architecture (50 - 55)

### 50. Technical Debt Governance
Tech debt is not an engineering secret; it is a balance sheet liability. Tech debt is quantified in Jira using a specific issue type and visualized on executive dashboards. Squads must dedicate 20% of their sprint velocity to tech debt remediation.

### 51. Architecture Fitness Functions & 52. Continuous Architecture
Architecture must be tested just like code. We use ArchUnit to mathematically prevent bounded context violations.
```java
// ArchUnit Java Example
@AnalyzeClasses(packages = "com.ire.bank")
public class ArchitectureTest {
    @ArchTest
    static final ArchRule credit_domain_must_not_depend_on_fraud =
        noClasses().that().resideInAPackage("..credit..")
        .should().dependOnClassesThat().resideInAPackage("..fraud..");
}
```

---

# Metrics, Maturity & DORA (56 - 67)

### 56. Engineering KPIs, 57. DORA Metrics & 58. SPACE Metrics
Governance tracks developer velocity. If ARB reviews cause Lead Time to jump from 1 day to 14 days, the ARB is actively harming the bank and must streamline its processes.

### 61. Architecture Maturity Model
*   **Level 1 (Chaotic):** Manual reviews, undocumented tech debt.
*   **Level 3 (Managed):** Documented ADRs, standardized technology radar.
*   **Level 5 (Continuous):** Fitness functions run in CI/CD, preventing architectural degradation autonomously.

---

# Enterprise Investment & Vendor Governance (68 - 76)

### 70. Build vs Buy Governance
*   If it is a core competitive advantage (e.g., AI Credit Scoring model), we BUILD.
*   If it is a commodity utility (e.g., Log aggregation, CRM, HR system), we BUY.

### 71. Vendor Governance & 72. SaaS Governance
Third-party SaaS vendors must undergo a grueling ISO 27001, SOC 2 Type II, and Penetration Test review. Vendors cannot have access to raw PII data under any circumstances.

### 74. FinOps Governance Integration
Every cloud resource must be tagged with `CostCenter`, `Owner`, and `Environment`. Missing tags trigger automatic garbage collection of the resource within 24 hours.

---

# AI, Communities & The Future (77 - 94)

### 79. Principal Engineer Council & 81. CTO Technical Council
The PEC meets bi-weekly to align cross-domain architecture. The CTO Council approves massive, multi-year investments (e.g., migrating from on-premise to AWS).

### 92. AI-assisted Architecture Reviews & 94. Architecture Copilot
An internal LLM, fine-tuned on Documents 00-34 and the entire ADR repository, serves as the Architecture Copilot. Developers can query it during the PR phase: *"Does using Redis here violate our persistence guidelines?"*

### 93. Architecture Knowledge Graph
We construct a Neo4j Knowledge Graph linking GitHub Repos $\rightarrow$ Microservices $\rightarrow$ Databases $\rightarrow$ APIs $\rightarrow$ Business Capabilities, enabling instant impact analysis during incident triage.

---

# 96. Enterprise Governance ADRs
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `GOV-01` | Policy as Code (OPA) | Manual ARB Reviews | Humans are slow and inconsistent. OPA runs in milliseconds and guarantees 100% compliance. |
| `GOV-02` | Automated CAB | ITIL CAB Meetings | Requiring 30 managers on a Friday call to approve an API update destroys agility. Tests are the CAB. |
| `GOV-03` | Immutable Tech Debt TTLs | Verbal Promises | "We'll fix it later" never happens. A 90-day pipeline lock enforces discipline. |
| `GOV-04` | Standardized Golden Paths | Infinite Developer Choice | Allowing 5 different DBs and 4 languages creates an unmaintainable operational nightmare for SRE. |

# 97. Governance Anti-Patterns
*   **The Ivory Tower Architect:** Architects who draw Visio diagrams but haven't written code or deployed to Kubernetes in 5 years. (Solution: Architects must code).
*   **Approval by Exhaustion:** A governance process so painful that engineers deliberately hide rogue infrastructure to avoid dealing with the ARB.
*   **Resume-Driven Development:** An engineer choosing a complex technology (e.g., Kafka for a 10-message-a-day queue) purely to put it on their resume.
*   **The Infinite Exception:** A waiver that is extended 12 times because the business refuses to fund the tech debt remediation.

# 98. Governance Fitness Functions
```yaml
# GitHub Actions: ArchUnit Enforcement
name: Architecture Governance Check
jobs:
  arch-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ArchUnit
        run: ./gradlew test --tests "com.ire.architecture.*"
# Pipeline fails if domain boundaries are violated.
```
```yaml
# OPA Gatekeeper: Prevent Banned Images
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sBannedImages
metadata:
  name: block-latest-tag
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    bannedImages:
      - "*:latest" # Banned to ensure deterministic deployments
```

# 99. Production Readiness Governance Checklist
- [ ] Technical Design Document (RFC) is approved and recorded as an ADR.
- [ ] Technology choices align perfectly with the "Adopt" ring of the Tech Radar.
- [ ] OPA Gatekeeper policies successfully validate the Kubernetes deployment manifests.
- [ ] Codebase passes ArchUnit boundary fitness functions.
- [ ] FinOps mandatory tags are applied to all provisioned infrastructure.
- [ ] SBOM is generated, signed (SLSA L3), and scanned for viral licenses/CVEs.
- [ ] No expired Architecture Waivers exist for the originating team.

# 100. Executive Governance Scorecard
| Category | Status | Owner | Criteria | Trend |
| :--- | :--- | :--- | :--- | :--- |
| **Policy-as-Code** | PASS | Chief Arch | > 95% of governance rules automated in CI/CD. | ↗️ Improving |
| **Waiver Backlog** | PASS | VP Eng | < 5% of active services operating under a waiver. | ➡️ Stable |
| **Golden Path Adoption**| PASS | DevEx Lead | 90% of new projects utilize approved Backstage templates. | ↗️ Improving |
| **Tech Debt Ratio**| PASS | Domain Leads | Technical debt Jira tickets < 15% of total backlog. | ↘️ Warning |
| **DORA (Velocity)**| PASS | Plat Ops | Deployments frequency high, Lead time < 1 day. | ➡️ Stable |

---
*Approval: Chief Enterprise Architect, Distinguished Engineer Council, Chief Technology Officer (CTO)*
