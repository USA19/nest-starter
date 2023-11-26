import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAttachmentInput {
  @Field()
  typeId: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  url?: string;
}
