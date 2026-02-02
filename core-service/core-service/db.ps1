# ===================================
# SMD Database Viewer
# Script de xem PostgreSQL Database
# ===================================


param(
    [string]$Action = "menu"
)


# Load environment variables from .env if exists
function Load-EnvFile {
    if (Test-Path .env) {
        Get-Content .env | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$' -and $_ -notmatch '^#') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
    }
}


# Get database configuration
function Get-DbConfig {
    Load-EnvFile
    return @{
        User = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "root" }
        Password = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "rootpassword" }
        Database = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "smd_db" }
        Port = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
        Container = "smd_postgres"
    }
}


# Check if container is running
function Test-Container {
    param($ContainerName)
    $status = docker ps --filter "name=$ContainerName" --format "{{.Status}}" 2>$null
    return $status -ne $null -and $status -ne ""
}


# Execute SQL query
function Invoke-SqlQuery {
    param(
        [string]$Query,
        [hashtable]$Config
    )
   
    $escapedQuery = $Query -replace '"', '\"'
    $result = docker exec -i $Config.Container psql -U $Config.User -d $Config.Database -c "$escapedQuery" 2>&1
    return $result
}


# Execute SQL query with expanded display
function Invoke-SqlQueryExpanded {
    param(
        [string]$Query,
        [hashtable]$Config
    )
   
    $escapedQuery = $Query -replace '"', '\"'
    $result = docker exec -i $Config.Container psql -U $Config.User -d $Config.Database -x -c "$escapedQuery" 2>&1
    return $result
}


# Display header
function Show-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}


# Get list of tables
function Get-TableList {
    param([hashtable]$Config)
   
    $query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
    $result = Invoke-SqlQuery -Query $query -Config $Config
   
    $tables = @()
    $lines = $result -split "`n"
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -and $trimmed -ne "table_name" -and $trimmed -notmatch "^-+$" -and $trimmed -notmatch "^\(\d+ row") {
            $tables += $trimmed
        }
    }
    return $tables
}


# Show all tables
function Show-AllTables {
    param([hashtable]$Config)
   
    Show-Header "DANH SACH CAC BANG TRONG DATABASE"
   
    $query = @"
SELECT
    table_name as "Ten bang",
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as "So cot"
FROM
    information_schema.tables t
WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY
    table_name;
"@
   
    $result = Invoke-SqlQuery -Query $query -Config $Config
    Write-Host $result
}


# Show table structure
function Show-TableStructure {
    param(
        [string]$TableName,
        [hashtable]$Config
    )
   
    Show-Header "CAU TRUC BANG: $TableName"
   
    $query = @"
SELECT
    column_name as "Ten cot",
    data_type as "Kieu du lieu",
    character_maximum_length as "Do dai",
    is_nullable as "Cho phep NULL",
    column_default as "Gia tri mac dinh"
FROM
    information_schema.columns
WHERE
    table_name = '$TableName'
    AND table_schema = 'public'
ORDER BY
    ordinal_position;
"@
   
    $result = Invoke-SqlQuery -Query $query -Config $Config
    Write-Host $result
   
    # Show constraints
    Write-Host "`n--- RANG BUOC (Constraints) ---" -ForegroundColor Yellow
    $constraintQuery = @"
SELECT
    tc.constraint_name as "Ten rang buoc",
    tc.constraint_type as "Loai",
    kcu.column_name as "Cot"
FROM
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
WHERE
    tc.table_name = '$TableName'
    AND tc.table_schema = 'public'
ORDER BY
    tc.constraint_type;
"@
   
    $result = Invoke-SqlQuery -Query $constraintQuery -Config $Config
    Write-Host $result
}


# Show table data with normal view
function Show-TableData {
    param(
        [string]$TableName,
        [hashtable]$Config,
        [int]$Limit = 10
    )
   
    Show-Header "DU LIEU BANG: $TableName (Top $Limit)"
   
    # Get record count (escape table name for reserved keywords)
    $countQuery = "SELECT COUNT(*) as total FROM `"$TableName`";"
    $countResult = Invoke-SqlQuery -Query $countQuery -Config $Config
    Write-Host $countResult
   
    # Get data (escape table name for reserved keywords)
    Write-Host "`n--- DU LIEU (Hien thi ngang) ---" -ForegroundColor Yellow
    $query = "SELECT * FROM `"$TableName`" LIMIT $Limit;"
    $result = Invoke-SqlQuery -Query $query -Config $Config
    Write-Host $result
}


# Show table data with expanded view (vertical)
function Show-TableDataExpanded {
    param(
        [string]$TableName,
        [hashtable]$Config,
        [int]$Limit = 5
    )
   
    Show-Header "DU LIEU BANG: $TableName (Chi tiet - Top $Limit)"
   
    # Get record count (escape table name for reserved keywords)
    $countQuery = "SELECT COUNT(*) as total FROM `"$TableName`";"
    $countResult = Invoke-SqlQuery -Query $countQuery -Config $Config
    Write-Host $countResult
   
    # Get data with expanded display (escape table name for reserved keywords)
    Write-Host "`n--- DU LIEU (Hien thi doc - Chi tiet) ---" -ForegroundColor Yellow
    $query = "SELECT * FROM `"$TableName`" LIMIT $Limit;"
    $result = Invoke-SqlQueryExpanded -Query $query -Config $Config
    Write-Host $result
}


# Browse all tables data
function Browse-AllTablesData {
    param([hashtable]$Config)
   
    $tables = Get-TableList -Config $Config
   
    if ($tables.Count -eq 0) {
        Write-Host "Khong tim thay bang nao trong database!" -ForegroundColor Red
        return
    }
   
    $currentIndex = 0
   
    while ($true) {
        Clear-Host
        Show-Header "XEM DU LIEU TAT CA CAC BANG"
       
        $currentTable = $tables[$currentIndex]
       
        Write-Host "Bang hien tai: " -NoNewline -ForegroundColor Yellow
        Write-Host "$currentTable ($($currentIndex + 1)/$($tables.Count))" -ForegroundColor Cyan
        Write-Host ""
       
        # Show record count (escape table name for reserved keywords)
        $countQuery = "SELECT COUNT(*) as total FROM `"$currentTable`";"
        $countResult = Invoke-SqlQuery -Query $countQuery -Config $Config
        Write-Host $countResult
       
        # Show data (escape table name for reserved keywords)
        Write-Host "`n--- DU LIEU (Top 10 rows) ---" -ForegroundColor Yellow
        $query = "SELECT * FROM `"$currentTable`" LIMIT 10;"
        $result = Invoke-SqlQuery -Query $query -Config $Config
        Write-Host $result
       
        # Navigation menu
        Write-Host "`n" -NoNewline
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "n/ENTER - Bang tiep theo" -ForegroundColor Green
        Write-Host "p       - Bang truoc" -ForegroundColor Green
        Write-Host "d       - Xem chi tiet (hien thi doc)" -ForegroundColor Green
        Write-Host "s       - Xem cau truc bang" -ForegroundColor Green
        Write-Host "m       - Nhap so luong rows muon xem" -ForegroundColor Green
        Write-Host "q/0     - Quay lai menu chinh" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
       
        $choice = Read-Host "Lua chon"
       
        switch ($choice.ToLower()) {
            "" {
                # Next table
                $currentIndex = ($currentIndex + 1) % $tables.Count
            }
            "n" {
                # Next table
                $currentIndex = ($currentIndex + 1) % $tables.Count
            }
            "p" {
                # Previous table
                $currentIndex = if ($currentIndex -eq 0) { $tables.Count - 1 } else { $currentIndex - 1 }
            }
            "d" {
                # Show detailed view
                Clear-Host
                Show-TableDataExpanded -TableName $currentTable -Config $Config -Limit 5
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "s" {
                # Show structure
                Clear-Host
                Show-TableStructure -TableName $currentTable -Config $Config
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "m" {
                # Custom limit
                $limit = Read-Host "Nhap so luong rows (mac dinh 10)"
                if (-not $limit) { $limit = 10 }
                Clear-Host
                Show-Header "DU LIEU BANG: $currentTable (Top $limit)"
                # Escape table name for reserved keywords
                $query = "SELECT * FROM `"$currentTable`" LIMIT $limit;"
                $result = Invoke-SqlQuery -Query $query -Config $Config
                Write-Host $result
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "q" {
                return
            }
            "0" {
                return
            }
            default {
                Write-Host "Lua chon khong hop le!" -ForegroundColor Red
                Start-Sleep -Seconds 1
            }
        }
    }
}


# Show database statistics
function Show-DatabaseStats {
    param([hashtable]$Config)
   
    Show-Header "THONG KE DATABASE"
   
    $query = @"
SELECT
    schemaname as "Schema",
    tablename as "Ten bang",
    n_live_tup as "So records",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Kich thuoc"
FROM
    pg_stat_user_tables
ORDER BY
    n_live_tup DESC;
"@
   
    $result = Invoke-SqlQuery -Query $query -Config $Config
    Write-Host $result
   
    # Show total database size
    Write-Host "`n--- TONG KICH THUOC DATABASE ---" -ForegroundColor Yellow
    $dbName = $Config.Database
    $sizeQuery = "SELECT pg_size_pretty(pg_database_size('$dbName')) as size;"
    $sizeResult = Invoke-SqlQuery -Query $sizeQuery -Config $Config
    Write-Host $sizeResult
}


# Show foreign keys
function Show-ForeignKeys {
    param([hashtable]$Config)
   
    Show-Header "QUAN HE GIUA CAC BANG (Foreign Keys)"
   
    $query = @"
SELECT
    tc.table_name as "Bang",
    kcu.column_name as "Cot",
    ccu.table_name as "Bang tham chieu",
    ccu.column_name as "Cot tham chieu"
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
WHERE
    tc.constraint_type = 'FOREIGN KEY'
ORDER BY
    tc.table_name;
"@
   
    $result = Invoke-SqlQuery -Query $query -Config $Config
    Write-Host $result
}


# Show indexes
function Show-Indexes {
    param([hashtable]$Config)
   
    Show-Header "DANH SACH INDEX"
   
    $query = @"
SELECT
    tablename as "Bang",
    indexname as "Ten index",
    indexdef as "Dinh nghia"
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename, indexname;
"@
   
    $result = Invoke-SqlQuery -Query $query -Config $Config
    Write-Host $result
}


# Interactive menu
function Show-Menu {
    param([hashtable]$Config)
   
    while ($true) {
        Clear-Host
        Show-Header "SMD DATABASE VIEWER"
        Write-Host "Database: $($Config.Database)" -ForegroundColor Yellow
        Write-Host "User: $($Config.User)" -ForegroundColor Yellow
        Write-Host "Port: $($Config.Port)" -ForegroundColor Yellow
        Write-Host "Container: $($Config.Container)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Xem danh sach tat ca cac bang" -ForegroundColor Green
        Write-Host "2. Xem cau truc bang" -ForegroundColor Green
        Write-Host "3. Xem du lieu bang (chon 1 bang)" -ForegroundColor Green
        Write-Host "4. Xem du lieu tat ca cac bang (duyet tung bang)" -ForegroundColor Cyan
        Write-Host "5. Xem thong ke database" -ForegroundColor Green
        Write-Host "6. Xem quan he giua cac bang (Foreign Keys)" -ForegroundColor Green
        Write-Host "7. Xem danh sach index" -ForegroundColor Green
        Write-Host "8. Ket noi psql interactive" -ForegroundColor Green
        Write-Host "9. Xem tat ca thong tin tong quan" -ForegroundColor Green
        Write-Host "0. Thoat" -ForegroundColor Red
        Write-Host ""
       
        $choice = Read-Host "Chon chuc nang (0-9)"
       
        switch ($choice) {
            "1" {
                Show-AllTables -Config $Config
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "2" {
                Show-AllTables -Config $Config
                Write-Host ""
                $tableName = Read-Host "Nhap ten bang"
                if ($tableName) {
                    Show-TableStructure -TableName $tableName -Config $Config
                    Read-Host "`nNhan Enter de tiep tuc"
                }
            }
            "3" {
                Show-AllTables -Config $Config
                Write-Host ""
                $tableName = Read-Host "Nhap ten bang"
                if ($tableName) {
                    Write-Host "`n1. Hien thi ngang (chuan)" -ForegroundColor Yellow
                    Write-Host "2. Hien thi doc (chi tiet)" -ForegroundColor Yellow
                    $viewType = Read-Host "Chon kieu hien thi (1/2)"
                   
                    $limit = Read-Host "So records muon xem (mac dinh 10)"
                    if (-not $limit) { $limit = 10 }
                   
                    if ($viewType -eq "2") {
                        Show-TableDataExpanded -TableName $tableName -Config $Config -Limit $limit
                    } else {
                        Show-TableData -TableName $tableName -Config $Config -Limit $limit
                    }
                    Read-Host "`nNhan Enter de tiep tuc"
                }
            }
            "4" {
                Browse-AllTablesData -Config $Config
            }
            "5" {
                Show-DatabaseStats -Config $Config
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "6" {
                Show-ForeignKeys -Config $Config
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "7" {
                Show-Indexes -Config $Config
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "8" {
                Write-Host "`nDang ket noi psql... (go \q de thoat)" -ForegroundColor Yellow
                Write-Host "Mot so lenh huu ich:" -ForegroundColor Cyan
                Write-Host "  \dt          - Xem danh sach bang" -ForegroundColor Gray
                Write-Host "  \d table     - Xem cau truc bang" -ForegroundColor Gray
                Write-Host "  \x           - Toggle hien thi doc/ngang" -ForegroundColor Gray
                Write-Host "  \df          - Xem danh sach function" -ForegroundColor Gray
                Write-Host "  \l           - Xem danh sach database" -ForegroundColor Gray
                Write-Host ""
                docker exec -it $Config.Container psql -U $Config.User -d $Config.Database
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "9" {
                Show-AllTables -Config $Config
                Read-Host "`nNhan Enter de xem tiep"
                Show-DatabaseStats -Config $Config
                Read-Host "`nNhan Enter de xem tiep"
                Show-ForeignKeys -Config $Config
                Read-Host "`nNhan Enter de xem tiep"
                Show-Indexes -Config $Config
                Read-Host "`nNhan Enter de tiep tuc"
            }
            "0" {
                Write-Host "`nTam biet!" -ForegroundColor Cyan
                return
            }
            default {
                Write-Host "`nLua chon khong hop le!" -ForegroundColor Red
                Start-Sleep -Seconds 1
            }
        }
    }
}


# Main execution
try {
    $config = Get-DbConfig
   
    Write-Host "Dang kiem tra Docker..." -ForegroundColor Yellow
   
    # Check if Docker is running
    $dockerRunning = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "X Docker khong chay hoac chua cai dat!" -ForegroundColor Red
        Write-Host "Vui long khoi dong Docker Desktop truoc." -ForegroundColor Yellow
        exit 1
    }
   
    # Check if container is running
    if (-not (Test-Container -ContainerName $config.Container)) {
        Write-Host "X Container '$($config.Container)' khong chay!" -ForegroundColor Red
        Write-Host "Vui long chay: docker-compose up -d" -ForegroundColor Yellow
        exit 1
    }
   
    Write-Host "V Ket noi thanh cong!" -ForegroundColor Green
    Start-Sleep -Seconds 1
   
    # Run based on action parameter
    switch ($Action.ToLower()) {
        "tables" {
            Show-AllTables -Config $config
            Read-Host "`nNhan Enter de thoat"
        }
        "browse" {
            Browse-AllTablesData -Config $config
        }
        "stats" {
            Show-DatabaseStats -Config $config
            Read-Host "`nNhan Enter de thoat"
        }
        "fk" {
            Show-ForeignKeys -Config $config
            Read-Host "`nNhan Enter de thoat"
        }
        "indexes" {
            Show-Indexes -Config $config
            Read-Host "`nNhan Enter de thoat"
        }
        "all" {
            Show-AllTables -Config $config
            Read-Host "`nNhan Enter de xem tiep"
            Show-DatabaseStats -Config $config
            Read-Host "`nNhan Enter de xem tiep"
            Show-ForeignKeys -Config $config
            Read-Host "`nNhan Enter de thoat"
        }
        default { Show-Menu -Config $config }
    }
   
} catch {
    Write-Host "X Loi: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}





