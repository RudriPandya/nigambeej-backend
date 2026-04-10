import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Entity('blog_post_translations')
export class BlogPostTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BlogPost, (p) => p.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: BlogPost;

  @Column({ length: 5 })
  lang: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'longtext', nullable: true })
  content: string;
}
