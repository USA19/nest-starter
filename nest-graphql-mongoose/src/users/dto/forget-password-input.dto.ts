import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@InputType()
export class ForgotPasswordInput {
  @Field()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  email: string;
}
