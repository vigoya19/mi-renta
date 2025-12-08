import { GraphQLContext } from './context';

export type Resolver<Parent, Args, Return> = (
  parent: Parent,
  args: Args,
  ctx: GraphQLContext,
) => Promise<Return> | Return;

export type EmptyArgs = Record<string, never>;