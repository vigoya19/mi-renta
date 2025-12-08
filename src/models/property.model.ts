import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
} from 'sequelize';

export interface PropertyAttributes {
  id: number;
  title: string;
  description?: string | null;
  ownerId: number;
  maxGuests: number;
  basePricePerNight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PropertyCreationAttributes = Optional<
  PropertyAttributes,
  'id' | 'description' | 'createdAt' | 'updatedAt'
>;

export class Property
  extends Model<PropertyAttributes, PropertyCreationAttributes>
  implements PropertyAttributes
{
  public id!: number;
  public title!: string;
  public description!: string | null;
  public ownerId!: number;
  public maxGuests!: number;
  public basePricePerNight!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initPropertyModel(sequelize: Sequelize): void {
  Property.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ownerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      maxGuests: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      basePricePerNight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
      tableName: 'Properties',
      timestamps: true,
    },
  );
}