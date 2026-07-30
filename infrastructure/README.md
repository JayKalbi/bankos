# BankOS / infrastructure

## Purpose
Contains all Infrastructure-as-Code. Subdirectories handle Terraform modules, GitOps (ArgoCD) manifests, Helm charts, and Crossplane compositions.

## Responsibilities
- Encapsulate all logic and definitions related to the infrastructure domain.
- Maintain isolation from other core components.

## Future Implementation
- This directory will be populated with production-grade implementations during BankOS execution phases.

## Developer Guidance
- Adhere to the enterprise standards defined in docs/blueprints/.
- Do not commit secrets.
- Ensure all CI/CD pipelines validate changes made in this directory.
