import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../entities/role.entity';

@InputType()
export class SearchUserInput {
  @Field()
  searchTerm: string;
}
