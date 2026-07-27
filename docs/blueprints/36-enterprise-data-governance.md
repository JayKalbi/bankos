---
Document Name: Enterprise Data Governance, Data Quality, Master Data Management (MDM), Metadata, Data Catalog, Data Lineage, Data Stewardship & Enterprise Information Management Specification
Document Number: 36
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Chief Data Officer (CDO), Distinguished Data Architect, Chief Enterprise Architect
Depends On: 00-35 Architecture Series
---

# 1. Enterprise Data Governance Vision
The Institutional Risk Engine (IRE) treats data not as a byproduct of applications, but as the Bank's most critical autonomous asset. This specification defines the enterprise governance frameworks required to comply with BCBS 239 (Risk Data Aggregation) and GDPR, ensuring that every byte of data flowing through IRE is owned, classified, lineage-tracked, and mathematically verified for quality.

# 2. Data Ownership & 3. Data Stewardship
Data is not owned by IT; it is owned by the Business.
*   **Business Data Owner (BDO):** A Managing Director accountable for the definition, quality, and regulatory compliance of a specific data domain (e.g., the MD of Credit Risk).
*   **Data Steward:** The operational expert appointed by the BDO who handles day-to-day data classification, glossary definition, and quality dispute resolution.
*   **Data Custodian:** The IT Platform Engineering team responsible for the physical storage, encryption, and safe transport of the data.

---

# Data Mesh & Data Products (7 - 10)

### 7. Domain-Oriented Data Ownership & 8. Data Mesh Governance
IRE rejects the monolithic Enterprise Data Warehouse pattern. We utilize a **Data Mesh**. The "Credit Scoring Squad" owns the operational database AND the analytical data products they generate. They are responsible for serving their analytical data to the enterprise via governed interfaces.

### 9. Data Products & 10. Data Contracts
Data is published as a "Product." To prevent downstream breakages, every Data Product is bound by a strict **Data Contract** defining schema, SLAs, and semantics.
```yaml
# Data Contract Example (YAML)
dataset: ire_core.credit_risk.loan_origination
owner: team-credit-risk@ire.bank.com
sla:
  freshness: < 15 minutes
  availability: 99.9%
schema:
  type: avro
  version: 1.4.2
  fields:
    - name: application_id
      type: string
      pii: false
    - name: applicant_ssn_hash
      type: string
      pii: true
      masking: SHA-256
```
If the upstream team attempts to push a schema change that violates this contract, the CI/CD pipeline fails the build automatically.

---

# Classification & Regulatory Compliance (11 - 17)

### 11. Data Classification
All data elements must be explicitly tagged in the Data Catalog:
*   **Public:** Unrestricted (e.g., Marketing copy).
*   **Internal:** Employee general data.
*   **Confidential (PII/PCI):** Subject to GDPR, CCPA, PCI DSS. Requires At-Rest and In-Transit encryption.
*   **Restricted (MNPI):** Material Non-Public Information. Access requires explicit HR and Compliance clearance.

### 15. BCBS 239 Compliance
The Basel Committee on Banking Supervision (BCBS) standard 239 demands accuracy, integrity, completeness, and timeliness of risk data. To comply, IRE mandates fully automated column-level data lineage from the source transactional system to the final executive risk dashboard.

---

# Data Quality & Observability (18 - 20, 44 - 49)

### 18. Data Quality Framework & 19. Data Quality Dimensions
Data Quality (DQ) is measured across 6 mathematical dimensions:
1.  **Accuracy:** Does the loan amount match the signed contract?
2.  **Completeness:** Are there any NULLs in mandatory regulatory fields?
3.  **Consistency:** Does `Client_ID = 123` mean the same thing in the CRM and the Risk Engine?
4.  **Timeliness:** Is the data fresher than the 15-minute SLA?
5.  **Validity:** Does the `Country_Code` adhere to ISO 3166?
6.  **Uniqueness:** Are there duplicate transactions?

### 44. Data Observability & 47. Data SLIs / SLOs
Instead of manually writing thousands of SQL quality checks, we utilize Data Observability platforms (e.g., Monte Carlo) that apply Machine Learning to historical data distributions. If the daily total loan origination volume suddenly drops by 40% compared to historical Tuesdays, the system alerts the Data Stewards before a downstream executive sees a broken dashboard.

---

# Metadata & Data Lineage (21 - 29)

### 25. Enterprise Data Catalog & 26. Data Discovery
Collibra (or Alation) serves as the Enterprise Data Catalog. It is the "Google Search" for enterprise data. Before an engineer can request a new database table, they must search the catalog to ensure the data does not already exist.

### 27. End-to-End Lineage & 28. Column-Level Lineage
OpenLineage standardizes the emission of metadata. When an Apache Spark job transforms data from S3 to Snowflake, it emits a JSON payload to the lineage backend, mapping exactly which input column produced which output column. This is legally required to prove to regulators how a specific Risk Score was calculated.

---

# Master Data Management (MDM) (30 - 35)

### 30. Master Data Management & 31. Golden Records
IRE cannot have 5 different definitions of "A Customer." MDM defines the exact algorithm to consolidate records from CRM, Core Banking, and KYC systems into a single, immutable **Golden Record** (Customer 360).

### 33. Reference Data & 34. Enterprise Taxonomy
Reference Data (e.g., Currency Codes, Industry Standard Classifications, Legal Entity Identifiers) is strictly centrally managed. Microservices are forbidden from hardcoding currency codes; they must query or cache the Enterprise Reference Data API.

---

# AI Governance & Ethics (53 - 59)

### 53. AI Training Data Governance & 55. Vector Data Governance
Machine Learning models are only as unbiased as their training data.
*   **Bias Detection:** All training datasets must be scanned for protected class bias (Race, Gender, Age) before an ML model can be promoted to production.
*   **Vector DB Lineage:** Embeddings stored in `pgvector` or Pinecone must retain metadata linking back to the raw source text to facilitate "Right to be Forgotten" (GDPR) deletion requests.

### 58. Data Ethics
A capability being technically feasible does not make it ethically permissible. The Data Governance Council must explicitly approve the ethical use of alternative data (e.g., scraping social media for credit scoring), which is currently strictly banned in IRE.

---

# 60. Data Governance ADRs
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `DAT-01` | Data Mesh Architecture | Centralized Data Lake | Centralized data teams become massive bottlenecks. Distributing data ownership to the domains (Mesh) enables agile scaling while enforcing global interoperability standards. |
| `DAT-02` | CI/CD Enforced Data Contracts | Wiki Documentation | Schemas evolve. If a data contract is just a Wiki page, downstream pipelines will silently break. Contracts must be enforced as YAML in the CI/CD pipeline. |
| `DAT-03` | Automated OpenLineage | Manual Visio Diagrams | Manual lineage for BCBS 239 compliance is impossible at the scale of 10,000 tables. Lineage must be autonomously emitted by the compute engines (Spark, dbt, Snowflake). |
| `DAT-04` | Multi-Tiered MDM | Allowing microservices to own Core Entities | The definition of a "Customer" or "Legal Entity" is a bank-wide concern, not a microservice concern. Golden Records must be governed centrally. |

# 61. Governance Anti-Patterns
*   **The Data Swamp:** Dumping raw JSON into an S3 Data Lake for 5 years without enforcing schema, cataloging, or metadata, rendering the data completely unusable for analytics.
*   **The Orphaned Dataset:** A critical regulatory report powered by a database where the original creator left the bank 4 years ago and no one knows how the ETL pipeline works.
*   **Schema Drift:** A developer drops a column in the Postgres operational database, instantly breaking 4 Tableau dashboards and 2 ML training pipelines downstream.
*   **Shadow IT Data Marts:** Business analysts extracting production data via CSV and joining it in Microsoft Excel to calculate enterprise risk metrics.

# 62. Data Governance Fitness Functions
```yaml
# GitHub Actions: Data Contract Enforcement
name: Data Contract Validation
jobs:
  validate-schema-evolution:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Run Schema Registry Compatibility Check
        run: |
          confluent schema-registry compatibility validate \
          --subject ire-credit-loan-origination \
          --schema schemas/loan_origination.avsc
# The pipeline fails if the schema change is not backwards compatible.
```

# 63. Production Readiness Checklist
- [ ] Every column containing PII/PCI is explicitly tagged in the Enterprise Data Catalog.
- [ ] A Business Data Owner (BDO) is formally assigned and recorded in the Data Catalog.
- [ ] Data Contracts are defined in YAML and registered in the centralized schema registry.
- [ ] Data retention policies (Time-to-Live) are mathematically enforced on the storage layer.
- [ ] OpenLineage instrumentation is active on all data transformation jobs.
- [ ] AI training data sets have passed algorithmic bias and variance testing.

# 64. Executive Data Governance Scorecard
| Category | Status | Owner | Criteria | Trend |
| :--- | :--- | :--- | :--- | :--- |
| **Catalog Coverage** | PASS | CDO | > 95% of Tier-0 data products are documented in the Catalog. | ↗️ Improving |
| **Data Quality (DQ)** | PASS | BDOs | 99.9% of Tier-0 datasets pass their mathematical DQ assertions. | ➡️ Stable |
| **Lineage Completeness**| PASS | Data Arch | 100% of regulatory reports have unbroken column-level lineage. | ➡️ Stable |
| **Contract Violations** | PASS | Plat Ops | 0 backwards-incompatible schema changes merged to mainline. | ➡️ Stable |
| **AI Data Bias** | PASS | Chief Risk | 0 training datasets flagged for protected-class statistical bias. | ↗️ Improving |

---
*Approval: Chief Data Officer (CDO), Distinguished Data Architect, Chief Enterprise Architect*
