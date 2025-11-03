#!/usr/bin/env pwsh
# Script de prueba para los endpoints de autores

$BASE_URL = "http://localhost:3000/api/autores"

Write-Host "🧪 Probando Endpoints de Autores..." -ForegroundColor Cyan
Write-Host ""

# Test 1: GET /api/autores (lista básica)
Write-Host "📋 Test 1: Obtener lista de autores" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: GET /api/autores?search=test
Write-Host "🔍 Test 2: Búsqueda local de autores" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL`?search=Gabriel" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: GET /api/autores/search?q=test (sin APIs externas)
Write-Host "🔍 Test 3: Búsqueda híbrida (solo local)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/search?q=Gabriel" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: GET /api/autores/search?q=test&includeExternal=true (con APIs)
Write-Host "🌐 Test 4: Búsqueda híbrida (con APIs externas)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/search?q=Rowling&includeExternal=true" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: GET /api/autores/1 (obtener autor por ID)
Write-Host "👤 Test 5: Obtener autor por ID" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/1" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: GET /api/autores/1/stats
Write-Host "📊 Test 6: Obtener estadísticas de autor" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/1/stats" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📦 Respuesta:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Pruebas completadas!" -ForegroundColor Green
