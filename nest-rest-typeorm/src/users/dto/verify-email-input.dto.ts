import { PickType } from '@nestjs/swagger';
import { ResetPasswordInput } from './reset-password-input.dto';

export class VerifyEmailInput extends PickType(ResetPasswordInput, ['token'] as const) { }