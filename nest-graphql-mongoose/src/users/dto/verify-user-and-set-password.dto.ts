import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyUserAndUpdatePasswordInput {
  @Field()
  token: string;

  @Field()
  password: string;
}
