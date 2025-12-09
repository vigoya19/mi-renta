import { Model, ModelCtor, ModelStatic, Sequelize } from 'sequelize';
import { env } from '../config/env';

import { initUserModel, User } from '../models/user.model';
import { initPropertyModel, Property } from '../models/property.model';
import { initBookingModel, Booking } from '../models/booking.model';
import { initBlockedDateModel, BlockedDate } from '../models/blocked-date.model';
import { logger } from '../common/logger';

let sequelize: Sequelize;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = new Sequelize(
      env.DB_NAME,
      env.DB_USER,
      env.DB_PASSWORD,
      {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'mysql',
        logging: false,
      }
    );
  }
  return sequelize;
}

function initAssociations(): void {
  type AssocModel<M extends Model> = ModelStatic<M> & {
    hasMany: (...args: unknown[]) => unknown;
    belongsTo: (...args: unknown[]) => unknown;
  };

  const UserModel = User as unknown as AssocModel<User>;
  const PropertyModel = Property as unknown as AssocModel<Property>;
  const BookingModel = Booking as unknown as AssocModel<Booking>;
  const BlockedDateModel = BlockedDate as unknown as AssocModel<BlockedDate>;

  UserModel.hasMany(PropertyModel, {
    foreignKey: 'ownerId',
    as: 'properties',
  });
  PropertyModel.belongsTo(UserModel, {
    foreignKey: 'ownerId',
    as: 'owner',
  });

  PropertyModel.hasMany(BookingModel, {
    foreignKey: 'propertyId',
    as: 'bookings',
  });
  BookingModel.belongsTo(PropertyModel, {
    foreignKey: 'propertyId',
    as: 'property',
  });

  UserModel.hasMany(BookingModel, {
    foreignKey: 'userId',
    as: 'bookings',
  });
  BookingModel.belongsTo(UserModel, {
    foreignKey: 'userId',
    as: 'traveler',
  });

  PropertyModel.hasMany(BlockedDateModel, {
    foreignKey: 'propertyId',
    as: 'blockedDates',
  });
  BlockedDateModel.belongsTo(PropertyModel, {
    foreignKey: 'propertyId',
    as: 'property',
  });
}

export async function initDb(): Promise<void> {
  const sequelize = getSequelize();

  initUserModel(sequelize);
  initPropertyModel(sequelize);
  initBookingModel(sequelize);
  initBlockedDateModel(sequelize);

  initAssociations();

  await sequelize.authenticate();
  logger.info('Conexión a MySQL establecida correctamente');

  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync();
    logger.info('Modelos sincronizados con la base de datos (dev sync habilitado)');
  } else {
    logger.info('sync() omitido fuera de development; usa migraciones para cambios de esquema');
  }
}

export { User, Property, Booking, BlockedDate };
