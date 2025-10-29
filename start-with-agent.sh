#!/bin/sh
set -e

# Create logs directory
mkdir -p /app/logs

# Start Grafana Agent in the background
echo "Starting Grafana Agent..."
/usr/bin/grafana-agent --config.file=/app/grafana-agent-config.yaml --config.expand-env &

# Store the PID
AGENT_PID=$!

# Function to handle shutdown gracefully
shutdown() {
    echo "Shutting down..."
    kill -TERM "$AGENT_PID" 2>/dev/null || true
    exit 0
}

# Trap signals for graceful shutdown
trap shutdown SIGTERM SIGINT

# Wait a moment for agent to start
sleep 2

# Start Next.js application
echo "Starting Next.js application..."
exec node --max-old-space-size=512 server.js
