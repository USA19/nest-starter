import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Attachment {
  @ApiProperty()
  _id: string;

  @Prop({ nullable: true })
  @ApiPropertyOptional()
  typeId: string;

  @Prop({ nullable: true })
  @ApiPropertyOptional()
  description: string;

  @Prop({ nullable: true })
  @ApiPropertyOptional()
  key: string;

  @Prop({ nullable: true })
  @ApiPropertyOptional()
  url: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
