import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient('http://localhost:3002/graphql', {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const queries = {
  GET_METRICS: `
    query GetMetrics($orgId: ID!, $projectId: ID!, $startDate: Date!, $endDate: Date!, $filters: JSON) {
      metrics(orgId: $orgId, projectId: $projectId, startDate: $startDate, endDate: $endDate, filters: $filters) {
        totalEvents
        dailyActiveUsers {
          date
          value
        }
        topEvents {
          eventName
          count
        }
        dateRange {
          start
          end
        }
      }
    }
  `,

  GET_DAU: `
    query GetDAU($orgId: ID!, $projectId: ID!, $startDate: Date!, $endDate: Date!, $filters: JSON) {
      dailyActiveUsers(orgId: $orgId, projectId: $projectId, startDate: $startDate, endDate: $endDate, filters: $filters) {
        date
        value
      }
    }
  `,

  GET_EVENT_COUNTS: `
    query GetEventCounts($orgId: ID!, $projectId: ID!, $startDate: Date!, $endDate: Date!, $filters: JSON) {
      eventCounts(orgId: $orgId, projectId: $projectId, startDate: $startDate, endDate: $endDate, filters: $filters) {
        eventName
        count
      }
    }
  `,

  GET_EVENT_SERIES: `
    query GetEventSeries($orgId: ID!, $projectId: ID!, $startDate: Date!, $endDate: Date!, $eventName: String, $filters: JSON) {
      eventCountsOverTime(orgId: $orgId, projectId: $projectId, startDate: $startDate, endDate: $endDate, eventName: $eventName, filters: $filters) {
        date
        value
      }
    }
  `,

  GET_RECENT_EVENTS: `
    query GetRecentEvents($orgId: ID!, $projectId: ID!, $limit: Int, $filters: JSON) {
      recentEvents(orgId: $orgId, projectId: $projectId, limit: $limit, filters: $filters) {
        id
        eventName
        userId
        timestamp
        properties
      }
    }
  `,
};
