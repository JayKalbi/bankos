# BankOS API Gateway Service

## Purpose
The API Gateway acts as the unified ingress point for the BankOS platform. It handles routing, OpenTelemetry trace propagation, rate limiting, and JWT validation.

## Architecture Traceability
- **Implements:** Doc 41 Enterprise Banking Blueprint
- **Depends on:**
  - Doc 60 Platform Engineering
  - Doc 61 Kubernetes Platform
  - Doc 63 Zero Trust (JWT Validation)
  - Doc 64 IAM
  - Doc 65 Observability (OTel & Prometheus)

## API
All ingress traffic goes through /api/v1/. The gateway exposes OpenAPI specifications in openapi.yaml.

## Dependencies
- Redis (for distributed rate limiting in Prod)
- Identity Service (Auth)
- Customer 360 Service (Customer lookup)
- Credit Risk Service (Evaluations)

## Deployment
Deployed via ArgoCD GitOps pipeline using Helm.

## Run Instructions
`ash
npm install
npm run dev
`

## Security
Enforces strict JWT token validation. Unauthenticated requests to protected endpoints return RFC 7807 Problem Details.