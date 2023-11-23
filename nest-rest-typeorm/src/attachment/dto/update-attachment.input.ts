import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { CreateAttachmentInput } from './create-attachment.dto';
import PaginationInput from 'src/users/dto/pagination-input.dto';

export class UpdateAttachmentInput extends PartialType(CreateAttachmentInput) {
  @ApiPropertyOptional()
  key?: string;
}

export class UpdateAttachmentMediaInput extends PickType(CreateAttachmentInput, ['typeId'] as const) {
  @ApiPropertyOptional()
  id?: string;
}

export class GetMedia {
  @ApiPropertyOptional()
  id: string;
}


export class GetAttachment {
  @ApiProperty()
  typeId: string;
}

export default class AttachmentInput {
  @ApiProperty({ type: PaginationInput })
  paginationOptions: PaginationInput
}

export class RemoveAttachment extends GetMedia { }
