import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
} from 'sequelize';

export interface BlockedDateAttributes {
  id: number;
  propertyId: number;
  startDate: string;
  endDate: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BlockedDateCreationAttributes = Optional<
  BlockedDateAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class BlockedDate
  extends Model<BlockedDateAttributes, BlockedDateCreationAttributes>
  implements BlockedDateAttributes
{
  public id!: number;
  public propertyId!: number;
  public startDate!: string;
  public endDate!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public save!: () => Promise<this>;
  public destroy!: () => Promise<void>;
}

export function initBlockedDateModel(sequelize: Sequelize): void {
  BlockedDate.init(
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
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
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
      tableName: 'BlockedDates',
      timestamps: true,
    },
  );
}
