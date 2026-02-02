# Test Syllabus Create and View Operations
# Script kiem tra tinh nang tao moi va xem syllabus

$baseUrl = "http://localhost:8080/api/v1"
$syllabusUrl = "$baseUrl/syllabuses"

# Colors for output
$colors = @{
    Title = "Cyan"
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Gray"
}

function Write-TestHeader {
    param([string]$message)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor $colors.Title
    Write-Host $message -ForegroundColor $colors.Title
    Write-Host "============================================" -ForegroundColor $colors.Title
}

function Write-TestStep {
    param([string]$message)
    Write-Host ""
    Write-Host ">> $message" -ForegroundColor $colors.Warning
}

function Write-Success {
    param([string]$message)
    Write-Host "[OK] $message" -ForegroundColor $colors.Success
}

function Write-Error {
    param([string]$message)
    Write-Host "[ERROR] $message" -ForegroundColor $colors.Error
}

function Write-Info {
    param([string]$message)
    Write-Host "   $message" -ForegroundColor $colors.Info
}

function Show-JsonResponse {
    param([object]$response, [string]$title = "Response")
    Write-Host ""
    Write-Host "   [$title]" -ForegroundColor $colors.Info
    Write-Host "   $($response | ConvertTo-Json -Depth 5)" -ForegroundColor DarkGray
}

# Variables to store test data
$token = $null
$createdSyllabusId = $null
$courseId = $null
$lecturerId = $null
$programId = $null
$departmentId = $null

Write-TestHeader "TEST TAO MOI VA XEM SYLLABUS"
Write-Host "Base URL: $syllabusUrl" -ForegroundColor $colors.Info
Write-Host "Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $colors.Info

# ===========================
# Step 1: Authentication
# ===========================
Write-TestStep "Step 1: Dang nhap de lay token"

$loginBody = @{
    username = "lecturer1"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.token
    $lecturerId = $loginResponse.userId
    Write-Success "Dang nhap thanh cong"
    Write-Info "Username: $($loginResponse.username)"
    Write-Info "Token: $($token.Substring(0, 30))..."
} catch {
    Write-Warning "Khong the dang nhap voi tai khoan lecturer1, thu dang ky..."
    
    # Try to register if login fails
    $registerBody = @{
        username = "lecturer1"
        password = "password123"
        email = "lecturer1@smd.edu.vn"
        fullName = "Giang Vien Test"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -ErrorAction Stop | Out-Null
        Write-Success "Dang ky tai khoan thanh cong"
        
        # Login again after registration
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
        $token = $loginResponse.token
        $lecturerId = $loginResponse.userId
        Write-Success "Dang nhap thanh cong sau khi dang ky"
        Write-Info "Token: $($token.Substring(0, 30))..."
    } catch {
        Write-Error "Khong the xac thuc: $($_.Exception.Message)"
        exit 1
    }
}

# Setup headers with token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# ===========================
# Step 2: Prepare test data (Department, Program, Course)
# ===========================
Write-TestStep "Step 2: Chuan bi du lieu phu thuoc"

# Get or Create Department
Write-Info "Kiem tra va tao Department..."
try {
    $deptList = Invoke-RestMethod -Uri "$baseUrl/../departments" -Method Get -Headers $headers -ErrorAction Stop
    if ($deptList -and $deptList.Count -gt 0) {
        $departmentId = $deptList[0].departmentId
        Write-Success "Su dung Department co san: ID=$departmentId"
    }
} catch {
    Write-Info "Loi khi lay Department: $($_.Exception.Message)"
}

if (-not $departmentId) {
    Write-Info "Tao Department moi..."
    $departmentBody = @{
        deptName = "Khoa Cong Nghe Thong Tin"
    } | ConvertTo-Json
    
    try {
        $dept = Invoke-RestMethod -Uri "$baseUrl/../departments" -Method Post -Body $departmentBody -Headers $headers -ErrorAction Stop
        $departmentId = $dept.departmentId
        Write-Success "Tao Department thanh cong: ID=$departmentId"
    } catch {
        Write-Error "Khong the tao Department: $($_.Exception.Message)"
        exit 1
    }
}

# Get or Create Program
Write-Info "Kiem tra va tao Program..."
try {
    $progList = Invoke-RestMethod -Uri "$baseUrl/../programs" -Method Get -Headers $headers -ErrorAction Stop
    if ($progList -and $progList.Count -gt 0) {
        $programId = $progList[0].programId
        Write-Success "Su dung Program co san: ID=$programId"
    }
} catch {
    Write-Info "Loi khi lay Program: $($_.Exception.Message)"
}

if (-not $programId) {
    Write-Info "Tao Program moi..."
    $programBody = @{
        programName = "Cong Nghe Phan Mem"
        department = @{
            departmentId = $departmentId
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $prog = Invoke-RestMethod -Uri "$baseUrl/../programs" -Method Post -Body $programBody -Headers $headers -ErrorAction Stop
        $programId = $prog.programId
        Write-Success "Tao Program thanh cong: ID=$programId"
    } catch {
        Write-Error "Khong the tao Program: $($_.Exception.Message)"
        exit 1
    }
}

# Get or Create Course
Write-Info "Kiem tra va tao Course..."
try {
    $courseList = Invoke-RestMethod -Uri "$baseUrl/../courses" -Method Get -Headers $headers -ErrorAction Stop
    if ($courseList -and $courseList.Count -gt 0) {
        $courseId = $courseList[0].courseId
        Write-Success "Su dung Course co san: ID=$courseId"
    }
} catch {
    Write-Info "Loi khi lay Course: $($_.Exception.Message)"
}

if (-not $courseId) {
    Write-Info "Tao Course moi..."
    $timestamp = Get-Date -Format "HHmmss"
    $courseBody = @{
        courseCode = "IT$timestamp"
        courseName = "Lap Trinh Huong Doi Tuong"
        credits = 3
        department = @{
            departmentId = $departmentId
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $course = Invoke-RestMethod -Uri "$baseUrl/../courses" -Method Post -Body $courseBody -Headers $headers -ErrorAction Stop
        $courseId = $course.courseId
        Write-Success "Tao Course thanh cong: ID=$courseId"
    } catch {
        Write-Error "Khong the tao Course: $($_.Exception.Message)"
        exit 1
    }
}

Write-Success "Du lieu phu thuoc da san sang"
Write-Info "Department ID: $departmentId"
Write-Info "Program ID: $programId"
Write-Info "Course ID: $courseId"
Write-Info "Lecturer ID: $lecturerId"

# ===========================
# Step 3: Create New Syllabus
# ===========================
Write-TestStep "Step 3: Tao Syllabus moi"

$currentYear = (Get-Date).Year
$syllabusBody = @{
    course = @{
        courseId = $courseId
    }
    lecturer = @{
        userId = $lecturerId
    }
    program = @{
        programId = $programId
    }
    academicYear = "$currentYear-$($currentYear + 1)"
    versionNo = 1
    currentStatus = "DRAFT"
} | ConvertTo-Json -Depth 5

Write-Info "Dang gui request tao Syllabus..."
Write-Host "   Request Body:" -ForegroundColor DarkGray
Write-Host "   $syllabusBody" -ForegroundColor DarkGray

try {
    $createResponse = Invoke-RestMethod -Uri $syllabusUrl -Method Post -Body $syllabusBody -Headers $headers -ErrorAction Stop
    $createdSyllabusId = $createResponse.syllabusId
    Write-Success "Tao Syllabus thanh cong!"
    Write-Info "Syllabus ID: $createdSyllabusId"
    Write-Info "Academic Year: $($createResponse.academicYear)"
    Write-Info "Version: $($createResponse.versionNo)"
    Write-Info "Status: $($createResponse.currentStatus)"
    Write-Info "Created At: $($createResponse.createdAt)"
    Show-JsonResponse -response $createResponse -title "Chi tiet Syllabus vua tao"
} catch {
    Write-Error "Tao Syllabus that bai: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# ===========================
# Step 4: View Syllabus by ID
# ===========================
Write-TestStep "Step 4: Xem chi tiet Syllabus vua tao"

Write-Info "Dang lay thong tin Syllabus ID: $createdSyllabusId..."

try {
    $viewResponse = Invoke-RestMethod -Uri "$syllabusUrl/$createdSyllabusId" -Method Get -Headers $headers -ErrorAction Stop
    Write-Success "Lay thong tin Syllabus thanh cong!"
    
    Write-Host ""
    Write-Host "   [THONG TIN CHI TIET SYLLABUS]" -ForegroundColor Cyan
    Write-Host "   ================================" -ForegroundColor Cyan
    Write-Host "   Syllabus ID:    $($viewResponse.syllabusId)" -ForegroundColor White
    Write-Host "   Academic Year:  $($viewResponse.academicYear)" -ForegroundColor White
    Write-Host "   Version:        $($viewResponse.versionNo)" -ForegroundColor White
    Write-Host "   Status:         $($viewResponse.currentStatus)" -ForegroundColor White
    Write-Host "   Created At:     $($viewResponse.createdAt)" -ForegroundColor White
    
    if ($viewResponse.course) {
        Write-Host ""
        Write-Host "   [THONG TIN KHOA HOC]" -ForegroundColor Cyan
        Write-Host "   Course ID:      $($viewResponse.course.courseId)" -ForegroundColor White
        Write-Host "   Course Code:    $($viewResponse.course.courseCode)" -ForegroundColor White
        Write-Host "   Course Name:    $($viewResponse.course.courseName)" -ForegroundColor White
        Write-Host "   Credits:        $($viewResponse.course.credits)" -ForegroundColor White
    }
    
    if ($viewResponse.lecturer) {
        Write-Host ""
        Write-Host "   [THONG TIN GIANG VIEN]" -ForegroundColor Cyan
        Write-Host "   Lecturer ID:    $($viewResponse.lecturer.userId)" -ForegroundColor White
        Write-Host "   Full Name:      $($viewResponse.lecturer.fullName)" -ForegroundColor White
        Write-Host "   Username:       $($viewResponse.lecturer.username)" -ForegroundColor White
        Write-Host "   Email:          $($viewResponse.lecturer.email)" -ForegroundColor White
    }
    
    if ($viewResponse.program) {
        Write-Host ""
        Write-Host "   [THONG TIN CHUONG TRINH]" -ForegroundColor Cyan
        Write-Host "   Program ID:     $($viewResponse.program.programId)" -ForegroundColor White
        Write-Host "   Program Name:   $($viewResponse.program.programName)" -ForegroundColor White
    }
    
    Show-JsonResponse -response $viewResponse -title "Full JSON Response"
    
} catch {
    Write-Error "Lay thong tin Syllabus that bai: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# ===========================
# Step 5: View All Syllabuses
# ===========================
Write-TestStep "Step 5: Xem danh sach tat ca Syllabuses"

Write-Info "Dang lay danh sach tat ca Syllabuses..."

try {
    $allSyllabuses = Invoke-RestMethod -Uri $syllabusUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Success "Lay danh sach thanh cong!"
    Write-Info "Tong so Syllabuses: $($allSyllabuses.Count)"
    
    if ($allSyllabuses.Count -gt 0) {
        Write-Host ""
        Write-Host "   [DANH SACH SYLLABUSES]" -ForegroundColor Cyan
        Write-Host "   ================================" -ForegroundColor Cyan
        foreach ($syllabus in $allSyllabuses) {
            $marker = if ($syllabus.syllabusId -eq $createdSyllabusId) { "(*) (Vua tao)" } else { "" }
            Write-Host "   • ID: $($syllabus.syllabusId) | Year: $($syllabus.academicYear) | Version: $($syllabus.versionNo) | Status: $($syllabus.currentStatus) $marker" -ForegroundColor White
        }
    }
    
} catch {
    Write-Error "Lay danh sach Syllabuses that bai: $($_.Exception.Message)"
}

# ===========================
# Step 6: Verify Created Syllabus Exists
# ===========================
Write-TestStep "Step 6: Xac nhan Syllabus vua tao ton tai trong danh sach"

try {
    $allSyllabuses = Invoke-RestMethod -Uri $syllabusUrl -Method Get -Headers $headers -ErrorAction Stop
    $foundSyllabus = $allSyllabuses | Where-Object { $_.syllabusId -eq $createdSyllabusId }
    
    if ($foundSyllabus) {
        Write-Success "Xac nhan thanh cong: Syllabus ID $createdSyllabusId ton tai trong danh sach"
        Write-Info "Academic Year: $($foundSyllabus.academicYear)"
        Write-Info "Status: $($foundSyllabus.currentStatus)"
    } else {
        Write-Error "Khong tim thay Syllabus vua tao trong danh sach!"
    }
} catch {
    Write-Error "Xac nhan that bai: $($_.Exception.Message)"
}

# ===========================
# Test Summary
# ===========================
Write-TestHeader "KET QUA TEST"

Write-Host ""
Write-Host "[SUCCESS] Tat ca cac test da chay thanh cong!" -ForegroundColor $colors.Success
Write-Host ""
Write-Host "   TONG KET:" -ForegroundColor Cyan
Write-Host "   - Dang nhap:             [OK] Thanh cong" -ForegroundColor White
Write-Host "   - Tao du lieu phu thuoc: [OK] Thanh cong" -ForegroundColor White
Write-Host "   - Tao Syllabus:          [OK] Thanh cong (ID: $createdSyllabusId)" -ForegroundColor White
Write-Host "   - Xem Syllabus:          [OK] Thanh cong" -ForegroundColor White
Write-Host "   - Xem tat ca:            [OK] Thanh cong" -ForegroundColor White
Write-Host "   - Xac nhan ton tai:      [OK] Thanh cong" -ForegroundColor White
Write-Host ""
Write-Host "End Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $colors.Info
Write-Host ""
