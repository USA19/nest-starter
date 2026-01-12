import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserIdInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
