import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer"
import { IsEmail, IsString } from "class-validator";

export class LoginUserInput {
  @ApiProperty()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  password: string;
}

export class RefreshTokenInput {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
