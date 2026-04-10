import {
  IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength, Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStatDto {
  @IsString()
  @IsNotEmpty({ message: 'Stat key is required' })
  @MaxLength(100, { message: 'Stat key must not exceed 100 characters' })
  statKey: string;

  @IsString()
  @IsNotEmpty({ message: 'Value is required' })
  @MaxLength(50, { message: 'Value must not exceed 50 characters' })
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Icon name must not exceed 50 characters' })
  iconName?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0)
  sortOrder?: number;

  // labels JSON string: [{lang, label}]
  @IsOptional()
  labels?: string;
}

export class UpdateStatDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  statKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  iconName?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  labels?: string;
}
