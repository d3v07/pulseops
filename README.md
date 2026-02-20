# PulseOps - Real-Time Analytics SaaS Platform

Production-grade event-driven analytics platform demonstrating scalable system design.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen)](https://www.docker.com/)

## Overview

PulseOps is a portfolio project demonstrating production-grade system design for real-time analytics using event-driven architecture.

**Key Features**:
- Real-time event ingestion (1000+ RPS)
- Sub-second dashboard queries
- Multi-tenant with OAuth 2.0
- Zero to $5/month operational cost
- Comprehensive automation workflows

## Architecture

```
Event Sources → Ingest API → Kafka → Workers → PostgreSQL
                                               ↓
                User Dashboards ← GraphQL API ← Redis Cache
```


## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ and pnpm
- PostgreSQL, Redis, Kafka (via Docker)

### One-Command Setup
```bash
# Bootstrap entire project
pnpm bootstrap

# Or manually:
pnpm install
docker-compose up -d
pnpm db:migrate
pnpm dev
```

Visit http://localhost:5173 for the dashboard.

## Project Structure

```
PulseOps/
├── services/
│   ├── ingest-api/          # Event ingestion service
│   ├── graphql-api/         # Query API service
│   └── worker/              # Event processor
├── web/                     # React dashboard
├── packages/                # Shared libraries
└── docker-compose.yml       # Local infrastructure
```


## Security

Zero-compromise security practices:
- No secrets in git (`.env` files gitignored)
- API keys hashed with bcrypt
- OAuth 2.0 with Google
- Rate limiting (100 req/min)
- SQL injection prevention
- HTTPS enforcement
- Automated vulnerability scanning

See `.agent/rules/workspace-rules.md` for full security guidelines.

## Tech Stack

**Frontend**: React 18, TypeScript, Tailwind CSS, Recharts  
**Backend**: Node.js, Express, Apollo GraphQL  
**Database**: PostgreSQL (time-series partitioned)  
**Cache**: Redis (Upstash)  
**Queue**: Kafka / Redpanda  
**Deployment**: Vercel, Railway, Neon  
**Testing**: Jest, Playwright, k6  

## Testing

```bash
# Run all tests
pnpm test

# Coverage report
pnpm test:coverage

# Load testing
pnpm test:load
```

**Test Coverage**: 80%+ unit, 60%+ integration, 100% critical path E2E

## Metrics & Performance

- **Ingestion**: 1000+ events/second
- **Latency**: p95 < 500ms (cached queries)
- **Uptime**: 99.5%+ (demo target)
- **Cost**: $0-5/month using free tiers


## Development

### Start All Services
```bash
# Terminal 1: Infrastructure
docker-compose up postgres redis kafka

# Terminal 2: Ingest API
pnpm dev:ingest-api

# Terminal 3: GraphQL API
pnpm dev:graphql-api

# Terminal 4: Worker
pnpm dev:worker

# Terminal 5: Frontend
pnpm dev:web
```

## License

MIT

