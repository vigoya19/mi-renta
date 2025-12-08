import { AuthService } from './auth.service';
import { requireAuth } from '../../common/auth-guards';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import { RegisterArgs, LoginArgs, AuthPayload } from '../../types/auth';
import { User } from '../../models/user.model';

const authService = new AuthService();

const accountResolver: Resolver<unknown, EmptyArgs, User | null> = (
  _parent,
  _args,
  ctx,
) => {
  const currentUser = requireAuth(ctx);
  return authService.getAccount(currentUser.userId);
};

const registerResolver: Resolver<unknown, RegisterArgs, AuthPayload> = (
  _parent,
  args,
  _ctx,
) => {
  return authService.register(
    args.name,
    args.email,
    args.password,
    args.role,
  );
};

const loginResolver: Resolver<unknown, LoginArgs, AuthPayload> = (
  _parent,
  args,
  _ctx,
) => {
  return authService.login(args.email, args.password);
};

export const authResolvers = {
  Query: {
    account: accountResolver,
  },
  Mutation: {
    register: registerResolver,
    login: loginResolver,
  },
};