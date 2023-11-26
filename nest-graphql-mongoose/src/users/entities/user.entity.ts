import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role } from './role.entity';

export enum UserStatus {
  DEACTIVATED = "0",
  ACTIVE = "1",
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'The user status',
});

@Schema({ timestamps: true })
@ObjectType()
export class User extends Document {
  @Field()
  _id: string;

  @Prop({ nullable: true, lowercase: true })
  @Field({ nullable: true })
  firstName: string;

  @Prop({ nullable: true, lowercase: true })
  @Field({ nullable: true })
  lastName: string;

  @Prop({
    type: String,
    default: UserStatus.DEACTIVATED,
    enum: Object.values(UserStatus)
  })
  @Field(() => UserStatus)
  status: UserStatus;

  @Prop({ nullable: true, default: false })
  @Field()
  emailVerified: boolean;

  @Prop()
  password: string;

  @Prop({ unique: true, lowercase: true })
  @Field()
  email: string;

  @Field(() => [Role], { nullable: 'items' })
  @Prop({ type: [{ type: mongooseSchema.Types.ObjectId, ref: 'Role' }] })
  roleIds: string[];

  @Field(() => [Role])
  roles: Role[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('roles', {
  ref: "Role",
  localField: 'roleIds',
  foreignField: '_id',
  // justOne: true, // default is false
});