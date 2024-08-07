import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, } from 'class-validator';

export default class UsersInput {
  @ApiPropertyOptional({ description: "Format should be year-month-day time i.e. 2023-05-04 00:00" })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: "Format should be year-month-day time i.e. 2023-05-04 23:59" })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ type: "enum", enum: UserStatus, })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      enum: [UserRole],
    },
    description: 'Array of user roles',
    example: [UserRole.ADMIN],
  })

  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  page: number

  @ApiProperty()
  @IsInt()
  @IsPositive()
  limit: number
}
