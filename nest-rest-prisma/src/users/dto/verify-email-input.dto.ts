import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResetPasswordInput } from './reset-password-input.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailInput extends PickType(ResetPasswordInput, ['token'] as const) { }

export class VerifyPhoneInput extends VerifyEmailInput {
  @ApiProperty({ description: "countyCode+number", example: "+92xxxx" })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}