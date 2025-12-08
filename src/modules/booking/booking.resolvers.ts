import { GraphQLContext } from '../../types/context';
import { Booking } from '../../models/booking.model';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';

import { Resolver, EmptyArgs } from '../../types/resolvers';
import {
  CreateBookingArgs,
  UpdateBookingStatusArgs,
} from '../../types/booking';

const createBookingResolver: Resolver<
  unknown,
  CreateBookingArgs,
  Booking
> = (_parent, args, ctx) => {
  const propertyId = parseInt(args.propertyId, 10);

  return ctx.container.bookingService.createBooking(ctx, {
    propertyId,
    startDate: args.startDate,
    endDate: args.endDate,
    guests: args.guests,
  });
};

const updateBookingStatusResolver: Resolver<
  unknown,
  UpdateBookingStatusArgs,
  Booking
> = (_parent, args, ctx) => {
  const id = parseInt(args.id, 10);

  return ctx.container.bookingService.updateBookingStatus(ctx, {
    id,
    status: args.status,
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
