import {
  IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength, Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHeroDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  imagePath?: string;

  // Added for file upload
  imageData?: Buffer;
  imageMimetype?: string;
  imageOriginalName?: string;

  // translations JSON string: [{lang, title, subtitle, ctaLabel, ctaUrl}]
  @IsOptional()
  translations?: string;
}

export class UpdateHeroDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  imagePath?: string;

  // Added for file upload
  imageData?: Buffer;
  imageMimetype?: string;
  imageOriginalName?: string;

  @IsOptional()
  translations?: string;
}
