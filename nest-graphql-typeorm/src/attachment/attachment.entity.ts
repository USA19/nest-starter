import {
  ManyToMany,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';


export enum AttachmentType {
  PANELIST = "panelist",
}

registerEnumType(AttachmentType, {
  name: "AttachmentType",
  description: "The type is assigned",
});

@Entity({ name: 'Attachments' })
@ObjectType()
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ nullable: true })
  @Field()
  typeId: string;

  @Column({
    type: "enum", enum: AttachmentType, default: AttachmentType.PANELIST
  })
  @Field(type => AttachmentType)
  type: AttachmentType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  key: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  url: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field()
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field()
  updatedAt: string;
}
