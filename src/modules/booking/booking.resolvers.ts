import { GraphQLContext } from '../../types/context';
import { Booking } from '../../models/booking.model';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import {
  CreateBookingArgs,
  UpdateBookingStatusArgs,
} from '../../types/booking';
import { validateDto } from '../../common/validation';
import {
  CreateBookingDto,
  UpdateBookingStatusDto,
} from '../../dtos/booking.dto';

const createBookingResolver: Resolver<
  unknown,
  CreateBookingArgs,
  Booking
> = (_parent, args, ctx) => {
  const dto = validateDto(CreateBookingDto, args);

  return ctx.container.bookingService.createBooking(ctx, {
    propertyId: dto.propertyId,
    startDate: dto.startDate,
    endDate: dto.endDate,
    guests: dto.guests,
  });
};

const updateBookingStatusResolver: Resolver<
  unknown,
  UpdateBookingStatusArgs,
  Booking
> = (_parent, args, ctx) => {
  const dto = validateDto(UpdateBookingStatusDto, args);

  return ctx.container.bookingService.updateBookingStatus(ctx, {
    id: dto.id,
    status: dto.status,
  });
};

const bookingPropertyResolver = (
  parent: Booking,
  _args: EmptyArgs,
  _ctx: GraphQLContext,
) => {
  return Property.findByPk(parent.propertyId);
};

const bookingTravelerResolver = (
  parent: Booking,
  _args: EmptyArgs,
  _ctx: GraphQLContext,
) => {
  return User.findByPk(parent.userId);
};


export const bookingResolvers = {
  Mutation: {
    createBooking: createBookingResolver,
    updateBookingStatus: updateBookingStatusResolver,
  },
  Booking: {
    property: bookingPropertyResolver,
    traveler: bookingTravelerResolver,
  },
};
