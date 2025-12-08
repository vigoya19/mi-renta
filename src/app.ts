import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { GraphQLContext } from './types/context';
import { initDb } from './db';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

export async function createApp() {
  await initDb();

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }): GraphQLContext => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

      let user: GraphQLContext['user'] = null;

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as any;
          user = {
            userId: decoded.userId,
            role: decoded.role,
          };
        } catch {
          user = null;
        }
      }

      return { user };
    }
  });

  await server.start();

  server.applyMiddleware({ app: app as any, path: '/graphql' });

  return app;
}