import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/role.entity';
import { UserStatus } from '../entities/user.entity';
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, } from 'class-validator';
import { Transform } from 'class-transformer';

export default class UsersInput {
  @ApiPropertyOptional({ description: "Format should be year-month-day time i.e. 2023-05-04 00:00" })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: "Format should be year-month-day time i.e. 2023-05-04 23:59" })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ type: "string", enum: UserStatus, })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Array of user roles',
    enum: UserRole,
    isArray: true,
    example: [UserRole.ADMIN],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value ? [value] : undefined
  )
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
