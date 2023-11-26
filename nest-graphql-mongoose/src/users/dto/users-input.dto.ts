import { Field, InputType } from '@nestjs/graphql';
import { UserStatus } from '../entities/user.entity';
import PaginationInput from './pagination-input.dto';

@InputType()
export default class UsersInput {
  @Field(() => String, { nullable: true, description: 'YYYY-MM-DDTHH:mm:ss.sssZ i.e.2023-11-25T08:30:00.000Z' })
  from?: string;

  @Field(() => String, { nullable: true, description: 'YYYY-MM-DDTHH:mm:ss.sssZ i.e.2023-11-25T08:30:00.000Z' })
  to?: string;

  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;

  @Field(() => [String], { nullable: true })
  roles?: string[];

  @Field(() => String, { nullable: true })
  searchQuery?: string;

  @Field(() => PaginationInput)
  paginationOptions: PaginationInput;
}
