@echo off
REM ============================================================================
REM PRO C++ Extension Auto-Deployment Script
REM Use this script to quickly build and publish a PATCH version to the Marketplace
REM ============================================================================

echo [PRO-CPP] Starting build process...
call npm run compile

if %ERRORLEVEL% NEQ 0 (
    echo [PRO-CPP] ERROR: Compilation failed! Fix the TypeScript errors before publishing.
    pause
    exit /b %ERRORLEVEL%
)

echo [PRO-CPP] Build successful. Publishing to VS Code Marketplace...
REM This command auto-increments the patch version (e.g., 1.0.0 to 1.0.1) and deploys
call vsce publish patch

echo [PRO-CPP] Deployment complete!
pause