import { AuthService } from './auth.service';
import { requireAuth } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';

const authService = new AuthService();

export const authResolvers = {
  Query: {
    account: (_: any, __: any, ctx: GraphQLContext) => {
      const currentUser = requireAuth(ctx);
      return authService.getAccount(currentUser.userId);
    },
  },
  Mutation: {
    register: (_: any, args: any) => {
      return authService.register(
        args.name,
        args.email,
        args.password,
        args.role,
      );
    },
    login: (_: any, args: any) => {
      return authService.login(args.email, args.password);
    },
  },
};