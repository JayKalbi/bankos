# Enterprise API Standards

## Overview
All REST APIs across BankOS must conform to these specifications.

## Requirements
1. **OpenAPI**: All APIs must publish OpenAPI 3.0+ specs.
2. **Versioning**: Use URL path versioning (e.g., /api/v1/...).
3. **Pagination**: Standardize on cursor-based or limit/offset with page and size parameters. Return _links for HATEOAS.
4. **Filtering & Sorting**: Use query parameters ?sort=-createdAt and ?status=ACTIVE.
5. **Problem Details**: All errors MUST return RFC 7807 pplication/problem+json format.
6. **Validation Responses**: Return HTTP 400 with a list of invalid fields in the Problem Details errors array.
7. **Rate Limiting**: Use X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers.
