// Shared constants and utilities for PulseOps

// Kafka topics
export const KAFKA_TOPICS = {
    EVENTS_RAW: 'events-raw',
    EVENTS_PROCESSED: 'events-processed',
} as const;

// Default configuration values
export const DEFAULTS = {
    RATE_LIMIT_MAX_REQUESTS: 100,
    RATE_LIMIT_WINDOW_MS: 60000,
    CACHE_TTL_SECONDS: 300,
} as const;

// Metric names
export const METRICS = {
    DAU: 'daily_active_users',
    EVENT_COUNT: 'event_count',
    SESSION_COUNT: 'session_count',
} as const;
