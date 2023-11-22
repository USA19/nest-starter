import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ResponsePayload {
  @Field({ nullable: true })
  status: number;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  message: string;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class ResponsePayloadResponse {
  @Field({ nullable: true })
  response?: ResponsePayload;
}
