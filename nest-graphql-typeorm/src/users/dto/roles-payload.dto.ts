import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';
import { Role } from '../entities/role.entity';

@ObjectType()
export default class RolesPayload {
  @Field((type) => [Role], { nullable: 'itemsAndList' })
  roles: Role[];

  @Field({ nullable: true })
  response?: ResponsePayload;
}
