import { Booking, BookingAttributes } from '../../models/booking.model';
import { BlockedDate, BlockedDateAttributes } from '../../models/blocked-date.model';
import { Op, WhereAttributeHash } from 'sequelize';

import { Property, PropertyAttributes } from '../../models/property.model';
import { requireRole } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';
import { diffInDays } from '../../common/date-utils';
import { PaginationParams } from '../../types/pagination';
import { ERROR_MESSAGES } from '../../common/error-messages';
import { ApolloError } from 'apollo-server-express';
import { getSequelize } from '../../db';

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
    const available = await sequelize.query<Property>(
      `
      SELECT *
      FROM Properties p
      WHERE p.maxGuests >= :guests
        AND NOT EXISTS (
          SELECT 1 FROM Bookings b
          WHERE b.propertyId = p.id
            AND b.status = 'CONFIRMED'
            AND b.startDate <= :end
            AND b.endDate >= :start
        )
        AND NOT EXISTS (
          SELECT 1 FROM BlockedDates bd
          WHERE bd.propertyId = p.id
            AND bd.startDate <= :end
            AND bd.endDate >= :start
        )
      ORDER BY p.id ASC
      LIMIT :limit OFFSET :offset
    `,
      {
        replacements: {
          guests,
          start,
          end,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        model: Property,
        mapToModel: true,
      },
    );

    return available;
  }
}
