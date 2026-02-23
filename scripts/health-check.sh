#!/bin/bash
set -e

echo "Starting PulseOps health check..."

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker exec pulseops-postgres pg_isready -U pulseops > /dev/null 2>&1; then
  echo "✓ Connected"
else
  echo "✗ Failed"
  exit 1
fi

# Check Redis
echo -n "Redis: "
if docker exec pulseops-redis redis-cli ping > /dev/null 2>&1; then
  echo "✓ Connected"
else
  echo "✗ Failed"
  exit 1
fi

# Check Kafka
echo -n "Kafka: "
if docker ps | grep -q "pulseops-kafka"; then
  echo "✓ Running"
else
  echo "✗ Not running"
  exit 1
fi

# Check Ingest API
echo -n "Ingest API: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "✓ Healthy (http://localhost:3001)"
else
  echo "✗ Not responding"
fi

# Check GraphQL API
echo -n "GraphQL API: "
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
  echo "✓ Healthy (http://localhost:3002)"
else
  echo "✗ Not responding"
fi

echo ""
echo "Health check complete!"
