import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from project root
config({ path: resolve(__dirname, '../../../.env') });

import { Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { logger } from './utils/logger';
import { computeDailyAggregates } from './aggregators/daily';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'pulseops-aggregators';

// Initialize database
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
});

// Initialize Kafka consumer
const kafka = new Kafka({
    clientId: 'pulseops-worker',
    brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({
    groupId: KAFKA_GROUP_ID,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
});

// Track processing stats
let processedCount = 0;
let errorCount = 0;

async function processEvent(event: any) {
    try {
        // Store raw event (optional, for debugging/replay)
        await db.query(
            `INSERT INTO events (org_id, project_id, event_name, user_id, session_id, properties, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
            [
                event.org_id,
                event.project_id,
                event.event_name,
                event.user_id,
                event.session_id,
                event.properties,
                event.timestamp,
            ]
        );

        // Compute aggregates
        await computeDailyAggregates(db, event);

        processedCount++;

        if (processedCount % 100 === 0) {
            logger.info({
                processed: processedCount,
                errors: errorCount,
                error_rate: (errorCount / processedCount * 100).toFixed(2) + '%',
            }, 'Processing stats');
        }
    } catch (error) {
        errorCount++;
        logger.error({ error, event }, 'Failed to process event');
        throw error; // Let Kafka handle retry
    }
}

async function start() {
    try {
        // Connect to Kafka
        await consumer.connect();
        logger.info('Kafka consumer connected');

        // Subscribe to topic
        await consumer.subscribe({
            topic: 'events-raw',
            fromBeginning: false,
        });

        logger.info('Subscribed to events-raw topic');

        // Run consumer
        await consumer.run({
            autoCommit: false,
            eachMessage: async ({ topic, partition, message }) => {
                const event = JSON.parse(message.value?.toString() || '{}');
                const traceId = message.headers?.trace_id?.toString();

                logger.info({
                    trace_id: traceId,
                    event_id: event.id,
                    event_name: event.event_name,
                    offset: message.offset,
                }, 'Processing event');

                try {
                    await processEvent(event);

                    // Commit offset after successful processing
                    await consumer.commitOffsets([{
                        topic,
                        partition,
                        offset: (parseInt(message.offset) + 1).toString(),
                    }]);
                } catch (error) {
                    logger.error({ error, trace_id: traceId }, 'Event processing failed, will retry');
                    // Do not commit offset, allowing retry
                }
            },
        });
    } catch (error) {
        logger.error({ error }, 'Worker failed to start');
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown() {
    logger.info('Shutting down worker...');

    await consumer.disconnect();
    await db.end();

    logger.info({
        total_processed: processedCount,
        total_errors: errorCount,
    }, 'Worker shutdown complete');

    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
