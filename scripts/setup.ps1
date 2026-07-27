$ErrorActionPreference = "Stop"

Write-Host "ðŸ¦ Initializing BankOS Enterprise Developer Environment..." -ForegroundColor Cyan

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "âŒ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

if (Get-Command pip -ErrorAction SilentlyContinue) {
    Write-Host "ðŸ“¦ Installing pre-commit hooks..." -ForegroundColor Yellow
    pip install pre-commit
    pre-commit install
    pre-commit install --hook-type commit-msg
} else {
    Write-Host "âš ï¸ Python/pip not found. Skipping pre-commit installation." -ForegroundColor Yellow
}

Write-Host "ðŸš€ Starting local enterprise dependencies..." -ForegroundColor Yellow
docker compose up -d

Write-Host "âœ… BankOS local environment is ready!" -ForegroundColor Green