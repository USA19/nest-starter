import { InputType, Field, PartialType, PickType } from '@nestjs/graphql';
import { CreateAttachmentInput } from './create-attachment.dto';
import PaginationInput from 'src/users/dto/pagination-input.dto';

@InputType()
export class UpdateAttachmentInput extends PartialType(CreateAttachmentInput) {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  key?: string;
}

@InputType()
export class UpdateAttachmentMediaInput extends PickType(CreateAttachmentInput, ['typeId'] as const) {
  @Field({ nullable: true })
  id?: string;
}

@InputType()
export class GetMedia extends PickType(UpdateAttachmentInput, ['id'] as const) { }

@InputType()
export class GetAttachment/*  extends PickType(CreateAttachmentInput, ['typeId'] as const)  */ {
  @Field()
  typeId: string;
}

@InputType()
export default class AttachmentInput {
  @Field(type => PaginationInput)
  paginationOptions: PaginationInput
}

@InputType()
export class RemoveAttachment extends PickType(UpdateAttachmentInput, ['id'] as const) { }
