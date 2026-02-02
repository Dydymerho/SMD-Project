# Test Audit Log API Endpoints
# Usage: .\test-audit-log-api.ps1

$baseUrl = "http://localhost:8080"
$token = ""

# Colors for output
function Write-Success { param($message) Write-Host $message -ForegroundColor Green }
function Write-Error { param($message) Write-Host $message -ForegroundColor Red }
function Write-Info { param($message) Write-Host $message -ForegroundColor Cyan }
function Write-Warning { param($message) Write-Host $message -ForegroundColor Yellow }

Write-Host "`n=== AUDIT LOG API TEST ===" -ForegroundColor Magenta
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Yellow

# Check if token is provided
if ([string]::IsNullOrEmpty($token)) {
    Write-Warning "⚠️  No token provided. Please update `$token variable with a valid ADMIN token."
    Write-Info "You can get token by logging in as admin first.`n"
    
    # Try to login as admin
    Write-Info "Attempting to login as admin..."
    $loginPayload = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
        if ($loginResponse.token) {
            $token = $loginResponse.token
            Write-Success "✓ Login successful! Token obtained."
        }
    } catch {
        Write-Error "✗ Login failed. Please ensure admin account exists and update credentials."
        Write-Error "Error: $_"
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Function to make API call and display result
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    Write-Info "`n--- Testing: $Name ---"
    Write-Host "Endpoint: $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Success "✓ SUCCESS"
        
        # Display relevant info from response
        if ($response.success) {
            Write-Host "Message: $($response.message)" -ForegroundColor White
            
            if ($response.data) {
                # For paginated responses
                if ($response.data.totalItems) {
                    Write-Host "Total Items: $($response.data.totalItems)" -ForegroundColor White
                    Write-Host "Total Pages: $($response.data.totalPages)" -ForegroundColor White
                    Write-Host "Current Page: $($response.data.currentPage + 1)" -ForegroundColor White
                    Write-Host "Returned: $($response.data.auditLogs.Count) logs" -ForegroundColor White
                }
                # For list responses
                elseif ($response.data -is [System.Array]) {
                    Write-Host "Returned: $($response.data.Count) logs" -ForegroundColor White
                }
                # For statistics
                elseif ($response.data.totalLogs) {
                    Write-Host "Total Logs: $($response.data.totalLogs)" -ForegroundColor White
                    Write-Host "Last 24h: $($response.data.logsLast24Hours)" -ForegroundColor White
                    Write-Host "Last 7d: $($response.data.logsLast7Days)" -ForegroundColor White
                    Write-Host "Last 30d: $($response.data.logsLast30Days)" -ForegroundColor White
                }
            }
        }
        
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ FAILED (Status: $statusCode)"
        Write-Error "Error: $($_.Exception.Message)"
        
        if ($_.ErrorDetails.Message) {
            $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Error "Detail: $($errorDetail.message)"
        }
        
        return $false
    }
}

# Test Suite
Write-Host "`n📊 Starting Audit Log API Tests...`n" -ForegroundColor Magenta

$results = @{
    Passed = 0
    Failed = 0
}

# Test 1: Get all audit logs with pagination
if (Test-Endpoint -Name "Get All Audit Logs (Page 1)" `
                  -Endpoint "/api/audit-logs?page=0&size=10&sortBy=timestamp&sortDir=desc") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 2: Get statistics
if (Test-Endpoint -Name "Get Audit Log Statistics" `
                  -Endpoint "/api/audit-logs/statistics") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 3: Get recent logs (last 7 days)
if (Test-Endpoint -Name "Get Recent Logs (Last 7 Days)" `
                  -Endpoint "/api/audit-logs/recent?days=7") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 4: Get recent logs (last 1 day)
if (Test-Endpoint -Name "Get Recent Logs (Last 24 Hours)" `
                  -Endpoint "/api/audit-logs/recent?days=1") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 5: Get logs by action type
Write-Info "`nTesting various action types..."
$actionTypes = @("CREATE_SYLLABUS", "UPDATE_SYLLABUS", "UPLOAD_PDF", "SUBMIT_FOR_REVIEW", "HOD_APPROVE")
foreach ($actionType in $actionTypes) {
    if (Test-Endpoint -Name "Get Logs by Action Type: $actionType" `
                      -Endpoint "/api/audit-logs/action-type/$actionType") {
        $results.Passed++
    } else {
        $results.Failed++
    }
}

# Test 6: Get logs by date range
$startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-ddTHH:mm:ss")
$endDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
if (Test-Endpoint -Name "Get Logs by Date Range (Last 30 Days)" `
                  -Endpoint "/api/audit-logs/date-range?startDate=$startDate&endDate=$endDate") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 7: Get logs by academic year (if exists)
if (Test-Endpoint -Name "Get Logs by Academic Year 2024-2025" `
                  -Endpoint "/api/audit-logs/academic-year/2024-2025") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 8: Get logs by user (try common usernames)
$testUsers = @("admin", "teacher1", "hod1")
foreach ($user in $testUsers) {
    if (Test-Endpoint -Name "Get Logs by User: $user" `
                      -Endpoint "/api/audit-logs/user/$user") {
        $results.Passed++
    } else {
        $results.Failed++
    }
}

# Test 9: Get logs by syllabus (if you know a valid ID)
Write-Warning "`n⚠️  Skipping 'Get Logs by Syllabus' test (need valid syllabus ID)"
Write-Info "To test manually: GET /api/audit-logs/syllabus/{syllabusId}"

# Test 10: Pagination test
Write-Info "`nTesting pagination..."
if (Test-Endpoint -Name "Get Page 1 (size 5)" `
                  -Endpoint "/api/audit-logs?page=0&size=5") {
    $results.Passed++
} else {
    $results.Failed++
}

if (Test-Endpoint -Name "Get Page 2 (size 5)" `
                  -Endpoint "/api/audit-logs?page=1&size=5") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 11: Different sort directions
if (Test-Endpoint -Name "Sort by timestamp ASC" `
                  -Endpoint "/api/audit-logs?sortBy=timestamp&sortDir=asc&size=5") {
    $results.Passed++
} else {
    $results.Failed++
}

if (Test-Endpoint -Name "Sort by actionType DESC" `
                  -Endpoint "/api/audit-logs?sortBy=actionType&sortDir=desc&size=5") {
    $results.Passed++
} else {
    $results.Failed++
}

# Test 12: Edge cases
Write-Info "`nTesting edge cases..."

# Invalid date range (start > end)
Write-Info "`n--- Testing: Invalid Date Range (should fail with 400) ---"
$invalidStart = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
$invalidEnd = (Get-Date).AddDays(-30).ToString("yyyy-MM-ddTHH:mm:ss")
try {
    Invoke-RestMethod -Uri "$baseUrl/api/audit-logs/date-range?startDate=$invalidStart&endDate=$invalidEnd" `
                      -Method GET -Headers $headers
    Write-Error "✗ Should have failed but didn't"
    $results.Failed++
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Success "✓ Correctly returned 400 Bad Request"
        $results.Passed++
    } else {
        Write-Error "✗ Wrong error code: $($_.Exception.Response.StatusCode.value__)"
        $results.Failed++
    }
}

# Non-existent user
if (Test-Endpoint -Name "Get Logs by Non-existent User" `
                  -Endpoint "/api/audit-logs/user/nonexistentuser999") {
    Write-Success "✓ Correctly handled non-existent user (returns empty array)"
    $results.Passed++
} else {
    $results.Failed++
}

# Summary
Write-Host "`n`n========================================" -ForegroundColor Magenta
Write-Host "           TEST SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$total = $results.Passed + $results.Failed
$passRate = if ($total -gt 0) { [math]::Round(($results.Passed / $total) * 100, 2) } else { 0 }

Write-Success "`n✓ Passed: $($results.Passed)"
Write-Error "✗ Failed: $($results.Failed)"
Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } else { "Yellow" })

if ($results.Failed -eq 0) {
    Write-Host "`n🎉 All tests passed! Audit Log API is working correctly!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Magenta
