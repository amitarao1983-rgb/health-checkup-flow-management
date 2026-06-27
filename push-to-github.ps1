# Push HealthFirst360 app to GitHub
# Run in PowerShell from this project folder after logging into GitHub.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Ensure gh is on PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "`nChecking GitHub login..." -ForegroundColor Cyan
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Opening GitHub device login..." -ForegroundColor Yellow
    gh auth login -h github.com -p https -w
}

$repoName = "health-checkup-flow-management"
Write-Host "`nCreating GitHub repo and pushing..." -ForegroundColor Cyan

gh repo create $repoName --public --source=. --remote=origin --push --description "HealthFirst360 hospital health check-up queue flow management app"

if ($LASTEXITCODE -eq 0) {
    $url = gh repo view --json url -q .url
    Write-Host "`nSuccess! Repository:" -ForegroundColor Green
    Write-Host $url
    Write-Host "`nOpen app locally: http://localhost:3001 (after npm run dev)`n"
} else {
    Write-Host "`nIf repo already exists, run:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/$repoName.git"
    Write-Host "  git push -u origin main"
}
