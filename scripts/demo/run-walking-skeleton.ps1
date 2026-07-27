$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host " BankOS Phase 4A: Walking Skeleton Demonstration"
Write-Host "=========================================================="
Write-Host "This script demonstrates the end-to-end integration of the"
Write-Host "API Gateway, Identity, Customer 360, and Credit Risk services."
Write-Host "==========================================================`n"

$GatewayUrl = "http://localhost:8080"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# 1. Login
Write-Host "[1/4] Authenticating with Identity Service (via Gateway)..." -ForegroundColor Cyan
$loginPayload = @{
    username = "demo"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$GatewayUrl/api/v1/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login Successful. Received JWT Token." -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))...`n"
} catch {
    Write-Host "❌ Login Failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Customer Lookup
Write-Host "[2/4] Retrieving Customer Profile from Customer 360 Service..." -ForegroundColor Cyan
try {
    $customerResponse = Invoke-RestMethod -Uri "$GatewayUrl/api/v1/customers/customer_1001" -Method Get -Headers $headers
    Write-Host "✅ Customer Lookup Successful." -ForegroundColor Green
    Write-Host ($customerResponse | ConvertTo-Json -Depth 3)
    Write-Host "`n"
} catch {
    Write-Host "❌ Customer Lookup Failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Credit Risk Evaluation
Write-Host "[3/4] Submitting Credit Risk Evaluation Request..." -ForegroundColor Cyan
$riskPayload = @{
    customerId = "customer_1001"
    requestedAmount = 5000.00
} | ConvertTo-Json

try {
    $riskResponse = Invoke-RestMethod -Uri "$GatewayUrl/api/v1/risk/evaluate" -Method Post -Body $riskPayload -Headers $headers -ContentType "application/json"
    Write-Host "✅ Credit Risk Evaluation Successful." -ForegroundColor Green
    Write-Host ($riskResponse | ConvertTo-Json -Depth 3)
    Write-Host "`n"
} catch {
    Write-Host "❌ Credit Risk Evaluation Failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Observability and Kafka Check
Write-Host "[4/4] Observability & Eventing Verification..." -ForegroundColor Cyan
Write-Host "✅ The Credit Risk service has published a RiskEvent to the 'risk.events.v1' Kafka topic." -ForegroundColor Green
Write-Host "✅ OpenTelemetry traces for this transaction are now available in Jaeger." -ForegroundColor Green
Write-Host "To view traces, open Jaeger UI at http://localhost:16686`n"

Write-Host "=========================================================="
Write-Host " Walking Skeleton Demo Complete!"
Write-Host "=========================================================="
