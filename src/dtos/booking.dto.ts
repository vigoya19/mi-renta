import { IsEnum, IsInt, IsOptional, IsPositive, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  propertyId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  guests!: number;
}

export class UpdateBookingStatusDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id!: number;

  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
