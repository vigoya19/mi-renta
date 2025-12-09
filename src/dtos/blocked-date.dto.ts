import { IsInt, IsPositive, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockedDateDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  propertyId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate!: string;
}
