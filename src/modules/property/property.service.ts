import { Booking, BookingAttributes } from '../../models/booking.model';
import { BlockedDate, BlockedDateAttributes } from '../../models/blocked-date.model';
import { Op, WhereAttributeHash } from 'sequelize';

import { Property, PropertyAttributes } from '../../models/property.model';
import { requireRole } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';
import { diffInDays } from '../../common/date-utils';
import { PaginationParams } from '../../types/pagination';
import { ERROR_MESSAGES } from '../../common/error-messages';

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
      throw new Error(ERROR_MESSAGES.PROPERTY.NOT_FOUND);
    }

    if (property.ownerId !== currentUser.userId) {
      throw new Error(ERROR_MESSAGES.PROPERTY.UNAUTHORIZED_UPDATE);
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
      throw new Error(ERROR_MESSAGES.PROPERTY.NOT_FOUND);
    }

    if (property.ownerId !== currentUser.userId) {
      throw new Error(ERROR_MESSAGES.PROPERTY.UNAUTHORIZED_DELETE);
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
      throw new Error(ERROR_MESSAGES.BOOKING.INVALID_DATE_RANGE);
    }

    // 1) Propiedades cuyo maxGuests >= guests
    const properties = await Property.findAll({
      where: {
        maxGuests: { [Op.gte]: guests },
      } as WhereAttributeHash<PropertyAttributes>,
    });

    if (properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map(function (p) {
      return p.id;
    });

    // 2) Reservas confirmadas solapadas
    const overlappingBookings = await Booking.findAll({
      where: {
        propertyId: { [Op.in]: propertyIds },
        status: 'CONFIRMED',
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start },
      } as WhereAttributeHash<BookingAttributes>,
    });

    const bookedPropertyIds: { [key: number]: boolean } = {};
    overlappingBookings.forEach(function (b) {
      bookedPropertyIds[b.propertyId] = true;
    });

    // 3) Bloqueos solapados
    const overlappingBlocks = await BlockedDate.findAll({
      where: {
        propertyId: { [Op.in]: propertyIds },
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start },
      } as WhereAttributeHash<BlockedDateAttributes>,
    });

    const blockedPropertyIds: { [key: number]: boolean } = {};
    overlappingBlocks.forEach(function (bd) {
      blockedPropertyIds[bd.propertyId] = true;
    });

    // 4) Filtrar propiedades que no estén en booked ni blocked
    const available = properties.filter(function (p) {
      return !bookedPropertyIds[p.id] && !blockedPropertyIds[p.id];
    });

    const sliceStart = pagination.offset;
    const sliceEnd = pagination.offset + pagination.limit;

    return available.slice(sliceStart, sliceEnd);
  }
}
