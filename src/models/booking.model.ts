import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
} from 'sequelize';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface BookingAttributes {
  id: number;
  propertyId: number;
  userId: number;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookingCreationAttributes = Optional<
  BookingAttributes,
  'id' | 'totalPrice' | 'status' | 'createdAt' | 'updatedAt'
>;

export class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public propertyId!: number;
  public userId!: number;
  public startDate!: string;
  public endDate!: string;
  public guests!: number;
  public totalPrice!: number;
  public status!: BookingStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initBookingModel(sequelize: Sequelize): void {
  Booking.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      guests: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'Bookings',
      timestamps: true,
    },
  );
}