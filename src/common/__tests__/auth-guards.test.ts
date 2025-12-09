import { requireAuth, requireRole } from '../auth-guards';

describe('auth-guards', () => {
  test('requireAuth throws when no user', () => {
    expect(() => requireAuth({ user: null } as any)).toThrow();
  });

  test('requireRole throws when role mismatch', () => {
    const ctx: any = { user: { role: 'VIAJERO', userId: 1 } };
    expect(() => requireRole(ctx, 'PROPIETARIO')).toThrow();
    expect(requireRole(ctx, 'VIAJERO')).toEqual(ctx.user);
  });
});
