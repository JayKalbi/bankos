# BankOS Golden Path Template: kafka-producer

## Overview
This is a production-ready template for a $t microservice in the BankOS ecosystem.
It automatically inherits observability, security, and GitOps standards.

## Features Included
- **Dockerfile (Distroless)**: Minimized attack surface
- **docker-compose.override.yml**: Local development dependencies
- **Helm chart placeholder**: Standardized deployment artifact
- **OpenTelemetry & Prometheus**: Distributed tracing and metrics
- **Structured JSON Logging**: Centralized log aggregation
- **Health & Metrics endpoints**: Kubernetes probes and monitoring
- **Graceful shutdown**: Zero-downtime deployments
- **Testing framework**: Unit, Integration, and Testcontainers support

## Getting Started
1. Copy this folder into services/
2. Rename the directory to your service name (e.g., services/payments)
3. Update configuration to match your domain
