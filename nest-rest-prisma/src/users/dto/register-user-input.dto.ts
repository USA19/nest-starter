import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';

export class RegisterUserInput {
  @ApiPropertyOptional()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  @IsString()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.ADMIN })
  @IsEnum(UserRole)
  roleType: UserRole;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  status?: UserStatus
  emailVerified?: boolean
}
