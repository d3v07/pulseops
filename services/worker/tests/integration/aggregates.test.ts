import { computeDailyAggregates } from '../src/aggregators/daily';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Pool } from 'pg';

describe('Daily Aggregates', () => {
    let db: Pool;

    beforeEach(() => {
        db = new Pool({
            connectionString: process.env.TEST_DATABASE_URL || 'postgresql://pulseops:dev_password_change_in_production@localhost:5432/pulseops_test',
        });
    });

    afterEach(async () => {
        await db.end();
    });

    it('should compute DAU aggregate', async () => {
        const event = {
            org_id: '00000000-0000-0000-0000-000000000001',
            project_id: '00000000-0000-0000-0000-000000000002',
            event_name: 'page_view',
            user_id: 'test_user',
            timestamp: new Date().toISOString(),
            properties: {},
        };

        await computeDailyAggregates(db, event);

        const result = await db.query(
            `SELECT metric_value FROM daily_aggregates 
       WHERE org_id = $1 AND metric_name = 'dau' AND date = CURRENT_DATE`,
            [event.org_id]
        );

        expect(result.rows.length).toBeGreaterThan(0);
        expect(Number(result.rows[0].metric_value)).toBeGreaterThan(0);
    });

    it('should compute event count aggregate', async () => {
        const event = {
            org_id: '00000000-0000-0000-0000-000000000001',
            project_id: '00000000-0000-0000-0000-000000000002',
            event_name: 'button_click',
            timestamp: new Date().toISOString(),
            properties: {},
        };

        await computeDailyAggregates(db, event);

        const result = await db.query(
            `SELECT metric_value FROM daily_aggregates 
       WHERE org_id = $1 AND metric_name = 'event_count' AND date = CURRENT_DATE`,
            [event.org_id]
        );

        expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should increment total_events', async () => {
        const event = {
            org_id: '00000000-0000-0000-0000-000000000001',
            project_id: '00000000-0000-0000-0000-000000000002',
            event_name: 'test_event',
            timestamp: new Date().toISOString(),
            properties: {},
        };

        const beforeResult = await db.query(
            `SELECT COALESCE(metric_value, 0) as value FROM daily_aggregates 
       WHERE org_id = $1 AND metric_name = 'total_events' AND date = CURRENT_DATE`,
            [event.org_id]
        );

        const beforeValue = beforeResult.rows[0]?.value || 0;

        await computeDailyAggregates(db, event);

        const afterResult = await db.query(
            `SELECT metric_value as value FROM daily_aggregates 
       WHERE org_id = $1 AND metric_name = 'total_events' AND date = CURRENT_DATE`,
            [event.org_id]
        );

        const afterValue = Number(afterResult.rows[0].value);

        expect(afterValue).toBeGreaterThan(Number(beforeValue));
    });
});
