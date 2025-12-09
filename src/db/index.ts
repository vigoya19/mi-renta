import { Sequelize } from 'sequelize';
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
  User.hasMany(Property, {
    foreignKey: 'ownerId',
    as: 'properties',
  });
  Property.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner',
  });

  Property.hasMany(Booking, {
    foreignKey: 'propertyId',
    as: 'bookings',
  });
  Booking.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property',
  });

  User.hasMany(Booking, {
    foreignKey: 'userId',
    as: 'bookings',
  });
  Booking.belongsTo(User, {
    foreignKey: 'userId',
    as: 'traveler',
  });

  Property.hasMany(BlockedDate, {
    foreignKey: 'propertyId',
    as: 'blockedDates',
  });
  BlockedDate.belongsTo(Property, {
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

  await sequelize.sync();
  console.log('✅ Modelos sincronizados con la base de datos (sin alter)');
}

export { User, Property, Booking, BlockedDate };
