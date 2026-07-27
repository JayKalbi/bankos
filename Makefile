.PHONY: setup start stop lint status clean

setup: ## One-command setup for the BankOS developer environment
	@bash scripts/setup.sh

start: ## Start all local enterprise dependencies via Docker Compose
	@docker compose up -d

stop: ## Stop all local enterprise dependencies
	@docker compose down

lint: ## Run all enterprise linters and security checks
	@pre-commit run --all-files

status: ## Show the status of local dependencies
	@docker compose ps

clean: stop ## Stop and remove all volumes
	@docker compose down -v

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", 1, 2}'
