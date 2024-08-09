import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';
import PaginationPayload from './pagination-payload.dto';
import { UserDto } from './user.dto';

@ObjectType()
export class UsersPayload {
  @Field(type => [UserDto], { nullable: 'itemsAndList' })
  users: UserDto[];

  @Field(type => PaginationPayload, { nullable: true })
  pagination?: PaginationPayload

  @Field({ nullable: true })
  response?: ResponsePayload
}
