import { IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TranslationItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Language is required' })
  @MaxLength(10)
  lang: string;

  @IsString()
  @IsNotEmpty({ message: 'Namespace is required' })
  @MaxLength(100)
  namespace: string;

  @IsString()
  @IsNotEmpty({ message: 'Key path is required' })
  @MaxLength(200)
  keyPath: string;

  @IsString()
  @MaxLength(2000, { message: 'Value must not exceed 2000 characters' })
  value: string;
}

export class BatchUpsertTranslationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationItemDto)
  items: TranslationItemDto[];
}
