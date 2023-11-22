import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'Attachments' })
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  typeId: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  key: string;

  @Column({ nullable: true })
  url: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;
}
