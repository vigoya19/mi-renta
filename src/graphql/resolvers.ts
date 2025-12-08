import { authResolvers } from '../modules/auth/auth.resolvers';
import { propertyResolvers } from '../modules/property/property.resolvers';
import { blockedDateResolvers } from '../modules/blocked-date/blocked-date.resolvers';
import { bookingResolvers } from '../modules/booking/booking.resolvers';

export const resolvers = {
  Query: {
    _health: function () {
      return 'OK';
    },
    ...authResolvers.Query,
    ...propertyResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...propertyResolvers.Mutation,
    ...blockedDateResolvers.Mutation,
    ...bookingResolvers.Mutation,
  },
  Property: {
    ...propertyResolvers.Property,
  },
  BlockedDate: {
    ...blockedDateResolvers.BlockedDate,
  },
  Booking: {
    ...bookingResolvers.Booking,
  },
};