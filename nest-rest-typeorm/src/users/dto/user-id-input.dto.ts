import { ApiProperty } from "@nestjs/swagger";

export class UserIdInput {
  @ApiProperty()
  userId: string;
}
