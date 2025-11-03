#!/usr/bin/env powershell
# This script ensures the radioo.png image is copied to the lowercase public directory
# Run this script before deploying if you encounter image loading issues

# Create lowercase public directory if it doesn't exist
if (-not (Test-Path -Path "./public")) {
    New-Item -Path "./public" -ItemType Directory -Force
    Write-Host "Created lowercase public directory"
}

# Copy radioo.png from Public to public
if (Test-Path -Path "./Public/radioo.png") {
    Copy-Item -Path "./Public/radioo.png" -Destination "./public/radioo.png" -Force
    Write-Host "Successfully copied radioo.png to lowercase public directory"
} else {
    Write-Host "Error: radioo.png not found in ./Public directory"
}
