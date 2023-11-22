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
import { Role } from './role.entity';

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
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.DEACTIVATED,
  })
  status: UserStatus;

  @Column({ nullable: true, default: false })
  emailVerified: boolean;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, default: false })
  token: string;

  @ManyToMany((type) => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'UserRoles' })
  roles: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
