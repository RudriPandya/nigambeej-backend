import {
  IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength, MinLength, Matches, Min, IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty({ message: 'YouTube video ID is required' })
  @MinLength(5, { message: 'Video ID seems too short' })
  @MaxLength(20, { message: 'Video ID must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Video ID must contain only letters, numbers, underscores, and hyphens' })
  videoId: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  @IsNumber({}, { message: 'Sort order must be a number' })
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  translations?: Record<string, { title?: string }>;
}

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Video ID must contain only letters, numbers, underscores, and hyphens' })
  videoId?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  translations?: Record<string, { title?: string }>;
}
