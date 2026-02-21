import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create registry
export const register = new Registry();

// Default metrics (CPU, memory, etc.)
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics({ register });

// Custom business metrics
export const metrics = {
    // HTTP Metrics
    httpRequestDuration: new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
        registers: [register],
    }),

    httpRequestsTotal: new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [register],
    }),

    // Event Ingestion Metrics
    eventsIngested: new Counter({
        name: 'events_ingested_total',
        help: 'Total number of events ingested',
        labelNames: ['org_id', 'project_id'],
        registers: [register],
    }),

    eventsIngestedBatch: new Counter({
        name: 'events_ingested_batch_total',
        help: 'Total number of batch events ingested',
        labelNames: ['org_id', 'project_id', 'batch_size'],
        registers: [register],
    }),

    eventIngestionDuration: new Histogram({
        name: 'event_ingestion_duration_seconds',
        help: 'Duration of event ingestion in seconds',
        labelNames: ['type'], // 'single' or 'batch'
        buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [register],
    }),

    eventIngestionErrors: new Counter({
        name: 'event_ingestion_errors_total',
        help: 'Total number of event ingestion errors',
        labelNames: ['error_type'],
        registers: [register],
    }),

    // Database Metrics
    dbQueryDuration: new Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries in seconds',
        labelNames: ['query_type'],
        buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [register],
    }),

    dbConnectionsActive: new Gauge({
        name: 'db_connections_active',
        help: 'Number of active database connections',
        registers: [register],
    }),

    dbConnectionsIdle: new Gauge({
        name: 'db_connections_idle',
        help: 'Number of idle database connections',
        registers: [register],
    }),

    // Redis Metrics
    redisCacheHits: new Counter({
        name: 'redis_cache_hits_total',
        help: 'Total number of Redis cache hits',
        labelNames: ['cache_key'],
        registers: [register],
    }),

    redisCacheMisses: new Counter({
        name: 'redis_cache_misses_total',
        help: 'Total number of Redis cache misses',
        labelNames: ['cache_key'],
        registers: [register],
    }),

    // Kafka Metrics
    kafkaMessagesProduced: new Counter({
        name: 'kafka_messages_produced_total',
        help: 'Total number of Kafka messages produced',
        labelNames: ['topic'],
        registers: [register],
    }),

    kafkaProduceErrors: new Counter({
        name: 'kafka_produce_errors_total',
        help: 'Total number of Kafka produce errors',
        labelNames: ['topic', 'error_type'],
        registers: [register],
    }),

    // Rate Limiting Metrics
    rateLimitHits: new Counter({
        name: 'rate_limit_hits_total',
        help: 'Total number of rate limit hits',
        labelNames: ['org_id', 'limit_type'],
        registers: [register],
    }),

    // Business Metrics
    activeOrganizations: new Gauge({
        name: 'active_organizations_total',
        help: 'Total number of active organizations',
        registers: [register],
    }),

    activeProjects: new Gauge({
        name: 'active_projects_total',
        help: 'Total number of active projects',
        registers: [register],
    }),

    eventsPerSecond: new Gauge({
        name: 'events_per_second',
        help: 'Current event ingestion rate per second',
        registers: [register],
    }),

    dataLagSeconds: new Gauge({
        name: 'data_lag_seconds',
        help: 'Lag between event ingestion and availability in analytics (seconds)',
        registers: [register],
    }),
};

// Middleware to track HTTP metrics
export function metricsMiddleware() {
    return async (request: any, reply: any) => {
        const start = Date.now();

        reply.addHook('onSend', async () => {
            const duration = (Date.now() - start) / 1000;
            const route = request.routerPath || request.url;
            const method = request.method;
            const statusCode = reply.statusCode;

            metrics.httpRequestDuration.observe(
                { method, route, status_code: statusCode },
                duration
            );

            metrics.httpRequestsTotal.inc({
                method,
                route,
                status_code: statusCode,
            });
        });
    };
}

// Metrics endpoint handler
export async function metricsHandler() {
    return register.metrics();
}
