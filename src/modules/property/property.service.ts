import { Booking, BookingAttributes } from '../../models/booking.model';
import { BlockedDate, BlockedDateAttributes } from '../../models/blocked-date.model';
import { Op, WhereAttributeHash, literal } from 'sequelize';

import { Property, PropertyAttributes } from '../../models/property.model';
import { requireRole } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';
import { diffInDays } from '../../common/date-utils';
import { PaginationParams } from '../../types/pagination';
import { ERROR_MESSAGES } from '../../common/error-messages';
import { ApolloError } from 'apollo-server-express';
import { getSequelize } from '../../db';
import { diffInDays as diffInDaysUtc } from '../../common/date-utils';

export class PropertyService {
  async getMyProperties(ctx: GraphQLContext, pagination: PaginationParams) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');
    const where = { ownerId: currentUser.userId } as WhereAttributeHash<PropertyAttributes>;

    return Property.findAll({
      where,
      order: [['id', 'ASC']],
      limit: pagination.limit,
      offset: pagination.offset,
    });
  }

  async getPropertyById(id: number) {
    return Property.findByPk(id);
  }

  async createProperty(
    ctx: GraphQLContext,
    data: {
      title: string;
      description?: string;
      maxGuests: number;
      basePricePerNight: number;
    },
  ) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');

    const property = await Property.create({
      title: data.title,
      description: data.description || null,
      maxGuests: data.maxGuests,
      basePricePerNight: data.basePricePerNight,
      ownerId: currentUser.userId,
    });

    return property;
  }

  async updateProperty(
    ctx: GraphQLContext,
    id: number,
    data: {
      title?: string;
      description?: string;
      maxGuests?: number;
      basePricePerNight?: number;
    },
  ) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');

    const property = await Property.findByPk(id);

    if (!property) {
      throw new ApolloError(ERROR_MESSAGES.PROPERTY.NOT_FOUND, 'NOT_FOUND');
    }

    if (property.ownerId !== currentUser.userId) {
      throw new ApolloError(ERROR_MESSAGES.PROPERTY.UNAUTHORIZED_UPDATE, 'FORBIDDEN');
    }

    if (typeof data.title !== 'undefined') {
      property.title = data.title;
    }
    if (typeof data.description !== 'undefined') {
      property.description = data.description;
    }
    if (typeof data.maxGuests !== 'undefined') {
      property.maxGuests = data.maxGuests;
    }
    if (typeof data.basePricePerNight !== 'undefined') {
      property.basePricePerNight = data.basePricePerNight;
    }

    await property.save();

    return property;
  }

  async deleteProperty(ctx: GraphQLContext, id: number) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');

    const property = await Property.findByPk(id);

    if (!property) {
      throw new ApolloError(ERROR_MESSAGES.PROPERTY.NOT_FOUND, 'NOT_FOUND');
    }

    if (property.ownerId !== currentUser.userId) {
      throw new ApolloError(ERROR_MESSAGES.PROPERTY.UNAUTHORIZED_DELETE, 'FORBIDDEN');
    }

    await property.destroy();

    return true;
  }

  async searchAvailableProperties(
    start: string,
    end: string,
    guests: number,
    pagination: PaginationParams,
  ) {
    const days = diffInDays(start, end);
    if (days <= 0) {
      throw new ApolloError(ERROR_MESSAGES.BOOKING.INVALID_DATE_RANGE, 'BAD_USER_INPUT');
    }

    const sequelize = getSequelize();
    const escapedStart = sequelize.escape(start);
    const escapedEnd = sequelize.escape(end);
    const andConditions = {
      [Op.and]: [
        literal(
          `NOT EXISTS (
            SELECT 1 FROM Bookings b
            WHERE b.propertyId = Property.id
              AND b.status = 'CONFIRMED'
              AND b.startDate <= ${escapedEnd}
              AND b.endDate >= ${escapedStart}
          )`,
        ),
        literal(
          `NOT EXISTS (
            SELECT 1 FROM BlockedDates bd
            WHERE bd.propertyId = Property.id
              AND bd.startDate <= ${escapedEnd}
              AND bd.endDate >= ${escapedStart}
          )`,
        ),
      ],
    };

    const properties = await Property.findAll({
      where: {
        maxGuests: { [Op.gte]: guests },
        [Op.and]: (andConditions as any)[Op.and],
      } as unknown as WhereAttributeHash<PropertyAttributes>,
      order: [['id', 'ASC']],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    return properties.map(function (p) {
      const nights = Math.max(1, diffInDaysUtc(start, end));
      const base = typeof p.basePricePerNight === 'number'
        ? p.basePricePerNight
        : Number(p.basePricePerNight);
      const totalPrice = base * nights;

      const plain = (p as unknown as { get: (opt?: any) => any }).get({ plain: true });

      return Object.assign({}, plain, {
        totalPrice,
      }) as Property & { totalPrice: number };
    });
  }
}
