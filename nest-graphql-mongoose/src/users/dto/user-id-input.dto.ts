import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserIdInput {
  @Field()
  userId: string;
}
