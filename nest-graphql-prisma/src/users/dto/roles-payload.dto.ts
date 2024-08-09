import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';
import { RoleDto } from './role.dto';

@ObjectType()
export default class RolesPayload {
  @Field((type) => [RoleDto], { nullable: 'itemsAndList' })
  roles: RoleDto[];

  @Field({ nullable: true })
  response?: ResponsePayload;
}
