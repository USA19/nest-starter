import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SearchUserInput {
  @IsString()
  @ApiProperty()
  searchTerm: string;
}
