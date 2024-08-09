import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';
import { UserDto } from './user.dto';
import { User } from '@prisma/client';

@ObjectType()
export class UserPayload {
  @Field(() => UserDto, { nullable: true })
  user?: User | UserDto;

  @Field({ nullable: true })
  response?: ResponsePayload;
}
