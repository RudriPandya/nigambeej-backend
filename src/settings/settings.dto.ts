import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SettingItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Setting key is required' })
  @MaxLength(100, { message: 'Key must not exceed 100 characters' })
  key: string;

  @IsString()
  @MaxLength(5000, { message: 'Value must not exceed 5000 characters' })
  value: string;
}

export class UploadSettingImageDto {
  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  @MaxLength(100)
  key: string;
}
