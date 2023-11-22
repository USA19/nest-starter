import { UserRole } from '../entities/role.entity';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserInput {
  @ApiPropertyOptional()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  firstName: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  lastName: string;

  @ApiPropertyOptional()
  password?: string;

  @ApiProperty()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  email: string;

  @ApiPropertyOptional({ type: UserRole, default: UserRole.ADMIN })
  roleType: UserRole;
}
