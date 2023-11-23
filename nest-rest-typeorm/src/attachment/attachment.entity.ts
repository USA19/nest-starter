import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'Attachments' })
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  typeId: string;

  @Column({ nullable: true })
  @ApiProperty()
  description: string;

  @Column({ nullable: true })
  @ApiProperty()
  key: string;

  @Column({ nullable: true })
  @ApiProperty()
  url: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: string;
}
