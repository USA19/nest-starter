import {
  ManyToMany,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
}

@Entity({ name: 'Roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')

  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @ManyToMany((type) => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
