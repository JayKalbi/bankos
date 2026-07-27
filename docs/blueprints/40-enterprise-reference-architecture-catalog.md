---
Document Name: Enterprise Reference Architecture Catalog
Document Number: 40
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Chief Enterprise Architect, Distinguished Solution Architect, Chief Technology Officer
Depends On: 00-39 Architecture Standards
---

# Executive Overview
The **Enterprise Reference Architecture Catalog** marks the transition from Phase 1 (Enterprise Governance & Policy) to Phase 2 (Implementation Blueprints) within the Institutional Risk Engine (IRE) documentation repository. Documents 00–39 mathematically defined the boundaries of the playing field—establishing rigorous standards for security, data governance, FinOps, SRE, and AI. 

Document 40 is the definitive taxonomy and master index for the 40 specific, production-ready solution blueprints (Documents 41–80) that engineering teams will adopt to construct the Bank. It dictates how blueprints are classified, versioned, reviewed, and mapped to the business capabilities of a Tier-1 global bank.

# Architecture Blueprint Consumption Guide
Engineering squads are expected to consume this catalog during the "Design" phase of the SDLC. 
1. **Identify Business Need:** The squad identifies the core capability required (e.g., streaming real-time events).
2. **Consult Selection Matrix:** The squad reviews the *Architecture Pattern Selection Matrix* to locate the exact blueprint required (e.g., `12 Event Streaming Platform`).
3. **Inherit & Deploy:** The squad utilizes the Backstage Internal Developer Portal to instantiate the blueprint. They do not write the Terraform from scratch; they parameterize the approved baseline.

# Architecture Pattern Selection Matrix
| Problem Domain | Recommended Architecture Pattern | Target Blueprint |
| :--- | :--- | :--- |
| High-throughput Async Messaging | Event-Driven Architecture (EDA) | `12 Event Streaming Platform` |
| Synchronous B2B Integration | API Gateway Pattern | `03 API Banking Platform` |
| Long-running Stateful Processes| Workflow Orchestration | `32 Enterprise Workflow Platform` |
| AI Chatbot with Internal Data | Retrieval-Augmented Gen (RAG) | `16 Enterprise RAG Platform` |

# Golden Path Adoption Policy
We reject "Snowflake Architecture." An engineering squad does not get to invent a custom way to deploy a database or route an API. 
*   **Golden Paths:** If a team adopts a reference architecture exactly as prescribed, they inherit 100% of the enterprise compliance, DR, and security approvals.
*   **Deviations:** Any deviation from the Golden Path requires a formal Architecture Waiver (see Doc 35), stripping the squad of automatic ARB approval and requiring manual security penetration testing.

# Cross Blueprint Dependency Matrix
Blueprints are highly composable. Foundational platforms must be established before Capability platforms can be deployed.
*   **Level 0:** `24 Kubernetes Platform`, `28 Enterprise IAM Platform`, `27 Zero Trust Enterprise`
*   **Level 1:** `12 Event Streaming Platform`, `10 Data Platform`
*   **Level 2:** `04 Credit Risk Engine`, `06 Payment Processing Platform`
*(e.g., You cannot deploy the Credit Risk Engine until the Kubernetes and IAM platforms are fully operational).*

---

# Blueprint Governance, Lifecycle & Inheritance

## Reference Architecture Repository Layout
The documentation repository is structured to separate governance from implementation:
*   `docs/00-39-governance/` (Phase 1: Enterprise Standards)
*   `docs/41-80-blueprints/` (Phase 2: Technical Architectures)
*   `docs/adr/` (Architecture Decision Records)
*   `templates/` (Backstage Software Templates executing the blueprints)

## Architecture Template Structure
Every individual blueprint (Documents 41-80) MUST strictly adhere to the following structure to ensure consistency:
1. Executive Overview & Business Problem
2. Logical & Physical Architecture (with Mermaid C4 Models)
3. Technology Stack & Cloud Deployment Model
4. High Availability & Disaster Recovery Topologies
5. Implementation Details (Code snippets: Terraform, K8s YAML, Python)
6. Production Readiness Checklist & Executive Scorecard

## Blueprint Quality Gates
Before a new Blueprint can be published to this catalog as "Active", it must pass the ARB Quality Gates:
1. **Security Gate:** Threat model completed and signed off by CISO.
2. **FinOps Gate:** Cost-per-transaction modeled and optimized.
3. **SRE Gate:** Chaos testing and DR failover successfully executed in Staging.

## Reference Architecture Certification Levels
*   **Level 1 (Draft):** Visio diagram exists. Under active design.
*   **Level 3 (Defined):** Documented architecture with Threat Model and ADRs.
*   **Level 5 (Production-Ready):** Fully codified in Terraform/ArgoCD, proven in production with automated DR testing. Only Level 5 architectures may be consumed by product squads.

## Reference Architecture Evolution Policy
Blueprints are versioned like software (`v1.0.0`). The ARB reviews all Active blueprints on a strict **Semi-Annual** cadence to ensure alignment with the latest Technology Radar (Doc 35).
*   **Active:** The standard. All new projects must use this version.
*   **Deprecated:** Replaced by a newer version. Existing deployments are safe, but no new deployments are permitted.
*   **Retired:** Non-compliant. Existing deployments must be migrated within 180 days.

---

# Enterprise Architecture Mapping & Models

## Mapping Between Business Capabilities and Architecture Blueprints
| Business Capability | Owning Domain | Primary Blueprint Dependency |
| :--- | :--- | :--- |
| Core Ledger / Balances | Retail Banking | `01 Enterprise Banking Platform` |
| Consumer App Access | Digital Channels | `02 Digital Banking Platform` |
| Risk Scoring & Decisioning | Risk Management | `04 Credit Risk Engine` |
| Fraud Monitoring | Risk Management | `05 Fraud Detection Platform` |
| Transaction Execution | Payments | `06 Payment Processing Platform` |
| Financial Regulatory Reporting | Finance / CFO | `38 Regulatory Reporting Platform` |

## Technology Stack Mapping
| Layer | Standard Enterprise Stack |
| :--- | :--- |
| **Compute** | AWS EKS (Kubernetes), AWS Lambda |
| **Data (Relational)** | PostgreSQL (Aurora), CockroachDB |
| **Data (Streaming)** | Apache Kafka (Confluent) |
| **AI / ML** | MLflow, AWS Bedrock, Pinecone |
| **Observability** | OpenTelemetry, Datadog, Prometheus |

---

# Enterprise Reference Architecture Catalog

The following is the canonical index of the 40 Enterprise Reference Architectures.

---

### 01 Enterprise Banking Platform
*   **Purpose:** The core operational ledger system managing accounts, balances, and atomic financial transactions.
*   **Business capabilities:** Account Management, Ledger Management, Interest Calculation.
*   **Primary users:** Core Banking Operations, Finance.
*   **Technology stack:** PostgreSQL (Aurora), Kafka, Spring Boot / Java, AWS EKS.
*   **Cloud deployment model:** AWS Multi-Region (Active-Active).
*   **Security classification:** Restricted (PCI/MNPI).
*   **Criticality tier:** Tier-0.
*   **RTO/RPO:** RTO < 15 Min, RPO < 1 Sec.
*   **Related ADRs:** `ARCH-01-Ledger-ACID`.
*   **Dependencies:** `28 Enterprise IAM`, `31 Enterprise Integration`.
*   **Success metrics:** Transaction throughput (TPS), Ledger consistency (0 drift).

### 02 Digital Banking Platform
*   **Purpose:** The omni-channel customer-facing portal and mobile application backend.
*   **Business capabilities:** Mobile Banking, Web Banking, Customer Self-Service.
*   **Primary users:** Retail & Corporate Customers.
*   **Technology stack:** React/React Native, Node.js, GraphQL (Apollo), Redis.
*   **Cloud deployment model:** AWS Multi-AZ.
*   **Security classification:** Confidential (PII).
*   **Criticality tier:** Tier-1.
*   **RTO/RPO:** RTO < 4 Hours, RPO < 15 Min.
*   **Dependencies:** `01 Enterprise Banking Platform`, `03 API Banking Platform`.
*   **Success metrics:** Sub-100ms API latency, App Store ratings.

### 03 API Banking Platform
*   **Purpose:** The external perimeter gateway handling Open Banking (PSD2), B2B integrations, and third-party developers.
*   **Business capabilities:** Open Banking API, Partner Integration, API Monetization.
*   **Technology stack:** Kong API Gateway, OAuth2, WAF, Redis Rate Limiting.
*   **Security classification:** Confidential.
*   **Criticality tier:** Tier-0.
*   **Dependencies:** `27 Zero Trust Enterprise`, `01 Enterprise Banking Platform`.
*   **Success metrics:** API Uptime (99.99%), Invalid requests blocked at edge.

### 04 Credit Risk Engine
*   **Purpose:** The algorithmic decision engine that evaluates loan applications in real-time based on internal/external data.
*   **Business capabilities:** Credit Scoring, Default Prediction, Underwriting.
*   **Technology stack:** Python (FastAPI), XGBoost, MLflow, Feature Store, PostgreSQL.
*   **Criticality tier:** Tier-0.
*   **RTO/RPO:** RTO < 15 Min, RPO < 1 Sec.
*   **Dependencies:** `14 Enterprise ML Platform`, `09 Customer 360`.
*   **Success metrics:** Inference latency < 200ms, Model fairness (AIR > 0.80).

### 05 Fraud Detection Platform
*   **Purpose:** Real-time stream processing engine evaluating transactional anomalies to block fraudulent payments.
*   **Technology stack:** Apache Flink, Kafka, Cassandra, Graph Database (Neo4j).
*   **Criticality tier:** Tier-0.
*   **Dependencies:** `12 Event Streaming Platform`, `06 Payment Processing`.
*   **Success metrics:** False-positive ratio < 2%, Sub-50ms evaluation time.

### 06 Payment Processing Platform
*   **Purpose:** The orchestration engine routing atomic fund transfers (ACH, Wire, SWIFT, SEPA).
*   **Technology stack:** Temporal.io, Java, PostgreSQL, Kafka.
*   **Criticality tier:** Tier-0.
*   **Dependencies:** `01 Enterprise Banking Platform`, `05 Fraud Detection Platform`.

### 07 Treasury Platform
*   **Purpose:** Manages the bank's liquidity, funding, capital reserves, and FX hedging.
*   **Technology stack:** Python, Snowflake, ActivePivot.
*   **Criticality tier:** Tier-1.

### 08 AML Platform
*   **Purpose:** Anti-Money Laundering (AML) transaction monitoring, KYC validation, and Suspicious Activity Reporting (SAR).
*   **Criticality tier:** Tier-1.
*   **Dependencies:** `10 Data Platform`, `09 Customer 360 Platform`.

### 09 Customer 360 Platform
*   **Purpose:** The Master Data Management (MDM) implementation providing a single, immutable golden record of every customer.
*   **Technology stack:** MongoDB, Kafka Connect, Elasticsearch.
*   **Criticality tier:** Tier-1.

### 10 Data Platform
*   **Purpose:** The foundational data mesh, providing standardized ingestion, storage, and querying of raw business data.
*   **Technology stack:** S3, AWS Glue, Snowflake, dbt.
*   **Criticality tier:** Tier-1.

### 11 Lakehouse Platform
*   **Purpose:** Convergence of the Data Warehouse and Data Lake using open table formats for scalable ML training.
*   **Technology stack:** Apache Iceberg, Trino, Spark.
*   **Criticality tier:** Tier-2.

### 12 Event Streaming Platform
*   **Purpose:** The central nervous system of the bank, handling real-time asynchronous data flow.
*   **Technology stack:** Confluent Kafka, Schema Registry (Avro).
*   **Criticality tier:** Tier-0.

### 13 Real-time Analytics Platform
*   **Purpose:** Providing millisecond-latency analytical queries for operational dashboards (e.g., live liquidity monitoring).
*   **Technology stack:** ClickHouse, Kafka.
*   **Criticality tier:** Tier-1.

### 14 Enterprise ML Platform
*   **Purpose:** The MLOps foundation for model training, registry, and traditional inference.
*   **Technology stack:** Kubeflow, MLflow, AWS SageMaker.
*   **Criticality tier:** Tier-1.

### 15 MLOps Platform
*   **Purpose:** Automated pipelines (CI/CD for ML) ensuring models are retrained, validated for drift, and safely deployed.
*   **Dependencies:** `14 Enterprise ML Platform`.

### 16 Enterprise RAG Platform
*   **Purpose:** The cognitive search layer allowing LLMs to answer questions grounded strictly in internal banking documentation.
*   **Technology stack:** Pinecone, LangChain, OpenAI/Bedrock.
*   **Criticality tier:** Tier-1.

### 17 AI Agent Platform
*   **Purpose:** The orchestration framework for autonomous, multi-step AI agents (e.g., AI Co-pilots for customer support).
*   **Technology stack:** LangGraph, Temporal.io.
*   **Criticality tier:** Tier-2 (Currently experimental).

### 18 LLM Gateway Platform
*   **Purpose:** The AI firewall providing semantic caching, PII scrubbing (DLP), and FinOps token tracking for all LLM calls.
*   **Technology stack:** LiteLLM / Kong AI Gateway, Redis.
*   **Criticality tier:** Tier-1.

### 19 Knowledge Graph Platform
*   **Purpose:** Mapping complex relationships (e.g., identifying fraud rings via shared addresses and phone numbers).
*   **Technology stack:** Neo4j / AWS Neptune.
*   **Criticality tier:** Tier-1.

### 20 Vector Search Platform
*   **Purpose:** The embedding storage engine powering semantic search and RAG retrieval.
*   **Technology stack:** PostgreSQL (pgvector) / Pinecone.
*   **Criticality tier:** Tier-1.

### 21 Platform Engineering Platform
*   **Purpose:** The foundational control plane providing self-service infrastructure to product developers.
*   **Technology stack:** Crossplane, ArgoCD, Terraform.
*   **Criticality tier:** Tier-0.

### 22 Internal Developer Platform
*   **Purpose:** The front-end portal abstracting infrastructure complexity via Software Templates.
*   **Technology stack:** Backstage (Spotify).
*   **Criticality tier:** Tier-1.

### 23 Multi-tenant SaaS Platform
*   **Purpose:** Architecture for white-labeling banking capabilities to regional partners (B2B2C).
*   **Criticality tier:** Tier-1.

### 24 Kubernetes Platform
*   **Purpose:** The standardized compute substrate for all containerized workloads.
*   **Technology stack:** AWS EKS, Cilium (CNI), Istio (Service Mesh).
*   **Criticality tier:** Tier-0.

### 25 Hybrid Cloud Platform & 26 Multi-cloud Platform
*   **Purpose:** Ensuring portability to on-premise or Azure environments via Kubernetes abstraction to prevent AWS lock-in.
*   **Criticality tier:** Tier-1.

### 27 Zero Trust Enterprise
*   **Purpose:** Architecture ensuring no implicit trust is granted based on network location; every request is cryptographically authenticated.
*   **Technology stack:** Istio mTLS, SPIFFE/SPIRE.
*   **Criticality tier:** Tier-0.

### 28 Enterprise IAM Platform
*   **Purpose:** Centralized Identity and Access Management for workforce and customer authentication.
*   **Technology stack:** Okta (Workforce), Auth0 (CIAM), AWS IAM Identity Center.
*   **Criticality tier:** Tier-0.

### 29 Observability Platform & 30 SRE Platform
*   **Purpose:** The unified collection of metrics, traces, and logs.
*   **Technology stack:** OpenTelemetry, Prometheus, Datadog, Splunk.
*   **Criticality tier:** Tier-1.

### 31 Enterprise Integration Platform
*   **Purpose:** Managed file transfers, legacy ESB connections, and batch ETL routing.
*   **Technology stack:** Apache Camel, AWS Step Functions.
*   **Criticality tier:** Tier-1.

### 32 Enterprise Workflow Platform
*   **Purpose:** Orchestrating long-running, stateful business processes (e.g., a 14-day mortgage approval flow).
*   **Technology stack:** Temporal.io, Camunda.
*   **Criticality tier:** Tier-1.

### 33 Enterprise Messaging Platform
*   **Purpose:** Legacy async messaging (Queues/Topics) distinct from event-streaming logs.
*   **Technology stack:** RabbitMQ, AWS SQS/SNS.
*   **Criticality tier:** Tier-1.

### 34 Enterprise Search Platform
*   **Purpose:** Providing ultra-fast, faceted full-text search across the bank's datasets.
*   **Technology stack:** Elasticsearch / OpenSearch.
*   **Criticality tier:** Tier-1.

### 35 Document Intelligence Platform
*   **Purpose:** Optical Character Recognition (OCR) and NLP to digitize and extract data from physical forms/IDs.
*   **Technology stack:** AWS Textract, Python (Transformers).
*   **Criticality tier:** Tier-2.

### 36 Enterprise Security Operations Platform
*   **Purpose:** SIEM, SOAR, and Vulnerability Management architectures.
*   **Technology stack:** Splunk Enterprise Security, CrowdStrike.
*   **Criticality tier:** Tier-0.

### 37 Business Continuity Platform
*   **Purpose:** The GitOps automation pipelines and immutable storage vaults enabling catastrophic recovery.
*   **Technology stack:** AWS S3 Object Lock, ArgoCD.
*   **Criticality tier:** Tier-0.

### 38 Regulatory Reporting Platform
*   **Purpose:** Automated data aggregation to fulfill Basel III, OCC, and Fed reporting requirements.
*   **Technology stack:** Snowflake, dbt.
*   **Criticality tier:** Tier-1.

### 39 Enterprise Data Governance Platform
*   **Purpose:** The Data Catalog, Data Lineage tracking, and Data Contract validation engine.
*   **Technology stack:** Collibra, OpenLineage, Confluent Schema Registry.
*   **Criticality tier:** Tier-1.

### 40 Executive Intelligence Platform
*   **Purpose:** High-level dashboards aggregating risk, finance, and operational KPIs for the C-Suite.
*   **Technology stack:** Tableau / PowerBI.
*   **Criticality tier:** Tier-2.

---
*Approval: Chief Enterprise Architect, Distinguished Solution Architect, Chief Technology Officer*
