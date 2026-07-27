---
Document Name: Data Architecture & Information Management Specification
Document Number: 10
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Principal Data Architect, Enterprise Information Architect
Depends On: 00-09 Architecture Series
---

# 1. Executive Overview
This document defines the comprehensive Data Architecture for the Institutional Risk Engine (IRE). It governs how data is modeled, stored, protected, retrieved, and governed across the Django Modular Monolith, Aurora PostgreSQL, Redis, and Amazon S3.

# 2. Data Architecture Vision
Data is the platform's most valuable asset. The architecture must guarantee 100% referential integrity, absolute isolation in multi-tenant contexts, and strict adherence to immutable auditing principles, ensuring seamless AI vector integration and regulatory compliance.

# 3. Data Principles
*   **Data is Immutable by Default:** Updates are permitted only when mathematically necessary; otherwise, append-only logs prevail.
*   **Schema is Contractual:** Database schemas are strictly governed. No dynamic column generation outside `JSONB`.
*   **Security is Intrinsic:** PII masking and field-level encryption occur at the repository level, invisible to domain logic.

---

# 4. Information Lifecycle (5 - 8)
*   **5. Data Domains:** Segmented into Core Banking (Loans, Customers), Analytics (Reports, SHAP), and AI (Prompts, Transcripts, Vectors).
*   **6. Domain Data Ownership:** Each Bounded Context absolutely owns its database tables. Cross-join SQL queries across Bounded Contexts are mathematically forbidden.
*   **7. Canonical Data Model:** Defines standard payloads (e.g., `MonetaryAmount`, `IdentityReference`) shared across domains.
*   **8. Ubiquitous Language Mapping:** Every table and column MUST exactly match the Domain-Driven Design (DDD) glossary defined in Document 03.

---

# 9. Database Architecture (10 - 13)
*   **9. Aggregate Persistence Strategy:** Aggregates save atomically. Nested entities are serialized into JSONB if they have no independent lifecycle, or stored in child tables if they require direct indexing.
*   **10. PostgreSQL Logical Architecture:** 
    *   Single PostgreSQL Database.
    *   Strict schemas per bounded context (e.g., `schema: loan_context`, `schema: docs_context`).
*   **11. Physical Database Architecture:** Amazon Aurora PostgreSQL (Serverless v2) spanning 3 AZs.
*   **12. Multi-Tenant Data Model & 13. Shared vs Isolated Tenant Strategy:**
    *   *Strategy:* **Shared Database, Shared Schema (Pool Model).**
    *   Every table mandates a `tenant_id` column.
    *   PostgreSQL Row-Level Security (RLS) is evaluated for extreme isolation, but currently, Tenant isolation is enforced via Django Middleware and Repositories (`.filter(tenant_id=ctx.tenant_id)`).

---

# 14. Naming Standards (15 - 16)
*   **14. Schema Naming Standards:** `ctx_{domain_name}` (e.g., `ctx_credit`, `ctx_committee`).
*   **15. Table Naming Standards:** Pluralized, snake_case, prefixed with domain (e.g., `ctx_credit.loan_applications`).
*   **16. Column Naming Standards:** snake_case. Boolean columns prefix with `is_` or `has_`. Date columns end in `_date`. Timestamp columns end in `_at`.

---

# 17. Keys and Constraints (18 - 19)
*   **17. Primary Key Strategy (UUIDv7):** Sequential UUIDv7 is mandated for ALL Primary Keys. This ensures global uniqueness for distributed systems while maintaining database B-Tree index locality (avoiding page fragmentation caused by UUIDv4).
*   **18. Foreign Keys:** Enforced strictly *within* a bounded context. Foreign keys crossing Bounded Contexts are **forbidden**; they must be loosely coupled UUID references.
*   **19. Composite Keys:** Avoided for primary records; permitted for pure many-to-many junction tables.

---

# 20. Essential Columns (21 - 24)
*   **20. Soft Deletes:** Mandated globally. Tables must have `is_deleted` (Boolean) and `deleted_at` (Timestamp).
*   **21. Optimistic Lock Columns:** Every aggregate root must have a `version` (Integer) column incremented on every update.
*   **22. Audit Columns:** Every table must have `created_at`, `updated_at`, `created_by`, and `updated_by`.
*   **23. Temporal Data & 24. Time Zone Standards:** ALL timestamps must be stored in UTC (`TIMESTAMP WITH TIME ZONE`).

---

# 25. Data Types & Guidelines (26 - 30)
*   **25. Monetary Data Standards & 26. Precision:** `NUMERIC(19, 4)` mandated. Floating-point `REAL` is explicitly banned for finance.
*   **27. Enum Strategy:** Stored as `VARCHAR` in the database, mapped to Python `Enum` types in Django. Native PostgreSQL ENUMs are avoided to prevent schema lock issues during zero-downtime deployments.
*   **28. JSONB Usage Guidelines:** Permitted for highly dynamic attributes (e.g., `AI_Agent_Config`). Banned for fields requiring relational integrity.
*   **29. Normalization Rules:** 3rd Normal Form (3NF) minimum for transactional data.
*   **30. Denormalization Policy:** Permitted only in Read Models for performance, updated asynchronously via Domain Events.

---

# 31. Read Models & Analytics (32 - 37)
*   **31. Read Models:** Separate Django models optimized entirely for UI querying, mapping to Read-Only DB tables.
*   **32. Materialized Views:** Used for heavy financial aggregations; refreshed via Celery cron.
*   **33. CQRS Read Database Strategy:** Current state reads from Aurora Read Replicas.
*   **34. Reporting Database:** A dedicated Aurora Reader endpoint is exposed to Metabase/Tableau.
*   **35. Data Warehouse Integration & 36. Lakehouse Strategy (Future):** Daily snapshots exported to Amazon S3 / Snowflake via AWS DMS.
*   **37. ETL / ELT Architecture:** Shift towards ELT (Extract, Load, Transform). Raw data is loaded into the Warehouse, transformations run via dbt.

---

# 38. Event and Change Data (39 - 44)
*   **38. CDC (Change Data Capture):** Debezium captures WAL logs for streaming to the Data Warehouse.
*   **39. Transactional Outbox:** Ensures reliable domain event publishing (Defined in Doc 05).
*   **40. Event Persistence & 41. Retention:** All emitted events are archived to S3 for 7 years.
*   **42. Event Replay:** Supported via S3 retrieval scripts for disaster recovery or Read Model rebuilds.
*   **43. Event Versioning:** Managed via schema registries (Doc 05).
*   **44. Data Lineage:** Maintained via `correlation_id` and `causation_id` tracing from UI entry to final reporting.

---

# 45. Metadata & Governance (46 - 50)
*   **45. Metadata Catalog:** Alation/Collibra tracks data origins.
*   **46. Data Dictionary & 47. Business Glossary:** Maintained in Backstage.io.
*   **48. Master Data Management (MDM):** 'Customer' is Master Data, managed by the Identity Context.
*   **49. Reference Data:** Static data (e.g., ISO Country Codes) cached in Redis upon application boot.
*   **50. Configuration Data:** Managed via LaunchDarkly (Dynamic) or Settings.py (Static).

---

# 51. AI & Vector Data Architecture (52 - 57)
*   **51. AI Prompt Data:** Stored relationally (`prompt_id`, `version`, `text`).
*   **52. AI Conversation History:** Transcripts stored in `JSONB` on the `CommitteeSession` aggregate.
*   **53. Vector Embeddings & 54. pgvector Design:**
    *   Embeddings stored in `vector(1536)` columns.
    *   Indexes: `HNSW` (Hierarchical Navigable Small World) utilizing `m=16, ef_construction=64`.
*   **55. Embedding Lifecycle:** Async Celery tasks generate embeddings.
*   **56. RAG Storage & 57. Chunking Strategy:** Documents are chunked (500 tokens, 50 token overlap). Table `document_chunks` contains `chunk_id`, `document_id`, `text`, and `embedding`.

---

# 58. File & Object Storage (59 - 62)
*   **58. OCR Data Storage:** Raw JSON from AWS Textract stored in S3; key entities parsed and stored relationally.
*   **59. Document Storage:** Primary PDF assets in S3.
*   **60. File Metadata:** Relational table `document_metadata` stores S3 URI, size, mime-type, and virus scan status.
*   **61. Binary Asset Strategy:** Never stored in PostgreSQL (No `BYTEA` blobs).
*   **62. Data Compression:** Historical text logs compressed via Snappy before S3 archival.

---

# 63. Data Security & Compliance (64 - 70)
*   **63. Encryption at Rest:** AWS KMS (AES-256) for all storage mediums.
*   **64. Field-Level Encryption (FLE):** SSNs and Tax IDs encrypted *within* the Python application using `cryptography.fernet` before DB persistence.
*   **65. Data Masking:** Developer databases use `faker` to replace PII with synthetic data.
*   **66. Tokenization:** Credit Card PANs are tokenized externally.
*   **67. PII Classification:** Macie scans S3 to ensure no unencrypted PII leaks into Analytics buckets.
*   **68. Sensitive Data Handling:** Strict logging filters prevent passwords or FLE fields from printing to `stdout`.
*   **69. GDPR Compliance & 70. Right to Erasure:** A specialized "Forget Me" Celery workflow nullifies PII while retaining anonymized data for statistical validity.

---

# 71. Retention & Archival (72 - 75)
*   **71. Data Retention & 72. Data Archival:** 7-year regulatory retention standard.
*   **73. Purge Policies:** Scheduled cron jobs delete `soft_deleted` rows older than 30 days from hot tables to optimize index size.
*   **74. Backup Metadata & 75. Recovery Metadata:** Tagged in AWS Backup with RPO/RTO SLAs to automate compliance reporting.

---

# 76. Data Quality & Integrity (77 - 83)
*   **76. Data Quality Framework:** Great Expectations runs against the Data Warehouse.
*   **77. Completeness & 78. Accuracy:** DB `NOT NULL` constraints and `CHECK` constraints enforce structural accuracy.
*   **79. Consistency & 80. Referential Integrity:** FK constraints within contexts ensure orphaned rows are mathematically impossible.
*   **81. Validation Rules:** Domain entities enforce business invariants.
*   **82. Duplicate Detection:** Unique constraints on `(tenant_id, business_key)`.
*   **83. Data Reconciliation:** Nightly scripts ensure Outbox tables match the Event Archive in S3.

---

# 84. Analytics & AI Workflows (85 - 94)
*   **84. Batch Processing:** Nightly Portfolio Risk evaluation (Celery).
*   **85. Streaming Data:** Domain Events streamed via Redis Streams.
*   **86. Analytics Data Flow & 87. BI Integration:** Metabase connected to Aurora Read Replicas.
*   **88. Regulatory Reporting:** Automated generation of CFPB HMDA files.
*   **89. Audit Reporting:** S3 WORM storage for immutable security logs.
*   **90. Explainability Data & 91. SHAP Storage:** SHAP arrays persisted as `JSONB` for UI rendering.
*   **92. AI Evaluation Storage & 93. Model Registry Metadata:** Metadata regarding prompt execution times, token usage, and LLM provider stored for cost attribution.
*   **94. Feature Store (Future):** Feast integration planned for real-time ML feature serving.

---

# 95. Data Governance & Access (96 - 100)
*   **95. Data Governance:** Overseen by the Enterprise Risk Committee.
*   **96. Stewardship & 97. Data Ownership:** Domain Tech Leads are the Data Stewards.
*   **98. Access Policies:** Zero direct human access to Production PostgreSQL.
*   **99. Fine-Grained Authorization:** Django Object-Level Permissions via `django-guardian`.
*   **100. Row-Level Security Strategy:** (Future) PostgreSQL RLS utilizing `current_setting('app.tenant_id')`.

---

# 101. Database Operations (102 - 114)
*   **101. Backup Architecture & 102. PITR:** 35-day Point-In-Time Recovery in Aurora.
*   **103. Disaster Recovery:** Cross-region async replication to US-West-2.
*   **104. Replication & 105. Read Replicas:** Synchronous Multi-AZ within the region; up to 15 Read Replicas supported.
*   **106. Partitioning Strategy:** Range partitioning by `created_at` (monthly) for audit tables exceeding 10M rows.
*   **107. Indexing Strategy:** B-Tree for highly selective queries; GIN for JSONB and Full-Text Search.
*   **108. HNSW Indexes:** Re-indexed during off-peak hours to maintain vector recall accuracy.
*   **109. Query Optimization:** `EXPLAIN ANALYZE` mandatory for any query taking > 50ms.
*   **110. Vacuum Strategy:** Autovacuum tuned aggressively for highly transactional Outbox tables to prevent bloat.
*   **111. Statistics Management:** `ANALYZE` scheduled post-batch loads.
*   **112. Database Maintenance:** Zero-downtime upgrades via Blue-Green deployments in Aurora.
*   **113. Migration Governance & 114. Django Migration Standards:**
    *   No destructive migrations (e.g., `RemoveField`) allowed. Must follow a 2-phase deployment (Deprecate -> Drop).
    *   `RunPython` data migrations must execute asynchronously via Celery if > 10,000 rows.

---

# 115. Data Architecture Decision Records (ADRs) (Selected)
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `DAT-01` | UUIDv7 Primary Keys | Auto-increment IDs | UUIDv7 prevents B-Tree fragmentation while allowing distributed generation. |
| `DAT-02` | `NUMERIC(19,4)` for Money | `REAL` / `FLOAT` | Floating-point math creates unacceptable rounding errors in finance. |
| `DAT-03` | Shared DB, Shared Schema Multi-Tenancy | DB-per-Tenant | DB-per-Tenant hits connection limits instantly at 1,000 tenants. |
| `DAT-04` | HNSW over IVFFlat for Vectors | IVFFlat | HNSW provides vastly superior recall for regulatory RAG queries. |
| `DAT-05` | UTC Enforced at DB Layer | Local Timezones | Prevents catastrophic scheduling bugs across global regions. |
| `DAT-06` | Django `JSONB` for Transcripts | Relational Tables | Transcript turns are an immutable blob with no independent lifecycle. |

# 116. Data Anti-Patterns
*   **Boolean Obsession:** Using 5 boolean columns instead of an `EntityStatus` Enum.
*   **N+1 Queries:** Failing to use `.select_related()` or `.prefetch_related()` in Django.
*   **Fat Transactions:** Running an HTTP call to OpenAI inside a `transaction.atomic()` block.

# 117. Validation Checklists & 118. Readiness Checklists
- [ ] Database migrations pass `makemigrations --check` in CI.
- [ ] PII Field-Level Encryption verified via database introspection.
- [ ] pgvector HNSW indexes successfully created on production schema.

# 119. Future Roadmap
*   Migrating to an Event Sourcing architecture for the Core Credit Decisioning engine.
*   Implementing PostgreSQL Row-Level Security (RLS) for defense-in-depth tenant isolation.

# 120. Data Fitness Functions
```python
def test_no_cross_boundary_foreign_keys():
    # Enforces that Loan context cannot have an FK to Document context
    assert not db_schema.has_cross_boundary_fks(allowed_exceptions=[])
```

# 121. Final Data Scorecard
| Domain | Status | Owner | Criteria |
| :--- | :--- | :--- | :--- |
| **Data Modeling** | PASS | Data Arch | UUIDv7, 3NF, Canonical Naming enforced. |
| **Performance** | PASS | DBA | Read Replicas active, Indexes tuned. |
| **Security** | PASS | CISO | KMS + FLE Encryption active. |
| **Governance** | PASS | Risk Comm | Data retention and PII masks validated. |

---
*Approval: Principal Data Architect, CISO, CTO*
