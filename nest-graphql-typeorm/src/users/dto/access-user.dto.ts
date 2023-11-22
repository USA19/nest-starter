import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';
import { Role } from '../entities/role.entity';

@ObjectType()
export class AccessUserPayload {
  @Field({ nullable: true })
  access_token?: string;

  @Field((type) => [Role], { nullable: true })
  roles: Role[];

  @Field({ nullable: true })
  response?: ResponsePayload;
}
