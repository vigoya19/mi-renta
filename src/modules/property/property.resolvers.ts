import { PropertyService } from './property.service';
import { GraphQLContext } from '../../types/context';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import {
  PropertyByIdArgs,
  SearchAvailablePropertiesArgs,
  CreatePropertyArgs,
  UpdatePropertyArgs,
  DeletePropertyArgs,
} from '../../types/property';

const propertyService = new PropertyService();

const myPropertiesResolver: Resolver<unknown, EmptyArgs, Property[]> = (
  _parent,
  _args,
  ctx,
) => {
  return propertyService.getMyProperties(ctx);
};

const propertyByIdResolver: Resolver<unknown, PropertyByIdArgs, Property | null> = (
  _parent,
  args,
  _ctx,
) => {
  const id = parseInt(args.id, 10);
  return propertyService.getPropertyById(id);
};

const searchAvailablePropertiesResolver: Resolver<
  unknown,
  SearchAvailablePropertiesArgs,
  Property[]
> = (_parent, args, _ctx) => {
  return propertyService.searchAvailableProperties(
    args.start,
    args.end,
    args.guests,
  );
};

const createPropertyResolver: Resolver<unknown, CreatePropertyArgs, Property> = (
  _parent,
  args,
  ctx,
) => {
  return propertyService.createProperty(ctx, {
    title: args.title,
    description: args.description,
    maxGuests: args.maxGuests,
    basePricePerNight: args.basePricePerNight,
  });
};

const updatePropertyResolver: Resolver<unknown, UpdatePropertyArgs, Property> = (
  _parent,
  args,
  ctx,
) => {
  const id = parseInt(args.id, 10);
  return propertyService.updateProperty(ctx, id, {
    title: args.title,
    description: args.description,
    maxGuests: args.maxGuests,
    basePricePerNight: args.basePricePerNight,
  });
};

const deletePropertyResolver: Resolver<unknown, DeletePropertyArgs, boolean> = (
  _parent,
  args,
  ctx,
) => {
  const id = parseInt(args.id, 10);
  return propertyService.deleteProperty(ctx, id);
};

const propertyOwnerResolver = (
  parent: Property,
  _args: EmptyArgs,
  _ctx: GraphQLContext,
) => {
  return User.findByPk(parent.ownerId);
};

export const propertyResolvers = {
  Query: {
    myProperties: myPropertiesResolver,
    property: propertyByIdResolver,
    searchAvailableProperties: searchAvailablePropertiesResolver,
  },
  Mutation: {
    createProperty: createPropertyResolver,
    updateProperty: updatePropertyResolver,
    deleteProperty: deletePropertyResolver,
  },
  Property: {
    owner: propertyOwnerResolver,
  },
};