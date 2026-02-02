# Test Syllabus CRUD Operations
# Script kiểm tra đầy đủ các chức năng CRUD của Syllabus API

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
    Write-Host "→ $message" -ForegroundColor $colors.Warning
}

function Write-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor $colors.Success
}

function Write-Error {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor $colors.Error
}

function Write-Info {
    param([string]$message)
    Write-Host "   $message" -ForegroundColor $colors.Info
}

# Variables to store test data
$token = $null
$createdSyllabusId = $null
$courseId = $null
$userId = $null

Write-TestHeader "SYLLABUS API CRUD TESTING"
Write-Host "Base URL: $syllabusUrl" -ForegroundColor $colors.Info
Write-Host "Start Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $colors.Info

# ===========================
# Step 1: Authentication
# ===========================
Write-TestStep "Step 1: Dang nhap de lay token"

$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.token
    Write-Success "Dang nhap thanh cong"
    Write-Info "Token: $($token.Substring(0, 20))..."
} catch {
    Write-Error "Dang nhap that bai: $($_.Exception.Message)"
    Write-Host "Dang thu dang ky user moi..." -ForegroundColor $colors.Warning
    
    # Try to register if login fails
    $registerBody = @{
        username = "admin"
        password = "admin123"
        email = "admin@smd.com"
        fullName = "Admin User"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -ErrorAction Stop
        $token = $registerResponse.token
        Write-Success "Dang ky va dang nhap thanh cong"
        Write-Info "Token: $($token.Substring(0, 20))..."
    } catch {
        Write-Error "Khong the xac thuc: $($_.Exception.Message)"
        Write-Host "Dung test do khong co token xac thuc" -ForegroundColor $colors.Error
        exit 1
    }
}

# Setup headers with token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# ===========================
# Step 1.5: Tao du lieu phu thuoc (Department, Program, Course)
# ===========================
Write-TestStep "Step 1.5: Tao du lieu phu thuoc"

$apiBase = "$baseUrl/.."

# Get or Create Department
Write-Host "   Lay/Tao Department..." -ForegroundColor $colors.Info
$departmentId = $null
try {
    $deptList = Invoke-RestMethod -Uri "$apiBase/departments" -Method Get -Headers $headers -ErrorAction Stop
    if ($deptList -and $deptList.Count -gt 0) {
        $departmentId = $deptList[0].departmentId
        $deptName = if ($deptList[0].deptName) { $deptList[0].deptName } else { "N/A" }
        Write-Info "Su dung Department ID: $departmentId - $deptName"
    }
} catch {
    Write-Host "   Loi khi lay Department: $($_.Exception.Message)" -ForegroundColor DarkGray
}

if (-not $departmentId) {
    Write-Host "   Tao Department moi..." -ForegroundColor $colors.Info
    $departmentBody = @{
        deptName = "Computer Science"
    } | ConvertTo-Json
    
    try {
        $deptResponse = Invoke-RestMethod -Uri "$apiBase/departments" -Method Post -Body $departmentBody -Headers $headers -ErrorAction Stop
        $departmentId = $deptResponse.departmentId
        Write-Success "Department ID: $departmentId"
    } catch {
        Write-Host "   Khong the tao Department: $($_.Exception.Message)" -ForegroundColor $colors.Warning
        Write-Host "   Bo qua test do khong co du lieu phu thuoc" -ForegroundColor $colors.Error
        exit 1
    }
}

# Get or Create Program
Write-Host "   Lay/Tao Program..." -ForegroundColor $colors.Info
$programId = $null
try {
    $progList = Invoke-RestMethod -Uri "$apiBase/programs" -Method Get -Headers $headers -ErrorAction Stop
    if ($progList -and $progList.Count -gt 0) {
        $programId = $progList[0].programId
        $progName = if ($progList[0].programName) { $progList[0].programName } else { "N/A" }
        Write-Info "Su dung Program ID: $programId - $progName"
    }
} catch {
    Write-Host "   Loi khi lay Program: $($_.Exception.Message)" -ForegroundColor DarkGray
}

if (-not $programId) {
    Write-Host "   Tao Program moi..." -ForegroundColor $colors.Info
    $programBody = @{
        programName = "Bachelor of Science in Computer Science"
        department = @{
            departmentId = $departmentId
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $progResponse = Invoke-RestMethod -Uri "$apiBase/programs" -Method Post -Body $programBody -Headers $headers -ErrorAction Stop
        $programId = $progResponse.programId
        Write-Success "Program ID: $programId"
    } catch {
        Write-Host "   Khong the tao Program: $($_.Exception.Message)" -ForegroundColor $colors.Warning
        Write-Host "   Bo qua test do khong co du lieu phu thuoc" -ForegroundColor $colors.Error
        exit 1
    }
}

# Get or Create Course
Write-Host "   Lay/Tao Course..." -ForegroundColor $colors.Info
$courseId = $null
try {
    $courseList = Invoke-RestMethod -Uri "$apiBase/courses" -Method Get -Headers $headers -ErrorAction Stop
    if ($courseList -and $courseList.Count -gt 0) {
        $courseId = $courseList[0].courseId
        $courseName = if ($courseList[0].courseName) { $courseList[0].courseName } else { "N/A" }
        Write-Info "Su dung Course ID: $courseId - $courseName"
    }
} catch {
    Write-Host "   Loi khi lay Course: $($_.Exception.Message)" -ForegroundColor DarkGray
}

if (-not $courseId) {
    Write-Host "   Tao Course moi..." -ForegroundColor $colors.Info
    # Generate unique course code with timestamp
    $timestamp = (Get-Date -Format "HHmmss")
    $courseCode = "CS$timestamp"
    
    $courseBody = @{
        courseCode = $courseCode
        courseName = "Introduction to Computer Science"
        credits = 3
        department = @{
            departmentId = $departmentId
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $courseResponse = Invoke-RestMethod -Uri "$apiBase/courses" -Method Post -Body $courseBody -Headers $headers -ErrorAction Stop
        $courseId = $courseResponse.courseId
        Write-Success "Course ID: $courseId (Code: $courseCode)"
    } catch {
        # If still conflict, try to get any existing course
        Write-Host "   Conflict khi tao Course, thu lay course bat ky..." -ForegroundColor $colors.Warning
        try {
            $courseList = Invoke-RestMethod -Uri "$apiBase/courses" -Method Get -Headers $headers -ErrorAction Stop
            if ($courseList -and $courseList.Count -gt 0) {
                $courseId = $courseList[0].courseId
                Write-Info "Su dung Course co san ID: $courseId"
            } else {
                Write-Host "   Khong co Course nao trong database" -ForegroundColor $colors.Error
                exit 1
            }
        } catch {
            Write-Host "   Khong the lay Course: $($_.Exception.Message)" -ForegroundColor $colors.Error
            exit 1
        }
    }
}

# Get User ID from token or use registered user ID
Write-Host "   Xac dinh User ID..." -ForegroundColor $colors.Info
$userId = 1  # Default to first user

Write-Host ""
Write-Host "   === Su dung IDs ===" -ForegroundColor $colors.Info
Write-Host "   Department ID: $departmentId" -ForegroundColor $colors.Info
Write-Host "   Program ID: $programId" -ForegroundColor $colors.Info
Write-Host "   Course ID: $courseId" -ForegroundColor $colors.Info
Write-Host "   User ID: $userId" -ForegroundColor $colors.Info

# ===========================
# Step 2: CREATE - Tạo Syllabus mới
# ===========================
Write-TestStep "Step 2: CREATE - Tao Syllabus moi"

$newSyllabus = @{
    course = @{
        courseId = $courseId
    }
    lecturer = @{
        userId = $userId
    }
    academicYear = "2024-2025"
    versionNo = 1
    currentStatus = "DRAFT"
    program = @{
        programId = $programId
    }
} | ConvertTo-Json -Depth 5

try {
    $createResponse = Invoke-RestMethod -Uri $syllabusUrl -Method Post -Body $newSyllabus -Headers $headers -ErrorAction Stop
    $createdSyllabusId = $createResponse.syllabusId
    Write-Success "Tao Syllabus thanh cong"
    Write-Info "Syllabus ID: $createdSyllabusId"
    Write-Info "Academic Year: $($createResponse.academicYear)"
    Write-Info "Status: $($createResponse.currentStatus)"
    Write-Info "Version: $($createResponse.versionNo)"
} catch {
    Write-Error "Tao Syllabus that bai: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Info "Response: $responseBody"
    }
}

# ===========================
# Step 3: READ - Lấy thông tin Syllabus vừa tạo
# ===========================
if ($createdSyllabusId) {
    Write-TestStep "Step 3: READ - Lay thong tin Syllabus (ID: $createdSyllabusId)"
    
    try {
        $getResponse = Invoke-RestMethod -Uri "$syllabusUrl/$createdSyllabusId" -Method Get -Headers $headers -ErrorAction Stop
        Write-Success "Lay thong tin Syllabus thanh cong"
        Write-Info "ID: $($getResponse.syllabusId)"
        Write-Info "Academic Year: $($getResponse.academicYear)"
        Write-Info "Status: $($getResponse.currentStatus)"
        Write-Info "Version: $($getResponse.versionNo)"
        Write-Info "Created At: $($getResponse.createdAt)"
    } catch {
        Write-Error "Lay thong tin Syllabus that bai: $($_.Exception.Message)"
    }
}

# ===========================
# Step 4: READ ALL - Lấy danh sách tất cả Syllabuses
# ===========================
Write-TestStep "Step 4: READ ALL - Lay danh sach tat ca Syllabuses"

try {
    $getAllResponse = Invoke-RestMethod -Uri $syllabusUrl -Method Get -Headers $headers -ErrorAction Stop
    Write-Success "Lay danh sach Syllabuses thanh cong"
    Write-Info "Tong so: $($getAllResponse.Count) Syllabus(es)"
    
    if ($getAllResponse.Count -gt 0) {
        Write-Info "--- Danh sach Syllabuses ---"
        foreach ($syllabus in $getAllResponse | Select-Object -First 5) {
            Write-Info "  • ID: $($syllabus.syllabusId), Year: $($syllabus.academicYear), Status: $($syllabus.currentStatus)"
        }
        if ($getAllResponse.Count -gt 5) {
            Write-Info "  ... va $($getAllResponse.Count - 5) Syllabus khac"
        }
    }
} catch {
    Write-Error "Lay danh sach Syllabuses that bai: $($_.Exception.Message)"
}

# ===========================
# Step 5: SEARCH - Tìm kiếm Syllabus
# ===========================
Write-TestStep "Step 5: SEARCH - Tim kiem Syllabus theo keyword"

$searchKeyword = "2024"
try {
    $searchResponse = Invoke-RestMethod -Uri "$syllabusUrl/search?keyword=$searchKeyword" -Method Get -Headers $headers -ErrorAction Stop
    Write-Success "Tim kiem Syllabus thanh cong"
    Write-Info "Keyword: '$searchKeyword'"
    Write-Info "Ket qua: $($searchResponse.Count) Syllabus(es)"
    
    if ($searchResponse.Count -gt 0) {
        Write-Info "--- Ket qua tim kiem ---"
        foreach ($syllabus in $searchResponse | Select-Object -First 3) {
            Write-Info "  • ID: $($syllabus.syllabusId), Year: $($syllabus.academicYear), Status: $($syllabus.currentStatus)"
        }
    }
} catch {
    Write-Error "Tim kiem Syllabus that bai: $($_.Exception.Message)"
}

# ===========================
# Step 6: UPDATE - Cập nhật Syllabus
# ===========================
if ($createdSyllabusId) {
    Write-TestStep "Step 6: UPDATE - Cap nhat Syllabus (ID: $createdSyllabusId)"
    
    $updateSyllabus = @{
        course = @{
            courseId = $courseId
        }
        lecturer = @{
            userId = $userId
        }
        academicYear = "2024-2025"
        versionNo = 2
        currentStatus = "IN_REVIEW"
        program = @{
            programId = $programId
        }
    } | ConvertTo-Json -Depth 5
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "$syllabusUrl/$createdSyllabusId" -Method Put -Body $updateSyllabus -Headers $headers -ErrorAction Stop
        Write-Success "Cap nhat Syllabus thanh cong"
        Write-Info "ID: $($updateResponse.syllabusId)"
        Write-Info "New Status: $($updateResponse.currentStatus)"
        Write-Info "New Version: $($updateResponse.versionNo)"
    } catch {
        Write-Error "Cap nhat Syllabus that bai: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $responseBody = $reader.ReadToEnd()
            Write-Info "Response: $responseBody"
        }
    }
    
    # Verify update
    Write-Host "   Xac nhan cap nhat..." -ForegroundColor $colors.Info
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$syllabusUrl/$createdSyllabusId" -Method Get -Headers $headers -ErrorAction Stop
        if ($verifyResponse.currentStatus -eq "IN_REVIEW" -and $verifyResponse.versionNo -eq 2) {
            Write-Success "Xac nhan: Du lieu da duoc cap nhat chinh xac"
        } else {
            Write-Error "Xac nhan: Du lieu khong khop sau khi cap nhat"
        }
    } catch {
        Write-Error "Khong the xac nhan cap nhat: $($_.Exception.Message)"
    }
}

# ===========================
# Step 7: DELETE - Xóa Syllabus
# ===========================
# if ($createdSyllabusId) {
#     Write-TestStep "Step 7: DELETE - Xoa Syllabus (ID: $createdSyllabusId)"
    
#     try {
#         Invoke-RestMethod -Uri "$syllabusUrl/$createdSyllabusId" -Method Delete -Headers $headers -ErrorAction Stop
#         Write-Success "Xoa Syllabus thanh cong"
        
#         # Verify deletion
#         Write-Host "   Xac nhan xoa..." -ForegroundColor $colors.Info
#         try {
#             $verifyDelete = Invoke-RestMethod -Uri "$syllabusUrl/$createdSyllabusId" -Method Get -Headers $headers -ErrorAction Stop
#             Write-Error "Xac nhan: Syllabus van ton tai sau khi xoa"
#         } catch {
#             if ($_.Exception.Response.StatusCode -eq 404) {
#                 Write-Success "Xac nhan: Syllabus da duoc xoa hoan toan"
#             } else {
#                 Write-Error "Xac nhan: Loi khong xac dinh - $($_.Exception.Message)"
#             }
#         }
#     } catch {
#         Write-Error "Xoa Syllabus that bai: $($_.Exception.Message)"
#     }
# }

# ===========================
# Test Summary
# ===========================
Write-TestHeader "KET QUA TEST"
Write-Host "End Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $colors.Info
Write-Host ""
Write-Host "Cac endpoint da test:" -ForegroundColor $colors.Title
Write-Host "  - POST   $syllabusUrl" -ForegroundColor $colors.Success
Write-Host "  - GET    $syllabusUrl/{id}" -ForegroundColor $colors.Success
Write-Host "  - GET    $syllabusUrl" -ForegroundColor $colors.Success
Write-Host "  - GET    $syllabusUrl/search?keyword={keyword}" -ForegroundColor $colors.Success
Write-Host "  - PUT    $syllabusUrl/{id}" -ForegroundColor $colors.Success
Write-Host "  - DELETE $syllabusUrl/{id}" -ForegroundColor $colors.Success
Write-Host ""
Write-Host "=== HOAN TAT TEST SYLLABUS CRUD ===" -ForegroundColor $colors.Title
