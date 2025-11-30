#!/bin/bash
# Build script for Grafana dashboards
# Converts Jsonnet dashboard definitions to JSON

set -e

echo "🔨 Building Grafana dashboards..."
echo ""

# Check if jsonnet is installed
if ! command -v jsonnet &> /dev/null; then
    echo "❌ Error: jsonnet is not installed"
    echo ""
    echo "Install jsonnet:"
    echo "  - macOS: brew install jsonnet"
    echo "  - Ubuntu/Debian: apt-get install jsonnet"
    echo "  - Go: go install github.com/google/go-jsonnet/cmd/jsonnet@latest"
    echo ""
    exit 1
fi

# Check if grafonnet library is available
if [ ! -d "vendor" ] && [ -z "$JSONNET_PATH" ]; then
    echo "⚠️  Warning: Grafonnet library not found"
    echo ""
    echo "Install Grafonnet:"
    echo "  1. Using jsonnet-bundler (recommended):"
    echo "     jb init && jb install github.com/grafana/grafonnet-lib/grafonnet"
    echo ""
    echo "  2. Manually:"
    echo "     git clone https://github.com/grafana/grafonnet-lib.git"
    echo "     export JSONNET_PATH=\$(pwd)/grafonnet-lib"
    echo ""
    exit 1
fi

# Create output directory
mkdir -p output

# Build each dashboard
DASHBOARDS=(
    "operational-overview"
    "application-deepdive"
    "infrastructure-deepdive"
    "user-journey"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for dashboard in "${DASHBOARDS[@]}"; do
    echo "📊 Building: $dashboard"

    if jsonnet -J lib -J vendor "dashboards/${dashboard}.jsonnet" > "output/${dashboard}.json" 2>/dev/null; then
        echo "   ✅ Success: output/${dashboard}.json"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo "   ❌ Failed: $dashboard"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Build Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 All dashboards built successfully!"
    echo ""
    echo "📁 Dashboard JSON files are in: grafana/output/"
    echo ""
    echo "Next steps:"
    echo "  1. Import dashboards to Grafana Cloud"
    echo "  2. Configure alert rules from: grafana/alerts/getmentor-alerts.yaml"
    echo "  3. Set up alert notification channels in Grafana Cloud"
    echo ""
    exit 0
else
    echo "⚠️  Some dashboards failed to build"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check jsonnet syntax in failed dashboard files"
    echo "  2. Ensure grafonnet library is properly installed"
    echo "  3. Run with verbose mode: jsonnet -J lib -J vendor dashboards/<name>.jsonnet"
    echo ""
    exit 1
fi
