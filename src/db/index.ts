import { ModelCtor, Sequelize } from 'sequelize';
import { env } from '../config/env';

import { initUserModel, User } from '../models/user.model';
import { initPropertyModel, Property } from '../models/property.model';
import { initBookingModel, Booking } from '../models/booking.model';
import { initBlockedDateModel, BlockedDate } from '../models/blocked-date.model';

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
  const UserModel = User as unknown as ModelCtor<User>;
  const PropertyModel = Property as unknown as ModelCtor<Property>;
  const BookingModel = Booking as unknown as ModelCtor<Booking>;
  const BlockedDateModel = BlockedDate as unknown as ModelCtor<BlockedDate>;

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
  console.log('✅ Conexión a MySQL establecida correctamente');

  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync();
    console.log('✅ Modelos sincronizados con la base de datos (dev sync habilitado)');
  } else {
    console.log('ℹ️ sync() omitido fuera de development; usa migraciones para cambios de esquema');
  }
}

export { User, Property, Booking, BlockedDate };
