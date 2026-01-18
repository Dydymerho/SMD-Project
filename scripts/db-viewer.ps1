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
    Write-Host "7. View Roles" -ForegroundColor Yellow
    Write-Host "8. View User Roles" -ForegroundColor Yellow
    Write-Host "9. View Assessments" -ForegroundColor Yellow
    Write-Host "10. View CLOs (Course Learning Outcomes)" -ForegroundColor Yellow
    Write-Host "11. View PLOs (Program Learning Outcomes)" -ForegroundColor Yellow
    Write-Host "12. View CLO-PLO Mappings" -ForegroundColor Yellow
    Write-Host "13. View Materials" -ForegroundColor Yellow
    Write-Host "14. View Session Plans" -ForegroundColor Yellow
    Write-Host "15. View Course Relations" -ForegroundColor Yellow
    Write-Host "16. View Review Comments" -ForegroundColor Yellow
    Write-Host "17. View Workflow Steps" -ForegroundColor Yellow
    Write-Host "18. View Syllabus Workflow History" -ForegroundColor Yellow
    Write-Host "19. View Syllabus Audit Logs" -ForegroundColor Yellow
    Write-Host "20. View AI Tasks" -ForegroundColor Yellow
    Write-Host "21. Custom SQL query" -ForegroundColor Yellow
    Write-Host "22. Interactive psql" -ForegroundColor Yellow
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
                Write-Host "`nRoles:" -ForegroundColor Green
                Run-Query "SELECT * FROM role ORDER BY role_id;"
            }
            "8" {
                Write-Host "`nUser Roles:" -ForegroundColor Green
                Run-Query "SELECT ur.user_role_id, u.username, u.full_name, r.role_name FROM user_role ur LEFT JOIN \`"user\`" u ON ur.user_id = u.user_id LEFT JOIN role r ON ur.role_id = r.role_id ORDER BY ur.user_role_id;"
            }
            "9" {
                Write-Host "`nAssessments:" -ForegroundColor Green
                Run-Query "SELECT a.assessment_id, s.syllabus_id, c.course_code, a.name, a.weight_percent, a.criteria FROM assessment a LEFT JOIN syllabus s ON a.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id ORDER BY a.assessment_id;"
            }
            "10" {
                Write-Host "`nCLOs (Course Learning Outcomes):" -ForegroundColor Green
                Run-Query "SELECT clo.clo_id, s.syllabus_id, c.course_code, clo.clo_code, clo.description FROM clo clo LEFT JOIN syllabus s ON clo.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id ORDER BY clo.clo_id;"
            }
            "11" {
                Write-Host "`nPLOs (Program Learning Outcomes):" -ForegroundColor Green
                Run-Query "SELECT plo.plo_id, p.program_name, plo.plo_code, plo.plo_description FROM plo plo LEFT JOIN program p ON plo.program_id = p.program_id ORDER BY plo.plo_id;"
            }
            "12" {
                Write-Host "`nCLO-PLO Mappings:" -ForegroundColor Green
                Run-Query "SELECT cp.mapping_id, clo.clo_code, plo.plo_code, cp.mapping_level FROM clo_plo_mapping cp LEFT JOIN clo ON cp.clo_id = clo.clo_id LEFT JOIN plo ON cp.plo_id = plo.plo_id ORDER BY cp.mapping_id;"
            }
            "13" {
                Write-Host "`nMaterials:" -ForegroundColor Green
                Run-Query "SELECT m.material_id, s.syllabus_id, c.course_code, m.material_type, m.title, m.author FROM material m LEFT JOIN syllabus s ON m.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id ORDER BY m.material_id;"
            }
            "14" {
                Write-Host "`nSession Plans:" -ForegroundColor Green
                Run-Query "SELECT sp.session_plan_id, s.syllabus_id, c.course_code, sp.session_number, sp.topic, sp.teaching_method FROM session_plan sp LEFT JOIN syllabus s ON sp.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id ORDER BY sp.session_plan_id;"
            }
            "15" {
                Write-Host "`nCourse Relations:" -ForegroundColor Green
                Run-Query "SELECT cr.relation_id, c1.course_code as course, c2.course_code as related_course, cr.relation_type FROM course_relation cr LEFT JOIN course c1 ON cr.course_id = c1.course_id LEFT JOIN course c2 ON cr.related_course_id = c2.course_id ORDER BY cr.relation_id;"
            }
            "16" {
                Write-Host "`nReview Comments:" -ForegroundColor Green
                Run-Query "SELECT rc.comment_id, s.syllabus_id, c.course_code, u.username as commenter, rc.content, rc.created_at FROM review_comment rc LEFT JOIN syllabus s ON rc.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id LEFT JOIN \`"user\`" u ON rc.user_id = u.user_id ORDER BY rc.comment_id;"
            }
            "17" {
                Write-Host "`nWorkflow Steps:" -ForegroundColor Green
                Run-Query "SELECT * FROM workflow_step ORDER BY step_id;"
            }
            "18" {
                Write-Host "`nSyllabus Workflow History:" -ForegroundColor Green
                Run-Query "SELECT swh.history_id, s.syllabus_id, c.course_code, ws.step_name, u.username as action_by, swh.action, swh.comment, swh.action_time FROM syllabus_workflow_history swh LEFT JOIN syllabus s ON swh.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id LEFT JOIN workflow_step ws ON swh.step_id = ws.step_id LEFT JOIN \`"user\`" u ON swh.action_by = u.user_id ORDER BY swh.history_id DESC LIMIT 20;"
            }
            "19" {
                Write-Host "`nSyllabus Audit Logs (Last 20):" -ForegroundColor Green
                Run-Query "SELECT sal.log_id, s.syllabus_id, c.course_code, u.username as user, sal.action, sal.field_name, sal.created_at FROM syllabus_audit_log sal LEFT JOIN syllabus s ON sal.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id LEFT JOIN \`"user\`" u ON sal.user_id = u.user_id ORDER BY sal.log_id DESC LIMIT 20;"
            }
            "20" {
                Write-Host "`nAI Tasks:" -ForegroundColor Green
                Run-Query "SELECT ai.task_id, s.syllabus_id, c.course_code, ai.task_type, ai.task_status, ai.created_at FROM ai_task ai LEFT JOIN syllabus s ON ai.syllabus_id = s.syllabus_id LEFT JOIN course c ON s.course_id = c.course_id ORDER BY ai.task_id DESC LIMIT 20;"
            }
            "21" {
                $query = Read-Host "Enter SQL query"
                Run-Query $query
            }
            "22" {
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
