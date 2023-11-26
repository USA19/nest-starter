
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttachmentInput {
  @ApiProperty()
  typeId: string

  @ApiPropertyOptional()
  description?: string

  @ApiPropertyOptional()
  url?: string;
}
