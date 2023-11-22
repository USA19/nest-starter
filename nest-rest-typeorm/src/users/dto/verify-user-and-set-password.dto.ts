import { ApiProperty } from "@nestjs/swagger";

export class VerifyUserAndUpdatePasswordInput {
  @ApiProperty()
  token: string;

  @ApiProperty()
  password: string;
}
