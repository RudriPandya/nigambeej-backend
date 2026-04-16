import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BlogPostTranslation } from './blog-post-translation.entity';
import { AdminUser } from './admin-user.entity';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'cover_image_data', type: 'longblob', nullable: true, select: false })
  coverImageData: Buffer;

  @Column({ name: 'cover_image_mimetype', nullable: true })
  coverImageMimetype: string;

  @Column({ name: 'cover_image_original_name', nullable: true })
  coverImageOriginalName: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @ManyToOne(() => AdminUser, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: AdminUser;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => BlogPostTranslation, (t) => t.post, { cascade: true })
  translations: BlogPostTranslation[];
}
