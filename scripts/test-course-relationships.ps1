# Script test API Course Relationship
# Test các tính năng cây quan hệ môn học

$baseUrl = "http://localhost:8080/api/v1"

Write-Host "=== TEST COURSE RELATIONSHIP API ===" -ForegroundColor Green
Write-Host ""

# 1. Tạo relationship PREREQUISITE
Write-Host "1. Tạo PREREQUISITE: CS202 requires CS101" -ForegroundColor Yellow
$createPrerequisite = @{
    courseId = 2
    relatedCourseId = 1
    relationType = "PREREQUISITE"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations" `
        -Method Post `
        -ContentType "application/json" `
        -Body $createPrerequisite `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Created:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 2. Tạo relationship COREQUISITE
Write-Host "2. Tạo COREQUISITE: CS301 with CS302" -ForegroundColor Yellow
$createCorequisite = @{
    courseId = 3
    relatedCourseId = 4
    relationType = "COREQUISITE"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations" `
        -Method Post `
        -ContentType "application/json" `
        -Body $createCorequisite `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Created:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 3. Lấy tất cả relationships của một course
Write-Host "3. Lấy relationships của courseId = 2" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations/course/2" `
        -Method Get `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Relationships:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 4. Lấy cây quan hệ
Write-Host "4. Lấy cây quan hệ của courseId = 2" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations/tree/2" `
        -Method Get `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Course Tree:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 5. Kiểm tra circular dependency
Write-Host "5. Kiểm tra circular dependency" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations/check-circular?courseId=1&relatedCourseId=2" `
        -Method Get `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Check result:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 6. Lấy available prerequisites
Write-Host "6. Lấy available prerequisites cho courseId = 2" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations/available-prerequisites/2" `
        -Method Get `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Available:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 7. Lấy statistics
Write-Host "7. Lấy statistics cho departmentId = 1" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations/statistics/department/1" `
        -Method Get `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✓ Statistics:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host ""

# 8. Test error case: Circular dependency
Write-Host "8. Test tạo circular dependency (should fail)" -ForegroundColor Yellow
$createCircular = @{
    courseId = 1
    relatedCourseId = 2
    relationType = "PREREQUISITE"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/course-relations" `
        -Method Post `
        -ContentType "application/json" `
        -Body $createCircular `
        -Headers @{Authorization = "Bearer YOUR_TOKEN"}
    
    Write-Host "✗ Should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected circular dependency" -ForegroundColor Green
    Write-Host "Error: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green
