import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, SetMetadata, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { fileFilter, } from '../lib/helper';
import { AttachmentsService } from './attachments.service';
import { JwtAuthRestFulGuard } from '../users/auth/jwt-auth-restful.guard';
import RestfulRoleGuard from '../users/auth/roleRestful.guard';
import { UpdateAttachmentInput, UpdateAttachmentMediaInput } from './dto/update-attachment.input';
import { AttachmentPayload, AttachmentsPayload } from './dto/attachments-payload.dto';
import { CreateAttachmentInput } from './dto/create-attachment.dto';
import { GetAttachmentPayload } from './dto/get-attachment-url-payload';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from '../aws/dto/file-input.dto';

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) { }

  @ApiBearerAuth()
  @Get('/:typeId')
  @ApiResponse({ status: 200, type: AttachmentsPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async getAttachments(@Param('typeId') typeId: string): Promise<AttachmentsPayload> {
    const attachments = await this.attachmentsService.findAttachmentsById(typeId)
    return {
      attachments,
      response: { status: 200, message: 'Attachments fetched successfully' }
    };
  }

  @ApiBearerAuth()
  @Post('data')
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

  @ApiBearerAuth()
  @Delete('/data/:id')
  @ApiResponse({ status: 200, type: AttachmentPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async removeAttachmentData(@Param('id') id: string): Promise<AttachmentPayload> {
    await this.attachmentsService.removeAttachmentData(id);
    return {
      response: { status: 200, message: 'Attachment data deleted successfully' }
    };
  }

  @ApiBearerAuth()
  @Put('/:id')
  @ApiResponse({ status: 200, type: AttachmentPayload })
  @UseGuards(JwtAuthRestFulGuard, RestfulRoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin'])
  async updateAttachmentData(@Param('id') id: string, @Body() updateAttachmentInput: UpdateAttachmentInput): Promise<AttachmentPayload> {
    const attachment = await this.attachmentsService.updateAttachmentData(updateAttachmentInput, id);
    return {
      attachment,
      response: { status: 200, message: 'Attachment data updated successfully' }
    };
  }

  @ApiBearerAuth()
  @Get('url/:id')
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

  // Just Example how image upload would work
  // @UseInterceptors(ClassSerializerInterceptor)
  // @Post('upload/:attachmentId')
  // @ApiConsumes("multipart/form-data")
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })

  // @UseInterceptors(FileInterceptor('file', { fileFilter }))
  // async uploadMedia(@Param("attachmentId") attachmentId: string, @UploadedFile() file: File, @Body() updateAttachmentMediaInput: UpdateAttachmentMediaInput) {
  //   return await this.attachmentsService.uploadMedia(file, updateAttachmentMediaInput, attachmentId)
  // }
}
