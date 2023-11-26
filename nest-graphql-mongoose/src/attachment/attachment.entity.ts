import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';

@Schema({ timestamps: true })
@ObjectType()
export class Attachment {
  @Field()
  _id: string;

  @Prop({ nullable: true })
  @Field()
  typeId: string;

  @Prop({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Prop({ nullable: true })
  @Field({ nullable: true })
  key: string;

  @Prop({ nullable: true })
  @Field({ nullable: true })
  url: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
