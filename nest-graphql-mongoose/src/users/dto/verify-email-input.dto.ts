import { InputType, PickType } from '@nestjs/graphql';
import { ResetPasswordInput } from './reset-password-input.dto';

@InputType()
export class VerifyEmailInput extends PickType(ResetPasswordInput, ['token'] as const) { }