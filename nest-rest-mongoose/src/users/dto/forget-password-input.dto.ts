import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordInput {
  @ApiProperty()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  @IsString()
  @IsEmail()
  email: string;
}
