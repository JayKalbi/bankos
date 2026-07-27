#!/usr/bin/env bash
set -e

echo -e "\033[36mðŸ¦ Initializing BankOS Enterprise Developer Environment...\033[0m"

if ! command -v docker &> /dev/null; then
    echo -e "\033[31mâŒ Docker is not installed. Please install Docker.\033[0m"
    exit 1
fi

if command -v pip &> /dev/null; then
    echo -e "\033[33mðŸ“¦ Installing pre-commit hooks...\033[0m"
    pip install pre-commit
    pre-commit install
    pre-commit install --hook-type commit-msg
else
    echo -e "\033[33mâš ï¸ Python/pip not found. Skipping pre-commit installation.\033[0m"
fi

echo -e "\033[33mðŸš€ Starting local enterprise dependencies...\033[0m"
docker compose up -d

echo -e "\033[32mâœ… BankOS local environment is ready!\033[0m"