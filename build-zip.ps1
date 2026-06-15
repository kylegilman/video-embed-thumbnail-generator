# build-zip.ps1
# Generates a distributable ZIP for video-embed-thumbnail-generator

$pluginName = "video-embed-thumbnail-generator"
$projectRoot = Get-Location

Write-Host "Building distributable ZIP for $pluginName..." -ForegroundColor Cyan

# 1. Clean and install production PHP dependencies
Write-Host "Installing production composer dependencies..." -ForegroundColor Gray
& composer install --no-dev --optimize-autoloader

# 2. Build admin-ui assets
Write-Host "Building admin-ui assets..." -ForegroundColor Gray
Push-Location admin-ui
& npm install
& npm run build
Pop-Location

# 3. Create a temporary build directory for staging
$stagingDir = Join-Path $projectRoot "dist"
$pluginStagingDir = Join-Path $stagingDir $pluginName

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir
}
New-Item -ItemType Directory -Path $pluginStagingDir | Out-Null

# List of files/folders to copy to the staging directory (WordPress.org compliant)
$includes = @(
    "video-embed-thumbnail-generator.php",
    "readme.txt",
    "license.txt",
    "index.html",
    "src",
    "vendor",
    "languages",
    "video-js",
    "admin-ui/build",
    "admin-ui/src",
    "admin-ui/package.json",
    "admin-ui/eslint.config.mjs",
    "admin-ui/webpack.config.js",
    "admin-ui/scripts",
    "admin-ui/test-entry-points.js"
)

Write-Host "Copying files to staging..." -ForegroundColor Gray
foreach ($item in $includes) {
    $srcPath = Join-Path $projectRoot $item
    if (Test-Path $srcPath) {
        $destPath = Join-Path $pluginStagingDir $item
        # Create parent directory if it doesn't exist
        $destParent = Split-Path $destPath -Parent
        if (!(Test-Path $destParent)) {
            New-Item -ItemType Directory -Path $destParent | Out-Null
        }
        Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
    } else {
        Write-Warning "Path not found: $item"
    }
}

# Clean up git metadata and dev files from the staged vendor directory to reduce size
Write-Host "Cleaning up dev files and git metadata from staged vendor..." -ForegroundColor Gray
$stagedVendor = Join-Path $pluginStagingDir "vendor"
if (Test-Path $stagedVendor) {
    Get-ChildItem -Path $stagedVendor -Recurse -Force | Where-Object { $_.PSIsContainer -and ($_.Name -in @(".git", ".github", ".phpstan", "tests", "test")) } | Remove-Item -Recurse -Force
    Get-ChildItem -Path $stagedVendor -Recurse -Force | Where-Object { -not $_.PSIsContainer -and ($_.Name -like ".*" -or $_.Name -in @("composer.json", "composer.lock", "package.json", "package-lock.json", "gulpfile.js", "phpcs.xml", "phpcompat.xml", "phpunit.xml")) } | Remove-Item -Force
}

# 4. Generate the ZIP archive
$zipFile = Join-Path $projectRoot "$pluginName.zip"
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

Write-Host "Waiting 5 seconds for file system locks to release..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "Creating ZIP archive: $zipFile..." -ForegroundColor Gray
$retryCount = 0
$zipSuccess = $false
while (-not $zipSuccess -and $retryCount -lt 5) {
    try {
        # Using native tar.exe with --format zip to ensure a valid ZIP file and forward slashes (/) in paths (POSIX/Linux compliant)
        & tar -c -f $zipFile --format zip -C $stagingDir $pluginName
        if ($LASTEXITCODE -eq 0) {
            $zipSuccess = $true
        } else {
            throw "tar exited with code $LASTEXITCODE"
        }
    } catch {
        $retryCount++
        Write-Warning "ZIP creation failed due to file lock or tar error. Retrying ($retryCount/5)..."
        Start-Sleep -Seconds 3
    }
}

if (-not $zipSuccess) {
    Write-Error "Failed to create ZIP archive after 5 attempts."
    exit 1
}

# 5. Cleanup
Write-Host "Cleaning up staging directory..." -ForegroundColor Gray
$cleanupSuccess = $false
$retryCount = 0
while (-not $cleanupSuccess -and $retryCount -lt 5) {
    try {
        Remove-Item -Recurse -Force $stagingDir -ErrorAction Stop
        $cleanupSuccess = $true
    } catch {
        $retryCount++
        Write-Warning "Staging cleanup failed due to file lock. Retrying ($retryCount/5)..."
        Start-Sleep -Seconds 3
    }
}

if (-not $cleanupSuccess) {
    Write-Warning "Could not completely delete staging directory '$stagingDir' because some files are locked."
}

# 6. Restore developer dependencies
Write-Host "Restoring dev composer dependencies..." -ForegroundColor Gray
& composer install

Write-Host "Done! Distributable ZIP created at $zipFile" -ForegroundColor Green

