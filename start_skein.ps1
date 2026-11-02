# SKEIN Launcher Script (Windows PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SKEIN - Real-Time Financial Crime Network Detector v3.0  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
$env:PYTHONPATH = $root

Write-Host "`n[1/3] Starting Backend API & WebSocket Server (Port 8000)..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory $root -PassThru

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting React Dashboard (Port 5173)..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$root\frontend" -PassThru

Start-Sleep -Seconds 3

Write-Host "[3/3] Launching Web Browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`nSKEIN is now live!" -ForegroundColor Yellow
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C or close this window to terminate.`n" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "Stopping processes..." -ForegroundColor Yellow
    if ($backendProcess -and !$backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -Force }
    if ($frontendProcess -and !$frontendProcess.HasExited) { Stop-Process -Id $frontendProcess.Id -Force }
}
