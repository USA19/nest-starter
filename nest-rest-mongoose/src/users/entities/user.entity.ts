import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from './role.entity';
import { Exclude } from 'class-transformer';

export enum UserStatus {
  DEACTIVATED = "0",
  ACTIVE = "1",
}

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty()
  _id: string;

  @Prop({ nullable: true, lowercase: true })
  @ApiPropertyOptional()
  firstName: string;

  @Prop({ nullable: true, lowercase: true })
  @ApiPropertyOptional()
  lastName: string;

  @Prop({
    type: String,
    default: UserStatus.DEACTIVATED,
    enum: Object.values(UserStatus)
  })
  @ApiProperty({ enum: UserStatus, default: UserStatus.DEACTIVATED })
  status: UserStatus;

  @Prop({ nullable: true, default: false })
  @ApiProperty()
  emailVerified: boolean;

  @Exclude()
  @Prop()
  password: string;

  @Prop({ unique: true, lowercase: true })
  @ApiProperty()
  email: string;

  @Prop({ type: [{ type: mongooseSchema.Types.ObjectId, ref: 'Role' }] })
  roleIds: string[];

  @ApiProperty({ type: [Role] })
  roles: Role[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
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