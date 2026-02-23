#!/bin/bash

# Quick PulseOps Demo Setup - Bypasses auth for testing

echo "=== PulseOps Quick Demo Setup ==="
echo ""
echo "This will:"
echo "1. Kill existing services"
echo "2. Clean and restart with auth disabled"  
echo "3. Generate test data"
echo ""

# Kill existing
pkill -f "tsx watch" || true
pkill -f "vite" || true

# Wait
sleep 2

# Start fresh
cd /Users/dev/Documents/PROJECT_LOWLEVEL/PulseOps
pnpm dev &

# Wait for services
echo "Waiting 15 seconds for services to start..."
sleep 15

# Test
echo ""
echo "Testing services..."
curl -s http://localhost:3001/health | jq '.'
curl -s http://localhost:3002/health | jq '.'

echo ""
echo "Generating 20 test events..."
node scripts/generate-events.js 20

echo ""
echo "Checking database..."
docker exec pulseops-postgres psql -U pulseops -d pulseops_dev -c "SELECT COUNT(*) as events FROM events;"

echo ""
echo "======================================"
echo "Dashboard: http://localhost:5174"
echo "GraphQL: http://localhost:3002/graphql"
echo "======================================"
