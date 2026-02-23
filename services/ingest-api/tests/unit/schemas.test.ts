import { eventValidationSchema } from '../../src/schemas/event';
import { describe, it, expect } from '@jest/globals';

describe('Event Validation Schema', () => {
    it('should validate correct event', () => {
        const validEvent = {
            event_name: 'page_view',
            user_id: 'user_123',
            properties: {
                page: '/home',
            },
        };

        const result = eventValidationSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('should reject event without event_name', () => {
        const invalidEvent = {
            user_id: 'user_123',
        };

        const result = eventValidationSchema.safeParse(invalidEvent);
        expect(result.success).toBe(false);
    });

    it('should accept event with session_id', () => {
        const event = {
            event_name: 'click',
            session_id: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = eventValidationSchema.safeParse(event);
        expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for session_id', () => {
        const event = {
            event_name: 'click',
            session_id: 'invalid-uuid',
        };

        const result = eventValidationSchema.safeParse(event);
        expect(result.success).toBe(false);
    });

    it('should accept event with timestamp', () => {
        const event = {
            event_name: 'signup',
            timestamp: new Date().toISOString(),
        };

        const result = eventValidationSchema.safeParse(event);
        expect(result.success).toBe(true);
    });

    it('should reject event_name too long', () => {
        const event = {
            event_name: 'a'.repeat(256),
        };

        const result = eventValidationSchema.safeParse(event);
        expect(result.success).toBe(false);
    });
});
