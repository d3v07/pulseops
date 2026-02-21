import { z } from 'zod';

export const eventValidationSchema = z.object({
    event_name: z.string().min(1).max(255),
    user_id: z.string().optional(),
    session_id: z.string().uuid().optional(),
    project_id: z.string().uuid().optional(),
    properties: z.record(z.any()).optional(),
    timestamp: z.string().datetime().optional(),
});

export type Event = z.infer<typeof eventValidationSchema>;
