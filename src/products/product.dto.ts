import {
  IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber,
  MaxLength, MinLength, Matches, IsArray, ValidateNested, Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductTranslationDto {
  @IsString()
  @IsNotEmpty({ message: 'Language code is required' })
  lang: string;

  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Detail intro must not exceed 1000 characters' })
  detailIntro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(150, { message: 'Slug must not exceed 150 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase letters, numbers, and hyphens only' })
  slug: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  subcategorySlug?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  imagePath?: string;

  // translations come as JSON string in multipart form
  @IsOptional()
  translations?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase letters, numbers, and hyphens only' })
  slug?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  subcategorySlug?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  imagePath?: string;

  @IsOptional()
  translations?: string;
}
