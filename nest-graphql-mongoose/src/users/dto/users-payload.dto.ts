import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { ResponsePayload } from './response-payload.dto';
import PaginationPayload from './pagination-payload.dto';

@ObjectType()
export class UsersPayload {
  @Field(type => [User], { nullable: 'itemsAndList' })
  users: User[];

  @Field(type => PaginationPayload, { nullable: true })
  pagination?: PaginationPayload

  @Field({ nullable: true })
  response?: ResponsePayload
}
