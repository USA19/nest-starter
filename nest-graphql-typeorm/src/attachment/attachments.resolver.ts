import { SetMetadata, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetAttachment, GetMedia, RemoveAttachment, UpdateAttachmentInput } from './dto/update-attachment.input';
import { JwtAuthGraphQLGuard } from '../users/auth/jwt-auth-graphql.guard';
import RoleGuard from '../users/auth/role.guard';
import { AttachmentsService } from './attachments.service';
import { AttachmentMediaPayload, AttachmentPayload } from './dto/attachment-payload.dto';
import { AttachmentsPayload } from './dto/attachments-payload.dto';
import { HttpExceptionFilter } from '../exception-filter';
import { CreateAttachmentInput } from './dto/create-attachment.dto';

@Resolver('attachments')
@UseFilters(HttpExceptionFilter)
export class AttachmentsResolver {
  constructor(private readonly attachmentsService: AttachmentsService) { }

  @Query(returns => AttachmentsPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin', "manager", 'panelist', 'med-panel'])
  async getAttachments(@Args('getAttachment') getAttachment: GetAttachment): Promise<AttachmentsPayload> {
    const attachments = await this.attachmentsService.findAttachmentsById(getAttachment.typeId)
    return {
      attachments,
      response: { status: 200, message: 'Attachments fetched successfully' }
    };
  }

  @Mutation(returns => AttachmentPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin', "manager", 'panelist', 'med-panel'])
  async createAttachmentData(@Args('createAttachmentInput') createAttachmentInput: CreateAttachmentInput) {
    const attachment = await this.attachmentsService.createAttachmentData(createAttachmentInput);
    return {
      attachment,
      response: { status: 200, message: 'Attachment data created successfully' }
    };
  }

  @Mutation(returns => AttachmentPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin', "manager", 'panelist', 'med-panel'])
  async removeAttachmentData(@Args('removeAttachment') removeAttachment: RemoveAttachment) {
    await this.attachmentsService.removeAttachmentData(removeAttachment.id);
    return {
      response: { status: 200, message: 'Attachment data deleted successfully' }
    };
  }

  @Mutation(returns => AttachmentPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin', "manager", 'panelist', 'med-panel'])
  async updateAttachmentData(@Args('updateAttachmentInput') updateAttachmentInput: UpdateAttachmentInput) {
    const attachment = await this.attachmentsService.updateAttachmentData(updateAttachmentInput);
    return {
      attachment,
      response: { status: 200, message: 'Attachment data updated successfully' }
    };
  }

  @Query(returns => AttachmentMediaPayload)
  @UseGuards(JwtAuthGraphQLGuard, RoleGuard)
  @SetMetadata('roles', ['admin', 'super-admin', "manager", 'panelist', 'med-panel'])
  async getAttachment(@Args('getMedia') getMedia: GetMedia) {
    const preSignedUrl = await this.attachmentsService.generatePresignedUrl(getMedia.id);
    return {
      preSignedUrl,
      response: { status: 200, message: 'Attachment presigned url fetched successfully' }
    };
  }
}
