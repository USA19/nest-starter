import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export default class PaginationPayload {
  @Field(type => Int, { nullable: true })
  page: number

  @Field(type => Int, { nullable: true })
  limit: number

  @Field(type => Int, { nullable: true })
  totalCount: number

  @Field(type => Int, { nullable: true })
  totalPages: number
}

