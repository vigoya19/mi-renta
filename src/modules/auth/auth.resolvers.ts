import { requireAuth } from '../../common/auth-guards';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import { RegisterArgs, LoginArgs, AuthPayload } from '../../types/auth';
import { User } from '../../models/user.model';
import { validateDto } from '../../common/validation';
import { LoginDto, RegisterDto } from '../../dtos/auth.dto';

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
  const dto = validateDto(RegisterDto, args);

  return ctx.container.authService.register(
    dto.name,
    dto.email,
    dto.password,
    dto.role,
  );
};

const loginResolver: Resolver<unknown, LoginArgs, AuthPayload> = (
  _parent,
  args,
  ctx,
) => {
  const dto = validateDto(LoginDto, args);

  return ctx.container.authService.login(dto.email, dto.password);
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
