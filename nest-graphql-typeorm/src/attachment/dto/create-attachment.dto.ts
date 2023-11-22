
import { InputType, Field } from '@nestjs/graphql';
import { AttachmentType } from '../attachment.entity';

@InputType()
export class CreateAttachmentInput {
  @Field(type => AttachmentType, { description: 'enum type for module type - Upload Media' })
  type: AttachmentType;

  @Field()
  typeId: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  url?: string;
}
