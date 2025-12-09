import { ERROR_MESSAGES } from './error-messages';
import { GraphQLContext } from '../types/context';

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw new Error(ERROR_MESSAGES.AUTH.NOT_AUTHENTICATED);
  }
  return ctx.user;
}

export function requireRole(ctx: GraphQLContext, role: 'PROPIETARIO' | 'VIAJERO') {
  const user = requireAuth(ctx);
  if (user.role !== role) {
    throw new Error(ERROR_MESSAGES.AUTH.NOT_AUTHORIZED);
  }
  return user;
}
