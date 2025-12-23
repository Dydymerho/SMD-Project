# Test Script for SMD API
# PowerShell script to test all endpoints

$baseUrl = "http://localhost:8080/api/v1"

Write-Host "=== SMD API Testing Script ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Server Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method OPTIONS -ErrorAction SilentlyContinue
    Write-Host "✓ Server is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running. Please start the application first." -ForegroundColor Red
    exit
}
Write-Host ""

# Test 2: Register New User
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    username = "testuser"
    password = "password123"
    fullName = "Test User"
    email = "testuser@example.com"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✓ User registered successfully" -ForegroundColor Green
    Write-Host "  Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "  UserId: $($registerResponse.userId)" -ForegroundColor Cyan
    Write-Host "  Username: $($registerResponse.username)" -ForegroundColor Cyan
    $token = $registerResponse.token
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠ User already exists, trying login..." -ForegroundColor Yellow
        
        # Test 3: Login
        Write-Host ""
        Write-Host "3. Testing User Login..." -ForegroundColor Yellow
        $loginData = @{
            username = "testuser"
            password = "password123"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
            Write-Host "✓ Login successful" -ForegroundColor Green
            Write-Host "  Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
            $token = $loginResponse.token
        } catch {
            Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit
    }
}
Write-Host ""

# Test 4: Access Protected Endpoint (with token)
Write-Host "4. Testing Protected Endpoint (with JWT)..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "✓ Protected endpoint accessible with token" -ForegroundColor Green
    Write-Host "  Response: $meResponse" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Failed to access protected endpoint: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Access Protected Endpoint (without token)
Write-Host "5. Testing Protected Endpoint (without JWT)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -ErrorAction Stop
    Write-Host "✗ Security issue: Endpoint accessible without token!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Security working: Access denied without token" -ForegroundColor Green
    } else {
        Write-Host "⚠ Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 6: Create Syllabus (requires authentication)
Write-Host "6. Testing Create Syllabus (authenticated)..." -ForegroundColor Yellow
$syllabusData = @{
    academicYear = "2024-2025"
    versionNo = 1
} | ConvertTo-Json

try {
    $syllabusResponse = Invoke-RestMethod -Uri "$baseUrl/syllabuses" -Method POST -Body $syllabusData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Syllabus created successfully" -ForegroundColor Green
    Write-Host "  Syllabus ID: $($syllabusResponse.syllabusId)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠ Create syllabus failed (may need course/lecturer data): $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 7: Get All Syllabuses
Write-Host "7. Testing Get All Syllabuses..." -ForegroundColor Yellow
try {
    $allSyllabuses = Invoke-RestMethod -Uri "$baseUrl/syllabuses" -Method GET -Headers $headers
    Write-Host "✓ Retrieved syllabuses: $($allSyllabuses.Count) items" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get syllabuses: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your JWT Token (save this for manual testing):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor Cyan
Write-Host ""
Write-Host "To use in Postman/curl:" -ForegroundColor Yellow
Write-Host "Authorization: Bearer $token" -ForegroundColor Cyan
