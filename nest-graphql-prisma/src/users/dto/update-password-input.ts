import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePasswordInput {
  @Field()
  id: string;

  @Field()
  newPassword: string;
}
