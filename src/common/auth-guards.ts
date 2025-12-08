import { GraphQLContext } from '../types/context';

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw new Error('No autenticado');
  }
  return ctx.user;
}

export function requireRole(ctx: GraphQLContext, role: 'PROPIETARIO' | 'VIAJERO') {
  const user = requireAuth(ctx);
  if (user.role !== role) {
    throw new Error('No autorizado');
  }
  return user;
}