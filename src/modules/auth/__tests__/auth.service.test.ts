import { AuthService } from '../auth.service';
import bcrypt from 'bcryptjs';

jest.mock('../../../models/user.model', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('../jwt', () => ({
  signToken: jest.fn(() => 'fake-token'),
}));

describe('AuthService', () => {
  const authService = new AuthService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register crea usuario y devuelve token', async () => {
    const { User } = require('../../../models/user.model');
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@example.com', role: 'PROPIETARIO' });

    const res = await authService.register('Alice', 'alice@example.com', 'Secret123', 'PROPIETARIO');

    expect(User.create).toHaveBeenCalled();
    expect(res.token).toBe('fake-token');
    expect(res.user.email).toBe('alice@example.com');
  });

  test('login falla con credenciales inválidas', async () => {
    const { User } = require('../../../models/user.model');
    User.findOne.mockResolvedValue(null);

    await expect(authService.login('x@example.com', 'bad')).rejects.toThrow();
  });

  test('login ok con password válido', async () => {
    const { User } = require('../../../models/user.model');
    const user = { id: 2, email: 'bob@example.com', passwordHash: await bcrypt.hash('Secret123', 1), role: 'VIAJERO' };
    User.findOne.mockResolvedValue(user);

    const res = await authService.login('bob@example.com', 'Secret123');
    expect(res.token).toBe('fake-token');
    expect(res.user.id).toBe(2);
  });
  test('register falla si email existe', async () => {
    const { User } = require('../../../models/user.model');
    User.findOne.mockResolvedValue({ id: 99 });
    await expect(
      authService.register('Alice', 'alice@example.com', 'Secret123', 'PROPIETARIO'),
    ).rejects.toThrow();
  });

  test('login falla si password incorrecto', async () => {
    const { User } = require('../../../models/user.model');
    const user = { id: 3, email: 'bob@example.com', passwordHash: await bcrypt.hash('ok', 1), role: 'VIAJERO' };
    User.findOne.mockResolvedValue(user);

    await expect(authService.login('bob@example.com', 'wrong')).rejects.toThrow();
  });
});
