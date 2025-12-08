import { BlockedDateService } from './blocked-date.service';
import { GraphQLContext } from '../../types/context';
import { Property } from '../../models/property.model';
import { BlockedDate } from '../../models/blocked-date.model';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import { CreateBlockedDateArgs } from '../../types/blocked-date';

const blockedDateService = new BlockedDateService();


const createBlockedDateResolver: Resolver<
  unknown,
  CreateBlockedDateArgs,
  BlockedDate
> = (_parent, args, ctx) => {
  const propertyId = parseInt(args.propertyId, 10);

  return blockedDateService.createBlockedDate(ctx, {
    propertyId,
    startDate: args.startDate,
    endDate: args.endDate,
  });
};


const blockedDatePropertyResolver = (
  parent: BlockedDate,
  _args: EmptyArgs,
  _ctx: GraphQLContext,
) => {
  return Property.findByPk(parent.propertyId);
};


export const blockedDateResolvers = {
  Mutation: {
    createBlockedDate: createBlockedDateResolver,
  },
  BlockedDate: {
    property: blockedDatePropertyResolver,
  },
};