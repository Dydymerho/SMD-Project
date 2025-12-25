# Quick Database Viewer Script
param(
    [string]$Command = "menu"
)

$dbHost = "smd_postgres"
$dbUser = "root"
$dbName = "smd_db"

function Show-Menu {
    Write-Host "`n=== DATABASE VIEWER ===" -ForegroundColor Cyan
    Write-Host "1. List all tables" -ForegroundColor Yellow
    Write-Host "2. View Courses" -ForegroundColor Yellow
    Write-Host "3. View Users" -ForegroundColor Yellow
    Write-Host "4. View Syllabuses" -ForegroundColor Yellow
    Write-Host "5. View Departments" -ForegroundColor Yellow
    Write-Host "6. View Programs" -ForegroundColor Yellow
    Write-Host "7. Custom SQL query" -ForegroundColor Yellow
    Write-Host "8. Interactive psql" -ForegroundColor Yellow
    Write-Host "0. Exit" -ForegroundColor Red
    Write-Host ""
}

function Run-Query {
    param([string]$Query)
    docker exec $dbHost psql -U $dbUser -d $dbName -c $Query
}

if ($Command -eq "menu") {
    while ($true) {
        Show-Menu
        $choice = Read-Host "Choose option"
        
        switch ($choice) {
            "1" {
                Write-Host "`nAll Tables:" -ForegroundColor Green
                Run-Query "\dt"
            }
            "2" {
                Write-Host "`nCourses:" -ForegroundColor Green
                Run-Query "SELECT c.course_id, c.course_code, c.course_name, c.credits, d.dept_name FROM course c LEFT JOIN department d ON c.department_id = d.department_id ORDER BY c.course_id;"
            }
            "3" {
                Write-Host "`nUsers:" -ForegroundColor Green
                Run-Query "SELECT user_id, username, full_name, email, status FROM \`"user\`" ORDER BY user_id;"
            }
            "4" {
                Write-Host "`nSyllabuses:" -ForegroundColor Green
                Run-Query "SELECT s.syllabus_id, c.course_code, c.course_name, u.username as lecturer, s.academic_year, s.version_no, s.current_status FROM syllabus s LEFT JOIN course c ON s.course_id = c.course_id LEFT JOIN \`"user\`" u ON s.lecturer_id = u.user_id ORDER BY s.syllabus_id;"
            }
            "5" {
                Write-Host "`nDepartments:" -ForegroundColor Green
                Run-Query "SELECT * FROM department ORDER BY department_id;"
            }
            "6" {
                Write-Host "`nPrograms:" -ForegroundColor Green
                Run-Query "SELECT p.program_id, p.program_name, d.dept_name FROM program p LEFT JOIN department d ON p.department_id = d.department_id ORDER BY p.program_id;"
            }
            "7" {
                $query = Read-Host "Enter SQL query"
                Run-Query $query
            }
            "8" {
                Write-Host "Entering interactive psql mode. Type '\q' to exit." -ForegroundColor Yellow
                docker exec -it $dbHost psql -U $dbUser -d $dbName
            }
            "0" {
                Write-Host "Goodbye!" -ForegroundColor Cyan
                return
            }
            default {
                Write-Host "Invalid option!" -ForegroundColor Red
            }
        }
        
        Write-Host "`nPress Enter to continue..." -ForegroundColor Gray
        Read-Host
    }
} else {
    # Direct command mode
    Run-Query $Command
}
