# CLO-PLO Mapping API Test Script
# PowerShell script to test CLO-PLO Mapping APIs

$baseUrl = "http://localhost:8080"
$contentType = "application/json"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CLO-PLO Mapping API Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Function to make API calls
function Invoke-ApiTest {
    param (
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "$Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            ContentType = $contentType
        }
        
        if ($Body) {
            $params.Add("Body", $Body)
            Write-Host "Body: $Body" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ Success" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Test 1: Get all mappings (should be empty initially)
Write-Host "`n--- Test 1: Get All Mappings ---" -ForegroundColor Magenta
Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings" -Description "Get all CLO-PLO mappings"

# Test 2: Get all CLOs
Write-Host "`n--- Test 2: Get CLOs ---" -ForegroundColor Magenta
$clos = Invoke-ApiTest -Method "GET" -Endpoint "/api/clos" -Description "Get all CLOs"

# Test 3: Get all PLOs
Write-Host "`n--- Test 3: Get PLOs ---" -ForegroundColor Magenta
$plos = Invoke-ApiTest -Method "GET" -Endpoint "/api/plos" -Description "Get all PLOs"

# Test 4: Create a single mapping (if CLOs and PLOs exist)
if ($clos -and $clos.Count -gt 0 -and $plos -and $plos.Count -gt 0) {
    Write-Host "`n--- Test 4: Create Single Mapping ---" -ForegroundColor Magenta
    $createBody = @{
        cloId = $clos[0].cloId
        ploId = $plos[0].ploId
        mappingLevel = "HIGH"
    } | ConvertTo-Json
    
    $mapping = Invoke-ApiTest -Method "POST" -Endpoint "/api/clo-plo-mappings" -Body $createBody -Description "Create CLO-PLO mapping"
    
    # Test 5: Get mapping by ID
    if ($mapping) {
        Write-Host "`n--- Test 5: Get Mapping by ID ---" -ForegroundColor Magenta
        Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings/$($mapping.mappingId)" -Description "Get mapping by ID"
        
        # Test 6: Update mapping level
        Write-Host "`n--- Test 6: Update Mapping Level ---" -ForegroundColor Magenta
        $updateBody = @{
            mappingLevel = "MEDIUM"
        } | ConvertTo-Json
        Invoke-ApiTest -Method "PUT" -Endpoint "/api/clo-plo-mappings/$($mapping.mappingId)" -Body $updateBody -Description "Update mapping level to MEDIUM"
    }
    
    # Test 7: Create batch mappings
    if ($plos.Count -ge 3) {
        Write-Host "`n--- Test 7: Create Batch Mappings ---" -ForegroundColor Magenta
        $batchBody = @{
            cloId = $clos[0].cloId
            ploIds = @($plos[1].ploId, $plos[2].ploId)
            mappingLevel = "LOW"
        } | ConvertTo-Json
        Invoke-ApiTest -Method "POST" -Endpoint "/api/clo-plo-mappings/batch" -Body $batchBody -Description "Create batch mappings"
    }
    
    # Test 8: Get mappings by CLO
    Write-Host "`n--- Test 8: Get Mappings by CLO ---" -ForegroundColor Magenta
    Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings/clo/$($clos[0].cloId)" -Description "Get all mappings for CLO"
    
    # Test 9: Get mappings by PLO
    Write-Host "`n--- Test 9: Get Mappings by PLO ---" -ForegroundColor Magenta
    Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings/plo/$($plos[0].ploId)" -Description "Get all mappings for PLO"
    
    # Test 10: Get CLO with mappings
    Write-Host "`n--- Test 10: Get CLO with Mappings ---" -ForegroundColor Magenta
    Invoke-ApiTest -Method "GET" -Endpoint "/api/clos/$($clos[0].cloId)/with-mappings" -Description "Get CLO with mapping details"
    
    # Test 11: Get PLO with coverage
    Write-Host "`n--- Test 11: Get PLO with Coverage ---" -ForegroundColor Magenta
    Invoke-ApiTest -Method "GET" -Endpoint "/api/plos/$($plos[0].ploId)/with-coverage" -Description "Get PLO with coverage statistics"
    
    # Test 12: Get mappings by syllabus (if syllabus ID available)
    if ($clos[0].syllabusId) {
        Write-Host "`n--- Test 12: Get Mappings by Syllabus ---" -ForegroundColor Magenta
        Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings/syllabus/$($clos[0].syllabusId)" -Description "Get all mappings for syllabus"
    }
    
    # Test 13: Get mappings by program (if program ID available)
    if ($plos[0].programId) {
        Write-Host "`n--- Test 13: Get Mappings by Program ---" -ForegroundColor Magenta
        Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings/program/$($plos[0].programId)" -Description "Get all mappings for program"
    }
    
    # Test 14: Delete mapping
    if ($mapping) {
        Write-Host "`n--- Test 14: Delete Mapping ---" -ForegroundColor Magenta
        Invoke-ApiTest -Method "DELETE" -Endpoint "/api/clo-plo-mappings/$($mapping.mappingId)" -Description "Delete mapping by ID"
    }
    
    # Test 15: Delete all mappings for CLO
    Write-Host "`n--- Test 15: Delete Mappings by CLO ---" -ForegroundColor Magenta
    Invoke-ApiTest -Method "DELETE" -Endpoint "/api/clo-plo-mappings/clo/$($clos[0].cloId)" -Description "Delete all mappings for CLO"
}
else {
    Write-Host "`nSkipping mapping tests - No CLOs or PLOs found in database" -ForegroundColor Yellow
    Write-Host "Please create some CLOs and PLOs first using the following APIs:" -ForegroundColor Yellow
    Write-Host "  POST /api/clos" -ForegroundColor Gray
    Write-Host "  POST /api/plos" -ForegroundColor Gray
}

# Test 16: Test error cases
Write-Host "`n--- Test 16: Error Handling Tests ---" -ForegroundColor Magenta

# Test invalid mapping level
Write-Host "`nTest: Invalid Mapping Level" -ForegroundColor Yellow
$invalidBody = @{
    cloId = 999
    ploId = 999
    mappingLevel = "INVALID"
} | ConvertTo-Json
Invoke-ApiTest -Method "POST" -Endpoint "/api/clo-plo-mappings" -Body $invalidBody -Description "Create mapping with invalid level"

# Test non-existent mapping ID
Write-Host "`nTest: Non-existent Mapping ID" -ForegroundColor Yellow
Invoke-ApiTest -Method "GET" -Endpoint "/api/clo-plo-mappings/99999" -Description "Get non-existent mapping"

# Test duplicate mapping
if ($clos -and $clos.Count -gt 0 -and $plos -and $plos.Count -gt 0) {
    Write-Host "`nTest: Duplicate Mapping" -ForegroundColor Yellow
    $duplicateBody = @{
        cloId = $clos[0].cloId
        ploId = $plos[0].ploId
        mappingLevel = "HIGH"
    } | ConvertTo-Json
    
    # Create first mapping
    Invoke-ApiTest -Method "POST" -Endpoint "/api/clo-plo-mappings" -Body $duplicateBody -Description "Create first mapping"
    
    # Try to create duplicate
    Invoke-ApiTest -Method "POST" -Endpoint "/api/clo-plo-mappings" -Body $duplicateBody -Description "Attempt to create duplicate mapping"
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
