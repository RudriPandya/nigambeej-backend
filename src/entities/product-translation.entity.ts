import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_translations')
export class ProductTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (p) => p.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 5 })
  lang: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'detail_intro', type: 'text', nullable: true })
  detailIntro: string | null;

  @Column({ name: 'practice_description', type: 'text', nullable: true })
  practiceDescription: string | null;
}
