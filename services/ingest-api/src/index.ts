import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from project root
config({ path: resolve(__dirname, '../../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { eventValidationSchema, type Event } from './schemas/event';
import { apiKeyAuth } from './middleware/auth';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3001', 10);
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

// Initialize database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize Kafka producer
const kafka = new Kafka({
  clientId: 'pulseops-ingest-api',
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();

// Initialize Fastify
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
  requestIdLogLabel: 'trace_id',
});

// Initialize and start server
(async () => {
  // Register plugins
  await app.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? false : '*',
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    redis,
    keyGenerator: (req) => {
      const apiKey = req.headers['x-api-key'] as string;
      return apiKey || req.ip;
    },
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: db.totalCount > 0 ? 'connected' : 'disconnected',
        redis: redis.status === 'ready' ? 'connected' : 'disconnected',
        kafka: 'connected', // Producer connects lazily
      },
    };
  });

  // Event ingestion endpoint
  app.post<{ Body: Event }>('/api/v1/events', async (req, reply) => {
    // Auth check
    await apiKeyAuth(db, redis)(req, reply);

    const startTime = Date.now();

    try {
      // Validate event payload
      const validatedEvent = eventValidationSchema.parse(req.body);

      // Attach org_id and project_id from auth context
      const event = {
        id: randomUUID(),
        org_id: req.orgId,
        project_id: req.projectId || validatedEvent.project_id,
        event_name: validatedEvent.event_name,
        user_id: validatedEvent.user_id,
        session_id: validatedEvent.session_id || randomUUID(),
        properties: validatedEvent.properties || {},
        timestamp: validatedEvent.timestamp || new Date().toISOString(),
      };

      // Publish to Kafka topic
      await producer.send({
        topic: 'events-raw',
        messages: [
          {
            key: event.org_id,
            value: JSON.stringify(event),
            headers: {
              trace_id: req.id,
            },
          },
        ],
      });

      const latency = Date.now() - startTime;

      req.log.info({
        event_id: event.id,
        org_id: event.org_id,
        event_name: event.event_name,
        latency_ms: latency,
      }, 'Event ingested');

      // Return 202 Accepted immediately
      return reply.code(202).send({
        status: 'accepted',
        event_id: event.id,
      });
    } catch (error) {
      req.log.error({ error }, 'Event ingestion failed');

      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: error,
        });
      }

      return reply.code(500).send({
        error: 'Internal server error',
      });
    }
  });

  // Batch event ingestion endpoint
  app.post<{ Body: { events: Event[] } }>('/api/v1/events/batch', async (req, reply) => {
    // Auth check
    await apiKeyAuth(db, redis)(req, reply);

    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return reply.code(400).send({
        error: 'Invalid batch: events must be a non-empty array',
      });
    }

    if (events.length > 1000) {
      return reply.code(400).send({
        error: 'Batch too large: maximum 1000 events per request',
      });
    }

    try {
      const messages = events.map((eventData) => {
        const validatedEvent = eventValidationSchema.parse(eventData);

        const event = {
          id: randomUUID(),
          org_id: req.orgId,
          project_id: req.projectId || validatedEvent.project_id,
          event_name: validatedEvent.event_name,
          user_id: validatedEvent.user_id,
          session_id: validatedEvent.session_id || randomUUID(),
          properties: validatedEvent.properties || {},
          timestamp: validatedEvent.timestamp || new Date().toISOString(),
        };

        return {
          key: event.org_id,
          value: JSON.stringify(event),
        };
      });

      await producer.send({
        topic: 'events-raw',
        messages,
      });

      req.log.info({
        org_id: req.orgId,
        batch_size: events.length,
      }, 'Batch ingested');

      return reply.code(202).send({
        status: 'accepted',
        count: events.length,
      });
    } catch (error) {
      req.log.error({ error }, 'Batch ingestion failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Graceful shutdown
  async function shutdown() {
    app.log.info('Shutting down gracefully...');

    await app.close();
    await producer.disconnect();
    await redis.quit();
    await db.end();

    process.exit(0);
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  try {
    // Connect Kafka producer
    await producer.connect();
    app.log.info('Kafka producer connected');

    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Ingest API listening on port ${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
})();

// Type augmentation for request
declare module 'fastify' {
  interface FastifyRequest {
    orgId: string;
    projectId?: string;
  }
}
