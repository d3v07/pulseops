export const typeDefs = `#graphql
  scalar Date
  scalar DateTime
  scalar JSON

  type Query {
    """Get daily active users for a project"""
    dailyActiveUsers(
      orgId: ID!
      projectId: ID!
      startDate: Date!
      endDate: Date!
      filters: JSON
    ): [DailyMetric!]!

    """Get event counts by event name"""
    eventCounts(
      orgId: ID!
      projectId: ID!
      startDate: Date!
      endDate: Date!
      eventName: String
      filters: JSON
    ): [EventCount!]!

    """Get total events count"""
    totalEvents(
      orgId: ID!
      projectId: ID!
      startDate: Date!
      endDate: Date!
      filters: JSON
    ): Int!

    """Get all metrics for a date range"""
    metrics(
      orgId: ID!
      projectId: ID!
      startDate: Date!
      endDate: Date!
      filters: JSON
    ): MetricsSummary!

    """Get event counts grouped by date (optionally filtered by event name)"""
    eventCountsOverTime(
      orgId: ID!
      projectId: ID!
      startDate: Date!
      endDate: Date!
      eventName: String
      filters: JSON
    ): [DailyMetric!]!

    """Get most recent events"""
    recentEvents(
      orgId: ID!
      projectId: ID!
      limit: Int = 10
      filters: JSON
    ): [EventItem!]!
  }

  type DailyMetric {
    date: Date!
    value: Float!
  }

  type EventCount {
    eventName: String!
    count: Int!
    trend: Float
  }

  type EventItem {
    id: ID!
    eventName: String!
    userId: String
    timestamp: String!
    properties: JSON
  }

  type MetricsSummary {
    totalEvents: Int!
    dailyActiveUsers: [DailyMetric!]!
    topEvents: [EventCount!]!
    dateRange: DateRange!
  }

  type DateRange {
    start: Date!
    end: Date!
  }
`;
