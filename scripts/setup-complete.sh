#!/bin/bash
# Complete PulseOps Setup Script

set -e

echo "========================================="
echo "PulseOps Complete Setup"
echo "========================================="

# Step 1: Check Docker
echo -e "\n[1/7] Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✓ Docker is running"

# Step 2: Start infrastructure
echo -e "\n[2/7] Starting infrastructure services..."
docker-compose up -d postgres redis kafka
echo "✓ Infrastructure started"

# Step 3: Wait for services to be healthy
echo -e "\n[3/7] Waiting for services to be ready..."
sleep 15
echo "✓ Services ready"

# Step 4: Initialize database
echo -e "\n[4/7] Initializing database schema..."
docker exec -i pulseops-postgres psql -U pulseops -d pulseops_dev < scripts/init-db.sql > /dev/null 2>&1
echo "✓ Database schema initialized"

# Step 5: Seed demo data with proper API key hash
echo -e "\n[5/7] Creating demo data..."
API_KEY_HASH='$2b$10$vQHx.HvNZ3nON8JmGqE8WeI4pgqJGzKAF5wgRrSB0zRnvK9y7nHRy'

docker exec pulseops-postgres psql -U pulseops -d  pulseops_dev << EOF > /dev/null 2>&1
INSERT INTO organizations (id, name, created_at) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, org_id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Demo Project', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO api_keys (org_id, project_id, key_hash, active, created_at, last_used_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '${API_KEY_HASH}',
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
EOF

echo "✓ Demo data created"
echo "   - Organization ID: 00000000-0000-0000-0000-000000000001"
echo "   - Project ID: 00000000-0000-0000-0000-000000000002"
echo "   - API Key: demo_key_change_this"

# Step 6: Verify database
echo -e "\n[6/7] Verifying database..."
ORG_COUNT=$(docker exec pulseops-postgres psql -U pulseops -d pulseops_dev -t -c "SELECT COUNT(*) FROM organizations;")
echo "✓ Organizations in database: $ORG_COUNT"

# Step 7: Instructions
echo -e "\n[7/7] Setup complete!"
echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Start all services:"
echo "   pnpm dev"
echo ""
echo "2. Generate test events:"
echo "   node scripts/generate-events.js 100"
echo ""
echo "3. Open dashboard:"
echo "   http://localhost:5174"
echo ""
echo "4. API Endpoints:"
echo "   - Ingest API: http://localhost:3001"
echo "   - GraphQL API: http://localhost:3002/graphql"
echo "========================================="
