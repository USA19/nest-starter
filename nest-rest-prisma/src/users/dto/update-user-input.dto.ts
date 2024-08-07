import { RegisterUserInput } from "./register-user-input.dto";
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import { UserStatus } from "@prisma/client";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class UpdateUserInput extends PartialType(
  OmitType(RegisterUserInput, ["password", "roleType"] as const)
) {
  @ApiPropertyOptional()
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsOptional()
  token?: string;

  @IsOptional()
  status?: UserStatus;

  password?: string;
}
export class ResendVerificationEmail extends PickType(UpdateUserInput, [
  "email",
] as const) { }

export class GetUser {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
