import { BlockedDate } from '../../models/blocked-date.model';
import { Property } from '../../models/property.model';
import { Booking } from '../../models/booking.model';
import { requireRole } from '../../common/auth-guards';
import { GraphQLContext } from '../../types/context';
import { diffInDays } from '../../common/date-utils';
import { Op } from 'sequelize';

export class BlockedDateService {
  async createBlockedDate(
    ctx: GraphQLContext,
    args: { propertyId: number; startDate: string; endDate: string },
  ) {
    var currentUser = requireRole(ctx, 'PROPIETARIO');

    var days = diffInDays(args.startDate, args.endDate);
    if (days <= 0) {
      throw new Error('El rango de fechas es inválido (start >= end)');
    }

    var property = await Property.findByPk(args.propertyId);
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }
    if (property.ownerId !== currentUser.userId) {
      throw new Error('No autorizado para bloquear esta propiedad');
    }

    var overlappingBookings = await Booking.findAll({
      where: {
        propertyId: args.propertyId,
        status: 'CONFIRMED',
        startDate: { [Op.lte]: args.endDate },
        endDate: { [Op.gte]: args.startDate },
      },
    });

    if (overlappingBookings.length > 0) {
      throw new Error(
        'No se puede bloquear el rango porque se solapa con reservas confirmadas',
      );
    }

    var overlappingBlocks = await BlockedDate.findAll({
      where: {
        propertyId: args.propertyId,
        startDate: { [Op.lte]: args.endDate },
        endDate: { [Op.gte]: args.startDate },
      },
    });

    if (overlappingBlocks.length > 0) {
      throw new Error(
        'La propiedad ya tiene un bloqueo que se solapa con este rango de fechas',
      );
    }

    var blocked = await BlockedDate.create({
      propertyId: args.propertyId,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return blocked;
  }
}