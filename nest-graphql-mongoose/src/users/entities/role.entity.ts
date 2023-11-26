import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The user role assigned',
});

@Schema({ timestamps: true })
@ObjectType()
export class Role extends Document {
  @Field()
  _id: string;

  @Prop({
    type: String, enum: UserRole, default: UserRole.ADMIN
  })
  @Field(() => UserRole)
  role: UserRole;

  @Prop({ type: [{ type: mongooseSchema.Types.ObjectId, ref: 'User' }] })
  userIds: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.virtual('users', {
  ref: "Role",
  localField: 'userIds',
  foreignField: '_id',
  justOne: true, // default is false
});
