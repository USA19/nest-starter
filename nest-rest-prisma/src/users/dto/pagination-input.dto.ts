import { ApiProperty } from "@nestjs/swagger"

export default class PaginationInput {
  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number
}