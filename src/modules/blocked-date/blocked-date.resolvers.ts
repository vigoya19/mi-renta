import { BlockedDateService } from './blocked-date.service';
import { GraphQLContext } from '../../types/context';
import { Property } from '../../models/property.model';
import { BlockedDate } from '../../models/blocked-date.model';

var blockedDateService = new BlockedDateService();

export var blockedDateResolvers = {
  Mutation: {
    createBlockedDate: function (
      _: any,
      args: { propertyId: string; startDate: string; endDate: string },
      ctx: GraphQLContext,
    ) {
      var propertyId = parseInt(args.propertyId, 10);
      return blockedDateService.createBlockedDate(ctx, {
        propertyId: propertyId,
        startDate: args.startDate,
        endDate: args.endDate,
      });
    },
  },
  BlockedDate: {
    property: function (parent: BlockedDate) {
      return Property.findByPk(parent.propertyId);
    },
  },
};