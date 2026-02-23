-- Database Optimization Migration
-- This migration adds indexes and optimizations for production performance

-- Events Table Indexes
-- Index for filtering by organization and project
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_org_project 
ON events(org_id, project_id);

-- Index for time-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_created_at 
ON events(created_at DESC);

-- Composite index for common query pattern (org, project, time)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_org_project_time 
ON events(org_id, project_id, created_at DESC);

-- Index for event name filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_event_name 
ON events(event_name);

-- Index for user-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_user_id 
ON events(user_id) WHERE user_id IS NOT NULL;

-- Index for session-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_session_id 
ON events(session_id) WHERE session_id IS NOT NULL;

-- Daily Aggregates Indexes
-- Index for time-series queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_aggregates_date 
ON daily_aggregates(date DESC);

-- Composite index for org/project filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_aggregates_org_project_date 
ON daily_aggregates(org_id, project_id, date DESC);

-- Index for metric type queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_aggregates_metric_type 
ON daily_aggregates(metric_type);

-- API Keys Indexes
-- Index for fast API key lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_key_hash 
ON api_keys(key_hash);

-- Index for organization lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_org_id 
ON api_keys(org_id);

-- Table Partitioning for Events (by month)
-- This improves query performance for time-based queries
CREATE TABLE IF NOT EXISTS events_template (
    LIKE events INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create partitions for current and future months
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    -- Create partitions for next 12 months
    FOR i IN 0..11 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE) + (i || ' months')::INTERVAL;
        end_date := start_date + '1 month'::INTERVAL;
        partition_name := 'events_y' || TO_CHAR(start_date, 'YYYY') || 'm' || TO_CHAR(start_date, 'MM');
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF events_template FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            start_date,
            end_date
        );
    END LOOP;
END $$;

-- Materialized View for Fast Dashboard Queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_metrics AS
SELECT 
    org_id,
    project_id,
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT session_id) AS unique_sessions,
    jsonb_object_agg(event_name, event_count) AS events_by_name
FROM events
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY org_id, project_id, DATE_TRUNC('day', created_at);

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_dashboard_org_project_date 
ON mv_dashboard_metrics(org_id, project_id, date DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'SELECT refresh_dashboard_metrics()');

-- Query Performance Optimization
-- Analyze tables to update statistics
ANALYZE events;
ANALYZE daily_aggregates;
ANALYZE api_keys;

-- Vacuum to reclaim space
VACUUM ANALYZE events;
VACUUM ANALYZE daily_aggregates;

-- Add query timeout to prevent long-running queries
ALTER DATABASE pulseops_dev SET statement_timeout = '30s';

-- Connection pooling settings (adjust based on workload)
COMMENT ON DATABASE pulseops_dev IS 'Recommended settings: max_connections=200, shared_buffers=2GB, effective_cache_size=6GB';
