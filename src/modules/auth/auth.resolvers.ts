import { requireAuth } from '../../common/auth-guards';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import { RegisterArgs, LoginArgs, AuthPayload } from '../../types/auth';
import { User } from '../../models/user.model';

const accountResolver: Resolver<unknown, EmptyArgs, User | null> = (
  _parent,
  _args,
  ctx,
) => {
  const currentUser = requireAuth(ctx);
  return ctx.container.authService.getAccount(currentUser.userId);
};

const registerResolver: Resolver<unknown, RegisterArgs, AuthPayload> = (
  _parent,
  args,
  ctx,
) => {
  return ctx.container.authService.register(
    args.name,
    args.email,
    args.password,
    args.role,
  );
};

const loginResolver: Resolver<unknown, LoginArgs, AuthPayload> = (
  _parent,
  args,
  ctx,
) => {
  return ctx.container.authService.login(args.email, args.password);
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
