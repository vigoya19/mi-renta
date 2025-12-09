import { PropertyService } from '../property.service';
import { requireRole } from '../../../common/auth-guards';
import { GraphQLContext } from '../../../types/context';

jest.mock('../../../common/auth-guards', () => ({
  requireRole: jest.fn(),
}));

jest.mock('../../../models/property.model', () => ({
  Property: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../../db', () => ({
  getSequelize: jest.fn(() => ({
    escape: (v: string) => `'${v}'`,
  })),
}));

describe('PropertyService.getMyProperties', () => {
  test('calls findAll with owner and pagination', async () => {
    const propertyService = new PropertyService();
    (requireRole as jest.Mock).mockReturnValue({ userId: 1 });

    const ctx = { user: { userId: 1, role: 'PROPIETARIO' } } as unknown as GraphQLContext;
    const pagination = { limit: 10, offset: 20, page: 3, pageSize: 10 };

    const { Property } = require('../../../models/property.model');
    Property.findAll.mockResolvedValue([]);

    await propertyService.getMyProperties(ctx, pagination);

    expect(Property.findAll).toHaveBeenCalledWith({
      where: { ownerId: 1 },
      order: [['id', 'ASC']],
      limit: 10,
      offset: 20,
    });
  });

  test('searchAvailableProperties returns totalPrice', async () => {
    const propertyService = new PropertyService();
    const { Property } = require('../../../models/property.model');

    Property.findAll.mockResolvedValue([
      {
        basePricePerNight: 100,
        get: () => ({
          id: 1,
          title: 'Casa',
          maxGuests: 4,
          basePricePerNight: 100,
        }),
      },
    ]);

    const res = await propertyService.searchAvailableProperties(
      '2024-01-01',
      '2024-01-04',
      2,
      { limit: 10, offset: 0, page: 1, pageSize: 10 },
    );

    expect(res[0].totalPrice).toBe(300);
  });

  test('updateProperty y deleteProperty manejan not found y forbiddens', async () => {
    const propertyService = new PropertyService();
    const { Property } = require('../../../models/property.model');
    (requireRole as jest.Mock).mockReturnValue({ userId: 1, role: 'PROPIETARIO' });

    Property.findByPk.mockResolvedValue(null);
    await expect(
      propertyService.updateProperty({} as any, 1, { title: 'x' }),
    ).rejects.toThrow();

    Property.findByPk.mockResolvedValue({ id: 1, ownerId: 2 });
    await expect(
      propertyService.deleteProperty({} as any, 1),
    ).rejects.toThrow();
  });

  test('searchAvailableProperties lanza por rango inválido', async () => {
    const propertyService = new PropertyService();
    await expect(
      propertyService.searchAvailableProperties(
        '2024-01-05',
        '2024-01-01',
        2,
        { limit: 10, offset: 0, page: 1, pageSize: 10 },
      ),
    ).rejects.toThrow();
  });

  test('createProperty llama a create', async () => {
    const propertyService = new PropertyService();
    const { Property } = require('../../../models/property.model');
    (requireRole as jest.Mock).mockReturnValue({ userId: 1, role: 'PROPIETARIO' });
    Property.create.mockResolvedValue({ id: 99 });

    const res = await propertyService.createProperty({} as any, {
      title: 'x',
      description: 'd',
      maxGuests: 2,
      basePricePerNight: 10,
    });
    expect(res).toEqual({ id: 99 });
  });
});
