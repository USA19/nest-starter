import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role } from './role.entity';

export enum UserStatus {
  DEACTIVATED = 0,
  ACTIVE,
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'The user status',
});

@Entity({ name: 'Users' })
@ObjectType()
export class User {
  @BeforeInsert()
  trimFields() {
    this.firstName = this.firstName.trim()
    this.lastName = this.lastName.trim()
    this.email = this.email.toLowerCase()
  }

  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.DEACTIVATED,
  })
  @Field((type) => UserStatus)
  status: UserStatus;

  @Column({ nullable: true, default: false })
  @Field()
  emailVerified: boolean;

  @Column()
  password: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ nullable: true, default: false })
  token: string;

  @Field((type) => [Role], { nullable: 'items' })
  @ManyToMany((type) => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'UserRoles' })
  roles: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  @Field()
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field()
  updatedAt: string;

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
