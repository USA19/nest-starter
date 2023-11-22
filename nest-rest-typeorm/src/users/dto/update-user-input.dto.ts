import { RegisterUserInput } from './register-user-input.dto';
import { UserStatus } from '../entities/user.entity';
import { ApiPropertyOptional, OmitType, PartialType, PickType } from '@nestjs/swagger';

export class UpdateUserInput extends PartialType(OmitType(RegisterUserInput, ['password', 'roleType'] as const)) {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  emailVerified?: boolean

  token?: string;
  status?: UserStatus
}

export class ResendVerificationEmail extends PickType(UpdateUserInput, ['email'] as const) { }

export class GetUser extends PickType(UpdateUserInput, ['id'] as const) { }