import { Booking, BookingAttributes } from '../../models/booking.model';
import { Property } from '../../models/property.model';
import { BlockedDate, BlockedDateAttributes } from '../../models/blocked-date.model';
import { GraphQLContext } from '../../types/context';
import { requireRole } from '../../common/auth-guards';
import { diffInDays } from '../../common/date-utils';
import { Op, WhereOptions } from 'sequelize';
import { ERROR_MESSAGES } from '../../common/error-messages';
import { ApolloError } from 'apollo-server-express';

export class BookingService {
  async createBooking(
    ctx: GraphQLContext,
    args: { propertyId: number; startDate: string; endDate: string; guests: number },
  ) {
    const currentUser = requireRole(ctx, 'VIAJERO');

    const days = diffInDays(args.startDate, args.endDate);
    if (days <= 0) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.INVALID_DATE_RANGE, 'BAD_USER_INPUT');
    }

    const property = await Property.findByPk(args.propertyId);
    if (!property) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.PROPERTY_NOT_FOUND, 'NOT_FOUND');
    }

    if (args.guests > property.maxGuests) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.CAPACITY_EXCEEDED, 'BAD_USER_INPUT');
    }

    const overlappingBookingsWhere = {
      propertyId: args.propertyId,
      status: 'CONFIRMED',
      startDate: { [Op.lte]: args.endDate },
      endDate: { [Op.gte]: args.startDate },
    } as unknown as WhereOptions<BookingAttributes>;

    const overlappingBookings = await Booking.findAll({
      where: overlappingBookingsWhere,
    });

    if (overlappingBookings.length > 0) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.DATES_UNAVAILABLE_BOOKING, 'CONFLICT');
    }

    const overlappingBlocksWhere = {
      propertyId: args.propertyId,
      startDate: { [Op.lte]: args.endDate },
      endDate: { [Op.gte]: args.startDate },
    } as unknown as WhereOptions<BlockedDateAttributes>;

    const overlappingBlocks = await BlockedDate.findAll({
      where: overlappingBlocksWhere,
    });

    if (overlappingBlocks.length > 0) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.DATES_UNAVAILABLE_BLOCKED, 'CONFLICT');
    }

    let nights = days;
    if (nights <= 0) {
      nights = 1;
    }

    const totalPrice = Number(property.basePricePerNight) * nights;

    const booking = await Booking.create({
      propertyId: args.propertyId,
      userId: currentUser.userId,
      startDate: args.startDate,
      endDate: args.endDate,
      guests: args.guests,
      totalPrice: totalPrice,
      status: 'PENDING',
    });

    return booking;
  }

  async updateBookingStatus(
    ctx: GraphQLContext,
    args: { id: number; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' },
  ) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');

    const booking = await Booking.findByPk(args.id, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!booking) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.NOT_FOUND, 'NOT_FOUND');
    }

    const bookingWithProperty = booking as Booking & { property?: Property };
    const property = bookingWithProperty.property;
    if (!property || property.ownerId !== currentUser.userId) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.UNAUTHORIZED_STATUS_CHANGE, 'FORBIDDEN');
    }

    const currentStatus = booking.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    const allowed: Record<typeof currentStatus, Array<typeof args.status>> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CANCELLED'],
      CANCELLED: [],
    };

    if (args.status === currentStatus) {
      return booking;
    }

    if (!allowed[currentStatus].includes(args.status)) {
      throw new ApolloError(
        ERROR_MESSAGES.BOOKING.INVALID_STATUS_TRANSITION,
        'BAD_USER_INPUT',
      );
    }

    if (args.status === 'CONFIRMED') {
      const overlappingBookings = await Booking.findAll({
        where: {
          propertyId: booking.propertyId,
          status: 'CONFIRMED',
          id: { [Op.ne]: booking.id },
          startDate: { [Op.lte]: booking.endDate },
          endDate: { [Op.gte]: booking.startDate },
        } as unknown as WhereOptions<BookingAttributes>,
      });

      if (overlappingBookings.length > 0) {
        throw new ApolloError(ERROR_MESSAGES.BOOKING.CONFLICT_BOOKING, 'CONFLICT');
      }

      const overlappingBlocks = await BlockedDate.findAll({
        where: {
          propertyId: booking.propertyId,
          startDate: { [Op.lte]: booking.endDate },
          endDate: { [Op.gte]: booking.startDate },
        } as unknown as WhereOptions<BlockedDateAttributes>,
      });

      if (overlappingBlocks.length > 0) {
        throw new ApolloError(ERROR_MESSAGES.BOOKING.CONFLICT_BLOCK, 'CONFLICT');
      }
    }

    booking.status = args.status;
    await booking.save();

    return booking;
  }
}
