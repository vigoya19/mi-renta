import bcrypt from 'bcryptjs';
import { User } from '../../models/user.model';
import { signToken } from './jwt';
import { ERROR_MESSAGES } from '../../common/error-messages';
import { ApolloError, AuthenticationError } from 'apollo-server-express';
import { WhereOptions } from 'sequelize';
import { UserAttributes } from '../../models/user.model';

export class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
    role: 'PROPIETARIO' | 'VIAJERO',
  ) {
    const whereEmail = { email } as unknown as WhereOptions<UserAttributes>;
    const existing = await User.findOne({ where: whereEmail });
    if (existing) {
      throw new ApolloError(ERROR_MESSAGES.AUTH.EMAIL_IN_USE, 'BAD_USER_INPUT');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    const token = signToken({ userId: user.id, role: user.role });

    return { user, token };
  }

  async login(email: string, password: string) {
    const whereEmail = { email } as unknown as WhereOptions<UserAttributes>;
    const user = await User.findOne({ where: whereEmail });
    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const token = signToken({ userId: user.id, role: user.role });

    return { user, token };
  }

  async getAccount(userId: number) {
    const user = await User.findByPk(userId);
    return user;
  }
}
