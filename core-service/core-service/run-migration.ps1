# Execute migration SQL via PowerShell and .NET PostgreSQL provider

# Load the connection details
$server = "localhost"
$port = "5432"
$database = "smd_db"
$username = "postgres"
$password = "123456"  # Update this if different

# Connection string
$connectionString = "Host=$server;Port=$port;Database=$database;Username=$username;Password=$password"

Write-Host "Connecting to database..." -ForegroundColor Cyan

try {
    # For PowerShell, we'll use basic SQL commands
    # Read the SQL file
    $sqlCommands = Get-Content "migration-versioning.sql" -Raw
    
    Write-Host "`nSQL to execute:" -ForegroundColor Yellow
    Write-Host $sqlCommands
    
    Write-Host "`n`nYou can execute these commands manually in your PostgreSQL client (pgAdmin, DBeaver, etc.)" -ForegroundColor Green
    Write-Host "Or run them via command line if you have psql installed." -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n`nAlternatively, you can execute this in Docker if PostgreSQL is running in a container:" -ForegroundColor Cyan
Write-Host 'docker exec -i <container-name> psql -U postgres -d smd_db < migration-versioning.sql' -ForegroundColor White
