$ErrorActionPreference = "Stop"

Write-Host "🏦 Initializing BankOS Enterprise Developer Environment..." -ForegroundColor Cyan

if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

if (Get-Command pip -ErrorAction SilentlyContinue) {
    Write-Host "📦 Installing pre-commit hooks..." -ForegroundColor Yellow
    pip install pre-commit
    pre-commit install
    pre-commit install --hook-type commit-msg
} else {
    Write-Host "⚠️ Python/pip not found. Skipping pre-commit installation." -ForegroundColor Yellow
}

Write-Host "🚀 Starting local enterprise dependencies..." -ForegroundColor Yellow
docker compose up -d

Write-Host "✅ BankOS local environment is ready!" -ForegroundColor Green
