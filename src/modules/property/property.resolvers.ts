import { PropertyService } from './property.service';
import { GraphQLContext } from '../../types/context';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model'; 

const propertyService = new PropertyService();

export const propertyResolvers = {
  Query: {
    myProperties: function (_: any, __: any, ctx: GraphQLContext) {
      return propertyService.getMyProperties(ctx);
    },
    property: function (args: { id: string }) {
      const id = parseInt(args.id, 10);
      return propertyService.getPropertyById(id);
    },
    searchAvailableProperties: function (
      _: any,
      args: { start: string; end: string; guests: number },
      _ctx: GraphQLContext,
    ) {
      return propertyService.searchAvailableProperties(
        args.start,
        args.end,
        args.guests,
      );
    },
  },

  Mutation: {
    createProperty: function (
      _: any,
      args: {
        title: string;
        description?: string;
        maxGuests: number;
        basePricePerNight: number;
      },
      ctx: GraphQLContext,
    ) {
      return propertyService.createProperty(ctx, {
        title: args.title,
        description: args.description,
        maxGuests: args.maxGuests,
        basePricePerNight: args.basePricePerNight,
      });
    },

    updateProperty: function (
      _: any,
      args: {
        id: string;
        title?: string;
        description?: string;
        maxGuests?: number;
        basePricePerNight?: number;
      },
      ctx: GraphQLContext,
    ) {
      const id = parseInt(args.id, 10);
      return propertyService.updateProperty(ctx, id, {
        title: args.title,
        description: args.description,
        maxGuests: args.maxGuests,
        basePricePerNight: args.basePricePerNight,
      });
    },

    deleteProperty: function (_: any, args: { id: string }, ctx: GraphQLContext) {
      const id = parseInt(args.id, 10);
      return propertyService.deleteProperty(ctx, id);
    },
  },

  Property: {
    owner: function (parent: Property) {
      return User.findByPk(parent.ownerId);
    },
  },
};