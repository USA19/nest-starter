import { ObjectType, Field } from '@nestjs/graphql';
import { ResponsePayload } from './response-payload.dto';

@ObjectType()
export class ForgotPasswordPayload {
  @Field({ nullable: true })
  response?: ResponsePayload;
}
