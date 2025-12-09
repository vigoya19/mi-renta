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
  },
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
});
