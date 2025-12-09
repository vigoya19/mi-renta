import { Booking } from '../../models/booking.model';
import { Property } from '../../models/property.model';
import { BlockedDate } from '../../models/blocked-date.model';
import { GraphQLContext } from '../../types/context';
import { requireRole } from '../../common/auth-guards';
import { diffInDays } from '../../common/date-utils';
import { Op } from 'sequelize';

export class BookingService {
  async createBooking(
    ctx: GraphQLContext,
    args: { propertyId: number; startDate: string; endDate: string; guests: number },
  ) {
    const currentUser = requireRole(ctx, 'VIAJERO');

    const days = diffInDays(args.startDate, args.endDate);
    if (days <= 0) {
      throw new Error('El rango de fechas es inválido (start >= end)');
    }

    const property = await Property.findByPk(args.propertyId);
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }

    if (args.guests > property.maxGuests) {
      throw new Error('Número de huéspedes excede la capacidad máxima');
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
      throw new Error('Las fechas no están disponibles (reservas confirmadas)');
    }

    const overlappingBlocks = await BlockedDate.findAll({
      where: {
        propertyId: args.propertyId,
        startDate: { [Op.lte]: args.endDate },
        endDate: { [Op.gte]: args.startDate },
      },
    });

    if (overlappingBlocks.length > 0) {
      throw new Error('Las fechas no están disponibles (fechas bloqueadas)');
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
      throw new Error('Reserva no encontrada');
    }

    const bookingWithProperty = booking as Booking & { property?: Property };
    const property = bookingWithProperty.property;
    if (!property || property.ownerId !== currentUser.userId) {
      throw new Error('No autorizado para cambiar el estado de esta reserva');
    }

    if (args.status === 'CONFIRMED') {
      const overlappingBookings = await Booking.findAll({
        where: {
          propertyId: booking.propertyId,
          status: 'CONFIRMED',
          id: { [Op.ne]: booking.id },
          startDate: { [Op.lte]: booking.endDate },
          endDate: { [Op.gte]: booking.startDate },
        },
      });

      if (overlappingBookings.length > 0) {
        throw new Error('No se puede confirmar, hay otra reserva confirmada solapada');
      }

      const overlappingBlocks = await BlockedDate.findAll({
        where: {
          propertyId: booking.propertyId,
          startDate: { [Op.lte]: booking.endDate },
          endDate: { [Op.gte]: booking.startDate },
        },
      });

      if (overlappingBlocks.length > 0) {
        throw new Error('No se puede confirmar, hay bloqueos solapados');
      }
    }

    booking.status = args.status;
    await booking.save();

    return booking;
  }
}
