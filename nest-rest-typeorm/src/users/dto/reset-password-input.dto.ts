import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordInput {
  @ApiProperty()
  password: string;

  @ApiProperty()
  token: string;
}
