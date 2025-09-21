# PowerShell script to watch for changes in the frontend directory and sync them to the Docker container

$frontendDir = "$PSScriptRoot\frontend\src"
$lastSync = Get-Date

Write-Host "Watching for changes in $frontendDir..."
Write-Host "Press Ctrl+C to stop watching."

try {
    while ($true) {
        # Get files that have changed since last sync
        $changedFiles = Get-ChildItem -Path $frontendDir -Recurse -File | Where-Object { $_.LastWriteTime -gt $lastSync }
        
        if ($changedFiles.Count -gt 0) {
            Write-Host "$(Get-Date) - Changes detected in $($changedFiles.Count) files. Syncing..."
            
            # Run the sync script
            & "$PSScriptRoot\sync-frontend.ps1"
            
            # Update last sync time
            $lastSync = Get-Date
            
            Write-Host "Sync completed. Waiting for more changes..."
        }
        
        # Wait before checking again
        Start-Sleep -Seconds 2
    }
}
finally {
    Write-Host "Stopped watching for changes."
}