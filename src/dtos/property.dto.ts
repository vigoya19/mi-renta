import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MyPropertiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number;
}

export class PropertyByIdDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id!: number;
}

export class SearchAvailablePropertiesDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  start!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  end!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  guests!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number;
}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxGuests!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  basePricePerNight!: number;
}

export class UpdatePropertyDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxGuests?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  basePricePerNight?: number;
}

export class DeletePropertyDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id!: number;
}
