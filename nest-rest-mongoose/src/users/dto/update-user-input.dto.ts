import { RegisterUserInput } from './register-user-input.dto';
import { UserStatus } from '../entities/user.entity';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserInput extends PartialType(OmitType(RegisterUserInput, ['password', 'roleType'] as const)) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean

  @IsOptional()
  token?: string;

  @IsOptional()
  status?: UserStatus
}

export class ResendVerificationEmail extends PickType(UpdateUserInput, ['email'] as const) { }

export class GetUser extends PickType(UpdateUserInput, ['id'] as const) { }