import { BlockedDateService } from '../blocked-date.service';
import { requireRole } from '../../../common/auth-guards';

jest.mock('../../../common/auth-guards', () => ({
  requireRole: jest.fn(),
}));

jest.mock('../../../models/property.model', () => ({
  Property: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../../models/booking.model', () => ({
  Booking: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../../models/blocked-date.model', () => ({
  BlockedDate: {
    findAll: jest.fn(),
    create: jest.fn(),
    get: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('BlockedDateService', () => {
  const service = new BlockedDateService();
  const ctx: any = { user: { userId: 1, role: 'PROPIETARIO' } };

  beforeEach(() => {
    jest.clearAllMocks();
    (requireRole as jest.Mock).mockReturnValue({ userId: 1, role: 'PROPIETARIO' });
  });

  test('rechaza rango inválido', async () => {
    await expect(
      service.createBlockedDate(ctx, {
        propertyId: 1,
        startDate: '2024-02-05',
        endDate: '2024-02-01',
      }),
    ).rejects.toThrow();
  });

  test('crea bloqueo cuando no hay solapes', async () => {
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue({ id: 1, ownerId: 1 });

    const { Booking } = require('../../../models/booking.model');
    Booking.findAll.mockResolvedValue([]);

    const { BlockedDate } = require('../../../models/blocked-date.model');
    BlockedDate.findAll.mockResolvedValue([]);
    BlockedDate.create.mockResolvedValue({ id: 10 });

    const res = await service.createBlockedDate(ctx, {
      propertyId: 1,
      startDate: '2024-02-01',
      endDate: '2024-02-05',
    });

    expect(res).toEqual({ id: 10 });
  });

  test('rechaza bloqueo cuando hay reservas confirmadas solapadas', async () => {
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue({ id: 1, ownerId: 1 });

    const { Booking } = require('../../../models/booking.model');
    Booking.findAll.mockResolvedValue([{ id: 99 }]);

    const { BlockedDate } = require('../../../models/blocked-date.model');
    BlockedDate.findAll.mockResolvedValue([]);

    await expect(
      service.createBlockedDate(ctx, {
        propertyId: 1,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
      }),
    ).rejects.toThrow();
  });

  test('rechaza bloqueo cuando propiedad no existe o no es dueño', async () => {
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue(null);

    await expect(
      service.createBlockedDate(ctx, {
        propertyId: 1,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
      }),
    ).rejects.toThrow();

    Property.findByPk.mockResolvedValue({ id: 1, ownerId: 2 });
    await expect(
      service.createBlockedDate(ctx, {
        propertyId: 1,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
      }),
    ).rejects.toThrow();
  });

  test('rechaza bloqueo cuando hay bloqueos solapados', async () => {
    const { Property } = require('../../../models/property.model');
    Property.findByPk.mockResolvedValue({ id: 1, ownerId: 1 });

    const { Booking } = require('../../../models/booking.model');
    Booking.findAll.mockResolvedValue([]);

    const { BlockedDate } = require('../../../models/blocked-date.model');
    BlockedDate.findAll.mockResolvedValue([{ id: 55 }]);

    await expect(
      service.createBlockedDate(ctx, {
        propertyId: 1,
        startDate: '2024-02-01',
        endDate: '2024-02-05',
      }),
    ).rejects.toThrow();
  });
});
