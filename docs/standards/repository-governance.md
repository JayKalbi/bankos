# Repository Governance Standards

## Branch Strategy
- **main**: Represents production state. Direct pushes are blocked.
- **develop**: Represents integration state. Direct pushes are blocked.
- **Feature Branches**: Format eature/TICKET-ID-description.

## Protection Rules
- **Require Signed Commits**: Enabled.
- **Require Linear History**: Enabled (Rebase merging only).
- **Require PR Reviews**: Minimum 1 approving review from a CODEOWNER.
- **Require Status Checks**: All CI workflows (Build, Test, Security, Lint) must pass before merge.

## Versioning
We use **Semantic Versioning (SemVer)** automated via Conventional Commits and semantic-release. 
