import { ApiProperty } from "@nestjs/swagger"

export default class PaginationPayload {
  @ApiProperty()
  page: number

  @ApiProperty()
  limit: number

  @ApiProperty()
  totalCount: number

  @ApiProperty()
  totalPages: number
}

