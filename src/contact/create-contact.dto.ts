import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,15}$/, { message: 'Please enter a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  message?: string;
}
