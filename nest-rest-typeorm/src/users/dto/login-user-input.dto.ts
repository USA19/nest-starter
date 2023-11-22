import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer"

export class LoginUserInput {
  @ApiProperty()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  email: string;

  @ApiProperty()
  @Transform(({ value }) => value?.trim())
  password: string;
}
