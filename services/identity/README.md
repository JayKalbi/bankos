# BankOS Identity Service

## Purpose
The Identity Service manages user authentication and issues signed JSON Web Tokens (JWTs) for authorization across the BankOS platform.

## Architecture Traceability
- **Implements:** Doc 41 Enterprise Banking Blueprint
- **Depends on:**
  - Doc 60 Platform Engineering
  - Doc 63 Zero Trust
  - Doc 64 IAM
  - Doc 65 Observability

## API
Exposes /auth/login for JWT generation. OpenAPI spec available in openapi.yaml.

## Dependencies
- PostgreSQL (User store)

## Deployment
Deployed via ArgoCD GitOps pipeline using Helm.

## Run Instructions
`ash
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8081
`

## Database
Uses SQLAlchemy with Alembic for migrations. Each service owns its schema.
