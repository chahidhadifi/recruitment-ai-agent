# PowerShell script to sync backend source files to Docker volume

# Get the container ID
$containerId = docker ps --filter "name=recruitment-ai-full-platform-backend" --format "{{.ID}}"

if (-not $containerId) {
    Write-Error "Backend container not found. Make sure it's running."
    exit 1
}

# Create a temporary directory inside the container
docker exec $containerId mkdir -p /tmp/app-sync

# Copy the local app directory to the temporary directory in the container
docker cp .\backend\app\. ${containerId}:/tmp/app-sync

# Move the files from the temporary directory to the /app/app directory
docker exec $containerId sh -c "cp -r /tmp/app-sync/. /app/app/ && rm -rf /tmp/app-sync"

Write-Output "Backend source files synced successfully!"