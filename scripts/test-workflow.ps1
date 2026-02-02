# Test Workflow Transitions
# Test script for syllabus approval workflow

$BASE_URL = "http://localhost:8080/api/v1"
$CONTENT_TYPE = "application/json"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SYLLABUS WORKFLOW TEST SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ==================== STEP 0: Login as different users ====================

Write-Host "[STEP 0] Logging in as different users..." -ForegroundColor Yellow

# Login as Lecturer
Write-Host "`n1. Login as LECTURER (user: lecturer1, pass: password123)" -ForegroundColor Green
$lecturerLogin = @{
    username = "lecturer1"
    password = "password123"
} | ConvertTo-Json

$lecturerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $lecturerLogin -ContentType $CONTENT_TYPE
$LECTURER_TOKEN = $lecturerResponse.token
Write-Host "Lecturer Token: $LECTURER_TOKEN" -ForegroundColor Gray

# Login as HOD
Write-Host "`n2. Login as HEAD_OF_DEPARTMENT (user: hod1, pass: password123)" -ForegroundColor Green
$hodLogin = @{
    username = "hod1"
    password = "password123"
} | ConvertTo-Json

$hodResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $hodLogin -ContentType $CONTENT_TYPE
$HOD_TOKEN = $hodResponse.token
Write-Host "HOD Token: $HOD_TOKEN" -ForegroundColor Gray

# Login as AA
Write-Host "`n3. Login as ACADEMIC_AFFAIRS (user: aa1, pass: password123)" -ForegroundColor Green
$aaLogin = @{
    username = "aa1"
    password = "password123"
} | ConvertTo-Json

$aaResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $aaLogin -ContentType $CONTENT_TYPE
$AA_TOKEN = $aaResponse.token
Write-Host "AA Token: $AA_TOKEN" -ForegroundColor Gray

# ==================== STEP 1: Create a draft syllabus ====================

Write-Host "`n`n[STEP 1] Creating a draft syllabus..." -ForegroundColor Yellow

$syllabusData = @{
    course = @{
        courseId = 1
    }
    lecturer = @{
        userId = 2  # Assuming lecturer1 has userId 2
    }
    academicYear = "2024-2025"
    versionNo = 1
    currentStatus = "DRAFT"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $LECTURER_TOKEN"
    "Content-Type" = $CONTENT_TYPE
}

try {
    $createResponse = Invoke-RestMethod -Uri "$BASE_URL/syllabuses" -Method POST -Body $syllabusData -Headers $headers
    $SYLLABUS_ID = $createResponse.syllabusId
    Write-Host "✓ Syllabus created with ID: $SYLLABUS_ID" -ForegroundColor Green
    Write-Host "  Status: $($createResponse.currentStatus)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to create syllabus" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

# ==================== STEP 2: Lecturer submits for review ====================

Write-Host "`n`n[STEP 2] Lecturer submits syllabus for review..." -ForegroundColor Yellow

$submitData = @{
    comment = "Please review my syllabus draft"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $LECTURER_TOKEN"
    "Content-Type" = $CONTENT_TYPE
}

try {
    $submitResponse = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/$SYLLABUS_ID/submit-for-review" -Method POST -Body $submitData -Headers $headers
    Write-Host "✓ Syllabus submitted for review" -ForegroundColor Green
    Write-Host "  Previous Status: $($submitResponse.previousStatus)" -ForegroundColor Gray
    Write-Host "  New Status: $($submitResponse.newStatus)" -ForegroundColor Gray
    Write-Host "  Action By: $($submitResponse.actionBy)" -ForegroundColor Gray
    Write-Host "  Message: $($submitResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to submit for review" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# ==================== STEP 3: HOD reviews ====================

Write-Host "`n`n[STEP 3] HOD reviews the syllabus..." -ForegroundColor Yellow

# Get syllabuses pending review
Write-Host "`nA. HOD checks pending review syllabuses:" -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $HOD_TOKEN"
}

try {
    $pendingReview = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/by-status/PENDING_REVIEW" -Method GET -Headers $headers
    Write-Host "  Found $($pendingReview.Count) syllabuses in PENDING_REVIEW" -ForegroundColor Gray
} catch {
    Write-Host "  Failed to get pending review list" -ForegroundColor Red
}

# Option 1: HOD can reject (uncomment to test rejection)
# Write-Host "`nB. HOD REJECTS the syllabus:" -ForegroundColor Cyan
# $rejectData = @{
#     comment = "Need more details in course objectives"
# } | ConvertTo-Json

# $headers["Content-Type"] = $CONTENT_TYPE
# try {
#     $rejectResponse = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/$SYLLABUS_ID/hod-reject" -Method POST -Body $rejectData -Headers $headers
#     Write-Host "✓ HOD rejected syllabus" -ForegroundColor Green
#     Write-Host "  New Status: $($rejectResponse.newStatus)" -ForegroundColor Gray
# } catch {
#     Write-Host "✗ Failed to reject" -ForegroundColor Red
# }

# Option 2: HOD approves
Write-Host "`nB. HOD APPROVES the syllabus:" -ForegroundColor Cyan
$approveData = @{
    comment = "Syllabus looks good, sending to Academic Affairs"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $HOD_TOKEN"
    "Content-Type" = $CONTENT_TYPE
}

try {
    $approveResponse = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/$SYLLABUS_ID/hod-approve" -Method POST -Body $approveData -Headers $headers
    Write-Host "✓ HOD approved syllabus" -ForegroundColor Green
    Write-Host "  Previous Status: $($approveResponse.previousStatus)" -ForegroundColor Gray
    Write-Host "  New Status: $($approveResponse.newStatus)" -ForegroundColor Gray
    Write-Host "  Message: $($approveResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to approve" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# ==================== STEP 4: AA reviews ====================

Write-Host "`n`n[STEP 4] Academic Affairs reviews the syllabus..." -ForegroundColor Yellow

# Get syllabuses pending approval
Write-Host "`nA. AA checks pending approval syllabuses:" -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $AA_TOKEN"
}

try {
    $pendingApproval = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/by-status/PENDING_APPROVAL" -Method GET -Headers $headers
    Write-Host "  Found $($pendingApproval.Count) syllabuses in PENDING_APPROVAL" -ForegroundColor Gray
} catch {
    Write-Host "  Failed to get pending approval list" -ForegroundColor Red
}

# Option 1: AA can reject (uncomment to test rejection)
# Write-Host "`nB. AA REJECTS the syllabus:" -ForegroundColor Cyan
# $aaRejectData = @{
#     comment = "Assessment methods need revision"
# } | ConvertTo-Json

# $headers["Content-Type"] = $CONTENT_TYPE
# try {
#     $aaRejectResponse = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/$SYLLABUS_ID/aa-reject" -Method POST -Body $aaRejectData -Headers $headers
#     Write-Host "✓ AA rejected syllabus" -ForegroundColor Green
#     Write-Host "  New Status: $($aaRejectResponse.newStatus)" -ForegroundColor Gray
# } catch {
#     Write-Host "✗ Failed to reject" -ForegroundColor Red
# }

# Option 2: AA approves and publishes
Write-Host "`nB. AA APPROVES and PUBLISHES the syllabus:" -ForegroundColor Cyan
$aaApproveData = @{
    comment = "Approved for publication"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $AA_TOKEN"
    "Content-Type" = $CONTENT_TYPE
}

try {
    $aaApproveResponse = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/$SYLLABUS_ID/aa-approve" -Method POST -Body $aaApproveData -Headers $headers
    Write-Host "✓ AA approved and published syllabus" -ForegroundColor Green
    Write-Host "  Previous Status: $($aaApproveResponse.previousStatus)" -ForegroundColor Gray
    Write-Host "  New Status: $($aaApproveResponse.newStatus)" -ForegroundColor Gray
    Write-Host "  Message: $($aaApproveResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to publish" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# ==================== STEP 5: View workflow history ====================

Write-Host "`n`n[STEP 5] Viewing workflow history..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $LECTURER_TOKEN"
}

try {
    $history = Invoke-RestMethod -Uri "$BASE_URL/syllabuses/$SYLLABUS_ID/workflow-history" -Method GET -Headers $headers
    Write-Host "✓ Workflow history retrieved ($($history.Count) records):" -ForegroundColor Green
    
    foreach ($record in $history) {
        Write-Host "`n  Action: $($record.action)" -ForegroundColor Cyan
        Write-Host "  By: $($record.actionBy.username) ($($record.actionBy.fullName))" -ForegroundColor Gray
        Write-Host "  Time: $($record.actionTime)" -ForegroundColor Gray
        Write-Host "  Comment: $($record.comment)" -ForegroundColor Gray
        Write-Host "  Step: $($record.workflowStep.stepName)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to retrieve workflow history" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "WORKFLOW TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
