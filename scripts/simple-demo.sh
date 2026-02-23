#!/bin/bash
set -e

echo "========================================="
echo "PulseOps - Simple Working Demo"
echo "========================================="
echo ""
echo "Starting from scratch with a working setup..."
echo ""

# 1. Kill everything
echo "[1/6] Cleaning up old processes..."
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
sleep 3

# 2. Ensure Docker services
echo "[2/6] Checking Docker services..."
docker-compose up -d postgres redis kafka
sleep 5

# 3. Setup database with sample data
echo "[3/6] Setting up database..."
docker exec pulseops-postgres psql -U pulseops -d pulseops_dev << 'EOSQL'
-- Create events table if not exists
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample events
INSERT INTO events (event_name, user_id, properties, created_at) VALUES
('page_view', 'user_1', '{"page": "/home"}'::jsonb, NOW() - INTERVAL '1 hour'),
('page_view', 'user_2', '{"page": "/pricing"}'::jsonb, NOW() - INTERVAL '2 hours'),
('button_click', 'user_1', '{"button": "signup"}'::jsonb, NOW() - INTERVAL '3 hours'),
('purchase', 'user_3', '{"amount": 99.99}'::jsonb, NOW() - INTERVAL '4 hours'),
('signup', 'user_4', '{"plan": "pro"}'::jsonb, NOW() - INTERVAL '5 hours');

SELECT 'Database ready with ' || COUNT(*) || ' sample events' as status FROM events;
EOSQL

# 4. Create simple GraphQL server
echo "[4/6] Creating simple GraphQL API..."
cat > /Users/dev/Documents/PROJECT_LOWLEVEL/PulseOps/simple-graphql.js << 'EOJS'
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { Pool } = require('pg');

const db = new Pool({
  connectionString: 'postgresql://pulseops:dev_password_change_in_production@localhost:5432/pulseops_dev'
});

const typeDefs = `
  type Event {
    id: ID!
    event_name: String!
    user_id: String
    created_at: String!
  }
  
  type EventCount {
    event_name: String!
    count: Int!
  }
  
  type Query {
    events: [Event!]!
    eventCounts: [EventCount!]!
    totalEvents: Int!
  }
`;

const resolvers = {
  Query: {
    events: async () => {
      const result = await db.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 10');
      return result.rows;
    },
    eventCounts: async () => {
      const result = await db.query('SELECT event_name, COUNT(*)::int as count FROM events GROUP BY event_name');
      return result.rows;
    },
    totalEvents: async () => {
      const result = await db.query('SELECT COUNT(*)::int as count FROM events');
      return result.rows[0].count;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
});
EOJS

# 5. Start simple GraphQL server
echo "[5/6] Starting GraphQL server..."
cd /Users/dev/Documents/PROJECT_LOWLEVEL/PulseOps
node simple-graphql.js &
sleep 3

# 6. Test it
echo "[6/6] Testing..."
curl -s http://localhost:4000 > /dev/null && echo "✓ GraphQL server running"

echo ""
echo "========================================="
echo "WORKING DEMO READY!"
echo "========================================="
echo ""
echo "GraphQL Playground: http://localhost:4000"
echo ""
echo "Try this query:"
echo "{"
echo '  totalEvents'
echo '  eventCounts { event_name count }'
echo '  events { id event_name user_id }'
echo "}"
echo ""
echo "========================================="
