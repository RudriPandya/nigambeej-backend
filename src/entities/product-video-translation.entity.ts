import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVideo } from './product-video.entity';

@Entity('product_video_translations')
export class ProductVideoTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductVideo, (v) => v.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_video_id' })
  video: ProductVideo;

  @Column({ length: 5 })
  lang: string;

  @Column()
  title: string;
}
