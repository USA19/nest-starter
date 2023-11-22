import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordInput {
  @ApiProperty()
  id: string;

  @ApiProperty()
  newPassword: string;
}
