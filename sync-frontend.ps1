# PowerShell script to sync frontend source files to Docker volume

# Get the container ID
$containerId = docker ps --filter "name=recruitment-ai-full-platform-frontend" --format "{{.ID}}"

if (-not $containerId) {
    Write-Error "Frontend container not found. Make sure it's running."
    exit 1
}

# Create a temporary directory inside the container
docker exec $containerId mkdir -p /tmp/src-sync

# Copy the local src directory to the temporary directory in the container
docker cp .\frontend\src\. ${containerId}:/tmp/src-sync

# Move the files from the temporary directory to the app/src directory
docker exec $containerId sh -c "cp -r /tmp/src-sync/. /app/src/ && rm -rf /tmp/src-sync"

Write-Output "Frontend source files synced successfully!"