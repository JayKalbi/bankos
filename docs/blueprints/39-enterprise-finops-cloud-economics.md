---
Document Name: Enterprise FinOps, Cloud Economics, Cost Governance, Capacity Management & Technology Investment Specification
Document Number: 39
Version: 1.0
Status: DRAFT
Last Updated: July 26, 2026
Author: Chief Financial Officer, FinOps Lead, Chief Cloud Architect
Depends On: 00-38 Architecture Series
---

# 1. Executive FinOps Vision & 2. Cloud Economics
The Institutional Risk Engine (IRE) operates on a consumption-based cloud model where engineering decisions directly dictate financial velocity. **Cloud cost is an architecture metric.** We do not optimize for absolute minimum cost (which degrades resilience); we optimize for **Unit Economics**—maximizing the business value extracted per dollar of compute spent. Every domain squad is fully financially accountable for the code they deploy.

# 3. Cost Allocation & 4. Resource Tagging
Unattributed spend is banned. 100% of cloud resources (AWS, Azure, SaaS) must be programmatically tagged via Terraform.
*   **Mandatory Tags:** `CostCenter`, `Owner`, `Environment` (Prod/Stg/Dev), `ApplicationID`.
*   **Enforcement:** Any untagged resource is considered a rogue deployment and is automatically garbage-collected (terminated) by the Cloud Custodian engine within 24 hours.

---

# Chargeback, Showback & Unit Economics (5 - 12)

### 5. Showback vs 6. Chargeback
*   **Showback:** Dashboards expose the real-time cloud cost of a service to the engineers who built it, creating psychological accountability.
*   **Chargeback:** The CFO strictly deducts the actual monthly AWS invoice line-items from the respective Business Domain's operating budget.

### 8. Unit Economics
Infrastructure costs must be correlated to business throughput. We measure:
*   **Cost per API Call:** (Total EC2/EKS Cost / Millions of Requests).
*   **Cost per Loan Origination:** (Total Domain Cost / Number of Approved Loans).
If the total cloud bill rises 20%, but loan originations rose 50%, the architecture is highly efficient. If the bill rises 20% but volume is flat, the architecture has regressed.

---

# Kubernetes & Microservice Cost Governance (13 - 18)

### 13. Kubernetes Cost Governance & 14. Namespace Budgets
Multi-tenant Kubernetes (EKS) obfuscates billing. AWS bills the EC2 node, not the Pod. We deploy **Kubecost (OpenCost)** to analyze CPU/RAM utilization at the Cgroups level and allocate accurate costs back to the specific microservice `Namespace`.

### 15. Rightsizing & 16. Autoscaling Economics
*   Over-provisioning "just in case" is a legacy data-center anti-pattern.
*   Services must use Vertical Pod Autoscaling (VPA) to right-size requests/limits, and Horizontal Pod Autoscaling (HPA) to scale dynamically with traffic. Idle CPU is wasted capital.

---

# Cloud Purchasing Strategy (19 - 25)

### 19. Reserved Instances & 20. Savings Plans
The central FinOps team manages the purchase of AWS Compute Savings Plans (1- or 3-year commits) to cover the persistent, baseline compute floor across the enterprise, yielding up to 72% discounts.

### 21. Spot Instances
Stateless, fault-tolerant batch workloads (e.g., EMR Data processing, ML model training) MUST execute on EC2 Spot Instances, reducing compute costs by up to 90%. EKS Node Groups are configured to gracefully handle 2-minute Spot termination notices.

### 22. Storage Lifecycle & 23. Data Tiering
AWS S3 storage costs compound infinitely if unmanaged.
*   Log files > 30 days are automatically transitioned via S3 Lifecycle Rules to `S3 Infrequent Access`.
*   Data > 365 days is transitioned to `S3 Glacier Deep Archive` (fractions of a cent per GB) for regulatory retention.

---

# AI, LLM & GPU Cost Optimization (26 - 32)

### 26. AI GPU Cost Optimization
GPUs (NVIDIA A100/H100) are extraordinarily expensive. ML Engineers are forbidden from leaving persistent, idle GPU notebooks running overnight. Environments autoscale to zero after 60 minutes of inactivity.

### 27. LLM Cost Optimization & 28. Token Cost Governance
Generative AI inference is billed per token.
*   **Prompt Caching:** We utilize semantic caching (Redis) in front of the LLM Gateway. If a user asks a question highly similar to a previous query, the Gateway returns the cached response, incurring $0 in LLM API fees.
*   **Model Routing:** Simple summarization tasks are routed to cheaper, faster models (e.g., Claude 3 Haiku). Only complex reasoning tasks are routed to expensive frontier models (e.g., Claude 3.5 Sonnet / GPT-4o).

---

# Green IT & Sustainability (33 - 36)

### 33. Carbon Footprint & 34. Green IT
Cloud efficiency is directly proportional to carbon efficiency. The Executive FinOps Dashboard tracks **Metric Tons of CO2e** emitted by the IRE platform. We prioritize provisioning resources in AWS regions powered by > 90% renewable energy (e.g., `eu-west-1` Ireland, `us-west-2` Oregon) where data sovereignty laws permit.

---

# 40. FinOps ADRs
| ID | Decision | Rejected Alternative | Rationale |
| :--- | :--- | :--- | :--- |
| `FIN-01` | Mandatory IaC Tagging | Manual Console Tagging | Manual tagging is impossible to enforce and guarantees unaccounted spend. Terraform strictly enforces tags at deployment. |
| `FIN-02` | Kubecost for EKS | AWS Cost Explorer | AWS Cost Explorer cannot see inside a Kubernetes node. Kubecost is required to allocate cluster costs back to individual microservice namespaces. |
| `FIN-03` | LLM Semantic Caching | Direct API Calls | Uncached LLM calls result in massive duplicate token fees. Caching standard queries reduces Generative AI costs by 40-60%. |
| `FIN-04` | Spot Instances for ML | On-Demand Instances | ML model training is easily restartable from checkpoints. Using On-Demand for training wastes up to 90% of potential compute budget. |

# 41. FinOps Anti-Patterns
*   **The Zombie Server:** An EC2 instance or RDS database that was spun up for a 3-day PoC 14 months ago, forgot about, and is still costing $500/month.
*   **The Infinite Log:** Storing 5 years of Splunk application debug logs in hot NVMe storage instead of migrating them to Glacier.
*   **The LLM Token Cannon:** Passing a 100,000-token unoptimized context window to GPT-4 for a task that could have been solved with a 500-token prompt, instantly burning dollars.
*   **Over-Provisioned Pods:** Requesting 4 CPUs for a microservice that peaks at 0.2 CPUs, preventing Kubernetes from densely scheduling other workloads.

# 42. FinOps Fitness Functions
```yaml
# HashiCorp Sentinel: Mandatory AWS Tags
import "tfplan/v2" as tfplan

# Ensure all aws_instance resources have CostCenter and Owner tags
aws_instances = filter tfplan.resource_changes as _, rc {
    rc.type is "aws_instance" and
    (rc.actions contains "create" or rc.actions contains "update")
}

rule mandatory_tags_exist {
    all aws_instances as _, instance {
        instance.change.after.tags contains "CostCenter" and
        instance.change.after.tags contains "Owner"
    }
}
# The deployment mathematically fails if financial accountability tags are missing.
```

# 43. Production Readiness Checklist
- [ ] Infrastructure as Code (IaC) strictly applies `CostCenter`, `Owner`, and `Environment` tags.
- [ ] Kubernetes Pod manifests define strict CPU/Memory `requests` and `limits`.
- [ ] Data storage (S3/DynamoDB) has automated TTLs or lifecycle tiering rules attached.
- [ ] Generative AI calls are routed through the Semantic Cache Gateway.
- [ ] Non-production environments (Dev/Test) are configured to scale to zero outside business hours.

# 44. Executive FinOps Dashboard
| Category | Status | Owner | Criteria | Trend |
| :--- | :--- | :--- | :--- | :--- |
| **Tagging Compliance** | PASS | FinOps | 99.8% of AWS resources are appropriately tagged. | ↗️ Improving |
| **Unit Economics** | PASS | VP Eng | Cloud Cost per Loan Origination decreased by 4% YoY. | ↗️ Improving |
| **Spot Utilization** | PASS | SRE Lead | 85% of batch/ML workloads are executing on Spot instances. | ➡️ Stable |
| **Zombie Eradication** | PASS | Cloud Arch | $1.2M in idle resources automatically reaped in Q3. | ↗️ Improving |
| **Green IT (CO2e)** | PASS | CTO | Total Scope 3 Carbon emissions from AWS decreased by 12%. | ↗️ Improving |

---
*Approval: Chief Financial Officer, FinOps Lead, Chief Cloud Architect*
