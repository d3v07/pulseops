const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { Pool } = require('pg');

const db = new Pool({
  connectionString: 'postgresql://pulseops:dev_password_change_in_production@localhost:5432/pulseops_dev'
});

const typeDefs = `
  type Event {
    id: ID!
    event_name: String!
    user_id: String
    created_at: String!
  }
  
  type EventCount {
    event_name: String!
    count: Int!
  }
  
  type Query {
    events: [Event!]!
    eventCounts: [EventCount!]!
    totalEvents: Int!
  }
`;

const resolvers = {
  Query: {
    events: async () => {
      const result = await db.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 10');
      return result.rows;
    },
    eventCounts: async () => {
      const result = await db.query('SELECT event_name, COUNT(*)::int as count FROM events GROUP BY event_name');
      return result.rows;
    },
    totalEvents: async () => {
      const result = await db.query('SELECT COUNT(*)::int as count FROM events');
      return result.rows[0].count;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
});
