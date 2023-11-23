import { ManyToMany, Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
}

@Entity({ name: 'Roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  @ApiProperty({ enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @ManyToMany(() => User, (user) => user.roles)
  @ApiProperty({ type: [User] })
  users: User[];

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: string;
}
