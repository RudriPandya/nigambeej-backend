import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator';

const TAB_KEYS = ['all', 'cropShow', 'awareness', 'businessMeet'] as const;

export class CreateGalleryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tab category is required' })
  @IsIn(TAB_KEYS, { message: 'Tab must be one of: all, cropShow, awareness, businessMeet' })
  tabKey: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Alt text must not exceed 200 characters' })
  altText?: string;

  @IsOptional()
  @IsString()
  imagePath?: string;
}

export class UpdateGalleryDto {
  @IsOptional()
  @IsString()
  @IsIn(TAB_KEYS, { message: 'Tab must be one of: all, cropShow, awareness, businessMeet' })
  tabKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;
}
