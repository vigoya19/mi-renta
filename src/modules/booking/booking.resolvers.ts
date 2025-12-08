import { BookingService } from './booking.service';
import { GraphQLContext } from '../../types/context';
import { Booking } from '../../models/booking.model';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';

var bookingService = new BookingService();

export var bookingResolvers = {
  Mutation: {
    createBooking: function (
      _: any,
      args: {
        propertyId: string;
        startDate: string;
        endDate: string;
        guests: number;
      },
      ctx: GraphQLContext,
    ) {
      var propertyId = parseInt(args.propertyId, 10);
      return bookingService.createBooking(ctx, {
        propertyId: propertyId,
        startDate: args.startDate,
        endDate: args.endDate,
        guests: args.guests,
      });
    },

    updateBookingStatus: function (
      _: any,
      args: { id: string; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' },
      ctx: GraphQLContext,
    ) {
      var id = parseInt(args.id, 10);
      return bookingService.updateBookingStatus(ctx, {
        id: id,
        status: args.status,
      });
    },
  },
  Booking: {
    property: function (parent: Booking) {
      return Property.findByPk(parent.propertyId);
    },
    traveler: function (parent: Booking) {
      return User.findByPk(parent.userId);
    },
  },
};