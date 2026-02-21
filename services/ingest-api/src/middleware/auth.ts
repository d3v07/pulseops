import { FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import Redis from 'ioredis';
import bcrypt from 'bcrypt';

export function apiKeyAuth(db: Pool, redis: Redis) {
    return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        // TEMPORARY: Skip API key validation for initial testing
        req.orgId = '00000000-0000-0000-0000-000000000001';
        req.projectId = '00000000-0000-0000-0000-000000000002';
        req.log.warn('API KEY AUTH DISABLED FOR TESTING - DO NOT USE IN PRODUCTION');
        return;

        // Original auth logic commented out temporarily
        /*
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return reply.code(401).send({ error: 'Missing API key' });
        }

        try {
            // Check cache first
            const cacheKey = `apikey:${apiKey}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                const { org_id, project_id } = JSON.parse(cached);
                req.orgId = org_id;
                req.projectId = project_id;
                return;
            }

            // Validate API key from database
            const result = await db.query(
                `SELECT org_id, key_hash, active 
         FROM api_keys 
         WHERE active = true 
         LIMIT 100`
            );

            let authenticated = false;
            let orgId = '';

            for (const row of result.rows) {
                const isValid = await bcrypt.compare(apiKey, row.key_hash);
                if (isValid && row.active) {
                    authenticated = true;
                    orgId = row.org_id;

                    // Update last_used_at
                    await db.query(
                        'UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1',
                        [row.key_hash]
                    );

                    break;
                }
            }

            if (!authenticated) {
                return reply.code(403).send({ error: 'Invalid API key' });
            }

            req.orgId = orgId;

            // Cache for 5 minutes
            await redis.setex(cacheKey, 300, JSON.stringify({ org_id: orgId }));
        } catch (error) {
            req.log.error({ error }, 'API key validation failed');
            return reply.code(500).send({ error: 'Internal server error' });
        }
        */
    };
}
