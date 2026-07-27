# BankOS CI/CD Architecture

BankOS enforces a strict, zero-trust, SLSA Level 3 compliant supply chain.

## Pipeline Architecture
All CI/CD operations are governed by **Reusable GitHub Actions Workflows** located in .github/workflows/.
- Microservices cannot define their own custom build logic; they must call the enterprise reusable workflows (eusable-build-java.yml, eusable-build-python.yml).
- This guarantees uniform execution of testing, formatting, and coverage collection.

## Supply Chain Security
- **SBOM Generation:** Syft is executed during the build process to generate an SPDX-compliant SBOM for every container.
- **Vulnerability Scanning:** Trivy scans the container layer and OS dependencies, enforcing failure on CRITICAL or HIGH CVEs.
- **Container Signing:** Cosign is used with keyless signing via GitHub OIDC to cryptographically sign every container image pushed to the registry.
- **Secret Scanning:** Gitleaks runs on every PR. Any hardcoded secrets will block the merge.

## GitOps Deployment
We utilize ArgoCD. Merging to main does not deploy directly; it triggers a semantic release, builds an image, and updates the ArgoCD manifests repo. ArgoCD pulls the state into the Kubernetes cluster.
