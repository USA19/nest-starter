import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserRole } from '../entities/role.entity';
import { UpdateUserInput } from './update-user-input.dto';
import { IsArray, IsEnum } from 'class-validator';

export class UpdateRoleInput extends PickType(UpdateUserInput, ['id'] as const) {
  @ApiProperty({ enum: UserRole, isArray: true })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
