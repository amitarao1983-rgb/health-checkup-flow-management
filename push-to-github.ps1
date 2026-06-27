# Push HealthFirst360 app to GitHub
# Run in PowerShell from this project folder.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# GitHub CLI is installed here but may not be on PATH until terminal restart
$ghPaths = @(
    "C:\Program Files\GitHub CLI\gh.exe",
    "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
)
$gh = $ghPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $gh) {
    Write-Host "GitHub CLI (gh) not found. Install with:" -ForegroundColor Red
    Write-Host "  winget install GitHub.cli"
    exit 1
}

function Invoke-Gh { & $gh @args }

Write-Host "Using: $gh" -ForegroundColor Gray
Write-Host "`nChecking GitHub login..." -ForegroundColor Cyan

$authOk = $false
try {
    Invoke-Gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $authOk = $true }
} catch {}

if (-not $authOk) {
    Write-Host "Not logged in. Complete login in your browser..." -ForegroundColor Yellow
    Invoke-Gh auth login -h github.com -p https -w
}

$repoName = "health-checkup-flow-management"
Write-Host "`nCreating GitHub repo and pushing..." -ForegroundColor Cyan

Invoke-Gh repo create $repoName --public --source=. --remote=origin --push --description "HealthFirst360 hospital health check-up queue flow management app"

if ($LASTEXITCODE -eq 0) {
    $url = Invoke-Gh repo view --json url -q .url
    Write-Host "`nSuccess! Repository:" -ForegroundColor Green
    Write-Host $url
    Write-Host "`nClone: git clone $url"
    Write-Host "Local app: http://localhost:3001 (run npm run dev)`n"
} else {
    Write-Host "`nPush failed. If the repo already exists, try:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/$repoName.git"
    Write-Host "  git push -u origin main"
}
