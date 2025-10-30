#!/bin/sh
set -e

# Create logs directory
mkdir -p /app/logs

# Start Grafana Alloy in the background
echo "Starting Grafana Alloy..."
/usr/local/bin/alloy run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data /app/config.alloy &

# Store the PID
ALLOY_PID=$!

# Function to handle shutdown gracefully
shutdown() {
    echo "Shutting down..."
    kill -TERM "$ALLOY_PID" 2>/dev/null || true
    exit 0
}

# Trap signals for graceful shutdown
trap shutdown SIGTERM SIGINT

# Wait a moment for Alloy to start
sleep 2

# Start Next.js application
echo "Starting Next.js application..."
exec node --max-old-space-size=512 server.js
