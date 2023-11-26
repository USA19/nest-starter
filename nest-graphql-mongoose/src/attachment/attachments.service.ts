import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { File } from 'src/aws/dto/file-input.dto';
import { UtilsService } from 'src/util/utils.service';
import { AwsS3Service } from '../aws/aws-s3.service';
import { CreateAttachmentInput } from './dto/create-attachment.dto';
import { UpdateAttachmentInput, UpdateAttachmentMediaInput } from './dto/update-attachment.input';
import { Attachment } from './attachment.entity';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError, S3 } from 'aws-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name)
    private readonly attachmentsModel: Model<Attachment>,
    private readonly awsService: AwsS3Service,
  ) { }

  /**
   * Creates attachment
   * @param file 
   * @param createAttachmentInput 
   * @returns  
   */
  async createAttachment(createAttachmentInput: CreateAttachmentInput): Promise<Attachment> {
    return await this.attachmentsModel.create(createAttachmentInput)
  }

  /**
   * Uploads attachment
   * @param file 
   * @param createAttachmentInput 
   * @returns  
   */
  async uploadAttachment(file: File, updateAttachmentMediaInput: UpdateAttachmentMediaInput) {
    const attachment = await this.createAttachment(updateAttachmentMediaInput)
    updateAttachmentMediaInput.id = attachment._id
    const attachments = await this.uploadMedia(file, updateAttachmentMediaInput)

    await this.updateAttachmentMedia(attachments)
    if (attachments.url) {
      return attachments
    }
    throw new PreconditionFailedException('Could not upload media');
  }

  /**
   * Updates attachment
   * @param file 
   * @param updateAttachmentMediaInput 
   * @returns  
   */
  async updateAttachment(file: File, updateAttachmentMediaInput: UpdateAttachmentMediaInput) {
    const { id: _id } = updateAttachmentMediaInput
    const existingAttachment = await this.attachmentsModel.findOne({ _id })

    if (existingAttachment) {
      const deletedRemoteFile = await this.awsService.removeFile(existingAttachment.key);

      if (deletedRemoteFile) {
        const attachments = await this.uploadMedia(file, updateAttachmentMediaInput);

        if (attachments.url) {
          return await this.updateAttachmentMedia(attachments)
        }

        throw new PreconditionFailedException('Could not upload media');
      }

      throw new PreconditionFailedException('Could not delete media file');
    }

    throw new NotFoundException('Attachment not found');
  }

  /**
   * Finds attachments
   * @param id 
   * @param type 
   * @returns attachments 
   */
  async findAttachments(typeId: string): Promise<Attachment[]> {
    return await this.attachmentsModel.find({ typeId }).sort({ createdAt: "asc" })
  }

  /**
   * Finds attachments by id
   * @param id 
   * @returns attachments by id 
   */
  async findAttachmentsById(id: string): Promise<Attachment[]> {
    return await this.attachmentsModel.find({ typeId: id });
  }

  /**
   * Updates attachment media
   * @param updateAttachmentInput 
   * @returns attachment media 
   */
  async updateAttachmentMedia(updateAttachmentInput: UpdateAttachmentInput): Promise<Attachment> {
    try {
      return await this.attachmentsModel.findByIdAndUpdate(updateAttachmentInput.id, updateAttachmentInput, { new: true })
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Removes media
   * @param id 
   * @returns  
   */
  async removeMedia(_id: string): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError> | ""> {
    const attachment = await this.attachmentsModel.findOne({ _id });
    if (attachment) {
      const deletedAttachment = await this.attachmentsModel.findByIdAndDelete(_id)
      if (deletedAttachment) {
        return attachment.key ? await this.awsService.removeFile(attachment.key) : '';
      }
      throw new PreconditionFailedException('Could not delete media from remote storage');
    }

    throw new NotFoundException('Attachment not found');
  }

  /**
   * Gets media
   * @param id 
   * @returns  
   */
  async getMedia(_id: string): Promise<string> {
    const attachment = await this.attachmentsModel.findOne({ _id });

    if (attachment) {
      return await this.awsService.getFile(attachment.key);
    }

    throw new NotFoundException('Attachment not found');
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
  async removeMediaById(typeId: string) {
    return await this.attachmentsModel.findOneAndDelete({ typeId })
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
  async uploadMedia(attachments: File, { id, typeId }: UpdateAttachmentInput) {
    const { Key, Location } = await this.awsService.uploadFile(attachments, typeId);
    return {
      id,
      typeId,
      key: Key,
      url: Location,
    }
  }
}
