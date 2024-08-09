import { Field, InputType } from '@nestjs/graphql';
import PaginationInput from './pagination-input.dto';
import { UserRole, UserStatus } from '@prisma/client';

@InputType()
export default class UsersInput {
  @Field(() => String, { nullable: true })
  from?: string;

  @Field(() => String, { nullable: true })
  to?: string;

  @Field(() => UserStatus, { nullable: true })
  status?: UserStatus;

  @Field(() => [UserRole], { nullable: true })
  roles?: UserRole[];

  @Field(() => String, { nullable: true })
  searchQuery?: string;

  @Field(() => PaginationInput)
  paginationOptions: PaginationInput;
}
