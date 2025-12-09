import { GraphQLContext } from '../../types/context';
import { Property } from '../../models/property.model';
import { BlockedDate } from '../../models/blocked-date.model';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import { CreateBlockedDateArgs } from '../../types/blocked-date';
import { validateDto } from '../../common/validation';
import { CreateBlockedDateDto } from '../../dtos/blocked-date.dto';

const createBlockedDateResolver: Resolver<
  unknown,
  CreateBlockedDateArgs,
  BlockedDate
> = (_parent, args, ctx) => {
  const dto = validateDto(CreateBlockedDateDto, args);

  return ctx.container.blockedDateService.createBlockedDate(ctx, {
    propertyId: dto.propertyId,
    startDate: dto.startDate,
    endDate: dto.endDate,
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
