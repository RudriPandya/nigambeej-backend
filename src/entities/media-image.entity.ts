import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media_images')
export class MediaImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_path' })
  imagePath: string;

  @Column({ name: 'alt_text', nullable: true })
  altText: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
