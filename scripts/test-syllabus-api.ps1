# Test Syllabus API
$baseUrl = "http://localhost:8080/api/v1"

Write-Host "=== TESTING SYLLABUS API ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get token
Write-Host "1. Login to get JWT token..." -ForegroundColor Yellow
$loginBody = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""

# Step 2: Get all syllabuses
Write-Host "2. Get all syllabuses..." -ForegroundColor Yellow
try {
    $syllabuses = Invoke-RestMethod -Uri "$baseUrl/syllabuses" -Method Get -Headers $headers
    Write-Host "✅ Retrieved $($syllabuses.Count) syllabus(es)" -ForegroundColor Green
    if ($syllabuses.Count -gt 0) {
        Write-Host "Sample: $($syllabuses[0] | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Get all failed: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Create new syllabus (simplified - will need actual Course and User IDs)
Write-Host "3. Create new syllabus..." -ForegroundColor Yellow
Write-Host "⚠️ NOTE: This requires existing Course, User, and Program records in database" -ForegroundColor Yellow

$syllabusBody = @{
    course = @{
        courseId = 1  # Need to exist in database
    }
    lecturer = @{
        userId = 1  # Need to exist in database
    }
    academicYear = "2024-2025"
    versionNo = 1
    currentStatus = "DRAFT"
} | ConvertTo-Json -Depth 3

Write-Host "Request body:" -ForegroundColor Gray
Write-Host $syllabusBody -ForegroundColor Gray

try {
    $newSyllabus = Invoke-RestMethod -Uri "$baseUrl/syllabuses" -Method Post -Body $syllabusBody -Headers $headers
    Write-Host "✅ Syllabus created successfully!" -ForegroundColor Green
    Write-Host "Created syllabus ID: $($newSyllabus.syllabusId)" -ForegroundColor Green
    Write-Host "Response: $($newSyllabus | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    
    # Step 4: Get the created syllabus by ID
    Write-Host ""
    Write-Host "4. Get syllabus by ID..." -ForegroundColor Yellow
    $syllabusId = $newSyllabus.syllabusId
    $getSyllabus = Invoke-RestMethod -Uri "$baseUrl/syllabuses/$syllabusId" -Method Get -Headers $headers
    Write-Host "✅ Retrieved syllabus: $($getSyllabus | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    
} catch {
    $errorDetail = $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message
    }
    Write-Host "❌ Create syllabus failed: $errorDetail" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 TIP: You need to create Course and User records first!" -ForegroundColor Cyan
    Write-Host "   - Course with courseId = 1" -ForegroundColor Cyan
    Write-Host "   - User with userId = 1" -ForegroundColor Cyan
}

Write-Host ""

# Step 5: Search syllabuses (if Elasticsearch is working)
Write-Host "5. Search syllabuses..." -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/syllabuses/search?keyword=Java" -Method Get -Headers $headers
    Write-Host "✅ Search found $($searchResults.Count) result(s)" -ForegroundColor Green
    if ($searchResults.Count -gt 0) {
        Write-Host "Results: $($searchResults | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Search failed (Elasticsearch might not be configured): $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Create sample Course, User, and Program data in database" -ForegroundColor White
Write-Host "   2. Update courseId, userId in the script with actual IDs" -ForegroundColor White
Write-Host "   3. Run this script again to test POST syllabus" -ForegroundColor White
