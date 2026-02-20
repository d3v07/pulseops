// Shared type definitions for PulseOps

export interface Event {
    id?: string;
    org_id?: string;
    project_id?: string;
    event_name: string;
    user_id?: string;
    session_id?: string;
    properties?: Record<string, any>;
    timestamp?: string;
}

export interface ApiKeyRecord {
    id: string;
    org_id: string;
    key_hash: string;
    active: boolean;
    created_at: string;
    last_used_at?: string;
}

export interface DailyAggregate {
    id: number;
    org_id: string;
    project_id: string;
    metric_name: string;
    metric_value: number;
    dimensions?: Record<string, any>;
    date: string;
    computed_at: string;
}
