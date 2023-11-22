import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/aws/dto/file-input.dto';
import { UtilsService } from 'src/util/utils.service';
import { Repository } from 'typeorm';
import { AwsS3Service } from '../aws/aws-s3.service';
import { CreateAttachmentInput } from './dto/create-attachment.dto';
import { UpdateAttachmentInput, UpdateAttachmentMediaInput } from './dto/update-attachment.input';
import { Attachment } from './attachment.entity';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError, S3 } from 'aws-sdk';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    private readonly awsService: AwsS3Service,
    private readonly utilsService: UtilsService,
  ) { }

  /**
   * Creates attachment
   * @param file 
   * @param createAttachmentInput 
   * @returns  
   */
  async createAttachment(createAttachmentInput: CreateAttachmentInput): Promise<Attachment> {
    const attachmentsResult = this.attachmentsRepository.create(createAttachmentInput)
    return await this.attachmentsRepository.save(attachmentsResult)
  }

  /**
   * Uploads attachment
   * @param file 
   * @param createAttachmentInput 
   * @returns  
   */
  async uploadAttachment(file: File, updateAttachmentMediaInput: UpdateAttachmentMediaInput) {
    const attachment = await this.createAttachment(updateAttachmentMediaInput)
    updateAttachmentMediaInput.id = attachment.id
    const attachments = await this.uploadMedia(file, updateAttachmentMediaInput)

    await this.updateAttachmentMedia(attachments)
    if (attachments.url) {
      return attachments
    }
    throw new PreconditionFailedException({
      status: HttpStatus.PRECONDITION_FAILED,
      error: 'Could not upload media',
    });
  }

  /**
   * Updates attachment
   * @param file 
   * @param updateAttachmentMediaInput 
   * @returns  
   */
  async updateAttachment(file: File, updateAttachmentMediaInput: UpdateAttachmentMediaInput) {
    const { id } = updateAttachmentMediaInput
    const existingAttachment = await this.attachmentsRepository.findOne({ where: { id } })

    if (existingAttachment) {
      const deletedRemoteFile = await this.awsService.removeFile(existingAttachment.key);

      if (deletedRemoteFile) {
        const attachments = await this.uploadMedia(file, updateAttachmentMediaInput);

        if (attachments.url) {
          return await this.updateAttachmentMedia(attachments)
        }

        throw new PreconditionFailedException({
          status: HttpStatus.PRECONDITION_FAILED,
          error: 'Could not upload media',
        });
      }

      throw new PreconditionFailedException({
        status: HttpStatus.PRECONDITION_FAILED,
        error: 'Could not delete media file',
      });
    }

    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Attachment not found',
    });
  }

  /**
   * Finds attachments
   * @param id 
   * @param type 
   * @returns attachments 
   */
  async findAttachments(typeId: string): Promise<Attachment[]> {
    return await this.attachmentsRepository.find({
      where: { typeId },
      order: { createdAt: "ASC" },
    });
  }

  /**
   * Finds attachments by id
   * @param id 
   * @returns attachments by id 
   */
  async findAttachmentsById(id: string): Promise<Attachment[]> {
    return await this.attachmentsRepository.find({ where: { typeId: id } });
  }

  /**
   * Updates attachment media
   * @param updateAttachmentInput 
   * @returns attachment media 
   */
  async updateAttachmentMedia(updateAttachmentInput: UpdateAttachmentInput): Promise<Attachment> {
    try {
      return await this.utilsService.updateEntityManager(Attachment, updateAttachmentInput.id, updateAttachmentInput, this.attachmentsRepository)
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Removes media
   * @param id 
   * @returns  
   */
  async removeMedia(id: string): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError> | ""> {
    const attachment = await this.attachmentsRepository.findOne({ where: { id } });
    if (attachment) {
      const deletedAttachment = await this.attachmentsRepository.delete(id)
      if (deletedAttachment.affected) {
        return attachment.key ? await this.awsService.removeFile(attachment.key) : '';
      }
      throw new PreconditionFailedException({
        status: HttpStatus.PRECONDITION_FAILED,
        error: 'Could not delete media from remote storage',
      });
    }
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Attachment not found',
    });
  }

  /**
   * Gets media
   * @param id 
   * @returns  
   */
  async getMedia(id: string): Promise<string> {
    const attachment = await this.attachmentsRepository.findOne({ where: { id } });

    if (attachment) {
      return await this.awsService.getFile(attachment.key);
    }

    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      error: 'Attachment not found',
    });
  }


  async generatePresignedUrl(key: string) {
    try {
      return await this.awsService.getFile(key);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * Removes media by id
   * @param id 
   * @returns  
   */
  async removeMediaById(id: string) {
    return await this.attachmentsRepository.delete({ typeId: id });
  }

  /**
   * Creates attachment data
   * @param createAttachmentInput 
   * @returns  
   */
  async createAttachmentData(createAttachmentInput: CreateAttachmentInput): Promise<Attachment> {
    try {
      await this.findAttachmentsById(createAttachmentInput.typeId)

      return await this.createAttachment(createAttachmentInput);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }


  /**
   * Updates attachment data
   * @param updateAttachmentInput 
   * @returns  
   */
  async updateAttachmentData(updateAttachmentInput: UpdateAttachmentInput): Promise<Attachment> {
    try {
      return await this.updateAttachmentMedia(updateAttachmentInput);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Removes attachment data
   * @param id 
   * @returns  
   */
  async removeAttachmentData(id: string) {
    try {
      return await this.removeMedia(id)
    }
    catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Uploads media
   * @param attachments 
   * @param uploadMedia 
   * @returns  
   */
  async uploadMedia(attachments: File, { id, type, typeId }: UpdateAttachmentInput) {
    const { Key, Location } = await this.awsService.uploadFile(attachments, type, typeId);
    return {
      id,
      type,
      typeId,
      key: Key,
      url: Location,
    }
  }
}
