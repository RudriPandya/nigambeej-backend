import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media_images')
export class MediaImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_data', type: 'longblob', select: false })
  imageData: Buffer;

  @Column({ name: 'mimetype' })
  mimetype: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'alt_text', nullable: true })
  altText: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
