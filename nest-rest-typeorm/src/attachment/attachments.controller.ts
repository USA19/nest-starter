import { Body, Controller, Delete, Get, Param, Post, Put, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { JwtAuthRestFulGuard } from '../users/auth/jwt-auth-restful.guard';
import RestfulRoleGuard from '../users/auth/roleRestful.guard';
import { GetAttachment, GetMedia, RemoveAttachment, UpdateAttachmentInput } from './dto/update-attachment.input';
import { AttachmentPayload, AttachmentsPayload } from './dto/attachments-payload.dto';
import { CreateAttachmentInput } from './dto/create-attachment.dto';
import { GetAttachmentPayload } from './dto/get-attachment-url-payload';

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) { }

  @Get('/:typeId')
  @ApiParam({
    type: GetAttachment,
    required: true,
    name: 'GetAttachmentParam'
  })
  @ApiResponse({
    status: 200,
    type: AttachmentsPayload,
  })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async getAttachments(@Param('typeId') typeId: string): Promise<AttachmentsPayload> {
    const attachments = await this.attachmentsService.findAttachmentsById(typeId)
    return {
      attachments,
      response: { status: 200, message: 'Attachments fetched successfully' }
    };
  }

  @Post('/data')
  @ApiResponse({ status: 200, type: AttachmentPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async createAttachmentData(@Body() createAttachmentInput: CreateAttachmentInput): Promise<AttachmentPayload> {
    const attachment = await this.attachmentsService.createAttachmentData(createAttachmentInput);
    return {
      attachment,
      response: { status: 200, message: 'Attachment data created successfully' }
    };
  }

  @Delete('/data/:id')
  @ApiParam({
    type: RemoveAttachment,
    required: true,
    name: 'RemoveAttachmentParam'
  })
  @ApiResponse({ status: 200, type: AttachmentPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async removeAttachmentData(@Param('id') id: string): Promise<AttachmentPayload> {
    await this.attachmentsService.removeAttachmentData(id);
    return {
      response: { status: 200, message: 'Attachment data deleted successfully' }
    };
  }

  @Put('/:id')
  @ApiParam({
    type: UpdateAttachmentInput,
    name: 'UpdateAttachmentParam'
  })
  @ApiResponse({ status: 200, type: AttachmentPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async updateAttachmentData(@Param('id') id: string, @Body() updateAttachmentInput: UpdateAttachmentInput): Promise<AttachmentPayload> {
    const attachment = await this.attachmentsService.updateAttachmentData({ ...updateAttachmentInput, id });
    return {
      attachment,
      response: { status: 200, message: 'Attachment data updated successfully' }
    };
  }

  @Get('url/:id')
  @ApiParam({
    type: GetMedia,
    name: 'GetMediaParam'
  })
  @ApiResponse({ status: 200, type: GetAttachmentPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async getAttachment(@Param('getMediaId') getMediaId: string): Promise<GetAttachmentPayload> {
    const preSignedUrl = await this.attachmentsService.generatePresignedUrl(getMediaId);
    return {
      preSignedUrl,
      response: { status: 200, message: 'Attachment presigned url fetched successfully' }
    };
  }
}
