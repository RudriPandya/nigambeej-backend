import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Alt text must not exceed 200 characters' })
  altText?: string;

  @IsOptional()
  @IsString()
  imagePath?: string;
}
