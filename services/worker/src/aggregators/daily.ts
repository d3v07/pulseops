import { Pool } from 'pg';

interface Event {
    org_id: string;
    project_id: string;
    event_name: string;
    user_id?: string;
    timestamp: string;
    properties: Record<string, any>;
}

export async function computeDailyAggregates(db: Pool, event: Event) {
    const date = new Date(event.timestamp).toISOString().split('T')[0];

    // DAU (Daily Active Users)
    if (event.user_id) {
        await db.query(
            `INSERT INTO daily_aggregates (org_id, project_id, metric_name, metric_value, date, dimensions)
       VALUES ($1, $2, 'dau', 1, $3, '{}')
       ON CONFLICT (org_id, project_id, metric_name, date, dimensions)
       DO UPDATE SET metric_value = daily_aggregates.metric_value + 1`,
            [event.org_id, event.project_id, date]
        );
    }



    // Event count by name
    await db.query(
        `INSERT INTO daily_aggregates (org_id, project_id, metric_name, metric_value, date, dimensions)
     VALUES ($1, $2, 'event_count', 1, $3, $4::jsonb)
     ON CONFLICT (org_id, project_id, metric_name, date, dimensions)
     DO UPDATE SET metric_value = daily_aggregates.metric_value + 1`,
        [event.org_id, event.project_id, date, JSON.stringify({ event_name: event.event_name })]
    );

    // Total events
    await db.query(
        `INSERT INTO daily_aggregates (org_id, project_id, metric_name, metric_value, date, dimensions)
     VALUES ($1, $2, 'total_events', 1, $3, '{}')
     ON CONFLICT (org_id, project_id, metric_name, date, dimensions)
     DO UPDATE SET metric_value = daily_aggregates.metric_value + 1`,
        [event.org_id, event.project_id, date]
    );
}
