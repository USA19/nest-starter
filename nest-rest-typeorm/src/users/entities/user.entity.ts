import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, JoinTable, ManyToMany, BeforeInsert } from 'typeorm';
import { Role } from './role.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatus {
  DEACTIVATED = 0,
  ACTIVE,
}
@Entity({ name: 'Users' })
export class User {
  @BeforeInsert()
  trimFields() {
    this.firstName = this.firstName.trim()
    this.lastName = this.lastName.trim()
    this.email = this.email.toLowerCase()
  }

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ nullable: true })
  @ApiProperty()
  firstName: string;

  @Column({ nullable: true })
  @ApiProperty()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.DEACTIVATED,
  })
  @ApiProperty({ enum: UserStatus, default: UserStatus.DEACTIVATED })
  status: UserStatus;

  @Column({ nullable: true, default: false })
  @ApiPropertyOptional()
  emailVerified: boolean;

  @Column()
  @ApiProperty()
  password: string;

  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ nullable: true, default: false })
  @ApiPropertyOptional()
  token: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @ApiProperty({ type: [Role] })
  @JoinTable({ name: 'UserRoles' })
  roles: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: string;

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
