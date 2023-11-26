import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../entities/role.entity';
import { Transform } from 'class-transformer';

@InputType()
export class RegisterUserInput {
  @Field({ nullable: true })
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  firstName: string;

  @Field({ nullable: true })
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  lastName: string;

  @Field({ nullable: true })
  password?: string;

  @Field()
  @Transform(({ value }) => value.toString()?.trim()?.toLowerCase())
  email: string;

  @Field(() => UserRole, {
    description: 'Send Investor Type from the ENUM - Sign-up',
  })
  roleType: UserRole;
}
