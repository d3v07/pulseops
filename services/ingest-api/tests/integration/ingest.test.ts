import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const INGEST_API_URL = process.env.INGEST_API_URL || 'http://localhost:3001';
const API_KEY = process.env.TEST_API_KEY || 'demo_key_change_this';

describe('Ingest API Integration Tests', () => {
    it('should accept a valid event', async () => {
        const response = await request(INGEST_API_URL)
            .post('/api/v1/events')
            .set('X-API-Key', API_KEY)
            .send({
                event_name: 'test_event',
                user_id: 'test_user_123',
                properties: {
                    test: true,
                    page: '/test',
                },
            });

        expect(response.status).toBe(202);
        expect(response.body).toHaveProperty('status', 'accepted');
        expect(response.body).toHaveProperty('event_id');
    });

    it('should reject event without API key', async () => {
        const response = await request(INGEST_API_URL)
            .post('/api/v1/events')
            .send({
                event_name: 'test_event',
            });

        expect(response.status).toBe(401);
    });

    it('should reject invalid event data', async () => {
        const response = await request(INGEST_API_URL)
            .post('/api/v1/events')
            .set('X-API-Key', API_KEY)
            .send({
                // Missing event_name
                user_id: 'test_user',
            });

        expect(response.status).toBe(400);
    });

    it('should accept batch events', async () => {
        const events = Array.from({ length: 10 }, (_, i) => ({
            event_name: 'batch_event',
            user_id: `user_${i}`,
            properties: { batch_index: i },
        }));

        const response = await request(INGEST_API_URL)
            .post('/api/v1/events/batch')
            .set('X-API-Key', API_KEY)
            .send({ events });

        expect(response.status).toBe(202);
        expect(response.body).toHaveProperty('count', 10);
    });

    it('should reject batch with too many events', async () => {
        const events = Array.from({ length: 1001 }, (_, i) => ({
            event_name: 'batch_event',
            user_id: `user_${i}`,
        }));

        const response = await request(INGEST_API_URL)
            .post('/api/v1/events/batch')
            .set('X-API-Key', API_KEY)
            .send({ events });

        expect(response.status).toBe(400);
    });
});
