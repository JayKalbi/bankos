# BankOS Gateway CI/CD Pipeline

## Overview

The BankOS Gateway utilizes GitHub Actions for continuous integration, continuous delivery, and software supply chain security.

## Workflows

### 1. Gateway CI/CD Pipeline (`ci.yml`)
Triggered on pushes to `main`, tags, and Pull Requests.

**Stages:**
- **Security & Linting**:
  - Checks out code.
  - Scans for hardcoded secrets using **Gitleaks**.
  - Runs dependency reviews for vulnerable transitive paths.
  - Lints codebase via `eslint`.
- **Unit Tests**:
  - Runs Jest tests covering Gateway proxy routes and authentication layers.
- **Build & Scan Docker Image**:
  - Sets up multi-platform `buildx` with aggressive layer caching.
  - Builds the local image.
  - Scans image for `HIGH` and `CRITICAL` vulnerabilities using **Trivy**.
  - Automatically generates an SBOM in SPDX-JSON format using **Syft/Anchore**.
  - Pushes to Docker Hub if on `main` or a tagged release.
  - Signs the container digest using **Cosign** (Keyless signing via GitHub OIDC).

### 2. Release Pipeline (`release.yml`)
Triggered on SemVer tags (e.g., `v1.0.0`).

- Automatically generates changelogs based on PR titles and conventional commits.
- Publishes the GitHub Release.

## Required Secrets

To function correctly, the repository must have the following secrets configured in GitHub Actions:
- `DOCKERHUB_USERNAME`: Docker Hub username for publishing images.
- `DOCKERHUB_TOKEN`: Access token for Docker Hub (requires write privileges).

*(No Cosign keys are required because the pipeline utilizes Keyless Signing tied to the GitHub OIDC provider).*

## Release Process

1. Developers commit changes using Conventional Commits.
2. Changes are merged into `main` via PR (triggering the `ci.yml` PR checks).
3. Once merged, create a tag locally: `git tag v1.0.0`
4. Push the tag: `git push origin v1.0.0`
5. The pipeline automatically builds the production image, scans it, signs it, and drafts a GitHub release with the attached SBOM.
