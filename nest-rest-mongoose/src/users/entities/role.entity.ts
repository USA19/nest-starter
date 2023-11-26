import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class Role extends Document {
  @ApiProperty()
  _id: string;

  @Prop({
    type: String, enum: UserRole, default: UserRole.ADMIN
  })
  @ApiProperty({ enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @Prop({ type: [{ type: mongooseSchema.Types.ObjectId, ref: 'User' }] })
  userIds: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.virtual('users', {
  ref: "Role",
  localField: 'userIds',
  foreignField: '_id',
  justOne: true, // default is false
});
