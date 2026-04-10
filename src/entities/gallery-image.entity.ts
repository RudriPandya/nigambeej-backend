import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('gallery_images')
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tab_key', default: 'all' })
  tabKey: string;

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
