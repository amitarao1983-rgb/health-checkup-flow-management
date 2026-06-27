@echo off
title Push to GitHub (no gh CLI needed)
cd /d "%~dp0"

echo.
echo  ============================================
echo   Push HealthFirst360 to GitHub
echo   Method: GitHub website + git (no gh CLI)
echo  ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Step 1: Saving latest code...
git add -A
git diff --cached --quiet
if errorlevel 1 (
    set GIT_AUTHOR_NAME=LENOVO
    set GIT_AUTHOR_EMAIL=lenovo@users.noreply.github.com
    set GIT_COMMITTER_NAME=LENOVO
    set GIT_COMMITTER_EMAIL=lenovo@users.noreply.github.com
    git commit -m "Update project files before GitHub push"
)

echo.
echo Step 2: Create a NEW repository on GitHub
echo   - Open: https://github.com/new
echo   - Repository name: health-checkup-flow-management
echo   - Choose Public
echo   - Do NOT add README, .gitignore, or license
echo   - Click "Create repository"
echo.
pause

set /p GITHUB_USER="Step 3: Enter your GitHub username: "
if "%GITHUB_USER%"=="" (
    echo ERROR: Username required.
    pause
    exit /b 1
)

set REPO_URL=https://github.com/%GITHUB_USER%/health-checkup-flow-management.git

echo.
echo Step 4: Pushing to %REPO_URL%
echo   When browser opens, sign in to GitHub and allow access.
echo.

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo PUSH FAILED. Try this instead:
    echo.
    echo A) Use GitHub Desktop - download: https://desktop.github.com/
    echo    File - Add Local Repository - this folder - Publish repository
    echo.
    echo B) Create Personal Access Token:
    echo    https://github.com/settings/tokens
    echo    Then run: git push -u origin main
    echo    Username: your GitHub username
    echo    Password: paste the TOKEN ^(not your GitHub password^)
    echo.
) else (
    echo.
    echo SUCCESS!
    echo Repository: https://github.com/%GITHUB_USER%/health-checkup-flow-management
    echo.
)

pause
