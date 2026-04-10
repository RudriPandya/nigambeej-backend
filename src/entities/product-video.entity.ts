import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { ProductVideoTranslation } from './product-video-translation.entity';

@Entity('product_videos')
export class ProductVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'video_id' })
  videoId: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductVideoTranslation, (t) => t.video, { cascade: true })
  translations: ProductVideoTranslation[];
}
