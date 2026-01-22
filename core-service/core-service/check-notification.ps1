# Script to check and setup notification system
# Run this script to diagnose notification issues

Write-Host "=== Notification System Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "smd_db"
$DB_USER = "postgres"
$DB_PASSWORD = "postgres"

Write-Host "1. Checking if notifications table exists..." -ForegroundColor Yellow
$checkTableQuery = @"
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'notifications'
);
"@

$tableExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $checkTableQuery

if ($tableExists -match "t") {
    Write-Host "✅ Notifications table exists" -ForegroundColor Green
    
    # Check table structure
    Write-Host ""
    Write-Host "2. Checking notifications table structure..." -ForegroundColor Yellow
    $structureQuery = @"
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;
"@
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $structureQuery
    
} else {
    Write-Host "❌ Notifications table does NOT exist!" -ForegroundColor Red
    Write-Host "Running migration script..." -ForegroundColor Yellow
    
    $migrationPath = "init\init-notification.sql"
    if (Test-Path $migrationPath) {
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migrationPath
        Write-Host "✅ Migration script executed" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration script not found at: $migrationPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Checking if departments have Head of Department assigned..." -ForegroundColor Yellow
$hodQuery = @"
SELECT 
    d.department_id,
    d.dept_name,
    d.head_of_department_id,
    u.username as hod_username,
    u.full_name as hod_name
FROM department d
LEFT JOIN "user" u ON d.head_of_department_id = u.user_id
ORDER BY d.department_id;
"@
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $hodQuery

Write-Host ""
Write-Host "4. Checking if head_of_department_id column exists..." -ForegroundColor Yellow
$checkHodColumn = @"
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'department' AND column_name = 'head_of_department_id'
);
"@

$hodColumnExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $checkHodColumn

if ($hodColumnExists -match "t") {
    Write-Host "✅ head_of_department_id column exists" -ForegroundColor Green
} else {
    Write-Host "❌ head_of_department_id column does NOT exist!" -ForegroundColor Red
    Write-Host "Running migration script..." -ForegroundColor Yellow
    
    $hodMigrationPath = "init\migration-add-hod-to-department.sql"
    if (Test-Path $hodMigrationPath) {
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $hodMigrationPath
        Write-Host "✅ HOD migration script executed" -ForegroundColor Green
    } else {
        Write-Host "❌ HOD migration script not found at: $hodMigrationPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5. Checking existing notifications..." -ForegroundColor Yellow
$countQuery = @"
SELECT 
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
    COUNT(CASE WHEN is_read = true THEN 1 END) as read
FROM notifications;
"@
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $countQuery

Write-Host ""
Write-Host "6. Showing recent notifications (last 10)..." -ForegroundColor Yellow
$recentQuery = @"
SELECT 
    n.notification_id,
    n.type,
    n.title,
    u.username as recipient,
    n.is_read,
    n.created_at
FROM notifications n
JOIN "user" u ON n.user_id = u.user_id
ORDER BY n.created_at DESC
LIMIT 10;
"@
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $recentQuery

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To assign Head of Department manually, run:" -ForegroundColor Yellow
Write-Host "UPDATE department SET head_of_department_id = (SELECT user_id FROM `"user`" WHERE username = 'head_dept') WHERE dept_name = 'Your Department Name';" -ForegroundColor Gray
