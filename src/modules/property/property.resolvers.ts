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
  MyPropertiesArgs,
} from '../../types/property';
import { normalizePagination } from '../../common/validators';
import { validateDto } from '../../common/validation';
import {
  CreatePropertyDto,
  DeletePropertyDto,
  MyPropertiesDto,
  PropertyByIdDto,
  SearchAvailablePropertiesDto,
  UpdatePropertyDto,
} from '../../dtos/property.dto';

const myPropertiesResolver: Resolver<unknown, MyPropertiesArgs, Property[]> =
  (_parent, args, ctx) => {
    const dto = validateDto(MyPropertiesDto, args);
    const pagination = normalizePagination({
      page: dto.page,
      pageSize: dto.pageSize,
    });
    return ctx.container.propertyService.getMyProperties(ctx, pagination);
  };

const propertyByIdResolver: Resolver<unknown, PropertyByIdArgs, Property | null> = (
  _parent,
  args,
  ctx,
) => {
  const dto = validateDto(PropertyByIdDto, args);
  return ctx.container.propertyService.getPropertyById(dto.id);
};

const searchAvailablePropertiesResolver: Resolver<
  unknown,
  SearchAvailablePropertiesArgs,
  Property[]
> = (_parent, args, ctx) => {
  const dto = validateDto(SearchAvailablePropertiesDto, args);
  const pagination = normalizePagination({
    page: dto.page,
    pageSize: dto.pageSize,
  });

  return ctx.container.propertyService.searchAvailableProperties(
    dto.start,
    dto.end,
    dto.guests,
    pagination,
  );
};

const createPropertyResolver: Resolver<unknown, CreatePropertyArgs, Property> = (
  _parent,
  args,
  ctx,
) => {
  const dto = validateDto(CreatePropertyDto, args);

  return ctx.container.propertyService.createProperty(ctx, {
    title: dto.title,
    description: dto.description,
    maxGuests: dto.maxGuests,
    basePricePerNight: dto.basePricePerNight,
  });
};

const updatePropertyResolver: Resolver<unknown, UpdatePropertyArgs, Property> = (
  _parent,
  args,
  ctx,
) => {
  const dto = validateDto(UpdatePropertyDto, args);

  return ctx.container.propertyService.updateProperty(ctx, dto.id, {
    title: dto.title,
    description: dto.description,
    maxGuests: dto.maxGuests,
    basePricePerNight: dto.basePricePerNight,
  });
};

const deletePropertyResolver: Resolver<unknown, DeletePropertyArgs, boolean> = (
  _parent,
  args,
  ctx,
) => {
  const dto = validateDto(DeletePropertyDto, args);
  return ctx.container.propertyService.deleteProperty(ctx, dto.id);
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
