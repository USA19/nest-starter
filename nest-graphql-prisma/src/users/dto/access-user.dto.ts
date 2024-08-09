import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';
import { RoleDto } from './role.dto';

@ObjectType()
export class AccessUserPayload {
  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true })
  refresh_token?: string;

  @Field((type) => [RoleDto], { nullable: true })
  roles: RoleDto[];

  @Field({ nullable: true })
  response?: ResponsePayload;
}
