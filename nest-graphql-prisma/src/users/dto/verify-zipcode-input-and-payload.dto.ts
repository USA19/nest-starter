
import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { ResponsePayloadResponse, ResponsePayload } from "../../users/dto/response-payload.dto";


@InputType()
export class ZipCodeInput {
  @Field({ nullable: true })
  zipCode: string;
}

@ObjectType()
export class verifiedZipCodePayload {
  @Field({ nullable: true })
  state: string;

  @Field({ nullable: true })
  region: string;

  @Field({ nullable: true })
  division: string;
}

@ObjectType()
export class VerifyUSAZipCodePayload extends ResponsePayloadResponse {
  @Field({ nullable: true })
  validZipCodeData: verifiedZipCodePayload

  @Field({ nullable: true })
  response?: ResponsePayload
}