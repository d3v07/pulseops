# PulseOps

Event-driven analytics backend with PostgreSQL time-series partitioning, Kafka event queue, Redis caching, and GraphQL API.

Designed to handle 1000+ events/second from heterogeneous sources, aggregate into daily/hourly metrics, and serve sub-second dashboard queries via cached GraphQL.

## Evidence

**Event Ingestion** — HTTP API accepts JSON events (any schema) and publishes to Kafka topic. Batches before writes reduce database load.

- Max: 1000+ events/second per node (multi-instance deployment supported)
- Latency: p95 < 100ms ingestion time
- Rate limiter: 100 req/min per API key (configurable)

(`services/ingest-api/src/handler.ts`)

**Event Processing** — Worker consumes from Kafka, aggregates events into hourly/daily metrics, writes to PostgreSQL. Handles out-of-order events and late arrivals via watermarking.

(`services/worker/src/processor.ts`)

**Storage** — PostgreSQL 16 with time-series optimization:
- Partitioned tables by date (automatic rotation)
- Retention policies (30-day default, configurable)
- Indexes on (timestamp, tenant_id, metric_name)
- Vacuum tuning for write-heavy workload

(`services/ingest-api/migrations/` — schema definitions)

**Query Layer** — Apollo GraphQL API:
- Cached queries (Redis TTL: 5min for hourly, 1h for daily aggregates)
- Multi-tenant authorization (checked on resolver entry)
- OAuth 2.0 (Google integration for user auth)
- Query complexity limits (prevent DOS via deep nested queries)

(`services/graphql-api/src/schema.ts`)

**Query Performance**:
- Cache hits: p95 < 50ms
- Database queries (cache miss): p95 < 500ms
- Dashboard (typical 5-10 queries): p95 < 2s total

(`scripts/load-test.js` — k6 benchmark script)

**Dashboard** — React 18 + Recharts, renders:
- Real-time event count trends (updated via GraphQL subscriptions)
- Custom metric dashboards (user-defined dimensions)
- Anomaly detection (threshold alerts)
- Timezone-aware charting

(`web/src/pages/Dashboard.tsx`)

**Infrastructure** — Docker Compose local dev stack:
- PostgreSQL 16 (time-series partitioned)
- Redis 7 (query cache)
- Kafka + Redpanda (message queue, 3 partitions)
- Ingest API (Node.js, port 3001)
- GraphQL API (Node.js, port 3002)
- Worker (Node.js, Kafka consumer)
- React frontend (Vite, port 5173)

All services configured with health checks + auto-restart.

(`docker-compose.yml`)

**Stack** — Node.js 20, Express, Apollo GraphQL, React 18, PostgreSQL 16, Redis 7, Kafka, Playwright (E2E), k6 (load testing), pnpm workspaces.

## How It Works

1. **Event source sends JSON** → POST to ingest API
2. **API validates + publishes** → Kafka topic (with batching)
3. **Worker consumes** → Aggregates into hourly buckets by (tenant_id, metric_name, dimension_values)
4. **Aggregates stored** → PostgreSQL partitioned tables
5. **GraphQL query** → Checks cache (Redis) → if miss, queries DB → returns to dashboard
6. **Dashboard renders** → Real-time updates via subscriptions

## Getting Started

### One-Command Setup
```bash
pnpm bootstrap  # Installs deps, starts Docker services, runs migrations
pnpm dev        # Starts all 4 backend services + frontend concurrently
```

Visit `http://localhost:5173`.

### Manual Setup
```bash
pnpm install
docker-compose up -d

# Create schema
pnpm db:migrate

# Seed sample data
pnpm db:seed

# Start services
pnpm dev
```

### Services
- **Ingest API** (port 3001): `curl -X POST http://localhost:3001/ingest -H 'Content-Type: application/json' -d '{"event":"signup","user_id":"123"}'`
- **GraphQL API** (port 3002): `http://localhost:3002/graphql`
- **Frontend** (port 5173): `http://localhost:5173`

## API Examples

### Ingest Event
```bash
curl -X POST http://localhost:3001/ingest \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "page_view",
    "user_id": "u123",
    "page": "/pricing",
    "timestamp": 1705945000
  }'
```

### Query Metrics (GraphQL)
```graphql
query {
  metrics(
    tenant: "acme-corp"
    name: "page_views"
    startTime: "2024-01-01T00:00:00Z"
    endTime: "2024-01-31T23:59:59Z"
    groupBy: ["page"]
  ) {
    timestamp
    value
    dimensions
  }
}
```

## Testing

### Unit Tests
```bash
pnpm test:unit  # Jest
```

### Integration Tests
```bash
pnpm test:integration  # Postgres + Redis required
```

### E2E Tests
```bash
pnpm test:e2e  # Playwright
```

### Load Testing
```bash
pnpm test:load  # k6, 1000 RPS sustained for 5 minutes
```

## Performance Characteristics

| Metric | Target | Notes |
|--------|--------|-------|
| Ingest throughput | 1000+ RPS | Single node; horizontally scalable |
| Ingest p95 latency | < 100ms | Network + Kafka publish |
| Query p95 (cached) | < 50ms | Redis hit |
| Query p95 (DB) | < 500ms | PostgreSQL + index |
| Availability | 99%+ | Demo target; prod requires multi-region |

## Deployment

### Frontend
```bash
npm run build
# Deploy to Vercel (free tier)
```

### Backend Services
- **Ingest API + GraphQL API + Worker**: Deploy to Railway, Render, or AWS Lambda
- **PostgreSQL**: Managed service (Neon free tier, Railway, AWS RDS)
- **Redis**: Upstash (free tier for dev)
- **Kafka**: Managed Kafka (Confluent Cloud, AWS MSK) or self-hosted

Estimated dev cost: $0 (free tiers); small prod workloads typically $50-200/month.

## Architecture

```
Event Source
      ↓
  Ingest API (HTTP, port 3001)
      ↓
   Kafka (3 partitions)
      ↓
   Worker (aggregation)
      ↓
PostgreSQL 16 (time-series partitioned, auto-vacuum tuned)
      ↓
GraphQL API (port 3002, Redis cache layer)
      ↓
React Dashboard (port 5173, subscriptions for real-time updates)
```

## Security

- **No secrets in git** — `.env` files gitignored, secrets in environment
- **API key hashing** — bcrypt, stored in PostgreSQL
- **Multi-tenant isolation** — All queries filtered by `tenant_id` at resolver entry
- **OAuth 2.0** — Google sign-in for user authentication
- **Rate limiting** — Token bucket per API key (100 req/min default)
- **SQL injection prevention** — Parameterized queries via ORM
- **Automated scans** — ESLint security plugin, npm audit in CI

## License

MIT
