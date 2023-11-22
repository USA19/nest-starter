import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../entities/role.entity';
import { UserStatus } from '../entities/user.entity';
import PaginationInput from './pagination-input.dto';

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
