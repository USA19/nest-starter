import { Field, InputType } from '@nestjs/graphql';
import { Transform } from "class-transformer"

@InputType()
export class LoginUserInput {
  @Field()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  email: string;

  @Field()
  @Transform(({ value }) => value?.trim())
  password: string;
}


@InputType()
export class RefreshTokenInput {
  @Field()
  refreshToken: string;
}