import { BlockedDate } from '../../models/blocked-date.model';
import { Property } from '../../models/property.model';
import { Booking } from '../../models/booking.model';
import { requireRole } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';
import { diffInDays } from '../../common/date-utils';
import { Op } from 'sequelize';
import { ERROR_MESSAGES } from '../../common/error-messages';
import { ApolloError } from 'apollo-server-express';

export class BlockedDateService {
  async createBlockedDate(
    ctx: GraphQLContext,
    args: { propertyId: number; startDate: string; endDate: string },
  ) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');

    const days = diffInDays(args.startDate, args.endDate);
    if (days <= 0) {
      throw new ApolloError(ERROR_MESSAGES.BLOCK.INVALID_DATE_RANGE, 'BAD_USER_INPUT');
    }

    const property = await Property.findByPk(args.propertyId);
    if (!property) {
      throw new ApolloError(ERROR_MESSAGES.BLOCK.PROPERTY_NOT_FOUND, 'NOT_FOUND');
    }
    if (property.ownerId !== currentUser.userId) {
      throw new ApolloError(ERROR_MESSAGES.BLOCK.UNAUTHORIZED, 'FORBIDDEN');
    }

    const overlappingBookings = await Booking.findAll({
      where: {
        propertyId: args.propertyId,
        status: 'CONFIRMED',
        startDate: { [Op.lte]: args.endDate },
        endDate: { [Op.gte]: args.startDate },
      },
    });

    if (overlappingBookings.length > 0) {
      throw new ApolloError(ERROR_MESSAGES.BLOCK.OVERLAP_BOOKINGS, 'CONFLICT');
    }

    const overlappingBlocks = await BlockedDate.findAll({
      where: {
        propertyId: args.propertyId,
        startDate: { [Op.lte]: args.endDate },
        endDate: { [Op.gte]: args.startDate },
      },
    });

    if (overlappingBlocks.length > 0) {
      throw new ApolloError(ERROR_MESSAGES.BLOCK.OVERLAP_BLOCKS, 'CONFLICT');
    }

    const blocked = await BlockedDate.create({
      propertyId: args.propertyId,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return blocked;
  }
}
