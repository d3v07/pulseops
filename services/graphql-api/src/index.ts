import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from project root
config({ path: resolve(__dirname, '../../../.env') });

import { ApolloServer } from '@apollo/server';
import fastifyApollo from '@as-integrations/fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3002', 10);

// Debug environment loading
console.log('[DEBUG] DATABASE_URL:', process.env.DATABASE_URL ? 'LOADED' : 'NOT LOADED');
console.log('[DEBUG] REDIS_URL:', process.env.REDIS_URL ? 'LOADED' : 'NOT LOADED');

// Initialize database
const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://pulseops:dev_password_change_in_production@localhost:5432/pulseops_dev',
    max: 20,
});

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create context
interface Context {
    db: Pool;
    redis: Redis;
}

// Initialize Apollo Server
const apollo = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
});

// Initialize and start server
(async () => {
    await apollo.start();

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
    });

    await app.register(cors, {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
    });

    await app.register(fastifyApollo(apollo), {
        context: async () => ({ db, redis }),
    });

    // Health check
    app.get('/health', async () => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
    }));

    // Graceful shutdown
    async function shutdown() {
        app.log.info('Shutting down...');
        await app.close();
        await apollo.stop();
        await redis.quit();
        await db.end();
        process.exit(0);
    }

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Start server
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' });
        app.log.info(`GraphQL API listening on port ${PORT}`);
        app.log.info(`GraphQL Playground: http://localhost:${PORT}/graphql`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
})();
