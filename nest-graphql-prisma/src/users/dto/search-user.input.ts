import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SearchUserInput {
  @Field()
  searchTerm: string;
}
