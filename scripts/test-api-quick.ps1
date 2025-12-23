# Quick API Test Script
$baseUrl = "http://localhost:8080/api/v1"

Write-Host "=== TESTING SMD SYSTEM ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register new user
Write-Host "1. Testing Register..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser"
    password = "password123"
    email = "test@example.com"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Register successful!" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token)" -ForegroundColor Gray
    $token = $registerResponse.token
} catch {
    Write-Host "❌ Register failed: $_" -ForegroundColor Red
    $token = $null
}

Write-Host ""

# Test 2: Login
Write-Host "2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token)" -ForegroundColor Gray
    $token = $loginResponse.token
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Access protected endpoint
if ($token) {
    Write-Host "3. Testing Protected Endpoint..." -ForegroundColor Yellow
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    try {
        $meResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
        Write-Host "✅ Protected endpoint accessible!" -ForegroundColor Green
        Write-Host "User info: $($meResponse | ConvertTo-Json)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Protected endpoint failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Cyan
