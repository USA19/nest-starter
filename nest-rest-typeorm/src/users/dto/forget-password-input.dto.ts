import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ForgotPasswordInput {
  @ApiProperty()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  email: string;
}
