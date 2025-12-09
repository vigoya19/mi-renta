import { BookingService } from '../booking.service';
import { requireRole } from '../../../common/auth-guards';

jest.mock('../../../common/auth-guards', () => ({
  requireRole: jest.fn(),
}));

jest.mock('../../../models/booking.model', () => ({
  Booking: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../../models/property.model', () => ({
  Property: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../../models/blocked-date.model', () => ({
  BlockedDate: {
    findAll: jest.fn(),
  },
}));

describe('BookingService', () => {
  const ctx: any = { user: { userId: 1, role: 'VIAJERO' } };
  const bookingService = new BookingService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rechaza rango inválido', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 10, role: 'VIAJERO' });
    await expect(
      bookingService.createBooking(ctx, {
        propertyId: 1,
        startDate: '2024-01-05',
        endDate: '2024-01-01',
        guests: 1,
      }),
    ).rejects.toThrow();
  });

  test('crea reserva calculando totalPrice y valida solapes', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 10, role: 'VIAJERO' });
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue({
      id: 1,
      maxGuests: 4,
      basePricePerNight: 100,
    });

    const { Booking } = require('../../../models/booking.model');
    Booking.findAll.mockResolvedValue([]);

    const { BlockedDate } = require('../../../models/blocked-date.model');
    BlockedDate.findAll.mockResolvedValue([]);

    Booking.create.mockImplementation(async (data: any) => data);

    const result = await bookingService.createBooking(ctx, {
      propertyId: 1,
      startDate: '2024-01-01',
      endDate: '2024-01-03',
      guests: 2,
    });

    expect(result.totalPrice).toBe(200);
    expect(Booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyId: 1,
        userId: 10,
        status: 'PENDING',
      }),
    );
  });

  test('rechaza reserva cuando hay solape confirmado', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 10, role: 'VIAJERO' });
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue({
      id: 1,
      maxGuests: 4,
      basePricePerNight: 100,
    });

    const { Booking } = require('../../../models/booking.model');
    Booking.findAll.mockResolvedValue([{ id: 99 }]);

    const { BlockedDate } = require('../../../models/blocked-date.model');
    BlockedDate.findAll.mockResolvedValue([]);

    await expect(
      bookingService.createBooking(ctx, {
        propertyId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        guests: 2,
      }),
    ).rejects.toThrow();
  });

  test('updateBookingStatus lanza si no es dueño o no existe', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 2, role: 'PROPIETARIO' });
    const { Booking } = require('../../../models/booking.model');
    Booking.findByPk.mockResolvedValue(null);
    await expect(
      bookingService.updateBookingStatus({} as any, { id: 1, status: 'CONFIRMED' }),
    ).rejects.toThrow();

    Booking.findByPk.mockResolvedValue({
      id: 1,
      propertyId: 1,
      userId: 99,
      status: 'PENDING',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      property: { ownerId: 999 },
      save: jest.fn(),
    });
    await expect(
      bookingService.updateBookingStatus({} as any, { id: 1, status: 'CONFIRMED' }),
    ).rejects.toThrow();
  });

  test('updateBookingStatus confirma cuando no hay solapes', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 2, role: 'PROPIETARIO' });
    const { Booking } = require('../../../models/booking.model');
    Booking.findByPk.mockResolvedValue({
      id: 1,
      propertyId: 1,
      userId: 99,
      status: 'PENDING',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      property: { ownerId: 2 },
      save: jest.fn(),
    });
    Booking.findAll.mockResolvedValue([]);
    const { BlockedDate } = require('../../../models/blocked-date.model');
    BlockedDate.findAll.mockResolvedValue([]);

    const res = await bookingService.updateBookingStatus({} as any, {
      id: 1,
      status: 'CONFIRMED',
    });
    expect(res.status).toBe('CONFIRMED');
  });

  test('updateBookingStatus rechaza transiciones inválidas', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 2, role: 'PROPIETARIO' });
    const { Booking } = require('../../../models/booking.model');
    Booking.findByPk.mockResolvedValue({
      id: 1,
      propertyId: 1,
      userId: 99,
      status: 'CANCELLED',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      property: { ownerId: 2 },
      save: jest.fn(),
    });

    await expect(
      bookingService.updateBookingStatus({} as any, { id: 1, status: 'CONFIRMED' }),
    ).rejects.toThrow();
  });

  test('createBooking valida propiedad existente y capacidad', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 10, role: 'VIAJERO' });
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue(null);

    await expect(
      bookingService.createBooking(ctx, {
        propertyId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        guests: 1,
      }),
    ).rejects.toThrow();

    Property.findByPk.mockResolvedValue({ id: 1, maxGuests: 1, basePricePerNight: 100 });
    await expect(
      bookingService.createBooking(ctx, {
        propertyId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        guests: 2,
      }),
    ).rejects.toThrow();
  });

  test('updateBookingStatus rechaza por solapes en confirmación', async () => {
    (requireRole as jest.Mock).mockReturnValue({ userId: 2, role: 'PROPIETARIO' });
    const { Booking } = require('../../../models/booking.model');
    Booking.findByPk.mockResolvedValue({
      id: 1,
      propertyId: 1,
      userId: 99,
      status: 'PENDING',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      property: { ownerId: 2 },
      save: jest.fn(),
    });
    Booking.findAll.mockResolvedValue([{ id: 2 }]);

    await expect(
      bookingService.updateBookingStatus({} as any, { id: 1, status: 'CONFIRMED' }),
    ).rejects.toThrow();
  });
});
