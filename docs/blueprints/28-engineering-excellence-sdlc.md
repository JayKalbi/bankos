---
Document Name: Enterprise Software Delivery, Software Development Lifecycle (SDLC), Engineering Excellence, Quality Engineering, Developer Experience (DevEx) & Software Factory Specification
Document Number: 28
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Distinguished Engineer, Chief Architect, VP Engineering, Chief Technology Officer
Depends On: 00-27 Architecture Series
---

# 1. Executive Engineering Vision
The Institutional Risk Engine (IRE) treats software delivery as a deterministic manufacturing process. This specification defines our **Enterprise Software Factory**. Engineering excellence is not achieved through heroics or 3 AM debugging sessions; it is achieved through relentless automation, mathematically enforced quality gates, and a Developer Experience (DevEx) that minimizes cognitive load. We ship code to production multiple times a day with zero fear, because our automation guarantees safety.

# 2. Engineering Principles & 3. Software Factory Philosophy
*   **The Pipeline is the Product:** The automated machinery that builds the software is as critical as the software itself.
*   **Shift Left Everything:** Security, performance, and quality are tested at the developer's laptop (via DevContainers), not in a Staging environment.
*   **Automate or Die:** Any manual process in the SDLC is a defect.

---

# Software Development Lifecycle (SDLC) (8 - 17)

### 8. Modern SDLC & 9. Secure SDLC (SSDLC)
IRE utilizes an accelerated, continuous SSDLC. Security Threat Modeling (STRIDE) occurs during the initial Epic refinement, before a single line of code is written.

### 11. Architecture Review & 12. Technical Design
Major features require an Architecture Decision Record (ADR) submitted to the Architecture Review Board (Doc 25). Code cannot be merged if the ADR is missing or rejected.

### 16. Deployment & 17. Continuous Improvement
Deployment is decoupled from Release via Feature Flags (LaunchDarkly). Deployment is a technical event; Release is a business event.

---

# Agile Engineering (18 - 31)

### 18. Agile, 19. Scrum, 20. Kanban
Scrum is used for predictable feature delivery. Kanban is used for interrupt-driven platform and SRE teams. SAFe (Scaled Agile) governs multi-team dependencies via 10-week PI Planning cycles (Doc 25).

### 27. Definition of Ready (DoR) & 28. Definition of Done (DoD)
*   **DoR:** Story has BDD Acceptance Criteria, UX designs attached, and architectural sign-off.
*   **DoD:** Code merged to `main`, deployed to Staging, 90% unit test coverage, 0 SonarQube vulnerabilities, Feature Flag active.

---

# Source Control & Git Standards (32 - 43)

### 32. Git Strategy & 33. Trunk Based Development
GitFlow is explicitly banned. All developers commit directly to `main` via short-lived branches (lived < 24 hours).
*Anti-Pattern:* A "Release Branch" that sits unmerged for 3 weeks, causing massive integration conflicts.

### 36. Pull Requests & 37. Merge Policies
PRs must be < 400 lines of code. GitHub Branch Protection requires at least one human approval and passing CI checks. Force pushes to `main` are cryptographically disabled.

### 38. Conventional Commits & 39. Semantic Versioning
Commits must follow `<type>[optional scope]: <description>` (e.g., `feat(credit-score): add FICO API integration`). Semantic versioning (SemVer) is automated based on these commit prefixes.

### 42. Repository Templates & 43. CODEOWNERS
Every repository is generated via a Backstage Software Template (Doc 21). A `.github/CODEOWNERS` file mandates that the `DatabaseGuild` must approve any changes to SQLAlchemy models.

---

# Coding Standards & Code Reviews (44 - 64)

### 44. Python Standards & 45. Type Safety
Python 3.12+ with strict `mypy` type hinting is mandatory.
```python
# CORRECT
def calculate_risk(principal: float, term_months: int) -> float:
    pass

# BANNED
def calculate_risk(principal, term_months):
    pass
```

### 48. Formatting & 49. Linting
`ruff` is the standard for both formatting and linting. It runs automatically on pre-commit hooks.

### 59. AI-assisted Code Reviews & 60. Review Checklists
GitHub Copilot Enterprise automatically scans the PR for OWASP vulnerabilities and cyclomatic complexity before human reviewers are notified. "LGTM" without substantial domain feedback is considered a review failure.

---

# Quality Engineering (65 - 85)

### 65. Testing Pyramid & 66. Testing Trophy
IRE heavily weights Integration Tests (Testing Trophy concept) over pure, highly-mocked Unit tests, as integration points are where microservices fail.

### 70. Contract Testing & 71. Consumer Driven Contracts
Pact is used to mathematically guarantee that API changes in the Django Backend do not break the React Frontend.

### 76. Mutation Testing
`mutmut` modifies the application code randomly during CI. If the unit tests still pass despite the mutated code, the tests are deemed inadequate (vanity metrics) and the build fails.

### 83. Mocking & 84. Test Containers
Mocking databases is banned for integration tests. Testcontainers spins up a real, ephemeral Docker PostgreSQL instance for every test suite run.

---

# CI/CD Engineering & Security (86 - 112)

### 89. GitHub Actions & 90. ArgoCD
*   **CI (Continuous Integration):** GitHub Actions builds the Docker image, runs tests, and pushes to JFrog Artifactory.
*   **CD (Continuous Deployment):** ArgoCD (GitOps) continuously syncs the Kubernetes cluster state to match the Helm charts in Git.

### 99. Canary Deployments & 100. Blue-Green Deployments
Argo Rollouts handles Canary deployments. Traffic is shifted 10% $\rightarrow$ 50% $\rightarrow$ 100%. If Datadog detects a 5xx error spike, Argo automatically rolls back.

### 104. SonarQube, 105. CodeQL, 110. Container Scanning
Every PR undergoes Static Application Security Testing (SAST) and Software Composition Analysis (SCA) via Trivy. High/Critical CVEs fail the build immediately.

---

# Engineering Productivity & AI (113 - 134)

### 113. Developer Experience (DevEx) & 114. Internal Developer Platform
Backstage.io (Doc 21) abstracts away Kubernetes YAML. Developers self-serve databases via `catalog-info.yaml`.

### 118. Dev Containers & 120. Ephemeral Environments
Local environments are containerized via `.devcontainer.json` ensuring parity across Mac, Windows, and Linux.

### 126. AI Pair Programming & 127. AI Code Generation
Copilot is mandated. However, AI-generated code must pass the exact same rigorous testing and security gates as human-written code.

---

# Engineering Metrics & Software Supply Chain (135 - 154)

### 135. DORA Metrics & 136. SPACE Framework
*   **DORA:** Focuses on pipeline speed and stability (Lead Time, MTTR).
*   **SPACE:** Focuses on human productivity (Satisfaction, Performance, Activity, Communication, Efficiency).

### 147. Artifact Provenance & 148. SLSA
SLSA (Supply chain Levels for Software Artifacts) Level 3 is enforced. Builds are isolated, and GitHub Actions generates a cryptographically signed provenance attestation for every Docker image.

---

# Organizational Engineering & Governance (155 - 171)

### 155. Platform Engineering
Platform teams treat Domain developers as their customers. They build internal products (APIs, IDP) to eliminate toil.

### 161. Technical Leadership & 163. Principal Engineering
Principals and Distinguished Engineers do not manage people; they manage architecture. They operate across Domain squads to enforce enterprise standards.

---

# 172. Engineering ADRs (Selected)
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `ENG-01` | Trunk-Based Dev | GitFlow | Long-lived branches destroy Continuous Integration and create massive merge risks. |
| `ENG-02` | Pact Contract Tests | E2E Selenium Tests | UI E2E tests are slow and flaky. Pact mathematically proves API compatibility in milliseconds. |
| `ENG-03` | Testcontainers | SQLite Mocks | Mocks hide dialect-specific SQL bugs. Testcontainers ensures production parity. |
| `ENG-04` | SLSA Level 3 Signatures | Unsigned Images | Protects against SolarWinds-style supply chain compromises. |

# 173. Engineering Anti-Patterns
*   **The Hero Culture:** Rewarding engineers for staying up until 3 AM to fix a broken deployment, rather than punishing the lack of automated rollback testing.
*   **Vanity Code Coverage:** Mandating 100% coverage, resulting in developers writing tests with zero assertions just to pass the CI gate.
*   **YAML Engineers:** Forcing Python developers to manually write 500-line Kubernetes Deployment and Service manifests.

# 174. Engineering Fitness Functions
```yaml
# GitHub Actions: Enforce strict Python typing
name: Mypy Strict Type Check
jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run mypy
        run: mypy src/ --strict --disallow-untyped-defs
# Build fails immediately if any function lacks a return type hint.
```

# 175. Production Readiness Checklist
- [ ] Code is merged to `main` via a PR with 1 human and 1 AI review.
- [ ] SonarQube Quality Gate is GREEN.
- [ ] Docker image is signed by Cosign (SLSA Level 3).
- [ ] Helm chart is updated and synced by ArgoCD.
- [ ] Feature Flag is enabled globally.

# 176. Executive Engineering Scorecard
| Category | Status | Owner | Criteria |
| :--- | :--- | :--- | :--- |
| **DORA** | PASS | VP Eng | Lead Time < 1 hour; Change Failure Rate < 2%. |
| **Code Quality** | PASS | Arch Guild| > 90% strict type coverage; < 5% Tech Debt ratio. |
| **Security** | PASS | CISO | 100% of images scanned; 0 High/Critical CVEs. |
| **DevEx** | PASS | Plat Eng | Time-to-10th-PR for new hires < 14 days. |

---
*Approval: Distinguished Engineer, Chief Architect, VP Engineering, Chief Technology Officer*
