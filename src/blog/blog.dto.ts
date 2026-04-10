import {
  IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(200, { message: 'Slug must not exceed 200 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase letters, numbers, and hyphens only' })
  slug: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;

  // translations (JSON string) for title, excerpt, content per lang
  @IsOptional()
  translations?: string;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase letters, numbers, and hyphens only' })
  slug?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  translations?: string;
}
