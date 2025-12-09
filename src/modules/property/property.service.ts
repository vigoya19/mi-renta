import { Booking } from '../../models/booking.model';
import { BlockedDate } from '../../models/blocked-date.model';
import { Op } from 'sequelize';

import { Property } from '../../models/property.model';
import { requireRole } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';
import { diffInDays } from '../../common/date-utils';
import { PaginationParams } from '../../types/pagination';

export class PropertyService {
  async getMyProperties(ctx: GraphQLContext, pagination: PaginationParams) {
    const currentUser = requireRole(ctx, 'PROPIETARIO');

    return Property.findAll({
      where: { ownerId: currentUser.userId },
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
      throw new Error('Propiedad no encontrada');
    }

    if (property.ownerId !== currentUser.userId) {
      throw new Error('No autorizado para modificar esta propiedad');
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
      throw new Error('Propiedad no encontrada');
    }

    if (property.ownerId !== currentUser.userId) {
      throw new Error('No autorizado para eliminar esta propiedad');
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
      throw new Error('El rango de fechas es inválido (start >= end)');
    }

    // 1) Propiedades cuyo maxGuests >= guests
    const properties = await Property.findAll({
      where: {
        maxGuests: { [Op.gte]: guests },
      },
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
      },
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
      },
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
