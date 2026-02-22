import { Pool } from 'pg';
import Redis from 'ioredis';
import { GraphQLScalarType, Kind } from 'graphql';

interface Context {
    db: Pool;
    redis: Redis;
}

// Date scalar
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date in YYYY-MM-DD format',
    serialize(value: any) {
        return value instanceof Date ? value.toISOString().split('T')[0] : value;
    },
    parseValue(value: any) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
});

const jsonScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    serialize(value: any) {
        return value;
    },
    parseValue(value: any) {
        return value;
    },
    parseLiteral(ast) {
        const parseAst = (node: any): any => {
            switch (node.kind) {
                case Kind.STRING:
                case Kind.BOOLEAN:
                    return node.value;
                case Kind.INT:
                    return parseInt(node.value, 10);
                case Kind.FLOAT:
                    return parseFloat(node.value);
                case Kind.OBJECT: {
                    const value: Record<string, any> = {};
                    node.fields.forEach((field: any) => {
                        value[field.name.value] = parseAst(field.value);
                    });
                    return value;
                }
                case Kind.LIST:
                    return node.values.map(parseAst);
                case Kind.NULL:
                    return null;
                default:
                    return null;
            }
        };
        return parseAst(ast);
    },
});

const allowedFilterKeys = new Set(['segment', 'region', 'device', 'product']);

function normalizeFilters(filters: any): Record<string, string> {
    if (!filters || typeof filters !== 'object') return {};
    const normalized: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (allowedFilterKeys.has(key) && typeof value === 'string' && value.trim().length > 0) {
            normalized[key] = value.trim();
        }
    });
    return normalized;
}

function buildPropertyClauses(filters: Record<string, string>, params: any[]) {
    const clauses: string[] = [];
    Object.entries(filters).forEach(([key, value]) => {
        params.push(value);
        clauses.push(`properties->>'${key}' = $${params.length}`);
    });
    return clauses.length ? ` AND ${clauses.join(' AND ')}` : '';
}

export const resolvers = {
    Date: dateScalar,
    JSON: jsonScalar,

    Query: {
        async dailyActiveUsers(
            _: any,
            { orgId, projectId, startDate, endDate, filters }: any,
            { db, redis }: Context
        ) {
            const normalizedFilters = normalizeFilters(filters);
            const filtersKey = JSON.stringify(normalizedFilters);

            // Try cache first
            const cacheKey = `dau:${orgId}:${projectId}:${startDate}:${endDate}:${filtersKey}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                return JSON.parse(cached);
            }

            let result;
            if (Object.keys(normalizedFilters).length > 0) {
                const params: any[] = [orgId, projectId, startDate, endDate];
                const filterClause = buildPropertyClauses(normalizedFilters, params);
                result = await db.query(
                    `SELECT DATE(timestamp) as date, COUNT(DISTINCT user_id)::float as value
         FROM events
         WHERE org_id = $1
           AND project_id = $2
           AND timestamp::date >= $3
           AND timestamp::date <= $4
           AND user_id IS NOT NULL${filterClause}
         GROUP BY DATE(timestamp)
         ORDER BY DATE(timestamp) ASC`,
                    params
                );
            } else {
                result = await db.query(
                    `SELECT date, metric_value as value
         FROM daily_aggregates
         WHERE org_id = $1
           AND project_id = $2
           AND metric_name = 'dau'
           AND date >= $3
           AND date <= $4
         ORDER BY date ASC`,
                    [orgId, projectId, startDate, endDate]
                );
            }

            const data = result.rows;

            // Cache for 5 minutes
            await redis.setex(cacheKey, 300, JSON.stringify(data));

            return data;
        },

        async eventCounts(
            _: any,
            { orgId, projectId, startDate, endDate, eventName, filters }: any,
            { db, redis }: Context
        ) {
            const normalizedFilters = normalizeFilters(filters);
            const filtersKey = JSON.stringify(normalizedFilters);
            const cacheKey = `events:${orgId}:${projectId}:${startDate}:${endDate}:${eventName || 'all'}:${filtersKey}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                return JSON.parse(cached);
            }

            let result;
            if (Object.keys(normalizedFilters).length > 0) {
                let query = `
        SELECT event_name as "eventName", COUNT(*)::int as count
        FROM events
        WHERE org_id = $1
          AND project_id = $2
          AND timestamp::date >= $3
          AND timestamp::date <= $4
      `;
                const params: any[] = [orgId, projectId, startDate, endDate];

                if (eventName) {
                    params.push(eventName);
                    query += ` AND event_name = $${params.length}`;
                }

                query += buildPropertyClauses(normalizedFilters, params);
                query += ` GROUP BY event_name ORDER BY count DESC LIMIT 20`;

                result = await db.query(query, params);
            } else {
                let query = `
        SELECT 
          dimensions->>'event_name' as "eventName",
          SUM(metric_value)::int as count
        FROM daily_aggregates
        WHERE org_id = $1
          AND project_id = $2
          AND metric_name = 'event_count'
          AND date >= $3
          AND date <= $4
      `;

                const params: any[] = [orgId, projectId, startDate, endDate];

                if (eventName) {
                    query += ` AND dimensions->>'event_name' = $5`;
                    params.push(eventName);
                }

                query += ` GROUP BY dimensions->>'event_name' ORDER BY count DESC LIMIT 20`;

                result = await db.query(query, params);
            }
            const data = result.rows;

            await redis.setex(cacheKey, 300, JSON.stringify(data));

            return data;
        },

        async totalEvents(
            _: any,
            { orgId, projectId, startDate, endDate, filters }: any,
            { db, redis }: Context
        ) {
            const normalizedFilters = normalizeFilters(filters);
            const filtersKey = JSON.stringify(normalizedFilters);
            const cacheKey = `total:${orgId}:${projectId}:${startDate}:${endDate}:${filtersKey}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                return parseInt(cached, 10);
            }

            let total = 0;
            if (Object.keys(normalizedFilters).length > 0) {
                const params: any[] = [orgId, projectId, startDate, endDate];
                const filterClause = buildPropertyClauses(normalizedFilters, params);
                const result = await db.query(
                    `SELECT COUNT(*)::int as total
         FROM events
         WHERE org_id = $1
           AND project_id = $2
           AND timestamp::date >= $3
           AND timestamp::date <= $4${filterClause}`,
                    params
                );
                total = result.rows[0]?.total || 0;
            } else {
                const result = await db.query(
                    `SELECT SUM(metric_value)::int as total
         FROM daily_aggregates
         WHERE org_id = $1
           AND project_id = $2
           AND metric_name = 'total_events'
           AND date >= $3
           AND date <= $4`,
                    [orgId, projectId, startDate, endDate]
                );
                total = result.rows[0]?.total || 0;
            }

            await redis.setex(cacheKey, 300, total.toString());

            return total;
        },

        async metrics(
            _: any,
            args: any,
            context: Context
        ) {
            const [totalEvents, dailyActiveUsers, topEvents] = await Promise.all([
                resolvers.Query.totalEvents(_, args, context),
                resolvers.Query.dailyActiveUsers(_, args, context),
                resolvers.Query.eventCounts(_, args, context),
            ]);

            return {
                totalEvents,
                dailyActiveUsers,
                topEvents: topEvents.slice(0, 10),
                dateRange: {
                    start: args.startDate,
                    end: args.endDate,
                },
            };
        },

        async eventCountsOverTime(
            _: any,
            { orgId, projectId, startDate, endDate, eventName, filters }: any,
            { db, redis }: Context
        ) {
            const normalizedFilters = normalizeFilters(filters);
            const filtersKey = JSON.stringify(normalizedFilters);
            const cacheKey = `events-series:${orgId}:${projectId}:${startDate}:${endDate}:${eventName || 'all'}:${filtersKey}`;
            const cached = await redis.get(cacheKey);

            if (cached) {
                return JSON.parse(cached);
            }

            let result;
            if (Object.keys(normalizedFilters).length > 0) {
                let query = `
        SELECT DATE(timestamp) as date, COUNT(*)::float as value
        FROM events
        WHERE org_id = $1
          AND project_id = $2
          AND timestamp::date >= $3
          AND timestamp::date <= $4
      `;
                const params: any[] = [orgId, projectId, startDate, endDate];

                if (eventName) {
                    params.push(eventName);
                    query += ` AND event_name = $${params.length}`;
                }

                query += buildPropertyClauses(normalizedFilters, params);
                query += ` GROUP BY DATE(timestamp) ORDER BY DATE(timestamp) ASC`;

                result = await db.query(query, params);
            } else {
                let query = `
        SELECT date, SUM(metric_value)::float as value
        FROM daily_aggregates
        WHERE org_id = $1
          AND project_id = $2
          AND metric_name = 'event_count'
          AND date >= $3
          AND date <= $4
      `;

                const params: any[] = [orgId, projectId, startDate, endDate];

                if (eventName) {
                    query += ` AND dimensions->>'event_name' = $5`;
                    params.push(eventName);
                }

                query += ` GROUP BY date ORDER BY date ASC`;

                result = await db.query(query, params);
            }
            const data = result.rows;

            await redis.setex(cacheKey, 300, JSON.stringify(data));

            return data;
        },

        async recentEvents(
            _: any,
            { orgId, projectId, limit, filters }: any,
            { db }: Context
        ) {
            const normalizedFilters = normalizeFilters(filters);
            const params: any[] = [orgId, projectId];
            let query = `
        SELECT id::text as id, event_name as "eventName", user_id as "userId", timestamp, properties
        FROM events
        WHERE org_id = $1
          AND project_id = $2
      `;

            if (Object.keys(normalizedFilters).length > 0) {
                query += buildPropertyClauses(normalizedFilters, params);
            }

            params.push(limit || 10);
            query += ` ORDER BY timestamp DESC LIMIT $${params.length}`;

            const result = await db.query(
                query,
                params
            );

            return result.rows;
        },
    },
};
