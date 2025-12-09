import { ERROR_MESSAGES } from './error-messages';
import { GraphQLContext } from '../types/context';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.NOT_AUTHENTICATED);
  }
  return ctx.user;
}

export function requireRole(ctx: GraphQLContext, role: 'PROPIETARIO' | 'VIAJERO') {
  const user = requireAuth(ctx);
  if (user.role !== role) {
    throw new ForbiddenError(ERROR_MESSAGES.AUTH.NOT_AUTHORIZED);
  }
  return user;
}
